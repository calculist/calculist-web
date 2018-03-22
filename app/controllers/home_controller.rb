class HomeController < ApplicationController

  before_action :authenticate_user!, except: :index

  def index
    if current_user
      homepage
    else
      redirect_to new_session_path(:user)
    end
  end

  def homepage
    @user = current_user
    @lists = @user.lists.where(list_type: [nil, 'welcome']).order('updated_at desc')
    @theme = @user.default_theme
    @font = @user.default_font
    render template: 'home/index'
  end

end
