# frozen_string_literal: true

Rails.application.configure do
  # STATUS_SEARCH_SCOPE was previously known as SEARCH_SCOPE and only covered statuses.
  status_search_scope = (ENV['STATUS_SEARCH_SCOPE'] || ENV.fetch('SEARCH_SCOPE', nil))
  config.x.status_search_scope = case status_search_scope
                                 when 'discoverable'
                                   :discoverable
                                 when 'public'
                                   :public
                                 when 'public_or_unlisted'
                                   :public_or_unlisted
                                 else
                                   :classic
                                 end

  account_search_scope = ENV.fetch('ACCOUNT_SEARCH_SCOPE', nil)
  config.x.account_search_scope = case account_search_scope
                                  when 'all'
                                    :all
                                  when 'discoverable'
                                    :discoverable
                                  else
                                    :classic
                                  end
end
