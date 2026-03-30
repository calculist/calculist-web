module TestHelpers
  # Creates a user with a valid beta access code. The after_create
  # hook runs, which claims the invite code and creates initial
  # lists (primary, preferences, welcome).
  def create_beta_access(notes: nil)
    BetaAccess.create!(notes: notes)
  end

  def create_user(username: "testuser#{SecureRandom.hex(3)}", email: nil, password: 'Pa$$WoRD321')
    email ||= "#{username}@example.com"
    ba = create_beta_access
    user = User.create!(
      username: username,
      email: email,
      password: password,
      invite_code: ba.code
    )
    user.update_column(:confirmed_at, Time.now) # skip email confirmation
    user
  end

  def create_list(user:, title: 'Test List', handle: nil, list_type: nil)
    handle ||= "list_#{SecureRandom.hex(4)}"
    List.create!(
      title: title,
      user_id: user.id,
      handle: handle,
      hex_id: SecureRandom.hex(4),
      update_count: 0,
      list_type: list_type
    )
  end

  def create_item(list:, text: 'test item', parent_guid: nil, is_top_item: false, sort_order: 100.0, is_deleted: false)
    Item.create!(
      guid: SecureRandom.uuid,
      list_id: list.id,
      parent_guid: parent_guid,
      sort_order: sort_order,
      text: text,
      is_collapsed: false,
      is_deleted: is_deleted,
      is_top_item: is_top_item,
      list_update_id: list.update_count || 0,
      initial_list_update_id: list.update_count || 0
    )
  end

  def create_tree(list:, root_text: 'Root', children_texts: [])
    top = create_item(list: list, text: root_text, is_top_item: true)
    children = children_texts.each_with_index.map do |text, i|
      create_item(list: list, text: text, parent_guid: top.guid, sort_order: (i + 1) * 100.0)
    end
    [top, children]
  end
end

RSpec.configure do |config|
  config.include TestHelpers
end
