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

  def looks_valid?
    # This method is used to speed up bulk updates by preventing
    # ActiveRecord from repeatedly loading up the same list
    # after each save.
    # TODO Find a better/faster way to do bulk updates.
    list_id.is_a?(Integer) &&
    list_update_id.is_a?(Integer) &&
    initial_list_update_id.is_a?(Integer) &&
    guid.is_a?(String) &&
    ((!is_top_item && parent_guid.is_a?(String)) ||
    (is_top_item == true && parent_guid.nil?)) &&
    sort_order.is_a?(Float)
  end

  def parent
    is_top_item ? nil : find_by_guid(parent_guid)
  end

  def children
    where(parent_guid: guid).order(:sort_order)
  end

end
