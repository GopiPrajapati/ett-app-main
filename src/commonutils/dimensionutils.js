import {Dimensions, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// 375x812 is scale of iPhone X.
const widthBaseScale = SCREEN_WIDTH / 375;
const heightBaseScale = SCREEN_HEIGHT / 812;

const normalize = (size, based = 'width') => {
  const newSize =
    based === 'height' ? size * heightBaseScale : size * widthBaseScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// For width pixel.
const widthPixel = size => {
  return normalize(size, 'width');
};

// For height pixel.
const heightPixel = size => {
  return normalize(size, 'height');
};

// For font pixel.
const fontPixel = size => {
  return heightPixel(size);
};

// For Margin and Padding vertical pixel.
const pixelSizeVertical = size => {
  return heightPixel(size);
};

// For Margin and Padding horizontal pixel.
const pixelSizeHorizontal = size => {
  return widthPixel(size);
};

const sizes = {
  paddingHorizontal: normalize(24),
  paddingVertical: normalize(24),
  marginHorizontal: normalize(24),
  extraBottomPadding: normalize(60),
  extraBottomMargin: normalize(60),
};

const screenWidth = SCREEN_WIDTH;
const screenHeight = SCREEN_HEIGHT;

export {
  fontPixel,
  heightPixel,
  normalize,
  pixelSizeHorizontal,
  pixelSizeVertical,
  widthPixel,
  sizes,
  screenWidth,
  screenHeight,
};
