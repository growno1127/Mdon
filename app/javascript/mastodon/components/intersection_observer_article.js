import React from 'react';
import PropTypes from 'prop-types';
import scheduleIdleTask from '../features/ui/util/schedule_idle_task';
import getRectFromEntry from '../features/ui/util/get_rect_from_entry';
import { is } from 'immutable';

// Diff these props in the "rendered" state
const updateOnPropsForRendered = ['id', 'index', 'listLength'];
// Diff these props in the "unrendered" state
const updateOnPropsForUnrendered = ['id', 'index', 'listLength', 'cachedHeight'];

export default class IntersectionObserverArticle extends React.Component {

  static propTypes = {
    intersectionObserverWrapper: PropTypes.object.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    listLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    saveHeightKey: PropTypes.string,
    cachedHeight: PropTypes.number,
    onHeightChange: PropTypes.func,
    children: PropTypes.node,
  };

  state = {
    isHidden: false, // set to true in requestIdleCallback to trigger un-render
  }

  shouldComponentUpdate (nextProps, nextState) {
    const isUnrendered = !this.state.isIntersecting && (this.state.isHidden || this.props.cachedHeight);
    const willBeUnrendered = !nextState.isIntersecting && (nextState.isHidden || nextProps.cachedHeight);
    if (!!isUnrendered !== !!willBeUnrendered) {
      // If we're going from rendered to unrendered (or vice versa) then update
      return true;
    }
    // Otherwise, diff based on props
    const propsToDiff = isUnrendered ? updateOnPropsForUnrendered : updateOnPropsForRendered;
    return !propsToDiff.every(prop => is(nextProps[prop], this.props[prop]));
  }

  componentDidMount () {
    const { intersectionObserverWrapper, id } = this.props;

    intersectionObserverWrapper.observe(
      id,
      this.node,
      this.handleIntersection
    );

    this.componentMounted = true;
  }

  componentWillUnmount () {
    const { intersectionObserverWrapper, id } = this.props;
    intersectionObserverWrapper.unobserve(id, this.node);

    this.componentMounted = false;
  }

  handleIntersection = (entry) => {
    const { onHeightChange, saveHeightKey, id } = this.props;

    if (this.node && this.node.children.length !== 0) {
      // save the height of the fully-rendered element
      this.height = getRectFromEntry(entry).height;

      if (onHeightChange && saveHeightKey) {
        onHeightChange(saveHeightKey, id, this.height);
      }
    }

    this.setState((prevState) => {
      if (prevState.isIntersecting && !entry.isIntersecting) {
        scheduleIdleTask(this.hideIfNotIntersecting);
      }
      return {
        isIntersecting: entry.isIntersecting,
        isHidden: false,
      };
    });
  }

  hideIfNotIntersecting = () => {
    if (!this.componentMounted) {
      return;
    }

    // When the browser gets a chance, test if we're still not intersecting,
    // and if so, set our isHidden to true to trigger an unrender. The point of
    // this is to save DOM nodes and avoid using up too much memory.
    // See: https://github.com/tootsuite/mastodon/issues/2900
    this.setState((prevState) => ({ isHidden: !prevState.isIntersecting }));
  }

  handleRef = (node) => {
    this.node = node;
  }

  render () {
    const { children, id, index, listLength, cachedHeight } = this.props;
    const { isIntersecting, isHidden } = this.state;

    if (!isIntersecting && (isHidden || cachedHeight)) {
      return (
        <article
          ref={this.handleRef}
          aria-posinset={index}
          aria-setsize={listLength}
          style={{ height: `${this.height || cachedHeight}px`, opacity: 0, overflow: 'hidden' }}
          data-id={id}
          tabIndex='0'
        >
          {children && React.cloneElement(children, { hidden: true })}
        </article>
      );
    }

    return (
      <article ref={this.handleRef} aria-posinset={index} aria-setsize={listLength} data-id={id} tabIndex='0'>
        {children && React.cloneElement(children, { hidden: false })}
      </article>
    );
  }

}
