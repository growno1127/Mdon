class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  force_ssl if: "Rails.env.production? && ENV['LOCAL_HTTPS'] == 'true'"

  helper_method :current_account

  protected

  def current_account
    current_user.try(:account)
  end
end
