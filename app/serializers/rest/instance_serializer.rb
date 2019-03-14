# frozen_string_literal: true

class REST::InstanceSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :uri, :title, :description, :email,
             :version, :urls, :stats, :thumbnail, :max_toot_chars, :poll_limits,
             :languages, :registrations

  has_one :contact_account, serializer: REST::AccountSerializer

  delegate :contact_account, to: :instance_presenter

  def uri
    Rails.configuration.x.local_domain
  end

  def title
    Setting.site_title
  end

  def description
    Setting.site_description
  end

  def email
    Setting.site_contact_email
  end

  def version
    Mastodon::Version.to_s
  end

  def thumbnail
    instance_presenter.thumbnail ? full_asset_url(instance_presenter.thumbnail.file.url) : full_pack_url('preview.jpg')
  end

  def max_toot_chars
    StatusLengthValidator::MAX_CHARS
  end

  def poll_limits
    {
      max_options: PollValidator::MAX_OPTIONS,
      max_option_chars: PollValidator::MAX_OPTION_CHARS,
      min_expiration: PollValidator::MIN_EXPIRATION,
      max_expiration: PollValidator::MAX_EXPIRATION,
    }
  end

  def stats
    {
      user_count: instance_presenter.user_count,
      status_count: instance_presenter.status_count,
      domain_count: instance_presenter.domain_count,
    }
  end

  def urls
    { streaming_api: Rails.configuration.x.streaming_api_base_url }
  end

  def languages
    [I18n.default_locale]
  end

  def registrations
    Setting.registrations_mode != 'none' && !Rails.configuration.x.single_user_mode
  end

  private

  def instance_presenter
    @instance_presenter ||= InstancePresenter.new
  end
end
