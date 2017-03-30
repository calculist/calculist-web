class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :validatable

  has_many :lists
  has_many :list_shares

  after_create :setup_account

  validates :username,
            presence: true,
            uniqueness: {
              case_sensitive: false
            }
  validates_format_of :username, with: /^[a-zA-Z0-9_]*$/, multiline: true
  validates :invite_code, with: :validate_invite_code

  def must_confirm_email?
    self.confirmed_at.nil? && (Time.now - self.created_at) > 48.hours
  end

  def setup_account
    save_invite_code
    create_initial_lists
  end

  def invite_code=(code)
    @invite_code = code
  end

  def invite_code
    return @invite_code if @invite_code || !id
    ba = BetaAccess.where(claimed_by: id).first
    return @invite_code = ba.code if ba
  end

  def validate_invite_code
    @beta_access = BetaAccess.where(code: @invite_code).first
    if @beta_access && @beta_access.claimed_by && @beta_access.claimed_by != id
      errors.add :invite_code, 'has already been claimed'
    elsif !@beta_access
      errors.add :invite_code, 'is not valid'
    end
  end

  def save_invite_code
    @beta_access ||= BetaAccess.where(code: @invite_code).first
    if @beta_access.notes == 'promo'
      @beta_access = BetaAccess.create(notes: "promo:#{@invite_code}")
      @invite_code = @beta_access.code
    end

    if @beta_access && @beta_access.claimed_by.nil?
      @beta_access.claimed_by = id
      @beta_access.claimed_at = DateTime.now
      @beta_access.save!
    end
  end

  def login=(login)
    @login = login
  end

  def login
    @login || self.username || self.email
  end

  def create_initial_lists
    primary_list
    preferences
  end

  def primary_list
    @primary_list ||= lists.where(list_type: 'user_primary').first
    unless @primary_list
      @primary_list = List.create(title: username,
                                  user_id: id,
                                  update_count: 0,
                                  handle: username,
                                  list_type: 'user_primary')
      upm.create_primary_list_items
    end
    @primary_list
  end

  def preferences
    @preferences ||= lists.where(list_type: 'user_preferences').first
    unless @preferences
      @preferences = List.create(title: 'my preferences',
                                  user_id: id,
                                  update_count: 0,
                                  handle: 'preferences',
                                  list_type: 'user_preferences')
      upm.create_preference_items
    end
    @preferences
  end

  def default_theme
    list_id = preferences.id
    parent_item = Item.where(list_id: list_id, is_deleted: false, text: 'default theme').first
    return 'light' unless parent_item
    item = Item.where(list_id: list_id, is_deleted: false, parent_guid: parent_item.guid, text: ['dark','sandcastle']).first
    item ? item.text : 'light'
  end

  def default_font
    list_id = preferences.id
    parent_item = Item.where(list_id: list_id, is_deleted: false, text: 'default font').first
    return 'Ubuntu Mono' unless parent_item
    item = Item.where(list_id: list_id, is_deleted: false, parent_guid: parent_item.guid).first
    item ? item.text : 'Ubuntu Mono'
  end

  def access_to_list(list)
    return 'read_write' if list.user_id == id
    share = ListShare.where(list_id: list.id, user_id: id).first
    share ? share.access_type : 'no_access'
  end

  def self.find_by_login(login)
    where(["username = :value OR email = :value", { value: login.downcase }]).first
  end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions.to_h).find_by_login(login)
    elsif conditions.has_key?(:username) || conditions.has_key?(:email)
      conditions[:email].downcase! if conditions[:email]
      where(conditions.to_h).first
    end
  end

  private

  def upm
    @upm ||= UserPreferencesManager.new(id)
  end

end
