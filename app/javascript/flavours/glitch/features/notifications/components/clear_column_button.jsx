import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import { Icon }  from 'flavours/glitch/components/icon';
import DeleteForeverIcon from 'mastodon/../material-icons/400-24px/delete_forever.svg?react';


export default class ClearColumnButton extends PureComponent {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
  };

  render () {
    return (
      <button className='text-btn column-header__setting-btn' tabIndex={0} onClick={this.props.onClick}><Icon id='eraser' icon={DeleteForeverIcon} /> <FormattedMessage id='notifications.clear' defaultMessage='Clear notifications' /></button>
    );
  }

}
