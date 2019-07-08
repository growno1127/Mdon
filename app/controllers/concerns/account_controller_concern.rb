# frozen_string_literal: true

module AccountControllerConcern
  extend ActiveSupport::Concern

  include AccountOwnedConcern

  FOLLOW_PER_PAGE = 12

  included do
    layout 'public'

    before_action :set_instance_presenter
    before_action :set_link_headers
  end

  private

  def set_instance_presenter
    @instance_presenter = InstancePresenter.new
  end

  def set_link_headers
    response.headers['Link'] = LinkHeader.new(
      [
        webfinger_account_link,
        actor_url_link,
      ]
    )
  end

  def webfinger_account_link
    [
      webfinger_account_url,
      [%w(rel lrdd), %w(type application/jrd+json)],
    ]
  end

  def actor_url_link
    [
      ActivityPub::TagManager.instance.uri_for(@account),
      [%w(rel alternate), %w(type application/activity+json)],
    ]
  end

  def webfinger_account_url
    webfinger_url(resource: @account.to_webfinger_s)
  end
end
