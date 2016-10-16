module Paginable
  extend ActiveSupport::Concern

  included do
    def self.paginate_by_max_id(limit, max_id = nil, since_id = nil)
      query = order('id desc').limit(limit)
      query = query.where(arel_table[:id].lt(max_id)) unless max_id.blank?
      query = query.where(arel_table[:id].gt(since_id)) unless since_id.blank?
      query
    end
  end
end
