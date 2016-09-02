class ListPagesController < ApplicationController
  before_action :authenticate_user!

  def index
    @user = User.find_by_username(params[:username])
    if @user.nil? || @user != current_user
      # TODO make a public profile page instead of 404
      render_404
      return
    end
    @lists = @user.lists.order('updated_at desc')
  end

  def show
    @list_owner = User.find_by_username(params[:username])
    render_404 if @list_owner.nil?
    @list = List.find_by_handle_and_user_id(params[:handle], @list_owner.id)
    render_404 if @list.nil?
    unless current_user_can_read?
      render_404 unless @list.id == 1 # TODO get rid of list.id == 1 hack
    end
    @lists = current_user.lists
    @theme = @list_owner.default_theme
  end

  def show_deleted
    # TODO Make this page actionable, i.e. allow the user to
    # do something with the deleted items on this page.
    @list_owner = User.find_by_username(params[:username])
    render_404 if @list_owner.nil?
    @list = List.find_by_handle_and_user_id(params[:handle], @list_owner.id)
    if @list && current_user_can_write?
      im = ItemManager.new(@list.id)
      days_ago = [params[:days_ago].to_i, 1].max
      @recently_deleted_items = im.get_recently_deleted(days_ago)
    else
      render_404
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

end
