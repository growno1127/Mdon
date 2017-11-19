import { connect } from 'react-redux';
import ColumnSettings from 'themes/glitch/features/community_timeline/components/column_settings';
import { changeSetting } from 'themes/glitch/actions/settings';

const mapStateToProps = state => ({
  settings: state.getIn(['settings', 'public']),
});

const mapDispatchToProps = dispatch => ({

  onChange (key, checked) {
    dispatch(changeSetting(['public', ...key], checked));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ColumnSettings);
