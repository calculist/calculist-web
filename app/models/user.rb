class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :validatable

  has_many :lists
  has_many :list_shares

  after_create :create_preferences

  validates :username,
            :presence => true,
            :uniqueness => {
              :case_sensitive => false
            }
  validates_format_of :username, with: /^[a-zA-Z0-9_\.]*$/, :multiline => true

  def invite_code
    nil # TODO remove this method after beta
  end

  def login=(login)
    @login = login
  end

  def login
    @login || self.username || self.email
  end

  def create_preferences
    unless preferences
      List.create(title: 'my preferences',
                  user_id: id,
                  update_count: 0,
                  handle: 'preferences',
                  list_type: 'user_preferences')
      upm = UserPreferencesManager.new(id)
      upm.create_preference_items
    end
  end

  def preferences
    @preferences ||= lists.where(list_type: 'user_preferences').first
  end

  def default_theme
    list_id = preferences.id
    parent_item = Item.where(list_id: list_id, is_deleted: false, text: 'default theme').first
    return 'light' unless parent_item
    item = Item.where(list_id: list_id, is_deleted: false, parent_guid: parent_item.guid, text: ['dark','sandcastle']).first
    item ? item.text : 'light'
  end

  def access_to_list(list)
    return 'read_write' if list.user_id == id
    share = ListShare.where(list_id: list.id, user_id: id).first
    share ? share.access_type : 'no_access'
  end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions.to_h).where(["username = :value OR email = :value", { :value => login.downcase }]).first
    elsif conditions.has_key?(:username) || conditions.has_key?(:email)
      conditions[:email].downcase! if conditions[:email]
      where(conditions.to_h).first
    end
  end

end
