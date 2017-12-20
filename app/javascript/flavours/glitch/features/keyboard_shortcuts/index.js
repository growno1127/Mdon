import React from 'react';
import Column from 'flavours/glitch/features/ui/components/column';
import ColumnBackButtonSlim from 'flavours/glitch/components/column_back_button_slim';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  heading: { id: 'keyboard_shortcuts.heading', defaultMessage: 'Keyboard Shortcuts' },
});

@injectIntl
export default class KeyboardShortcuts extends ImmutablePureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  render () {
    const { intl } = this.props;

    return (
      <Column icon='question' heading={intl.formatMessage(messages.heading)}>
        <ColumnBackButtonSlim />
        <div className='keyboard-shortcuts scrollable optionally-scrollable'>
          <table>
            <thead>
              <tr>
                <th><FormattedMessage id='keyboard_shortcuts.hotkey' defaultMessage='Hotkey' /></th>
                <th><FormattedMessage id='keyboard_shortcuts.description' defaultMessage='Description' /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>r</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.reply' defaultMessage='to reply' /></td>
              </tr>
              <tr>
                <td><code>m</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.mention' defaultMessage='to mention author' /></td>
              </tr>
              <tr>
                <td><code>f</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.favourite' defaultMessage='to favourite' /></td>
              </tr>
              <tr>
                <td><code>b</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.boost' defaultMessage='to boost' /></td>
              </tr>
              <tr>
                <td><code>enter</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.enter' defaultMessage='to open status' /></td>
              </tr>
              <tr>
                <td><code>up</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.up' defaultMessage='to move up in the list' /></td>
              </tr>
              <tr>
                <td><code>down</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.down' defaultMessage='to move down in the list' /></td>
              </tr>
              <tr>
                <td><code>1</code>-<code>9</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.column' defaultMessage='to focus a status in one of the columns' /></td>
              </tr>
              <tr>
                <td><code>n</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.compose' defaultMessage='to focus the compose textarea' /></td>
              </tr>
              <tr>
                <td><code>alt</code>+<code>n</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.toot' defaultMessage='to start a brand new toot' /></td>
              </tr>
              <tr>
                <td><code>backspace</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.back' defaultMessage='to navigate back' /></td>
              </tr>
              <tr>
                <td><code>s</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.search' defaultMessage='to focus search' /></td>
              </tr>
              <tr>
                <td><code>esc</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.unfocus' defaultMessage='to un-focus compose textarea/search' /></td>
              </tr>
              <tr>
                <td><code>x</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.expand' defaultMessage='to expand a status with a content warning' /></td>
              </tr>
              <tr>
                <td><code>?</code></td>
                <td><FormattedMessage id='keyboard_shortcuts.legend' defaultMessage='to display this legend' /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Column>
    );
  }

}
