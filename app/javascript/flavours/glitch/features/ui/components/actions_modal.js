import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import StatusContent from 'flavours/glitch/components/status_content';
import Avatar from 'flavours/glitch/components/avatar';
import RelativeTimestamp from 'flavours/glitch/components/relative_timestamp';
import DisplayName from 'flavours/glitch/components/display_name';
import classNames from 'classnames';
import Icon from 'flavours/glitch/components/icon';
import Toggle from 'react-toggle';

export default class ActionsModal extends ImmutablePureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map,
    onClick: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
      active: PropTypes.bool,
      href: PropTypes.string,
      icon: PropTypes.string,
      meta: PropTypes.node,
      name: PropTypes.string,
      on: PropTypes.bool,
      onPassiveClick: PropTypes.func,
      text: PropTypes.node,
    })),
  };

  renderAction = (action, i) => {
    if (action === null) {
      return <li key={`sep-${i}`} className='dropdown-menu__separator' />;
    }

    const {
      active,
      href,
      icon,
      meta,
      name,
      on,
      onClick,
      onPassiveClick,
      text,
    } = action;

    return (
      <li key={name || i}>
        <a href={href} target='_blank' rel='noopener noreferrer' onClick={on !== null && typeof on !== 'undefined' && onPassiveClick || onClick || this.props.onClick} data-index={i} className={classNames('link', { active })}>
          {on !== null && typeof on !== 'undefined' && (
            <Toggle
              checked={on}
              onChange={onPassiveClick || onClick}
            />
          )}
          {icon && (
            <Icon
              className='icon'
              fixedWidth
              id={icon}
            />
          )}
          {meta ? (
            <div>
              <strong>{text}</strong>
              {meta}
            </div>
          ) : <div>{text}</div>}
        </a>
      </li>
    );
  }

  render () {
    const status = this.props.status && (
      <div className='status light'>
        <div className='boost-modal__status-header'>
          <div className='boost-modal__status-time'>
            <a href={this.props.status.get('url')} className='status__relative-time' target='_blank' rel='noopener noreferrer'>
              <RelativeTimestamp timestamp={this.props.status.get('created_at')} />
            </a>
          </div>

          <a href={this.props.status.getIn(['account', 'url'])} className='status__display-name' rel='noopener noreferrer'>
            <div className='status__avatar'>
              <Avatar account={this.props.status.get('account')} size={48} />
            </div>

            <DisplayName account={this.props.status.get('account')} />
          </a>
        </div>

        <StatusContent status={this.props.status} />
      </div>
    );

    return (
      <div className='modal-root__modal actions-modal'>
        {status}

        <ul className={classNames({ 'with-status': !!status })}>
          {this.props.actions.map(this.renderAction)}
        </ul>
      </div>
    );
  }

}
