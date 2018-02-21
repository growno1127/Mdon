# frozen_string_literal: true

class ActivityPub::ImageSerializer < ActiveModel::Serializer
  include RoutingHelper

  attributes :type, :media_type, :url
  attribute :focal_point, if: :focal_point?

  def type
    'Image'
  end

  def url
    full_asset_url(object.url(:original))
  end

  def media_type
    object.content_type
  end

  def focal_point?
    object.responds_to?(:meta) && object.meta['focus'].is_a?(Hash)
  end

  def focal_point
    [object.meta['focus']['x'], object.meta['focus']['y']]
  end
end
