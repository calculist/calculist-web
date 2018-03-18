class List < ActiveRecord::Base
  belongs_to :user
  has_many :items, dependent: :destroy
  has_many :list_shares, dependent: :destroy

  before_save :default_values

  validates :handle, presence: true
  validates :hex_id, presence: true
  validates :list_type, :inclusion => { :in => %w(user_preferences user_primary) }, :allow_nil => true

  def default_values
    self.title ||= 'Untitled List'
    self.hex_id ||= SecureRandom.hex(4)
    self.handle ||= self.hex_id
    self.update_count ||= 0
  end

  def content=(_content)
    @content = _content
  end

  def content
    return @content if @content
    im = ItemManager.new(id)
    @content = im.get_tree
    @content
  end

  def is_user_primary?
    list_type == 'user_primary'
  end

  def is_user_preferences?
    list_type == 'user_preferences'
  end

end
