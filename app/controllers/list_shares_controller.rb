class ListSharesController < ApplicationController
  before_action :authenticate_user!

  def index
    @list = List.find(params[:list_id])
    if @list.user_id == current_user.id
      shares = ListShare.where(list_id: @list.id)
      if params[:usernames]
        usernames = JSON.parse(params[:usernames]) rescue params[:usernames]
        user_ids = usernames_to_user_ids(usernames)
        shares = shares.where(user_id: user_ids)
      end
      render json: format_shares(shares.includes(:user))
    end
  end

  def create
    @list = List.find(params[:list_id])
    if @list.user_id == current_user.id
      existing_shares = ListShare.where(list_id: @list.id)
      user_ids = User.where(username: params[:usernames]).pluck(:id) - existing_shares.pluck(:user_id)
      shares = existing_shares.to_a + user_ids.map do |user_id|
        ListShare.create!(
          list_id: @list.id,
          shared_by: current_user.id,
          user_id: user_id,
          access_type: params[:access_type] || 'read_write',
        )
      end
      render json: format_shares(shares)
    end
  end

  def show
    @list = List.find(params[:list_id])
    if @list.user_id == current_user.id
      share = ListShare.where(list_id: @list.id, id: params[:id]).first
      render json: format_shares([share])[0]
    end
  end

  def update
  end

  def destroy
    @list = List.find(params[:list_id])
    if @list.user_id == current_user.id
      shares = ListShare.where(list_id: @list.id)
      if params[:id]
        shares = shares.where(id: params[:id])
      elsif params[:usernames]
        user_ids = usernames_to_user_ids(params[:usernames])
        shares = shares.where(user_id: user_ids)
      end
      ListShare.delete(shares.pluck(:id))
      render json: []
    end
  end

  private

  def usernames_to_user_ids(usernames)
    User.where(username: usernames).pluck(:id)
  end

  def format_shares(shares)
    shares.map do |share|
      share ? {
        id: share.id,
        list_id: share.list_id,
        username: share.user.username,
        access_type: share.access_type,
        created_at: share.created_at,
        updated_at: share.updated_at,
      } : nil
    end
  end
end
