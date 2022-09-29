import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { expandSearch } from 'flavours/glitch/actions/search';
import Account from 'flavours/glitch/containers/account_container';
import Status from 'flavours/glitch/containers/status_container';
import { ImmutableHashtag as Hashtag } from 'flavours/glitch/components/hashtag';
import { List as ImmutableList } from 'immutable';
import LoadMore from 'flavours/glitch/components/load_more';
import LoadingIndicator from 'flavours/glitch/components/loading_indicator';

const messages = defineMessages({
  title: { id: 'search_results.title', defaultMessage: 'Search for {q}' },
});

const mapStateToProps = state => ({
  isLoading: state.getIn(['search', 'isLoading']),
  results: state.getIn(['search', 'results']),
  q: state.getIn(['search', 'searchTerm']),
});

const appendLoadMore = (id, list, onLoadMore) => {
  if (list.size >= 5) {
    return list.push(<LoadMore key={`${id}-load-more`} visible onClick={onLoadMore} />);
  } else {
    return list;
  }
};

const renderAccounts = (results, onLoadMore) => appendLoadMore('accounts', results.get('accounts', ImmutableList()).map(item => (
  <Account key={`account-${item}`} id={item} />
)), onLoadMore);

const renderHashtags = (results, onLoadMore) => appendLoadMore('hashtags', results.get('hashtags', ImmutableList()).map(item => (
  <Hashtag key={`tag-${item.get('name')}`} hashtag={item} />
)), onLoadMore);

const renderStatuses = (results, onLoadMore) => appendLoadMore('statuses', results.get('statuses', ImmutableList()).map(item => (
  <Status key={`status-${item}`} id={item} />
)), onLoadMore);

export default @connect(mapStateToProps)
@injectIntl
class Results extends React.PureComponent {

  static propTypes = {
    results: ImmutablePropTypes.map,
    isLoading: PropTypes.bool,
    multiColumn: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    q: PropTypes.string,
    intl: PropTypes.object,
  };

  state = {
    type: 'all',
  };

  handleSelectAll = () => this.setState({ type: 'all' });
  handleSelectAccounts = () => this.setState({ type: 'accounts' });
  handleSelectHashtags = () => this.setState({ type: 'hashtags' });
  handleSelectStatuses = () => this.setState({ type: 'statuses' });
  handleLoadMoreAccounts = () => this.loadMore('accounts');
  handleLoadMoreStatuses = () => this.loadMore('statuses');
  handleLoadMoreHashtags = () => this.loadMore('hashtags');

  loadMore (type) {
    const { dispatch } = this.props;
    dispatch(expandSearch(type));
  }

  render () {
    const { intl, isLoading, q, results } = this.props;
    const { type } = this.state;

    let filteredResults = ImmutableList();

    if (!isLoading) {
      switch(type) {
      case 'all':
        filteredResults = filteredResults.concat(renderAccounts(results, this.handleLoadMoreAccounts), renderHashtags(results, this.handleLoadMoreHashtags), renderStatuses(results, this.handleLoadMoreStatuses));
        break;
      case 'accounts':
        filteredResults = filteredResults.concat(renderAccounts(results, this.handleLoadMoreAccounts));
        break;
      case 'hashtags':
        filteredResults = filteredResults.concat(renderHashtags(results, this.handleLoadMoreHashtags));
        break;
      case 'statuses':
        filteredResults = filteredResults.concat(renderStatuses(results, this.handleLoadMoreStatuses));
        break;
      }

      if (filteredResults.size === 0) {
        filteredResults = (
          <div className='empty-column-indicator'>
            <FormattedMessage id='search_results.nothing_found' defaultMessage='Could not find anything for these search terms' />
          </div>
        );
      }
    }

    return (
      <React.Fragment>
        <div className='account__section-headline'>
          <button onClick={this.handleSelectAll} className={type === 'all' && 'active'}><FormattedMessage id='search_results.all' defaultMessage='All' /></button>
          <button onClick={this.handleSelectAccounts} className={type === 'accounts' && 'active'}><FormattedMessage id='search_results.accounts' defaultMessage='People' /></button>
          <button onClick={this.handleSelectHashtags} className={type === 'hashtags' && 'active'}><FormattedMessage id='search_results.hashtags' defaultMessage='Hashtags' /></button>
          <button onClick={this.handleSelectStatuses} className={type === 'statuses' && 'active'}><FormattedMessage id='search_results.statuses' defaultMessage='Toots' /></button>
        </div>

        <div className='explore__search-results'>
          {isLoading ? <LoadingIndicator /> : filteredResults}
        </div>
      </React.Fragment>
    );
  }

}
