require 'rails_helper'

RSpec.describe 'SharedToken (ApplicationController#get_shared_token)' do
  # This spec tests the get_shared_token method directly, bypassing
  # the stub in rails_helper that disables set_shared_token for request specs.

  let(:controller) { ApplicationController.new }

  before do
    # Restore the real implementation for this spec
    allow(controller).to receive(:get_shared_token).and_call_original
  end

  it 'returns nil when SHARED_SECRET is not set' do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('SHARED_SECRET').and_return(nil)
    allow(controller).to receive(:current_user).and_return(nil)

    expect(controller.send(:get_shared_token)).to be_nil
  end

  it 'returns an encrypted token when SHARED_SECRET is set' do
    key = SecureRandom.hex(32) # 64 hex chars = 32 bytes for key + 32 for sign
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('SHARED_SECRET').and_return(key)
    allow(controller).to receive(:current_user).and_return(nil)
    controller.instance_variable_set(:@list, nil)

    token = controller.send(:get_shared_token)
    expect(token).to be_a(String)
    expect(token).not_to be_empty
  end

  it 'produces a token that can be decrypted' do
    key = SecureRandom.hex(32)
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('SHARED_SECRET').and_return(key)
    allow(controller).to receive(:current_user).and_return(nil)
    controller.instance_variable_set(:@list, nil)

    token = controller.send(:get_shared_token)

    encryptor = ActiveSupport::MessageEncryptor.new(
      key[0...32], key[32...64],
      cipher: "aes-256-cbc", digest: 'SHA1'
    )
    decrypted = JSON.parse(encryptor.decrypt_and_verify(Base64.decode64(token)))
    expect(decrypted[0]['user_id']).to be_nil
    expect(decrypted[0]['v']).to eq(1)
  end
end
