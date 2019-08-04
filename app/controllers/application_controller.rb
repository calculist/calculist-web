class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :configure_permitted_parameters, if: :devise_controller?
  after_action :set_shared_token

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
      root_path
    else
      stored_location_for(resource_or_scope) || signed_in_root_path(resource_or_scope)
    end
  end

  def get_shared_token
    key = Rails.application.secrets.shared_secret
    if key
      encryptor = ActiveSupport::MessageEncryptor.new(
        key[0...32],
        key[32...64],
        cipher: "aes-256-cbc", digest: 'SHA1'
      )
      user_id = current_user ? current_user.id : nil
      list_id = @list ? @list.id : nil

      Base64.encode64(encryptor.encrypt_and_sign([
        {user_id: user_id, list_id: list_id, v: 1},
        DateTime.now,
        SecureRandom.hex(16)
      ].to_json)).gsub("\n","")
    end
  end

  def set_shared_token
    shared_token = get_shared_token
    if shared_token
      cookies['_calculist_shared_token'] = {
        httponly: true,
        domain: :all,
        value: shared_token
      }
    elsif cookies['_calculist_shared_token']
      cookies.delete('_calculist_shared_token', domain: :all)
    end
  end
end
