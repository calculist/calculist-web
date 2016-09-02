class Item < ActiveRecord::Base
  validates :list_id, presence: true
  validates :list_update_id, presence: true
  validates :initial_list_update_id, presence: true
  validates :guid, presence: true
  validates :parent_guid, presence: true, unless: :is_top_item
  validates :sort_order, presence: true

  belongs_to :list

  def main_attributes_hash
    [:guid, :text, :is_collapsed, :is_deleted,
     :parent_guid, :sort_order].inject({}) do |h, key|
      h[key] = self.send(key)
      h
    end
  end

  def parent
    is_top_item ? nil : find_by_guid(parent_guid)
  end

  def children
    where(parent_guid: guid).order(:sort_order)
  end

end
