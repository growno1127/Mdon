# frozen_string_literal: true

class UnmergeWorker
  include Sidekiq::Worker

  def perform(from_account_id, into_account_id)
    FeedManager.instance.unmerge_from_timeline(Account.find(from_account_id), Account.find(into_account_id))
  end
end
