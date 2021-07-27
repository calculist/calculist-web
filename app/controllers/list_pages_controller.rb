class ListPagesController < ApplicationController
  before_action :authenticate_user!, except: [:blankpage, :sample]

  def index
    @user = User.where(username: params[:username]).first
    if @user.nil? || @user != current_user
      # TODO make a public profile page instead of 404
      render_404
      return
    end
    @lists = @user.lists.where(list_type: ['user_preferences', nil]).order('updated_at desc')
    @list = @user.primary_list
    @list.content['items'].unshift(get_profile_page_list_of_lists)
    @other_lists = get_title_handle_path_id(@lists, @user)
    @theme = @user.default_theme
    @font = @user.default_font
  end

  def show
    if params[:hex_id]
      @list = List.where(hex_id: params[:hex_id]).first
      return render_404 if @list.nil?
      @list_owner = User.find(@list.user_id)
    else
      if params[:username]
        @list_owner = User.where(username: params[:username]).first
        return render_404 if @list_owner.nil?
      end
      @list_owner ||= current_user
      @list = List.where(handle: params[:handle], user_id: @list_owner.id).first
      if @list.nil? && @list_owner.id == current_user.id && params[:handle] == 'welcome'
        @list = @list_owner.welcome_list
      end
      return show_non_existent if @list.nil?
    end
    return show_non_existent unless current_user_can_read?
    return redirect_to(profile_page_path(username: @list_owner.username)) if @list.is_user_primary?
    @lists = current_user.lists
    @other_lists = get_title_handle_path_id(@lists, current_user)
    @theme = @list_owner.default_theme
    @font = @list_owner.default_font
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
    @list = List.new(user_id: current_user.id)
    @list.title = params[:title] if params[:title]
    @list.handle = params[:handle] if params[:handle]
    @list.default_values
    @list.save!
    if params[:handle]
      redirect_to list_page_path(username: current_user.username, handle: @list.handle)
    else
      redirect_to list_page_by_hex_id_path(hex_id: @list.hex_id)
    end
  end

  def blankpage
  end

  def sample
    @json = (@@sample_doc ||= File.read("#{Rails.root}/config/lists/sample_doc.calculist"))
    @list_title = '\emoji[U+1F4DD] Sample Document'
    render 'static_list'
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
      text: 'lists',
      guid: "do_not_save#{inc += 1}",
      'items': @lists.map do |list| {
        text: list.title,
        collapsed: true,
        guid: "do_not_save#{inc += 1}",
        'items': [
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
            'items': list.list_shares.map { |ls| { text: "#{ls.user.username} [:] #{ls.access_type}" } }
          }
        ]
      } end
    }
  end

end
