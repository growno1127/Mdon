# frozen_string_literal: true

class Api::V1::Statuses::TranslationsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :read, :'read:statuses' }
  before_action :set_status
  before_action :set_translation

  rescue_from TranslationService::NotConfiguredError, with: :not_found
  rescue_from TranslationService::UnexpectedResponseError, with: :service_unavailable

  rescue_from TranslationService::QuotaExceededError do
    render json: { error: I18n.t('translation.errors.quota_exceeded') }, status: 503
  end

  rescue_from TranslationService::TooManyRequestsError do
    render json: { error: I18n.t('translation.errors.too_many_requests') }, status: 503
  end

  def create
    render json: @translation, serializer: REST::TranslationSerializer
  end

  private

  def set_status
    @status = Status.find(params[:status_id])
    authorize @status, :show?
  rescue Mastodon::NotPermittedError
    not_found
  end

  def set_translation
    @translation = TranslateStatusService.new.call(@status, content_locale)
  end
end
