# frozen_string_literal: true

class ActivityPub::AcceptFollowSerializer < ActiveModel::Serializer
  attributes :id, :type, :actor

  has_one :object, serializer: ActivityPub::InverseFollowSerializer

  def id
    [ActivityPub::TagManager.instance.uri_for(object.target_account), '#accepts/follows/', object.id].join
  end

  def type
    'Accept'
  end

  def actor
    ActivityPub::TagManager.instance.uri_for(object.target_account)
  end
end
