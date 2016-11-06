module RoutingHelper
  extend ActiveSupport::Concern
  include Rails.application.routes.url_helpers
  include ActionView::Helpers::AssetTagHelper

  included do
    def default_url_options
      ActionMailer::Base.default_url_options
    end
  end

  def full_asset_url(source)
    Rails.configuration.x.use_s3 ? source : File.join(root_url, ActionController::Base.helpers.asset_url(source))
  end
end
