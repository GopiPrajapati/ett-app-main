import React from 'react';
import {View} from 'react-native';
import {heightPixel, widthPixel} from '../commonutils/dimensionutils';

/**
 * A flexible spacing component for creating consistent margins or padding in layouts.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number|string} [props.size=0] - The size of the spacing, interpreted as a pixel value.
 * @param {string} [props.direction] - The direction of the spacing.
 *    Acceptable values are:
 *    - 'x' or 'X' or 'row': Horizontal spacing (applies to width).
 *    - 'y' or 'Y' or 'column': Vertical spacing (applies to height).
 *    Defaults to vertical if not specified.
 * @param {Object} [props.style] - Additional styles to apply to the View component.
 *
 * @returns {JSX.Element} A View component with the specified spacing applied.
 *
 * Usage Example:
 * <Spacing size={10} direction="x" />
 */

const Spacing = ({size = 0, direction, style}) => {
  const defaultStyle = {};

  if (direction === 'x' || direction === 'X' || direction === 'row') {
    defaultStyle.width = widthPixel(Number(size));
  } else {
    defaultStyle.height = heightPixel(Number(size));
  }

  return <View style={[defaultStyle, style]} />;
};

export default React.memo(Spacing);
