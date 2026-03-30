require 'rails_helper'

RSpec.describe StripeHelper do
  let(:sh) { StripeHelper.new(secret_key: 'sk_test_fake') }

  describe '#valid_plan?' do
    it 'returns true for personal plan' do
      expect(sh.valid_plan?('personal')).to be true
    end

    it 'returns true for professional plan' do
      expect(sh.valid_plan?('professional')).to be true
    end

    it 'returns false for invalid plan' do
      expect(sh.valid_plan?('enterprise')).to be false
    end

    it 'returns false for nil' do
      expect(sh.valid_plan?(nil)).to be false
    end

    it 'returns false for empty string' do
      expect(sh.valid_plan?('')).to be false
    end
  end

  describe '#price_from_plan' do
    it 'returns STRIPE_PERSONAL_PLAN_ID for personal' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('STRIPE_PERSONAL_PLAN_ID').and_return('price_personal')
      expect(sh.price_from_plan('personal')).to eq('price_personal')
    end

    it 'returns STRIPE_PRO_PLAN_ID for professional' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('STRIPE_PRO_PLAN_ID').and_return('price_pro')
      expect(sh.price_from_plan('professional')).to eq('price_pro')
    end

    it 'returns nil for invalid plan' do
      expect(sh.price_from_plan('invalid')).to be_nil
    end
  end

  describe '#get_customer_for_user' do
    it 'returns nil when user has no stripe beta_access record' do
      user = create_user
      expect(sh.get_customer_for_user(user.id)).to be_nil
    end

    it 'looks up customer from beta_access notes' do
      user = create_user
      BetaAccess.create!(
        code: SecureRandom.hex(6),
        claimed_by: user.id,
        claimed_at: DateTime.now,
        notes: 'stripe:cus_test123'
      )

      fake_customer = double('Stripe::Customer', id: 'cus_test123')
      allow(Stripe::Customer).to receive(:retrieve).with('cus_test123').and_return(fake_customer)

      result = sh.get_customer_for_user(user.id)
      expect(result.id).to eq('cus_test123')
    end
  end

  describe '#create_checkout_session' do
    it 'calls Stripe::Checkout::Session.create with correct params' do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with('STRIPE_PERSONAL_PLAN_ID').and_return('price_123')
      allow(ENV).to receive(:[]).with('APP_BASE_URL').and_return('https://app.test.com')
      allow(ENV).to receive(:[]).with('CALCULIST_MAIN_URL').and_return('https://test.com')

      expect(Stripe::Checkout::Session).to receive(:create).with(
        hash_including(
          mode: 'subscription',
          payment_method_types: ['card'],
          customer_email: 'test@example.com'
        )
      ).and_return({ 'id' => 'cs_test_123' })

      result = sh.create_checkout_session('personal', 'test@example.com')
      expect(result['id']).to eq('cs_test_123')
    end
  end
end
