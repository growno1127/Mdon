# frozen_string_literal: true

class Api::V1::Emails::ConfirmationsController < Api::BaseController
  before_action :doorkeeper_authorize!
  before_action :require_user_owned_by_application!

  def create
    current_user.resend_confirmation_instructions if current_user.unconfirmed_email.present?
    render_empty
  end

  private

  def require_user_owned_by_application!
    render json: { error: 'This method is only available to the application the user originally signed-up with' }, status: :forbidden unless current_user && current_user.created_by_application_id == doorkeeper_token.application_id
  end
end
