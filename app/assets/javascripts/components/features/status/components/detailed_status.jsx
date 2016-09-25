import PureRenderMixin    from 'react-addons-pure-render-mixin';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Avatar             from '../../../components/avatar';
import DisplayName        from '../../../components/display_name';
import StatusContent      from '../../../components/status_content';
import MediaGallery       from '../../../components/media_gallery';
import VideoPlayer        from '../../../components/video_player';
import moment             from 'moment';

const DetailedStatus = React.createClass({

  contextTypes: {
    router: React.PropTypes.object
  },

  propTypes: {
    status: ImmutablePropTypes.map.isRequired
  },

  mixins: [PureRenderMixin],

  handleAccountClick (e) {
    if (e.button === 0) {
      e.preventDefault();
      this.context.router.push(`/accounts/${this.props.status.getIn(['account', 'id'])}`);
    }

    e.stopPropagation();
  },

  render () {
    const status = this.props.status.get('reblog') ? this.props.status.get('reblog') : this.props.status;

    return (
      <div style={{ background: '#2f3441', padding: '14px 10px' }} className='detailed-status'>
        <a href={status.getIn(['account', 'url'])} onClick={this.handleAccountClick} className='detailed-status__display-name' style={{ display: 'block', overflow: 'hidden', marginBottom: '15px' }}>
          <div style={{ float: 'left', marginRight: '10px' }}><Avatar src={status.getIn(['account', 'avatar'])} size={48} /></div>
          <DisplayName account={status.get('account')} />
        </a>

        <StatusContent status={status} />

        <div style={{ marginTop: '15px', color: '#616b86', fontSize: '14px', lineHeight: '18px' }}>
          <a className='detailed-status__datetime' style={{ color: 'inherit' }} href={status.get('url')} target='_blank' rel='noopener'>{moment(status.get('created_at')).format('HH:mm, DD MMM Y')}</a> · <i className='fa fa-retweet' /><span style={{ fontWeight: '500', fontSize: '12px', marginLeft: '6px', display: 'inline-block' }}>{status.get('reblogs_count')}</span> · <i className='fa fa-star' /><span style={{ fontWeight: '500', fontSize: '12px', marginLeft: '6px', display: 'inline-block' }}>{status.get('favourites_count')}</span>
        </div>
      </div>
    );
  }

});

export default DetailedStatus;
