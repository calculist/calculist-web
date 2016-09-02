class ItemStatsManager

  def self.get_item_count_histogram_data(start_date, end_date = nil)
    end_date ||= start_date + 1.day
    format = '%Y-%m-%d 00:00:00'
    start_date_string = start_date.strftime(format)
    end_date_string = end_date.strftime(format)
    query = "
      select
        count(*) as items_created,
        date(created_at) as creation_date
      from
        items
      where
        is_deleted = 0
        and
        created_at > '#{start_date_string}'
        and
        created_at < '#{end_date_string}'
      group by
        creation_date
      order by
        creation_date
    "
    Item.connection.select(query)
  end

  def self.get_total_item_count_line_chart_data(group_by = 'date')
    # TODO make groupable in different ways
    query = "
      select
        count(*) as items_created,
        date(created_at) as creation_date
      from
        items
      where
        is_deleted = 0
      group by
        creation_date
      order by
        creation_date
    "
    data = Item.connection.select(query)
    running_total = 0
    data.each do |datum|
      running_total += datum['items_created']
      datum['items_created'] = running_total
    end
    data
  end

end
