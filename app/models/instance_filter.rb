# frozen_string_literal: true

class InstanceFilter
  KEYS = %i(
    limited
    by_domain
  ).freeze

  attr_reader :params

  def initialize(params)
    @params = params
  end

  def results
    scope = Instance.includes(:domain_block, :domain_allow).order(accounts_count: :desc)

    params.each do |key, value|
      scope.merge!(scope_for(key, value.to_s.strip)) if value.present?
    end

    scope
  end

  private

  def scope_for(key, value)
    case key.to_s
    when 'limited'
      Instance.joins(:domain_block).reorder(Arel.sql('domain_blocks.id desc'))
    when 'allowed'
      Instance.joins(:domain_allow).reorder(Arel.sql('domain_allows.id desc'))
    when 'by_domain'
      Instance.matches_domain(value)
    else
      raise "Unknown filter: #{key}"
    end
  end
end
