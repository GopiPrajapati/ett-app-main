import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {useImperativeHandle, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import images from '../../assets/images';
import {
  fontPixel,
  normalize,
  screenWidth,
  sizes,
} from '../../commonutils/dimensionutils';
import storage from '../../commonutils/storage';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {TABS} from '../../container/screens/YettBottomTabBar';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const steps = [
  {
    title: '📍 Location',
    description:
      'Set your city or pinpoint your exact \nspot to unlock local shopping.',
  },
  {
    title: '🏙️  All in City',
    description:
      'Every brand, every store, all in one place.\nDiscover the pulse of local shopping.',
  },
  {
    title: '🏢  Malls',
    description:
      'Browse malls, stores, and the latest \noffers—all in one view.',
  },
  {
    title: '🛍️  Hubs',
    description:
      'From age-old bazaars to iconic markets\n—your gateway to local favorites and the\nstores that thrive there.',
  },
  {
    title: '🔔  Notifications',
    description:
      'Get alerts for offers, restocks, and\nupdates from your favorite stores.',
  },
];

const AppPreviewModal = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const {colors} = useTheme();
  const {top, bottom} = useSafeAreaInsets();
  const styles = createStyle(colors);

  const refs = Array(7)
    .fill(0)
    .map(() => React.createRef());
  const tooltipRef = useRef(null);
  const bottomTabRef = useRef(null);

  const tooltipX = useSharedValue(0);
  const tooltipY = useSharedValue(0);
  const pointerX = useSharedValue(0);

  const tooltipStyle = useAnimatedStyle(() => ({
    transform: [{translateX: tooltipX.value}, {translateY: tooltipY.value}],
  }));

  const triangleStyle = useAnimatedStyle(() => ({
    transform: [{translateX: pointerX.value}],
  }));

  useImperativeHandle(ref, () => ({
    open: () => {
      if (!visible) {
        setCurrentStep(0);
        setVisible(true);
      }
    },
    close: async () => {
      if (visible) {
        setVisible(false);
      }
    },
  }));

  const updatePosition = (_currentStep, x, y, tooltipWidth, tooltipHeight) => {
    const margin = normalize(20);
    let posX = x;
    let posY = y - tooltipHeight - margin;

    if (_currentStep > 0 && _currentStep < 4) {
      bottomTabRef.current?.measureInWindow((btX, btY, btWidth, btHeight) => {
        if (Platform.OS === 'ios') {
          posY = btY - tooltipHeight - margin - btHeight / 2;
        } else {
          posY -= normalize(20);
        }

        if (posY < margin) {
          posY = btY + btHeight + margin;
        }

        if (posX + tooltipWidth > screenWidth - margin) {
          posX = screenWidth - tooltipWidth - margin;
        }
        if (posX < margin) {
          posX = margin;
        }

        tooltipX.value = withTiming(posX);
        tooltipY.value = withTiming(
          posY + top + (Platform.OS === 'ios' ? -normalize(50) : 0),
        );
        pointerX.value = withTiming(x - posX);
      });
    } else {
      tooltipX.value = withTiming(screenWidth - tooltipWidth + x - margin / 2);
      tooltipY.value = withTiming(
        y -
          (Platform.OS === 'ios' ? top + normalize(20) : 0) +
          margin +
          top +
          normalize(10),
      );
      pointerX.value = withTiming(tooltipWidth - margin * 2.5 + normalize(8));
    }
  };

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      transparent={true}
      animationType="fade">
      <BlurView
        blurType="dark"
        style={StyleSheet.absoluteFillObject}
        blurAmount={10}
      />
      <View style={{flex: 1, marginTop: top}}>
        <View style={[styles.headerContainer]}>
          {currentStep === 0 ? (
            <View
              style={[styles.leftContainer]}
              ref={refs[0]}
              onLayout={event => {
                const {height, x, y} = event.nativeEvent.layout;
                tooltipX.value = withTiming(x);
                tooltipY.value = withTiming(y + height + normalize(5));
                pointerX.value = withTiming(x + normalize(10));
              }}>
              <View style={styles.locationContainer}>
                <FastImage
                  source={images.ic_location}
                  style={styles.locationIcon}
                />
                <Spacing size={12} direction="x" />
                <Text style={styles.locationText}>{'Lucknow'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.leftContainer} />
          )}
          <View
            style={[
              styles.rightContainer,
              {display: currentStep === 4 ? 'flex' : 'none'},
            ]}>
            <View style={styles.iconButton} ref={refs[5]}>
              <Image
                source={images.ic_notification}
                tintColor={commonColors.darkGray}
                style={styles.icon}
                resizeMode="contain"
              />
              <View style={styles.badge} />
            </View>
          </View>
        </View>

        <Animated.View
          ref={tooltipRef}
          style={[tooltipStyle, {position: 'absolute'}]}>
          {(currentStep === 0 || currentStep === 4) && (
            <Animated.View style={[styles.triangleContainer, triangleStyle]}>
              <View style={styles.triangle} />
            </Animated.View>
          )}
          <View style={styles.stepsContainer}>
            <View style={styles.stepsHeader}>
              <Text style={styles.stepsTitle}>{steps[currentStep]?.title}</Text>
              {currentStep < 4 && (
                <TouchableContainer
                  onPress={async () => {
                    ref.current.close();
                    await AsyncStorage.setItem(
                      storage.WALK_THROUGH_GUIDE,
                      'true',
                    );
                  }}>
                  <Text style={styles.skip}>Skip</Text>
                </TouchableContainer>
              )}
            </View>
            <Spacing size={8} />
            <Text style={styles.description}>
              {steps[currentStep]?.description}
            </Text>
            <Spacing size={16} />
            <View style={styles.stepsFooter}>
              <Text style={styles.currentSteps}>{currentStep + 1}/5</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {currentStep > 0 && (
                  <TouchableContainer
                    onPress={() => {
                      const nextStep =
                        currentStep === 4
                          ? 3
                          : currentStep === 3
                          ? 2
                          : currentStep === 2
                          ? 1
                          : 0;

                      refs[nextStep].current?.measureInWindow(
                        (x, y, width, height) => {
                          tooltipRef.current?.measureInWindow(
                            (tx, ty, tw, th) => {
                              updatePosition(nextStep, x, y, tw, th);
                            },
                          );
                        },
                      );

                      setCurrentStep(prev => prev - 1);
                    }}>
                    <Text style={styles.prev}>Prev</Text>
                  </TouchableContainer>
                )}
                <Spacing size={12} direction="x" />
                <TouchableContainer
                  onPress={async () => {
                    if (currentStep < steps.length - 1) {
                      let _currentStep = currentStep;
                      _currentStep =
                        _currentStep >= 3 ? _currentStep + 2 : _currentStep + 1;

                      refs[_currentStep].current?.measureInWindow(
                        (x, y, width, height) => {
                          tooltipRef.current?.measureInWindow(
                            (tx, ty, tw, th) => {
                              updatePosition(_currentStep, x, y, tw, th);
                            },
                          );
                        },
                      );

                      setCurrentStep(prev => prev + 1);
                    } else {
                      ref.current.close();
                      await AsyncStorage.setItem(
                        storage.WALK_THROUGH_GUIDE,
                        'true',
                      );
                    }
                  }}
                  styles={styles.stepsNext}>
                  <Text style={styles.next}>
                    {currentStep < 4 ? 'Next' : 'Done'}
                  </Text>
                </TouchableContainer>
              </View>
            </View>
          </View>
          {currentStep > 0 && currentStep < 4 && (
            <Animated.View style={[styles.triangleContainer, triangleStyle]}>
              <View style={[styles.triangle, {top: normalize(-10)}]} />
            </Animated.View>
          )}
        </Animated.View>

        <View
          ref={bottomTabRef}
          style={[
            styles.tabBarContainer,
            {paddingBottom: bottom > 0 ? bottom : normalize(12)},
          ]}>
          {TABS.map((route, index) => {
            return (
              <View key={index} style={styles.iconContainer}>
                <Image
                  ref={index === 0 || index === 4 ? undefined : refs[index]}
                  source={route.tabImage}
                  style={{width: normalize(24), height: normalize(24)}}
                  tintColor={
                    index === 0 || index === 4 || currentStep !== index
                      ? commonColors.transparent
                      : commonColors.white
                  }
                />
                <Spacing size={4} />
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        index === 0 || index === 4 || currentStep !== index
                          ? commonColors.transparent
                          : commonColors.white,
                    },
                  ]}>
                  {route.title}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Modal>
  );
});

export default AppPreviewModal;

const createStyle = colors =>
  StyleSheet.create({
    leftContainer: {flexDirection: 'row', alignItems: 'center', flexShrink: 1},
    headerContainer: {
      width: Dimensions.get('window').width,
      height: normalize(60),
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    locationIcon: {width: normalize(24), height: normalize(24)},
    locationText: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(16),
      color: commonColors.white,
    },
    rightContainer: {flexDirection: 'row', alignItems: 'center'},
    iconButton: {
      width: normalize(40),
      height: normalize(40),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: commonColors.white,
      borderRadius: 100,
      overflow: 'hidden',
    },
    icon: {width: normalize(22), height: normalize(22)},
    badge: {
      backgroundColor: '#FF0000',
      borderWidth: 1,
      borderColor: 'white',
      width: normalize(7.33),
      height: normalize(7.33),
      borderRadius: 100,
      position: 'absolute',
      top: 10,
      right: 12,
    },
    tabBarContainer: {
      flexDirection: 'row',
      paddingVertical: normalize(12),
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    iconContainer: {
      width: screenWidth / 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.white,
    },
    stepsContainer: {
      padding: normalize(22),
      paddingHorizontal: normalize(16),
      backgroundColor: commonColors.darkGray,
      borderRadius: normalize(20),
      minWidth: screenWidth / 2.5,
    },
    stepsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepsTitle: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(16),
      color: commonColors.white,
    },
    skip: {
      ...fontStyles.archivoSemiBold,
      fontSize: fontPixel(12),
      color: commonColors.brandColor,
    },
    description: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    stepsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currentSteps: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    stepsNext: {
      backgroundColor: commonColors.brandColor,
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(8),
      borderRadius: normalize(8),
    },
    next: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(12),
      color: commonColors.white,
    },
    prev: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    triangleContainer: {
      width: normalize(20),
      height: normalize(10),
      overflow: 'hidden',
    },
    triangle: {
      width: normalize(20),
      height: normalize(20),
      backgroundColor: commonColors.darkGray,
      borderRadius: 5,
      transform: [{rotate: '45deg'}, {scaleX: 0.7}, {scaleY: 0.7}],
    },
  });
