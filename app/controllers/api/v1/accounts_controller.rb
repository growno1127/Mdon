class Api::V1::AccountsController < ApiController
  before_action -> { doorkeeper_authorize! :read }, except: [:follow, :unfollow, :block, :unblock]
  before_action -> { doorkeeper_authorize! :follow }, only: [:follow, :unfollow, :block, :unblock]
  before_action :require_user!, except: [:show, :following, :followers, :statuses]
  before_action :set_account, except: [:verify_credentials, :suggestions, :search]

  respond_to :json

  def show
  end

  def verify_credentials
    @account = current_user.account
    render action: :show
  end

  def following
    results   = Follow.where(account: @account).paginate_by_max_id(DEFAULT_ACCOUNTS_LIMIT, params[:max_id], params[:since_id])
    @accounts = Account.where(id: results.map(&:target_account_id)).with_counters.to_a

    next_path = following_api_v1_account_url(max_id: results.last.id)    if results.size == DEFAULT_ACCOUNTS_LIMIT
    prev_path = following_api_v1_account_url(since_id: results.first.id) if results.size > 0

    set_pagination_headers(next_path, prev_path)

    render action: :index
  end

  def followers
    results   = Follow.where(target_account: @account).paginate_by_max_id(DEFAULT_ACCOUNTS_LIMIT, params[:max_id], params[:since_id])
    @accounts = Account.where(id: results.map(&:account_id)).with_counters.to_a

    next_path = following_api_v1_account_url(max_id: results.last.id)    if results.size == DEFAULT_ACCOUNTS_LIMIT
    prev_path = following_api_v1_account_url(since_id: results.first.id) if results.size > 0

    set_pagination_headers(next_path, prev_path)

    render action: :index
  end

  def common_followers
    @accounts = @account.common_followers_with(current_user.account)
    render action: :index
  end

  def suggestions
    @accounts = FollowSuggestion.get(current_user.account_id)
    render action: :index
  end

  def statuses
    @statuses = @account.statuses.with_includes.with_counters.paginate_by_max_id(DEFAULT_STATUSES_LIMIT, params[:max_id], params[:since_id]).to_a

    set_maps(@statuses)

    next_path = statuses_api_v1_account_url(max_id: @statuses.last.id)    if @statuses.size == DEFAULT_STATUSES_LIMIT
    prev_path = statuses_api_v1_account_url(since_id: @statuses.first.id) if @statuses.size > 0

    set_pagination_headers(next_path, prev_path)
  end

  def follow
    FollowService.new.call(current_user.account, @account.acct)
    set_relationship
    render action: :relationship
  end

  def block
    BlockService.new.call(current_user.account, @account)
    set_relationship
    render action: :relationship
  end

  def unfollow
    UnfollowService.new.call(current_user.account, @account)
    set_relationship
    render action: :relationship
  end

  def unblock
    UnblockService.new.call(current_user.account, @account)
    set_relationship
    render action: :relationship
  end

  def relationships
    ids = params[:id].is_a?(Enumerable) ? params[:id].map(&:to_i) : [params[:id].to_i]
    @accounts    = Account.where(id: ids).select('id')
    @following   = Account.following_map(ids, current_user.account_id)
    @followed_by = Account.followed_by_map(ids, current_user.account_id)
    @blocking    = Account.blocking_map(ids, current_user.account_id)
  end

  def search
    @accounts = SearchService.new.call(params[:q], params[:resolve] == 'true')
    render action: :index
  end

  private

  def set_account
    @account = Account.find(params[:id])
  end

  def set_relationship
    @following   = Account.following_map([@account.id], current_user.account_id)
    @followed_by = Account.followed_by_map([@account.id], current_user.account_id)
    @blocking    = Account.blocking_map([@account.id], current_user.account_id)
  end
end
