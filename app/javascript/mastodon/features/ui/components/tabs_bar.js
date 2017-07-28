import React from 'react';
import PropTypes from 'prop-types';
import NavLink from 'react-router-dom/NavLink';
import { FormattedMessage, injectIntl } from 'react-intl';
import { debounce } from 'lodash';

export const links = [
  <NavLink className='tabs-bar__link primary' to='/statuses/new' data-preview-title-id='tabs_bar.compose' data-preview-icon='pencil' ><i className='fa fa-fw fa-pencil' /><FormattedMessage id='tabs_bar.compose' defaultMessage='Compose' /></NavLink>,
  <NavLink className='tabs-bar__link primary' to='/timelines/home' data-preview-title-id='column.home' data-preview-icon='home' ><i className='fa fa-fw fa-home' /><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></NavLink>,
  <NavLink className='tabs-bar__link primary' to='/notifications' data-preview-title-id='column.notifications' data-preview-icon='bell' ><i className='fa fa-fw fa-bell' /><FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' /></NavLink>,

  <NavLink className='tabs-bar__link secondary' to='/timelines/public/local' data-preview-title-id='column.community' data-preview-icon='users' ><i className='fa fa-fw fa-users' /><FormattedMessage id='tabs_bar.local_timeline' defaultMessage='Local' /></NavLink>,
  <NavLink className='tabs-bar__link secondary' exact to='/timelines/public' data-preview-title-id='column.public' data-preview-icon='globe' ><i className='fa fa-fw fa-globe' /><FormattedMessage id='tabs_bar.federated_timeline' defaultMessage='Federated' /></NavLink>,

  <NavLink className='tabs-bar__link primary' style={{ flexGrow: '0', flexBasis: '30px' }} to='/getting-started' data-preview-title-id='getting_started.heading' data-preview-icon='asterisk' ><i className='fa fa-fw fa-asterisk' /></NavLink>,
];

export function getIndex (path) {
  return links.findIndex(link => link.props.to === path);
}

export function getLink (index) {
  return links[index].props.to;
}

@injectIntl
export default class TabsBar extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  static propTypes = {
    intl: PropTypes.object.isRequired,
  }

  setRef = ref => {
    this.node = ref;
  }

  handleClick = (e) => {
    e.preventDefault();
    e.persist();

    requestAnimationFrame(() => {
      const tabs = Array(...this.node.querySelectorAll('.tabs-bar__link'));
      const currentTab = tabs.find(tab => tab.classList.contains('active'));
      const nextTab = tabs.find(tab => tab.contains(e.target));
      const { props: { to } } = links[Array(...this.node.childNodes).indexOf(nextTab)];

      currentTab.classList.remove('active');

      const listener = debounce(() => {
        nextTab.removeEventListener('transitionend', listener);
        this.context.router.history.push(to);
      }, 50);

      nextTab.addEventListener('transitionend', listener);
      nextTab.classList.add('active');
    });

  }

  render () {
    const { intl: { formatMessage } } = this.props;

    return (
      <nav className='tabs-bar' ref={this.setRef}>
        {links.map(link => React.cloneElement(link, { key: link.props.to, onClick: this.handleClick, 'aria-label': formatMessage({ id: link.props['data-preview-title-id'] }) }))}
      </nav>
    );
  }

}
