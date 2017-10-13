import React from 'react';
import Motion from 'react-motion/lib/Motion';
import spring from 'react-motion/lib/spring';
import PropTypes from 'prop-types';

export default class IconButton extends React.PureComponent {

  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    size: PropTypes.number,
    active: PropTypes.bool,
    pressed: PropTypes.bool,
    expanded: PropTypes.bool,
    style: PropTypes.object,
    activeStyle: PropTypes.object,
    disabled: PropTypes.bool,
    inverted: PropTypes.bool,
    animate: PropTypes.bool,
    flip: PropTypes.bool,
    overlay: PropTypes.bool,
    tabIndex: PropTypes.string,
    label: PropTypes.string,
  };

  static defaultProps = {
    size: 18,
    active: false,
    disabled: false,
    animate: false,
    overlay: false,
    tabIndex: '0',
  };

  handleClick = (e) =>  {
    e.preventDefault();

    if (!this.props.disabled) {
      this.props.onClick(e);
    }
  }

  render () {
    let style = {
      fontSize: `${this.props.size}px`,
      height: `${this.props.size * 1.28571429}px`,
      lineHeight: `${this.props.size}px`,
      ...this.props.style,
      ...(this.props.active ? this.props.activeStyle : {}),
    };
    if (!this.props.label) {
      style.width = `${this.props.size * 1.28571429}px`;
    } else {
      style.textAlign = 'left';
    }

    const classes = ['icon-button'];

    if (this.props.active) {
      classes.push('active');
    }

    if (this.props.disabled) {
      classes.push('disabled');
    }

    if (this.props.inverted) {
      classes.push('inverted');
    }

    if (this.props.overlay) {
      classes.push('overlayed');
    }

    if (this.props.className) {
      classes.push(this.props.className);
    }

    const flipDeg = this.props.flip ? -180 : -360;
    const rotateDeg = this.props.active ? flipDeg : 0;

    const motionDefaultStyle = {
      rotate: rotateDeg,
    };

    const springOpts = {
      stiffness: this.props.flip ? 60 : 120,
      damping: 7,
    };
    const motionStyle = {
      rotate: this.props.animate ? spring(rotateDeg, springOpts) : 0,
    };

    return (
      <Motion defaultStyle={motionDefaultStyle} style={motionStyle}>
        {({ rotate }) =>
          <button
            aria-label={this.props.title}
            aria-pressed={this.props.pressed}
            aria-expanded={this.props.expanded}
            title={this.props.title}
            className={classes.join(' ')}
            onClick={this.handleClick}
            style={style}
            tabIndex={this.props.tabIndex}
          >
            <i style={{ transform: `rotate(${rotate}deg)` }} className={`fa fa-fw fa-${this.props.icon}`} aria-hidden='true' />
            {this.props.label}
          </button>
        }
      </Motion>
    );
  }

}
