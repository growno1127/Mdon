# frozen_string_literal: true

if ENV['S3_ENABLED'] == 'true'
  Aws.eager_autoload!(services: %w(S3))

  Paperclip::Attachment.default_options[:storage]        = :s3
  Paperclip::Attachment.default_options[:s3_protocol]    = ':https'
  Paperclip::Attachment.default_options[:url]            = ':s3_domain_url'
  Paperclip::Attachment.default_options[:s3_host_name]   = ENV.fetch('S3_HOSTNAME') { "s3-#{ENV.fetch('S3_REGION')}.amazonaws.com" }
  Paperclip::Attachment.default_options[:path]           = '/:class/:attachment/:id_partition/:style/:filename'
  Paperclip::Attachment.default_options[:s3_headers]     = { 'Cache-Control' => 'max-age=315576000', 'Expires' => 10.years.from_now.httpdate }
  Paperclip::Attachment.default_options[:s3_permissions] = 'public'
  Paperclip::Attachment.default_options[:s3_region]      = ENV.fetch('S3_REGION') { 'us-east-1' }

  unless ENV['S3_CLOUDFRONT_HOST'].blank?
    Paperclip::Attachment.default_options[:url]           = ':s3_alias_url'
    Paperclip::Attachment.default_options[:s3_host_alias] = ENV['S3_CLOUDFRONT_HOST']
  end

  Paperclip::Attachment.default_options[:s3_credentials] = {
    bucket: ENV.fetch('S3_BUCKET'),
    access_key_id: ENV.fetch('AWS_ACCESS_KEY_ID'),
    secret_access_key: ENV.fetch('AWS_SECRET_ACCESS_KEY'),
  }

  unless ENV['S3_ENDPOINT'].blank?
    Paperclip::Attachment.default_options[:s3_options] = {
      endpoint: ENV['S3_ENDPOINT'],
      force_path_style: true,
    }

    Paperclip::Attachment.default_options[:url] = ':s3_path_url'
  end
end
