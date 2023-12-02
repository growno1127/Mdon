# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

def host_to_url(str)
  return if str.blank?

  uri = Addressable::URI.parse("http#{Rails.configuration.x.use_https ? 's' : ''}://#{str}")
  uri.path += '/' unless uri.path.blank? || uri.path.end_with?('/')
  uri.to_s
end

def sso_host
  return unless ENV['ONE_CLICK_SSO_LOGIN'] == 'true'
  return unless ENV['OMNIAUTH_ONLY'] == 'true'
  return unless Devise.omniauth_providers.length == 1

  provider = Devise.omniauth_configs[Devise.omniauth_providers[0]]
  @sso_host ||= begin
    case provider.provider
    when :cas
      provider.cas_url
    when :saml
      provider.options[:idp_sso_target_url]
    when :openid_connect
      provider.options.dig(:client_options, :authorization_endpoint) || OpenIDConnect::Discovery::Provider::Config.discover!(provider.options[:issuer]).authorization_endpoint
    end
  end
end

unless Rails.env.development?
  assets_host = Rails.configuration.action_controller.asset_host || "https://#{ENV['WEB_DOMAIN'] || ENV['LOCAL_DOMAIN']}"
  data_hosts = [assets_host, 'https://media.tenor.com']

  if ENV['S3_ENABLED'] == 'true' || ENV['AZURE_ENABLED'] == 'true'
    attachments_host = host_to_url(ENV['S3_ALIAS_HOST'] || ENV['S3_CLOUDFRONT_HOST'] || ENV['AZURE_ALIAS_HOST'] || ENV['S3_HOSTNAME'] || "s3-#{ENV['S3_REGION'] || 'us-east-1'}.amazonaws.com")
  elsif ENV['SWIFT_ENABLED'] == 'true'
    attachments_host = ENV['SWIFT_OBJECT_URL']
    attachments_host = "https://#{Addressable::URI.parse(attachments_host).host}"
  else
    attachments_host = nil
  end

  data_hosts << attachments_host unless attachments_host.nil?

  if ENV['PAPERCLIP_ROOT_URL']
    url = Addressable::URI.parse(assets_host) + ENV['PAPERCLIP_ROOT_URL']
    data_hosts << "https://#{url.host}"
  end

  data_hosts.concat(ENV['EXTRA_DATA_HOSTS'].split('|')) if ENV['EXTRA_DATA_HOSTS']

  data_hosts.uniq!

  Rails.application.config.content_security_policy do |p|
    p.base_uri        :none
    p.default_src     :none
    p.frame_ancestors :none
    p.script_src      :self, assets_host, "'wasm-unsafe-eval'"
    p.font_src        :self, assets_host
    p.img_src         :self, :data, :blob, *data_hosts
    p.style_src       :self, assets_host
    p.media_src       :self, :data, *data_hosts
    p.frame_src       :self, :https
    p.child_src       :self, :blob, assets_host
    p.worker_src      :self, :blob, assets_host
    p.connect_src     :self, :blob, :data, Rails.configuration.x.streaming_api_base_url, *data_hosts, 'https://api.tenor.com'
    p.manifest_src    :self, assets_host

    if sso_host.present?
      p.form_action     :self, sso_host
    else
      p.form_action     :self
    end
  end
end

# Report CSP violations to a specified URI
# For further information see the following documentation:
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only
# Rails.application.config.content_security_policy_report_only = true

Rails.application.config.content_security_policy_nonce_generator = ->request { SecureRandom.base64(16) }

Rails.application.config.content_security_policy_nonce_directives = %w(style-src)

Rails.application.reloader.to_prepare do
  PgHero::HomeController.content_security_policy do |p|
    p.script_src :self, :unsafe_inline, assets_host
    p.style_src  :self, :unsafe_inline, assets_host
  end

  PgHero::HomeController.after_action do
    request.content_security_policy_nonce_generator = nil
  end

  if Rails.env.development?
    LetterOpenerWeb::LettersController.content_security_policy do |p|
      p.child_src       :self
      p.connect_src     :none
      p.frame_ancestors :self
      p.frame_src       :self
      p.script_src      :unsafe_inline
      p.style_src       :unsafe_inline
      p.worker_src      :none
    end

    LetterOpenerWeb::LettersController.after_action do |p|
      request.content_security_policy_nonce_directives = %w(script-src)
    end
  end
end
