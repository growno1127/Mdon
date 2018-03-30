import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import InnerHeader from 'flavours/glitch/features/account/components/header';
import ActionBar from 'flavours/glitch/features/account/components/action_bar';
import MissingIndicator from 'flavours/glitch/components/missing_indicator';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import MovedNote from './moved_note';

export default class Header extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map,
    onFollow: PropTypes.func.isRequired,
    onBlock: PropTypes.func.isRequired,
    onMention: PropTypes.func.isRequired,
    onReblogToggle: PropTypes.func.isRequired,
    onReport: PropTypes.func.isRequired,
    onMute: PropTypes.func.isRequired,
    onBlockDomain: PropTypes.func.isRequired,
    onUnblockDomain: PropTypes.func.isRequired,
    hideTabs: PropTypes.bool,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  handleFollow = () => {
    this.props.onFollow(this.props.account);
  }

  handleBlock = () => {
    this.props.onBlock(this.props.account);
  }

  handleMention = () => {
    this.props.onMention(this.props.account, this.context.router.history);
  }

  handleReport = () => {
    this.props.onReport(this.props.account);
  }

  handleReblogToggle = () => {
    this.props.onReblogToggle(this.props.account);
  }

  handleMute = () => {
    this.props.onMute(this.props.account);
  }

  handleBlockDomain = () => {
    const domain = this.props.account.get('acct').split('@')[1];

    if (!domain) return;

    this.props.onBlockDomain(domain);
  }

  handleUnblockDomain = () => {
    const domain = this.props.account.get('acct').split('@')[1];

    if (!domain) return;

    this.props.onUnblockDomain(domain);
  }

  render () {
    const { account, hideTabs } = this.props;

    if (account === null) {
      return <MissingIndicator />;
    }

    return (
      <div className='account-timeline__header'>
        {account.get('moved') && <MovedNote from={account} to={account.get('moved')} />}

        <InnerHeader
          account={account}
          onFollow={this.handleFollow}
          onBlock={this.handleBlock}
        />

        <ActionBar
          account={account}
          onBlock={this.handleBlock}
          onMention={this.handleMention}
          onReblogToggle={this.handleReblogToggle}
          onReport={this.handleReport}
          onMute={this.handleMute}
          onBlockDomain={this.handleBlockDomain}
          onUnblockDomain={this.handleUnblockDomain}
        />

        {!hideTabs && (
          <div className='account__section-headline'>
            <NavLink exact to={`/accounts/${account.get('id')}`}><FormattedMessage id='account.posts' defaultMessage='Toots' /></NavLink>
            <NavLink exact to={`/accounts/${account.get('id')}/with_replies`}><FormattedMessage id='account.posts_with_replies' defaultMessage='Toots with replies' /></NavLink>
            <NavLink exact to={`/accounts/${account.get('id')}/media`}><FormattedMessage id='account.media' defaultMessage='Media' /></NavLink>
          </div>
        )}
      </div>
    );
  }

}
