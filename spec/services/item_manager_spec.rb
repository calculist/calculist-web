require 'rails_helper'

describe ItemManager do

  let(:invite_code) { BetaAccess.create }
  let(:user) { User.create(username: 'user1', email: 'user1@calculist.io', password: 'Pa$$WoRD321', invite_code: invite_code.code) }
  let(:list) { List.create(title: 'list foo', handle: 'listfoo', user_id: user.id) }

  it 'should work' do
    item_manager = ItemManager.new(list)
    item_manager.get_tree
  end

end
