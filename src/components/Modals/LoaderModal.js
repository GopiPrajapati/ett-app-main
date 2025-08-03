import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Animated, Modal, Platform, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import images from '../../assets/images';
import {
  normalize,
  screenHeight,
  screenWidth,
} from '../../commonutils/dimensionutils';

const loaderImages = {
  dark: [
    images.ic_category_loader_dark,
    images.ic_building_loader_dark,
    images.ic_road_loader_dark,
  ],
  light: [
    images.ic_category_loader_light,
    images.ic_building_loader_light,
    images.ic_road_loader_light,
  ],
};

const Loader = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const global = useSelector(state => state.global);

  const images = loaderImages[global?.isDarkMode ? 'dark' : 'light'];
  const {colors} = useTheme();
  const styles = createStyle(colors);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
      }, 380); // Change image every 1 second

      return () => clearInterval(interval);
    }
  }, [visible, images.length]);

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
    },
    hide: () => {
      // Hide modal after 380 seconds
      setTimeout(() => {
        setVisible(false);
      }, 380); // 380 seconds
    },
  }));

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      transparent={true}
      animationType="fade">
      {Platform.OS === 'ios' ? (
        <BlurView
          blurType="dark"
          blurAmount={1}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.containerAndroid} />
      )}
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <Animated.Image
            source={images[currentImageIndex]}
            style={[styles.image]}
          />
        </View>
      </View>
    </Modal>
  );
});

const loaderRef = React.createRef();

const LoaderModal = () => <Loader ref={loaderRef} />;

Loader.show = ({key} = {}) => {
  // console.log('Loader.show - ', key);
  loaderRef.current?.show({key});
};

Loader.hide = ({key} = {}) => {
  // console.log('Loader.hide - ', key);
  loaderRef.current?.hide({key});
};

export {LoaderModal};

export default Loader;

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: screenWidth,
      height: screenHeight,
    },
    containerAndroid: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.8)',
      flex: 1,
    },
    loaderContainer: {
      width: normalize(60),
      height: normalize(60),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalize(12),
      backgroundColor: colors.loader.loaderContainer,
    },
    image: {
      width: normalize(32),
      height: normalize(32),
    },
  });
