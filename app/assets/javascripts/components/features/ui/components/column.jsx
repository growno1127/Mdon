import ColumnHeader from './column_header';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { DragSource } from 'react-dnd';

const easingOutQuint = (x, t, b, c, d) => c*((t=t/d-1)*t*t*t*t + 1) + b;

const scrollTop = (node) => {
  const startTime = Date.now();
  const offset    = node.scrollTop;
  const targetY   = -offset;
  const duration  = 1000;
  let interrupt   = false;

  const step = () => {
    const elapsed    = Date.now() - startTime;
    const percentage = elapsed / duration;

    if (percentage > 1 || interrupt) {
      return;
    }

    node.scrollTop = easingOutQuint(0, elapsed, offset, targetY, duration);
    requestAnimationFrame(step);
  };

  step();

  return () => {
    interrupt = true;
  };
};

const style = {
  boxSizing: 'border-box',
  background: '#282c37',
  display: 'flex',
  flexDirection: 'column'
};

const columnSource = {
  beginDrag (props) {
    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const Column = React.createClass({

  propTypes: {
    connectDragSource: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired,
    heading: React.PropTypes.string,
    icon: React.PropTypes.string,
    children: React.PropTypes.node
  },

  mixins: [PureRenderMixin],

  handleHeaderClick () {
    let node = ReactDOM.findDOMNode(this);
    this._interruptScrollAnimation = scrollTop(node.querySelector('.scrollable'));
  },

  handleWheel () {
    if (typeof this._interruptScrollAnimation !== 'undefined') {
      this._interruptScrollAnimation();
    }
  },

  render () {
    const { heading, icon, children, connectDragSource, isDragging } = this.props;

    let header = '';

    if (heading) {
      header = <ColumnHeader icon={icon} type={heading} onClick={this.handleHeaderClick} />;
    }

    return connectDragSource(
      <div className='column' style={{...style, opacity: isDragging ? '0.5' : '1' }} onWheel={this.handleWheel}>
        {header}
        {children}
      </div>
    );
  }

});

export default DragSource('column', columnSource, collect)(Column);
