class HomeController < ApplicationController

  def index
    if current_user
      redirect_to profile_page_path(username: current_user.username)
    end
  end

end
