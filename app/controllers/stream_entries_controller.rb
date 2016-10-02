class StreamEntriesController < ApplicationController
  layout 'public'

  before_action :set_account
  before_action :set_stream_entry
  before_action :set_link_headers

  def show
    @type = @stream_entry.activity_type.downcase

    if @stream_entry.activity_type == 'Status'
      @ancestors   = @stream_entry.activity.ancestors
      @descendants = @stream_entry.activity.descendants
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

  def set_link_headers
    response.headers['Link'] = LinkHeader.new([
      [account_stream_entry_url(@account, @stream_entry, format: 'atom'), [['rel', 'alternate'], ['type', 'application/atom+xml']]]
    ])
  end

  def set_stream_entry
    @stream_entry = @account.stream_entries.find(params[:id])
  end
end
