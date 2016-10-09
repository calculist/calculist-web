class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :configure_permitted_parameters, if: :devise_controller?

  def render_403(message = 'forbidden')
    render status: 403, message: message
  end

  def render_404
    render template: 'error_pages/404', status: :not_found
  end

  protected

  def configure_permitted_parameters
    added_attrs = [:username, :email, :password, :password_confirmation, :remember_me]
    devise_parameter_sanitizer.permit :sign_up, keys: added_attrs
    devise_parameter_sanitizer.permit :account_update, keys: added_attrs
  end

  def after_sign_in_path_for(resource_or_scope)
    if current_user
      profile_page_path(username: current_user.username)
    else
      stored_location_for(resource_or_scope) || signed_in_root_path(resource_or_scope)
    end
  end
end
