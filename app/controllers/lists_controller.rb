class ListsController < ApplicationController
  before_action :authenticate_user!

  def show
    @list = List.find(params[:id])
    return render_403 unless current_user_can_read?
    if params[:last_save]
      last_save = params[:last_save].to_i
      new_items = @list.items
                        .where(is_deleted: false)
                        .where('initial_list_update_id > ?', last_save)
                        .order(:sort_order)
      updated_items = @list.items
                        .where('list_update_id > ? and (initial_list_update_id <= ? or initial_list_update_id is null)', last_save, last_save)
                        .order(:sort_order)
      render json: {
        last_save: @list.update_count,
        new_items: new_items.map(&:main_attributes_hash),
        updated_items: updated_items.map(&:main_attributes_hash)
      }
      return
    else
      render json: @list.content
    end
  end

  def update
    @list = List.find(params[:id])
    return render_403 unless current_user_can_write?
    # TODO figure out how to account for changes that occur
    # after the GET but before the PUT
    changes = []
    update_count = (@list.update_count || 0) + 1
    List.transaction do
      @list.title = params[:title] if params[:title]
      @list.update_count = update_count
      if params[:changes]
        im = ItemManager.new(@list.id)
        im.update_items(params[:changes], update_count)
      end
      @list.save!
    end
    render json: {
      last_save: update_count,
      changes: changes
    }
  end

  def destroy
    @list = List.find(params[:id])
    if @list.user_id != current_user.id
      render status: :forbidden, json: {message: 'only list owners can delete lists'}
    elsif @list.list_type != nil
      render status: :forbidden, json: {message: "lists of type '#{@list.list_type}' cannot be deleted"}
    else
      @list.destroy!
      render status: :ok, json: {message: "list '#{@list.title}' has been successfully deleted"}
    end
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
