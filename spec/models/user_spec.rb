require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      ba = BetaAccess.create!
      user = User.new(username: 'validuser', email: 'valid@example.com',
                       password: 'Pa$$WoRD321', invite_code: ba.code)
      expect(user).to be_valid
    end

    it 'requires username' do
      ba = BetaAccess.create!
      user = User.new(email: 'test@example.com', password: 'Pa$$WoRD321', invite_code: ba.code)
      expect(user).not_to be_valid
      expect(user.errors[:username]).to be_present
    end

    it 'requires unique username (case insensitive)' do
      create_user(username: 'uniqueuser')
      ba = BetaAccess.create!
      user = User.new(username: 'UniqueUser', email: 'other@example.com',
                       password: 'Pa$$WoRD321', invite_code: ba.code)
      expect(user).not_to be_valid
      expect(user.errors[:username]).to be_present
    end

    it 'validates username format - alphanumeric and underscores only' do
      ba = BetaAccess.create!
      user = User.new(username: 'invalid-user!', email: 'test@example.com',
                       password: 'Pa$$WoRD321', invite_code: ba.code)
      expect(user).not_to be_valid
    end

    it 'allows underscores in username' do
      ba = BetaAccess.create!
      user = User.new(username: 'valid_user_123', email: 'test@example.com',
                       password: 'Pa$$WoRD321', invite_code: ba.code)
      expect(user).to be_valid
    end

    it 'validates invite code existence' do
      user = User.new(username: 'testuser', email: 'test@example.com',
                       password: 'Pa$$WoRD321', invite_code: 'nonexistent')
      expect(user).not_to be_valid
      expect(user.errors[:invite_code]).to be_present
    end

    it 'validates invite code not already claimed' do
      ba = BetaAccess.create!
      ba.update!(claimed_by: 999, claimed_at: DateTime.now)
      user = User.new(username: 'testuser', email: 'test@example.com',
                       password: 'Pa$$WoRD321', invite_code: ba.code)
      expect(user).not_to be_valid
      expect(user.errors[:invite_code]).to include('has already been claimed')
    end

    it 'requires email (via Devise)' do
      ba = BetaAccess.create!
      user = User.new(username: 'testuser', password: 'Pa$$WoRD321', invite_code: ba.code)
      expect(user).not_to be_valid
      expect(user.errors[:email]).to be_present
    end

    it 'requires password (via Devise)' do
      ba = BetaAccess.create!
      user = User.new(username: 'testuser', email: 'test@example.com', invite_code: ba.code)
      expect(user).not_to be_valid
      expect(user.errors[:password]).to be_present
    end
  end

  describe '#setup_account' do
    it 'creates initial lists on user creation' do
      user = create_user
      expect(user.lists.where(list_type: 'user_primary').count).to eq(1)
      expect(user.lists.where(list_type: 'user_preferences').count).to eq(1)
      expect(user.lists.where(list_type: 'welcome').count).to eq(1)
    end

    it 'claims the invite code' do
      ba = BetaAccess.create!
      user = User.create!(username: 'claimer', email: 'claimer@example.com',
                            password: 'Pa$$WoRD321', invite_code: ba.code)
      ba.reload
      expect(ba.claimed_by).to eq(user.id)
      expect(ba.claimed_at).to be_present
    end
  end

  describe '#primary_list' do
    it 'returns the user_primary list' do
      user = create_user
      pl = user.primary_list
      expect(pl.list_type).to eq('user_primary')
      expect(pl.user_id).to eq(user.id)
    end

    it 'creates items in the primary list' do
      user = create_user
      pl = user.primary_list
      expect(pl.items.count).to be > 0
    end
  end

  describe '#preferences' do
    it 'returns the user_preferences list' do
      user = create_user
      prefs = user.preferences
      expect(prefs.list_type).to eq('user_preferences')
    end
  end

  describe '#welcome_list' do
    it 'returns the welcome list' do
      user = create_user
      wl = user.welcome_list
      expect(wl.list_type).to eq('welcome')
    end
  end

  describe '#default_theme' do
    it 'returns a valid theme from default preferences' do
      user = create_user
      expect(['light', 'dark', 'sandcastle']).to include(user.default_theme)
    end

    it 'returns light when preference items are missing' do
      user = create_user
      # Delete the preference items so the fallback kicks in
      user.preferences.items.destroy_all
      expect(user.default_theme).to eq('light')
    end
  end

  describe '#default_font' do
    it 'returns a font from default preferences' do
      user = create_user
      expect(user.default_font).to be_a(String)
      expect(user.default_font).not_to be_empty
    end

    it 'returns Ubuntu Mono when preference items are missing' do
      user = create_user
      user.preferences.items.destroy_all
      expect(user.default_font).to eq('Ubuntu Mono')
    end
  end

  describe '#access_to_list' do
    let(:owner) { create_user(username: 'owner') }
    let(:other_user) { create_user(username: 'otheruser') }
    let(:list) { create_list(user: owner) }

    it 'returns read_write for the list owner' do
      expect(owner.access_to_list(list)).to eq('read_write')
    end

    it 'returns no_access for unshared user' do
      expect(other_user.access_to_list(list)).to eq('no_access')
    end

    it 'returns the share access_type for a shared user' do
      ListShare.create!(list_id: list.id, user_id: other_user.id,
                          shared_by: owner.id, access_type: 'read_only')
      expect(other_user.access_to_list(list)).to eq('read_only')
    end

    it 'returns read_write for a read_write shared user' do
      ListShare.create!(list_id: list.id, user_id: other_user.id,
                          shared_by: owner.id, access_type: 'read_write')
      expect(other_user.access_to_list(list)).to eq('read_write')
    end
  end

  describe '#login' do
    it 'returns username by default' do
      user = create_user(username: 'myuser')
      expect(user.login).to eq('myuser')
    end

    it 'returns custom login when set' do
      user = create_user
      user.login = 'custom_login'
      expect(user.login).to eq('custom_login')
    end
  end

  describe '.find_by_login' do
    it 'finds user by username' do
      user = create_user(username: 'findme')
      found = User.find_by_login('findme')
      expect(found).to eq(user)
    end

    it 'finds user by email' do
      user = create_user(username: 'emailuser', email: 'find@example.com')
      found = User.find_by_login('find@example.com')
      expect(found).to eq(user)
    end

    it 'is case insensitive' do
      user = create_user(username: 'caseuser', email: 'Case@Example.com')
      found = User.find_by_login('case@example.com')
      expect(found).to eq(user)
    end

    it 'returns nil for non-existent login' do
      expect(User.find_by_login('nobody')).to be_nil
    end
  end

  describe '#must_confirm_email?' do
    it 'returns true for unconfirmed user after 48 hours' do
      user = create_user
      user.update_columns(confirmed_at: nil, created_at: 3.days.ago)
      expect(user.must_confirm_email?).to be true
    end

    it 'returns false for confirmed user' do
      user = create_user
      expect(user.must_confirm_email?).to be false
    end

    it 'returns false for recently created unconfirmed user' do
      user = create_user
      user.update_columns(confirmed_at: nil, created_at: 1.hour.ago)
      expect(user.must_confirm_email?).to be false
    end
  end

  describe 'associations' do
    it 'has many lists' do
      user = create_user
      expect(user.lists.count).to be >= 3 # primary, preferences, welcome
    end

    it 'has many list_shares' do
      user = create_user
      expect(user.list_shares).to eq([])
    end
  end
end
