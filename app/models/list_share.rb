class ListShare < ActiveRecord::Base
  belongs_to :user
  belongs_to :list

  before_save :default_values

  validates :list_id, presence: true
  validates :shared_by, presence: true # TODO validate that shared_by has write access
  validates :user_id, presence: true
  validates :access_type, :inclusion => { :in => %w(read_only read_write) }, :allow_nil => false

  def default_values
    access_type ||= 'read_only'
  end

end
