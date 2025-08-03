import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {Animated, Modal, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const gender = {
  Male: {
    title: 'Male',
    type: 'Male',
  },
  Female: {
    title: 'Female',
    type: 'Female',
  },
  Others: {
    title: 'Others',
    type: 'Others',
  },
};

const SelectGenderModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState(gender.Male.type);
  const {bottom} = useSafeAreaInsets();
  const _blurViewOpacityRef = useRef(new Animated.Value(0)).current;
  const {colors} = useTheme();
  const styles = createStyle(colors);

  useImperativeHandle(ref, () => ({
    open: genderType => {
      if (visible) {
        return;
      }
      if (genderType) {
        setSelectedGender(gender[genderType].type);
      }
      setVisible(true);
    },
    close: () => {
      setVisible(false);
    },
  }));

  useEffect(() => {
    Animated.timing(_blurViewOpacityRef, {
      toValue: visible ? 1 : 0.2, // Animate to 1 when visible, 0.2 otherwise
      duration: 200,
      useNativeDriver: true, // Enable useNativeDriver for better performance
    }).start();
  }, [visible, _blurViewOpacityRef]);

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => ref.current.close()}
      style={styles.modal}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: _blurViewOpacityRef,
            backgroundColor: commonColors.transparent,
          },
        ]}>
        <BlurView
          blurType="dark"
          blurAmount={1}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bottomContainer}>
          <TouchableContainer
            styles={styles.closeIconContainer}
            onPress={() => {
              ref.current.close();
              props?.onPressGender(gender[selectedGender]);
            }}>
            <FastImage source={images.ic_x_close} style={styles.closeIcon} />
          </TouchableContainer>
          <Spacing size={20} />
          <View style={styles.content}>
            <Text style={styles.title}>{strings.select_gender}</Text>
            <Spacing size={normalize(26)} />
            <View style={styles.buttonContainer}>
              {Object.values(gender).map((item, index) => (
                <View key={index}>
                  <TouchableContainer
                    styles={[
                      styles.touchableContainer,
                      selectedGender === item.type
                        ? {
                            backgroundColor:
                              colors.genderModalTheme.backgroundColor,
                          }
                        : {
                            backgroundColor: commonColors.transparent,
                          },
                    ]}
                    onPress={() => {
                      setSelectedGender(item.type);
                      ref.current.close();
                      if (props?.onPressGender) {
                        props?.onPressGender(item);
                      }
                    }}>
                    <Text style={styles.iconTitle}>{item.title}</Text>
                  </TouchableContainer>
                  <Spacing size={8} />
                </View>
              ))}
            </View>
            <Spacing size={bottom === 0 ? 24 : bottom} />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
});

export default SelectGenderModal;

const createStyle = colors =>
  StyleSheet.create({
    modal: {
      flex: 1,
    },
    bottomContainer: {
      bottom: 0,
      position: 'absolute',
      left: 0,
      right: 0,
    },
    content: {
      backgroundColor: colors.editProfileModalTheme.backgroundColor,
      paddingHorizontal: normalize(24),
      paddingTop: normalize(24),
      borderTopLeftRadius: normalize(12),
      borderTopRightRadius: normalize(12),
    },
    closeIconContainer: {
      alignSelf: 'center',
      width: normalize(36),
      height: normalize(36),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.19)',
      borderRadius: 100,
    },
    closeIcon: {
      width: normalize(16),
      height: normalize(16),
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.editProfileModalTheme.titleColor,
      alignSelf: 'center',
    },
    buttonContainer: {
      flexGrow: 1,
    },
    touchableContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: normalize(48),
      borderRadius: normalize(12),
    },
    icon: {
      width: normalize(32),
      height: normalize(32),
    },
    iconTitle: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(16),
      color: colors.editProfileModalTheme.titleColor,
      alignSelf: 'center',
    },
  });
