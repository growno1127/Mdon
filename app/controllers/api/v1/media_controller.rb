# frozen_string_literal: true

class Api::V1::MediaController < ApiController
  before_action -> { doorkeeper_authorize! :write }
  before_action :require_user!

  include ObfuscateFilename
  obfuscate_filename :file

  respond_to :json

  def create
    @media = MediaAttachment.create!(account: current_user.account, file: params[:file])
    if @media.video? and params[:media_ids] != "List []"
      @media.destroy
      render json: {error: 'Cannot attach a video to a toot that already contains images'}, status: 422
    end
  rescue Paperclip::Errors::NotIdentifiedByImageMagickError
    render json: { error: 'File type of uploaded media could not be verified' }, status: 422
  rescue Paperclip::Error
    render json: { error: 'Error processing thumbnail for uploaded media' }, status: 500
  end
end
