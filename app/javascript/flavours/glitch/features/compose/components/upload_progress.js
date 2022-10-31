import React from 'react';
import PropTypes from 'prop-types';
import Motion from '../../ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import Icon from 'flavours/glitch/components/icon';
import { FormattedMessage } from 'react-intl';

export default class UploadProgress extends React.PureComponent {

  static propTypes = {
    active: PropTypes.bool,
    progress: PropTypes.number,
    isProcessing: PropTypes.bool,
  };

  render () {
    const { active, progress, isProcessing } = this.props;

    if (!active) {
      return null;
    }

    let message;

    if (isProcessing) {
      message = <FormattedMessage id='upload_progress.processing' defaultMessage='Processing…' />;
    } else {
      message = <FormattedMessage id='upload_progress.label' defaultMessage='Uploading…' />;
    }

    return (
      <div className='composer--upload_form--progress'>
        <Icon id='upload' />

        <div className='message'>
          {message}

          <div className='backdrop'>
            <Motion defaultStyle={{ width: 0 }} style={{ width: spring(progress) }}>
              {({ width }) =>
                (<div className='tracker' style={{ width: `${width}%` }}
                />)
              }
            </Motion>
          </div>
        </div>
      </div>
    );
  }

}
