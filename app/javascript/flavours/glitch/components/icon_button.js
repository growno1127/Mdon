import React from 'react';
import Motion from 'flavours/glitch/util/optional_motion';
import spring from 'react-motion/lib/spring';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from 'flavours/glitch/components/icon';
import AnimatedNumber from 'flavours/glitch/components/animated_number';

export default class IconButton extends React.PureComponent {

  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    onMouseDown: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    size: PropTypes.number,
    active: PropTypes.bool,
    pressed: PropTypes.bool,
    expanded: PropTypes.bool,
    style: PropTypes.object,
    activeStyle: PropTypes.object,
    disabled: PropTypes.bool,
    inverted: PropTypes.bool,
    animate: PropTypes.bool,
    overlay: PropTypes.bool,
    tabIndex: PropTypes.string,
    label: PropTypes.string,
    counter: PropTypes.number,
    obfuscateCount: PropTypes.bool,
    href: PropTypes.string,
  };

  static defaultProps = {
    size: 18,
    active: false,
    disabled: false,
    animate: false,
    overlay: false,
    tabIndex: '0',
  };

  state = {
    activate: false,
    deactivate: false,
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.animate) return;

    if (this.props.active && !nextProps.active) {
      this.setState({ activate: false, deactivate: true });
    } else if (!this.props.active && nextProps.active) {
      this.setState({ activate: true, deactivate: false });
    }
  }

  handleClick = (e) =>  {
    e.preventDefault();

    if (!this.props.disabled) {
      this.props.onClick(e);
    }
  }

  handleKeyPress = (e) => {
    if (this.props.onKeyPress && !this.props.disabled) {
      this.props.onKeyPress(e);
    }
  }

  handleMouseDown = (e) => {
    if (!this.props.disabled && this.props.onMouseDown) {
      this.props.onMouseDown(e);
    }
  }

  handleKeyDown = (e) => {
    if (!this.props.disabled && this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  }

  render () {
    let style = {
      fontSize: `${this.props.size}px`,
      height: '1.28571429em',
      lineHeight: `${this.props.size}px`,
      ...this.props.style,
      ...(this.props.active ? this.props.activeStyle : {}),
    };
    if (!this.props.label) {
      style.width = '1.28571429em';
    } else {
      style.textAlign = 'left';
    }

    const {
      active,
      className,
      disabled,
      expanded,
      icon,
      inverted,
      overlay,
      pressed,
      tabIndex,
      title,
      counter,
      obfuscateCount,
      href,
    } = this.props;

    const {
      activate,
      deactivate,
    } = this.state;

    const classes = classNames(className, 'icon-button', {
      active,
      disabled,
      inverted,
      activate,
      deactivate,
      overlayed: overlay,
      'icon-button--with-counter': typeof counter !== 'undefined',
    });

    if (typeof counter !== 'undefined') {
      style.width = 'auto';
    }

    let contents = (
      <React.Fragment>
        <Icon id={icon} fixedWidth aria-hidden='true' /> {typeof counter !== 'undefined' && <span className='icon-button__counter'><AnimatedNumber value={counter} obfuscate={obfuscateCount} /></span>}
        {this.props.label}
      </React.Fragment>
    );

    if (href && !this.prop) {
      contents = (
        <a href={href} target='_blank' rel='noopener noreferrer'>
          {contents}
        </a>
      );
    }

    return (
      <button
        aria-label={title}
        aria-pressed={pressed}
        aria-expanded={expanded}
        title={title}
        className={classes}
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        onKeyDown={this.handleKeyDown}
        onKeyPress={this.handleKeyPress}
        style={style}
        tabIndex={tabIndex}
        disabled={disabled}
      >
        {contents}
      </button>
    );
  }

}
