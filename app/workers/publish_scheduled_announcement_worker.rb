# frozen_string_literal: true

class PublishScheduledAnnouncementWorker
  include Sidekiq::Worker
  include Redisable

  def perform(announcement_id)
    announcement = Announcement.find(announcement_id)
    announcement.update(published: true)

    payload = InlineRenderer.render(announcement, nil, :announcement)
    payload = Oj.dump(event: :announcement, payload: payload)

    FeedManager.instance.with_active_accounts do |account|
      redis.publish("timeline:#{account.id}", payload) if redis.exists("subscribed:timeline:#{account.id}")
    end
  end
end
