class Auth::RegistrationsController < Devise::RegistrationsController
  layout 'auth'

  before_filter :configure_sign_up_params, only: [:create]

  protected

  def build_resource(hash = nil)
    super(hash)
    self.resource.build_account if self.resource.account.nil?
  end

  def configure_sign_up_params
    devise_parameter_sanitizer.for(:sign_up) do |u|
      u.permit(:email, :password, :password_confirmation, account_attributes: [:username])
    end
  end

  def after_sign_up_path_for(resource)
    account_path(resource.account)
  end
end
