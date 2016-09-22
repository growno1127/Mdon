import { connect }           from 'react-redux';
import PureRenderMixin       from 'react-addons-pure-render-mixin';
import ImmutablePropTypes    from 'react-immutable-proptypes';
import {
  fetchAccount,
  followAccount,
  unfollowAccount,
  fetchAccountTimeline,
  expandAccountTimeline
}                            from '../../actions/accounts';
import { replyCompose }      from '../../actions/compose';
import { favourite, reblog } from '../../actions/interactions';
import Header                from './components/header';
import { selectStatus }      from '../../reducers/timelines';
import StatusList            from '../../components/status_list';
import Immutable             from 'immutable';

function selectAccount(state, id) {
  return state.getIn(['timelines', 'accounts', id], null);
};

function selectStatuses(state, accountId) {
  return state.getIn(['timelines', 'accounts_timelines', accountId], Immutable.List()).map(id => selectStatus(state, id)).filterNot(status => status === null);
};

const mapStateToProps = (state, props) => ({
  account: selectAccount(state, Number(props.params.accountId)),
  statuses: selectStatuses(state, Number(props.params.accountId))
});

const Account = React.createClass({

  propTypes: {
    params: React.PropTypes.object.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    account: ImmutablePropTypes.map,
    statuses: ImmutablePropTypes.list
  },

  mixins: [PureRenderMixin],

  componentWillMount () {
    this.props.dispatch(fetchAccount(Number(this.props.params.accountId)));
    this.props.dispatch(fetchAccountTimeline(Number(this.props.params.accountId)));
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.accountId !== this.props.params.accountId && nextProps.params.accountId) {
      this.props.dispatch(fetchAccount(Number(nextProps.params.accountId)));
      this.props.dispatch(fetchAccountTimeline(Number(nextProps.params.accountId)));
    }
  },

  handleFollow () {
    this.props.dispatch(followAccount(this.props.account.get('id')));
  },

  handleUnfollow () {
    this.props.dispatch(unfollowAccount(this.props.account.get('id')));
  },

  handleReply (status) {
    this.props.dispatch(replyCompose(status));
  },

  handleReblog (status) {
    this.props.dispatch(reblog(status));
  },

  handleFavourite (status) {
    this.props.dispatch(favourite(status));
  },

  handleScrollToBottom () {
    this.props.dispatch(expandAccountTimeline(this.props.account.get('id')));
  },

  render () {
    const { account, statuses } = this.props;

    if (account === null) {
      return <div>Loading {this.props.params.accountId}...</div>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', 'flex': '0 0 auto', height: '100%' }}>
        <Header account={account} onFollow={this.handleFollow} onUnfollow={this.handleUnfollow} />
        <StatusList statuses={statuses} onScrollToBottom={this.handleScrollToBottom} onReply={this.handleReply} onReblog={this.handleReblog} onFavourite={this.handleFavourite} />
      </div>
    );
  }

});

export default connect(mapStateToProps)(Account);
