import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import { Link, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';

import { openModal } from 'flavours/glitch/actions/modal';
import { Avatar } from 'flavours/glitch/components/avatar';
import { WordmarkLogo, SymbolLogo } from 'flavours/glitch/components/logo';
import Permalink from 'flavours/glitch/components/permalink';
import { registrationsOpen, me } from 'flavours/glitch/initial_state';

const Account = connect(state => ({
  account: state.getIn(['accounts', me]),
}))(({ account }) => (
  <Permalink href={account.get('url')} to={`/@${account.get('acct')}`} title={account.get('acct')}>
    <Avatar account={account} size={35} />
  </Permalink>
));

const mapStateToProps = (state) => ({
  signupUrl: state.getIn(['server', 'server', 'registrations', 'url'], '/auth/sign_up'),
});

const mapDispatchToProps = (dispatch) => ({
  openClosedRegistrationsModal() {
    dispatch(openModal('CLOSED_REGISTRATIONS'));
  },
});

class Header extends PureComponent {

  static contextTypes = {
    identity: PropTypes.object,
  };

  static propTypes = {
    openClosedRegistrationsModal: PropTypes.func,
    location: PropTypes.object,
    signupUrl: PropTypes.string.isRequired,
  };

  render () {
    const { signedIn } = this.context.identity;
    const { location, openClosedRegistrationsModal, signupUrl } = this.props;

    let content;

    if (signedIn) {
      content = (
        <>
          {location.pathname !== '/publish' && <Link to='/publish' className='button'><FormattedMessage id='compose_form.publish_form' defaultMessage='Publish' /></Link>}
          <Account />
        </>
      );
    } else {
      let signupButton;

      if (registrationsOpen) {
        signupButton = (
          <a href={signupUrl} className='button'>
            <FormattedMessage id='sign_in_banner.create_account' defaultMessage='Create account' />
          </a>
        );
      } else {
        signupButton = (
          <button className='button' onClick={openClosedRegistrationsModal}>
            <FormattedMessage id='sign_in_banner.create_account' defaultMessage='Create account' />
          </button>
        );
      }

      content = (
        <>
          {signupButton}
          <a href='/auth/sign_in' className='button button-tertiary'><FormattedMessage id='sign_in_banner.sign_in' defaultMessage='Login' /></a>
        </>
      );
    }

    return (
      <div className='ui__header'>
        <Link to='/' className='ui__header__logo'>
          <WordmarkLogo />
          <SymbolLogo />
        </Link>

        <div className='ui__header__links'>
          {content}
        </div>
      </div>
    );
  }

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
