import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ZoomableImage from './zoomable_image';

export default class ImageLoader extends React.PureComponent {

  static propTypes = {
    alt: PropTypes.string,
    src: PropTypes.string.isRequired,
    previewSrc: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    alt: '',
    width: null,
    height: null,
  };

  state = {
    loading: true,
    error: false,
  }

  removers = [];
  canvas = null;

  get canvasContext() {
    if (!this.canvas) {
      return null;
    }
    this._canvasContext = this._canvasContext || this.canvas.getContext('2d');
    return this._canvasContext;
  }

  componentDidMount () {
    this.loadImage(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.src !== nextProps.src) {
      this.loadImage(nextProps);
    }
  }

  componentWillUnmount () {
    this.removeEventListeners();
  }

  loadImage (props) {
    this.removeEventListeners();
    this.setState({ loading: true, error: false });
    Promise.all([
      props.previewSrc && this.loadPreviewCanvas(props),
      this.hasSize() && this.loadOriginalImage(props),
    ].filter(Boolean))
      .then(() => {
        this.setState({ loading: false, error: false });
        this.clearPreviewCanvas();
      })
      .catch(() => this.setState({ loading: false, error: true }));
  }

  loadPreviewCanvas = ({ previewSrc, width, height }) => new Promise((resolve, reject) => {
    const image = new Image();
    const removeEventListeners = () => {
      image.removeEventListener('error', handleError);
      image.removeEventListener('load', handleLoad);
    };
    const handleError = () => {
      removeEventListeners();
      reject();
    };
    const handleLoad = () => {
      removeEventListeners();
      this.canvasContext.drawImage(image, 0, 0, width, height);
      resolve();
    };
    image.addEventListener('error', handleError);
    image.addEventListener('load', handleLoad);
    image.src = previewSrc;
    this.removers.push(removeEventListeners);
  })

  clearPreviewCanvas () {
    const { width, height } = this.canvas;
    this.canvasContext.clearRect(0, 0, width, height);
  }

  loadOriginalImage = ({ src }) => new Promise((resolve, reject) => {
    const image = new Image();
    const removeEventListeners = () => {
      image.removeEventListener('error', handleError);
      image.removeEventListener('load', handleLoad);
    };
    const handleError = () => {
      removeEventListeners();
      reject();
    };
    const handleLoad = () => {
      removeEventListeners();
      resolve();
    };
    image.addEventListener('error', handleError);
    image.addEventListener('load', handleLoad);
    image.src = src;
    this.removers.push(removeEventListeners);
  });

  removeEventListeners () {
    this.removers.forEach(listeners => listeners());
    this.removers = [];
  }

  hasSize () {
    const { width, height } = this.props;
    return typeof width === 'number' && typeof height === 'number';
  }

  setCanvasRef = c => {
    this.canvas = c;
  }

  render () {
    const { alt, src, width, height, onClick } = this.props;
    const { loading } = this.state;

    const className = classNames('image-loader', {
      'image-loader--loading': loading,
      'image-loader--amorphous': !this.hasSize(),
    });

    return (
      <div className={className}>
        {loading ? (
          <canvas
            className='image-loader__preview-canvas'
            ref={this.setCanvasRef}
            width={width}
            height={height}
          />
        ) : (
          <ZoomableImage
            alt={alt}
            src={src}
            onClick={onClick}
          />
        )}
      </div>
    );
  }

}
