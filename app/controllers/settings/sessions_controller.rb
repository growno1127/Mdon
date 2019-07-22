# frozen_string_literal: true

class Settings::SessionsController < Settings::BaseController
  before_action :authenticate_user!
  before_action :set_session, only: :destroy

  skip_before_action :require_functional!

  def destroy
    @session.destroy!
    flash[:notice] = I18n.t('sessions.revoke_success')
    redirect_to edit_user_registration_path
  end

  private

  def set_session
    @session = current_user.session_activations.find(params[:id])
  end
end
