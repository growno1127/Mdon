import { Provider } from 'react-redux';
import configureStore from '../store/configureStore';
import {
  refreshTimelineSuccess,
  updateTimeline,
  deleteFromTimelines,
  refreshTimeline
} from '../actions/timelines';
import { setAccessToken } from '../actions/meta';
import { setAccountSelf } from '../actions/accounts';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import {
  applyRouterMiddleware,
  useRouterHistory,
  Router,
  Route,
  IndexRoute
} from 'react-router';
import { useScroll } from 'react-router-scroll';
import UI from '../features/ui';
import Account from '../features/account';
import Status from '../features/status';
import GettingStarted from '../features/getting_started';
import PublicTimeline from '../features/public_timeline';
import AccountTimeline from '../features/account_timeline';
import HomeTimeline from '../features/home_timeline';
import MentionsTimeline from '../features/mentions_timeline';
import Compose from '../features/compose';
import Followers from '../features/followers';
import Following from '../features/following';
import Reblogs from '../features/reblogs';
import Favourites from '../features/favourites';
import HashtagTimeline from '../features/hashtag_timeline';

const store = configureStore();

const browserHistory = useRouterHistory(createBrowserHistory)({
  basename: '/web'
});

const Mastodon = React.createClass({

  propTypes: {
    token: React.PropTypes.string.isRequired,
    timelines: React.PropTypes.object,
    account: React.PropTypes.string
  },

  mixins: [PureRenderMixin],

  componentWillMount() {
    store.dispatch(setAccessToken(this.props.token));
    store.dispatch(setAccountSelf(JSON.parse(this.props.account)));

    if (typeof App !== 'undefined') {
      this.subscription = App.cable.subscriptions.create('TimelineChannel', {

        received (data) {
          switch(data.type) {
            case 'update':
              return store.dispatch(updateTimeline(data.timeline, JSON.parse(data.message)));
            case 'delete':
              return store.dispatch(deleteFromTimelines(data.id));
            case 'merge':
            case 'unmerge':
              return store.dispatch(refreshTimeline('home', true));
            case 'block':
              return store.dispatch(refreshTimeline('mentions', true));
          }
        }

      });
    }
  },

  componentWillUnmount () {
    if (typeof this.subscription !== 'undefined') {
      this.subscription.unsubscribe();
    }
  },

  render () {
    return (
      <Provider store={store}>
        <Router history={browserHistory} render={applyRouterMiddleware(useScroll())}>
          <Route path='/' component={UI}>
            <IndexRoute component={GettingStarted} />

            <Route path='timelines/home' component={HomeTimeline} />
            <Route path='timelines/mentions' component={MentionsTimeline} />
            <Route path='timelines/public' component={PublicTimeline} />
            <Route path='timelines/tag/:id' component={HashtagTimeline} />

            <Route path='statuses/new' component={Compose} />
            <Route path='statuses/:statusId' component={Status} />
            <Route path='statuses/:statusId/reblogs' component={Reblogs} />
            <Route path='statuses/:statusId/favourites' component={Favourites} />

            <Route path='accounts/:accountId' component={Account}>
              <IndexRoute component={AccountTimeline} />
              <Route path='followers' component={Followers} />
              <Route path='following' component={Following} />
            </Route>
          </Route>
        </Router>
      </Provider>
    );
  }

});

export default Mastodon;
