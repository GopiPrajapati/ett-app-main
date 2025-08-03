import React, {useRef} from 'react';
import {Animated, Platform, TouchableOpacity} from 'react-native';
import {hapticFeedback} from '../commonutils/helper';

const TouchableContainer = ({
  children,
  styles = {},
  onPress,
  disabled = false,
  enableHaptic = true,
  hapticType = 'impactMedium',
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPress={() => {
        if (enableHaptic && !disabled) {
          hapticFeedback();
        }
        onPress();
      }}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={!onPress || disabled}
      style={[{transform: [{scale: scale}]}, styles]}>
      {children}
    </TouchableOpacity>
  );
};

export default React.memo(TouchableContainer);
