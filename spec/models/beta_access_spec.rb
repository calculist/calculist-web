require 'rails_helper'

RSpec.describe BetaAccess, type: :model do
  describe '#set_defaults' do
    it 'generates a random code on create if none provided' do
      ba = BetaAccess.create!
      expect(ba.code).to be_present
      expect(ba.code.length).to eq(12) # hex(6) = 12 chars
    end

    it 'preserves a provided code' do
      ba = BetaAccess.create!(code: 'custom_code')
      expect(ba.code).to eq('custom_code')
    end

    it 'generates unique codes' do
      codes = 5.times.map { BetaAccess.create!.code }
      expect(codes.uniq.length).to eq(5)
    end
  end

  it 'can store claimed_by and claimed_at' do
    ba = BetaAccess.create!
    ba.update!(claimed_by: 123, claimed_at: DateTime.now)
    ba.reload
    expect(ba.claimed_by).to eq(123)
    expect(ba.claimed_at).to be_present
  end

  it 'can store notes' do
    ba = BetaAccess.create!(notes: 'stripe:cus_abc123')
    expect(ba.notes).to eq('stripe:cus_abc123')
  end
end
