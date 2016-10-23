# Be sure to restart your server when you modify this file. Action Cable runs in a loop that does not support auto reloading.
class PublicChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'timeline:public', lambda { |encoded_message|
      message = ActiveSupport::JSON.decode(encoded_message)

      status = Status.find_by(id: message['id'])
      next if status.nil? || current_user.account.blocking?(status.account) || (status.reblog? && current_user.account.blocking?(status.reblog.account))

      message['message'] = FeedManager.instance.inline_render(current_user.account, status)

      transmit message
    }
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
