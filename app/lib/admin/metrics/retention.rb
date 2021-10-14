# frozen_string_literal: true

class Admin::Metrics::Retention
  class Cohort < ActiveModelSerializers::Model
    attributes :period, :frequency, :data
  end

  class CohortData < ActiveModelSerializers::Model
    attributes :date, :percent, :value
  end

  def initialize(start_at, end_at, frequency)
    @start_at  = start_at&.to_date
    @end_at    = end_at&.to_date
    @frequency = %w(day month).include?(frequency) ? frequency : 'day'
  end

  def cohorts
    sql = <<-SQL.squish
      SELECT axis.*, (
        WITH new_users AS (
          SELECT users.id
          FROM users
          WHERE date_trunc($3, users.created_at)::date = axis.cohort_period
        ),
        retained_users AS (
          SELECT users.id
          FROM users
          INNER JOIN new_users on new_users.id = users.id
          WHERE date_trunc($3, users.current_sign_in_at) >= axis.retention_period
        )
        SELECT ARRAY[count(*), (count(*) + 1)::float / (SELECT count(*) + 1 FROM new_users)] AS retention_value_and_percent
        FROM retained_users
      )
      FROM (
        WITH cohort_periods AS (
          SELECT generate_series(date_trunc($3, $1::timestamp)::date, date_trunc($3, $2::timestamp)::date, ('1 ' || $3)::interval) AS cohort_period
        ),
        retention_periods AS (
          SELECT cohort_period AS retention_period FROM cohort_periods
        )
        SELECT *
        FROM cohort_periods, retention_periods
        WHERE retention_period >= cohort_period
      ) as axis
    SQL

    rows = ActiveRecord::Base.connection.select_all(sql, nil, [[nil, @start_at], [nil, @end_at], [nil, @frequency]])

    rows.each_with_object([]) do |row, arr|
      current_cohort = arr.last

      if current_cohort.nil? || current_cohort.period != row['cohort_period']
        current_cohort = Cohort.new(period: row['cohort_period'], frequency: @frequency, data: [])
        arr << current_cohort
      end

      value, percent = row['retention_value_and_percent'].delete('{}').split(',')

      current_cohort.data << CohortData.new(
        date: row['retention_period'],
        percent: percent.to_f,
        value: value.to_s
      )
    end
  end
end
