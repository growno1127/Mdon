import { connect } from 'react-redux';

import { uploadCompose } from '../../../actions/compose';
import UploadButton from '../components/upload_button';

const mapStateToProps = state => ({
  disabled: state.getIn(['compose', 'poll']) !== null || state.getIn(['compose', 'is_uploading']) || (state.getIn(['compose', 'media_attachments']).size + state.getIn(['compose', 'pending_media_attachments']) > 3 || state.getIn(['compose', 'media_attachments']).some(m => ['video', 'audio'].includes(m.get('type')))),
  resetFileKey: state.getIn(['compose', 'resetFileKey']),
});

const mapDispatchToProps = dispatch => ({

  onSelectFile (files) {
    dispatch(uploadCompose(files));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);
