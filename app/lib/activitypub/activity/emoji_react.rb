# frozen_string_literal: true

class ActivityPub::Activity::EmojiReact < ActivityPub::Activity
  def perform
    original_status = status_from_uri(object_uri)
    name = @json['content']
    return if original_status.nil? ||
      !original_status.account.local? ||
      delete_arrived_first?(@json['id']) ||
      @account.reacted?(original_status, name)

    original_status.status_reactions.create!(account: @account, name: name)
  end
end
