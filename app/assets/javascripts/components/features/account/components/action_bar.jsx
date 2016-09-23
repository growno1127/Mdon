import PureRenderMixin    from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Button             from '../../../components/button';

const ActionBar = React.createClass({

  propTypes: {
    account: ImmutablePropTypes.map.isRequired,
    me: React.PropTypes.number.isRequired,
    onFollow: React.PropTypes.func.isRequired,
    onUnfollow: React.PropTypes.func.isRequired
  },

  mixins: [PureRenderMixin],

  render () {
    const { account, me } = this.props;
    
    let followBack   = '';
    let actionButton = '';

    if (account.get('id') === me) {
      actionButton = 'This is you!';
    } else {
      if (account.getIn(['relationship', 'following'])) {
        actionButton = <Button text='Unfollow' onClick={this.props.onUnfollow} />
      } else {
        actionButton = <Button text='Follow' onClick={this.props.onFollow} />
      }

      if (account.getIn(['relationship', 'followed_by'])) {
        followBack = 'follows you';
      }
    }

    return (
      <div>
        {actionButton}
        {account.get('followers_count')} followers
        {account.get('following_count')} following
        {followBack}
      </div>
    );
  },

});

export default ActionBar;
