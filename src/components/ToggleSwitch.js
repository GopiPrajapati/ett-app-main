import {useTheme} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Animated, StyleSheet, TouchableOpacity} from 'react-native';

const width = 33;
const height = 20;
const thumbSize = width / 2 - 3;
const padding = 4;

const ToggleSwitch = ({
  isEnabled = false,
  onToggle = () => {},
  disabled = false,
}) => {
  const [active, setActive] = useState(isEnabled);
  const [thumbPosition, setThumbPosition] = useState(
    new Animated.Value(isEnabled ? width - thumbSize - padding : padding),
  );
  const {colors} = useTheme();
  const styles = createStyle(colors);

  useEffect(() => {
    Animated.timing(thumbPosition, {
      toValue: active ? width - thumbSize - padding : padding,
      duration: 300, // Duration of the animation in milliseconds
      useNativeDriver: true, // Use the native driver for better performance
    }).start();
  }, [active]);

  useEffect(() => {
    setActive(isEnabled);
  }, [isEnabled]);

  const toggleSwitch = () => {
    const newValue = !active;
    setActive(newValue);
    onToggle(newValue);
  };

  return (
    <TouchableOpacity
      onPress={toggleSwitch}
      disabled={disabled}
      activeOpacity={0.8}
      style={{
        width: width,
        height: height,
        backgroundColor: active
          ? colors.toggleSwitchTheme.activeColor
          : colors.toggleSwitchTheme.inactiveColor,
        borderRadius: 100,
      }}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <Animated.View
        style={[
          styles.switchThumb,
          {
            width: thumbSize,
            height: thumbSize,
            transform: [{translateX: thumbPosition}],
            backgroundColor: colors.toggleSwitchTheme.thumbColor,
            top: (height - thumbSize) / 2,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

export default React.memo(ToggleSwitch);

const createStyle = colors =>
  StyleSheet.create({
    switchThumb: {
      position: 'absolute',
      borderRadius: 50,
    },
  });
