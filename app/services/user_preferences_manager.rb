class UserPreferencesManager

  remove_guids = -> (hash) do
    hash.delete('guid')
    hash['items'].each {|h| remove_guids.call(h) }
  end

  load_list = -> (name) do
    list = JSON.parse(File.read("#{Rails.root}/config/lists/#{name}.calculist"))
    remove_guids.call(list)
    list
  end

  LIST_STATS = load_list.call('list_stats')
  DEFAULT_PREFERENCES = load_list.call('default_preferences')
  WELCOME_LIST = load_list.call('welcome_list')

  def initialize(user_id)
    @user_id = user_id
  end

  def create_primary_list_items
    im = ItemManager.new(user.primary_list)
    im.create_items_from_tree({
      text: user.primary_list.title,
      items: [LIST_STATS]
    })
  end

  def create_preference_items
    im = ItemManager.new(user.preferences)
    im.create_items_from_tree(DEFAULT_PREFERENCES)
  end

  def create_welcome_list_items
    im = ItemManager.new(user.welcome_list)
    im.create_items_from_tree(WELCOME_LIST)
  end

  private

  def user
    @user ||= User.find(@user_id)
  end

end
