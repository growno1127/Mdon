# frozen_string_literal: true

class RegenerationWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', backtrace: true

  def perform(account_id, _ = :home)
    PrecomputeFeedService.new.call(:home, Account.find(account_id))
  end
end
