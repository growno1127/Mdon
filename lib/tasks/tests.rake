# frozen_string_literal: true

namespace :tests do
  namespace :migrations do
    desc 'Populate the database with test data for 2.0.0'
    task populate_v2: :environment do
      admin_key   = OpenSSL::PKey::RSA.new(2048)
      user_key    = OpenSSL::PKey::RSA.new(2048)
      remote_key  = OpenSSL::PKey::RSA.new(2048)
      remote_key2 = OpenSSL::PKey::RSA.new(2048)
      remote_key3 = OpenSSL::PKey::RSA.new(2048)
      admin_private_key    = ActiveRecord::Base.connection.quote(admin_key.to_pem)
      admin_public_key     = ActiveRecord::Base.connection.quote(admin_key.public_key.to_pem)
      user_private_key     = ActiveRecord::Base.connection.quote(user_key.to_pem)
      user_public_key      = ActiveRecord::Base.connection.quote(user_key.public_key.to_pem)
      remote_public_key    = ActiveRecord::Base.connection.quote(remote_key.public_key.to_pem)
      remote_public_key2   = ActiveRecord::Base.connection.quote(remote_key2.public_key.to_pem)
      remote_public_key_ap = ActiveRecord::Base.connection.quote(remote_key3.public_key.to_pem)
      local_domain = ActiveRecord::Base.connection.quote(Rails.configuration.x.local_domain)

      ActiveRecord::Base.connection.execute(<<~SQL)
        -- accounts

        INSERT INTO "accounts"
          (id, username, domain, private_key, public_key, created_at, updated_at)
        VALUES
          (1, 'admin', NULL, #{admin_private_key}, #{admin_public_key}, now(), now()),
          (2, 'user',  NULL, #{user_private_key},  #{user_public_key},  now(), now());

        INSERT INTO "accounts"
          (id, username, domain, private_key, public_key, created_at, updated_at, remote_url, salmon_url)
        VALUES
          (3, 'remote', 'remote.com', NULL, #{remote_public_key}, now(), now(),
           'https://remote.com/@remote', 'https://remote.com/salmon/1'),
          (4, 'Remote', 'remote.com', NULL, #{remote_public_key}, now(), now(),
           'https://remote.com/@Remote', 'https://remote.com/salmon/1'),
          (5, 'REMOTE', 'Remote.com', NULL, #{remote_public_key2}, now(), now(),
           'https://remote.com/stale/@REMOTE', 'https://remote.com/stale/salmon/1');

        INSERT INTO "accounts"
          (id, username, domain, private_key, public_key, created_at, updated_at, protocol, inbox_url, outbox_url, followers_url)
        VALUES
          (6, 'bob', 'activitypub.com', NULL, #{remote_public_key_ap}, now(), now(),
           1, 'https://activitypub.com/users/bob/inbox', 'https://activitypub.com/users/bob/outbox', 'https://activitypub.com/users/bob/followers');

        INSERT INTO "accounts"
          (id, username, domain, private_key, public_key, created_at, updated_at)
        VALUES
          (7, 'user', #{local_domain}, #{user_private_key}, #{user_public_key}, now(), now()),
          (8, 'pt_user', NULL, #{user_private_key}, #{user_public_key}, now(), now());

        -- users

        INSERT INTO "users"
          (id, account_id, email, created_at, updated_at, admin)
        VALUES
          (1, 1, 'admin@localhost', now(), now(), true),
          (2, 2, 'user@localhost', now(), now(), false);

        INSERT INTO "users"
          (id, account_id, email, created_at, updated_at, admin, locale)
        VALUES
          (3, 7, 'ptuser@localhost', now(), now(), false, 'pt');

        -- statuses

        INSERT INTO "statuses"
          (id, account_id, text, created_at, updated_at)
        VALUES
          (1, 1, 'test', now(), now()),
          (2, 1, '@remote@remote.com hello', now(), now()),
          (3, 1, '@Remote@remote.com hello', now(), now()),
          (4, 1, '@REMOTE@remote.com hello', now(), now());

        INSERT INTO "statuses"
          (id, account_id, text, created_at, updated_at, uri, local)
        VALUES
          (5, 1, 'activitypub status', now(), now(), 'https://localhost/users/admin/statuses/4', true);

        INSERT INTO "statuses"
          (id, account_id, text, created_at, updated_at)
        VALUES
          (6, 3, 'test', now(), now());

        INSERT INTO "statuses"
          (id, account_id, text, created_at, updated_at, in_reply_to_id, in_reply_to_account_id)
        VALUES
          (7, 4, '@admin hello', now(), now(), 3, 1);

        INSERT INTO "statuses"
          (id, account_id, text, created_at, updated_at)
        VALUES
          (8, 5, 'test', now(), now());

        INSERT INTO "statuses"
          (id, account_id, reblog_of_id, created_at, updated_at)
        VALUES
          (9, 1, 2, now(), now());

        -- mentions (from previous statuses)

        INSERT INTO "mentions"
          (status_id, account_id, created_at, updated_at)
        VALUES
          (2, 3, now(), now()),
          (3, 4, now(), now()),
          (4, 5, now(), now());

        -- stream entries

        INSERT INTO "stream_entries"
          (activity_id, account_id, activity_type, created_at, updated_at)
        VALUES
          (1, 1, 'status', now(), now()),
          (2, 1, 'status', now(), now()),
          (3, 1, 'status', now(), now()),
          (4, 1, 'status', now(), now()),
          (5, 1, 'status', now(), now()),
          (6, 3, 'status', now(), now()),
          (7, 4, 'status', now(), now()),
          (8, 5, 'status', now(), now()),
          (9, 1, 'status', now(), now());


        -- custom emoji

        INSERT INTO "custom_emojis"
          (shortcode, created_at, updated_at)
        VALUES
          ('test', now(), now()),
          ('Test', now(), now()),
          ('blobcat', now(), now());

        INSERT INTO "custom_emojis"
          (shortcode, domain, uri, created_at, updated_at)
        VALUES
          ('blobcat', 'remote.org', 'https://remote.org/emoji/blobcat', now(), now()),
          ('blobcat', 'Remote.org', 'https://remote.org/emoji/blobcat', now(), now()),
          ('Blobcat', 'remote.org', 'https://remote.org/emoji/Blobcat', now(), now());

        -- favourites

        INSERT INTO "favourites"
          (account_id, status_id, created_at, updated_at)
        VALUES
          (1, 1, now(), now()),
          (1, 7, now(), now()),
          (4, 1, now(), now()),
          (3, 1, now(), now()),
          (5, 1, now(), now());

        -- pinned statuses

        INSERT INTO "status_pins"
          (account_id, status_id, created_at, updated_at)
        VALUES
          (1, 1, now(), now()),
          (3, 6, now(), now()),
          (4, 7, now(), now());

        -- follows

        INSERT INTO "follows"
          (account_id, target_account_id, created_at, updated_at)
        VALUES
          (1, 5, now(), now()),
          (6, 2, now(), now()),
          (5, 2, now(), now()),
          (6, 1, now(), now());

        -- follow requests

        INSERT INTO "follow_requests"
          (account_id, target_account_id, created_at, updated_at)
        VALUES
          (2, 5, now(), now()),
          (5, 1, now(), now());
      SQL
    end
  end
end
