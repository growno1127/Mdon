class StreamEntriesController < ApplicationController
  layout 'public'

  before_action :set_account
  before_action :set_stream_entry

  def show
    @type = @stream_entry.activity_type.downcase

    if @stream_entry.activity_type == 'Status'
      @ancestors   = @stream_entry.activity.ancestors.with_includes.with_counters
      @descendants = @stream_entry.activity.descendants.with_includes.with_counters

      if user_signed_in?
        status_ids  = [@stream_entry.activity_id] + @ancestors.map { |s| s.id } + @descendants.map { |s| s.id }
        @favourited = Status.favourites_map(status_ids, current_user.account_id)
        @reblogged  = Status.reblogs_map(status_ids, current_user.account_id)
      else
        @favourited = {}
        @reblogged  = {}
      end
    end

    respond_to do |format|
      format.html
      format.atom
    end
  end

  private

  def set_account
    @account = Account.find_local!(params[:account_username])
  end

  def set_stream_entry
    @stream_entry = @account.stream_entries.find(params[:id])
  end
end
