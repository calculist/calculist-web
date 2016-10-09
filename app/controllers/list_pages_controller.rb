class ListPagesController < ApplicationController
  before_action :authenticate_user!

  def index
    @user = User.where(username: params[:username]).first
    if @user.nil? || @user != current_user
      # TODO make a public profile page instead of 404
      render_404
      return
    end
    @lists = @user.lists.where(list_type: ['user_preferences', nil]).order('updated_at desc')
    @list = @user.primary_list
    @list.content['$items'].unshift(get_profile_page_list_of_lists)
    @other_lists = get_title_handle_path_id(@lists, @user)
    @theme = @user.default_theme
  end

  def show
    @list_owner = User.where(username: params[:username]).first
    return render_404 if @list_owner.nil?
    @list = List.where(handle: params[:handle], user_id: @list_owner.id).first
    return show_non_existent if @list.nil?
    unless current_user_can_read?
      return show_non_existent
    end
    @lists = current_user.lists
    @other_lists = get_title_handle_path_id(@lists, current_user)
    @theme = @list_owner.default_theme
  end

  def show_non_existent
    @error_message = "This list does not exist."
    render_404
  end

  def show_deleted
    # TODO Make this page actionable, i.e. allow the user to
    # do something with the deleted items on this page.
    @list_owner = User.where(username: params[:username]).first
    return render_404 if @list_owner.nil?
    @list = List.where(handle: params[:handle], user_id: @list_owner.id).first
    if @list && current_user_can_write?
      im = ItemManager.new(@list.id)
      days_ago = [params[:days_ago].to_i, 1].max
      @recently_deleted_items = im.get_recently_deleted(days_ago)
    else
      return render_404
    end
    @lists = current_user.lists
  end

  def create
    @list = List.create(user_id: current_user.id)
    @list.title = params[:title] if params[:title]
    @list.handle = params[:handle] || @list.id
    @list.save!
    redirect_to list_page_path(username: current_user.username, handle: @list.handle)
  end

private

  # NOTE Should these methods be User model methods?
  def current_user_can(access_types)
    current_user.id == @list.user_id || access_types.include?(current_user.access_to_list(@list))
  end

  def current_user_can_read?
    current_user_can(['read_write','read_only'])
  end

  def current_user_can_write?
    current_user_can(['read_write'])
  end

  def get_title_handle_path_id(lists, user)
    lists.map { |list| { title: list.title, handle: list.handle, path: list_page_path(username: user.username, handle: list.handle), id: list.id } }
  end

  def get_profile_page_list_of_lists
    inc = 0
    {
      text: 'lists [=] count($items)',
      guid: "do_not_save#{inc += 1}",
      '$items': @lists.map do |list| {
        text: list.title,
        collapsed: true,
        guid: "do_not_save#{inc += 1}",
        '$items': [
          {
            text: "handle [:] #{list.handle}",
            guid: "do_not_save#{inc += 1}"
          },{
            text: "created_at [:] #{list.created_at}",
            guid: "do_not_save#{inc += 1}"
          },{
            text: "updated_at [:] #{list.updated_at}",
            guid: "do_not_save#{inc += 1}",
          },{
            text: "update_count [:] #{list.update_count}",
            guid: "do_not_save#{inc += 1}"
          },{
            text: "item_count [:] #{list.items.where(is_deleted: false).pluck('count(*)')[0]}",
            guid: "do_not_save#{inc += 1}",
          },{
            text: "shared_with [=] count($items)",
            guid: "do_not_save#{inc += 1}",
            '$items': list.list_shares.map { |ls| { text: "#{ls.user.username} [:] #{ls.access_type}" } }
          }
        ]
      } end
    }
  end

end
