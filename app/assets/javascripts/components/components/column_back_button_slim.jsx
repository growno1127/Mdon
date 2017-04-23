import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

class ColumnBackButtonSlim extends React.PureComponent {

  constructor (props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick () {
    this.context.router.push('/');
  }

  render () {
    return (
      <div className='column-back-button--slim'>
        <div role='button' tabIndex='0' onClick={this.handleClick} className='column-back-button column-back-button--slim-button'>
          <i className='fa fa-fw fa-chevron-left column-back-button__icon' />
          <FormattedMessage id='column_back_button.label' defaultMessage='Back' />
        </div>
      </div>
    );
  }
}

ColumnBackButtonSlim.contextTypes = {
  router: PropTypes.object
};

export default ColumnBackButtonSlim;
