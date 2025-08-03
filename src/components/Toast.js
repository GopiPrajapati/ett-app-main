import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import images from '../assets/images';
import {fontPixel, normalize, sizes} from '../commonutils/dimensionutils';
import {commonColors} from '../commonutils/theme';
import {fontStyles} from '../commonutils/typography';
import Spacing from './Spacing';

const Toast = forwardRef((props, ref) => {
  const global = useSelector(state => state?.global);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [position, setPosition] = useState('top');
  const [hideTimeout, setHideTimeout] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const {top, bottom} = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyle(colors, global);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Only allow swipe in the correct direction based on toast position
        if (
          (position === 'top' && gestureState.dy < 0) || // Swipe up for top position
          (position === 'bottom' && gestureState.dy > 0) // Swipe down for bottom position
        ) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = 50; // Minimum swipe distance to dismiss
        const shouldDismiss =
          (position === 'top' && gestureState.dy < -swipeThreshold) ||
          (position === 'bottom' && gestureState.dy > swipeThreshold);

        if (shouldDismiss) {
          hide(position);
        } else {
          // Return to original position if not swiped enough
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useImperativeHandle(ref, () => ({
    show: ({message, type = null, position = 'top'}) => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }

      setToastType(type);
      setToastMessage(message);
      setPosition(position);
      setToastVisible(true);

      opacity.setValue(0);
      const extraTranslate = 50; // Add extra offset for better visibility
      const screenOffset =
        position === 'top'
          ? -200 - top - extraTranslate - 10 // Add margin for top
          : 200 + bottom + extraTranslate + 10; // Add margin for bottom

      translateY.setValue(screenOffset);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timeout = setTimeout(() => {
        hide(position);
      }, 3000);

      setHideTimeout(timeout);
    },
    hide: () => hide(position),
  }));

  const hide = currentPosition => {
    const extraTranslate = 50; // Add extra offset for better visibility
    const endValue =
      currentPosition === 'top'
        ? -200 - top - extraTranslate - 10 // Add margin for top
        : 200 + bottom + extraTranslate + 10; // Add margin for bottom

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: endValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastVisible(false);
      setToastMessage('');
      setToastType(null);
    });
  };

  if (!toastVisible) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        ...styles.toastContainer,
        opacity,
        transform: [{translateY}],
        top: position === 'top' ? top + 10 : undefined,
        bottom: position === 'bottom' ? bottom + 10 : undefined,
      }}>
      <View style={StyleSheet.absoluteFillObject}>
        {Platform.OS === 'ios' ? (
          <BlurView
            blurType="dark"
            blurAmount={10}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: 'rgba(0,0,0,0.8)'},
            ]}
          />
        )}
      </View>
      <View style={styles.messageContainer}>
        <Image
          source={
            toastType === 'success'
              ? images.ic_success
              : toastType === 'info'
              ? images.ic_info
              : images.ic_failed
          }
          style={styles.messageType}
        />
        <Spacing size={10} direction="x" />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </View>
    </Animated.View>
  );
});

const createStyle = (colors, global) => {
  const iOS = Platform.OS === 'ios';
  return StyleSheet.create({
    toastContainer: {
      position: 'absolute',
      left: sizes.marginHorizontal,
      right: sizes.marginHorizontal,
      zIndex: 9999,
      minHeight: normalize(48),
      borderRadius: 12,
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(10),
      justifyContent: 'center',
      shadowColor: iOS
        ? global.isDarkMode
          ? 'rgba(80, 80, 100, 0.5)'
          : 'rgba(50, 50, 50, 0.3)'
        : global.isDarkMode
        ? 'rgba(80, 80, 100, 0.5)'
        : 'rgba(50, 50, 50, 1)',
      shadowOpacity: iOS ? 0.5 : 0.8,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 4,
      elevation: iOS ? 3 : 5,
      overflow: 'hidden',
    },
    toastText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(15),
      color: commonColors.white,
      flex: 1,
    },
    messageType: {width: normalize(24), height: normalize(24)},
    messageContainer: {flexDirection: 'row', alignItems: 'center', flex: 1},
  });
};

const toastRef = React.createRef();

const GlobalToast = () => <Toast ref={toastRef} />;

Toast.show = ({message, type = null, position = 'top'}) => {
  toastRef.current?.show({message, type, position});
};

export {GlobalToast};
export default Toast;
