class HomeController < ApplicationController

  def index
    redirect_to profile_page_path(username: current_user.username) if current_user
  end

end
