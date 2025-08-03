import FastImage from 'react-native-fast-image';
import {useTheme} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Image, Platform, StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {askForPermission} from '../../../commonutils/helper';
import {navigate} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  Button,
  GlobalStatusBar,
  Input,
  Marquee,
  Spacing,
} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import Toast from '../../../components/Toast';
import {sendOtp} from '../../../redux/actions/authentication';
import {Routes} from '../../Routes';

const MARQUEE_SPEED = Platform.OS === 'ios' ? 0.9 : 0.8;

const LoginSignupScreen = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const {colors} = useTheme();
  const global = useSelector(state => state?.global);
  const dispatch = useDispatch();
  const styles = createStyle(colors, global?.isDarkMode);

  useEffect(() => {
    askForPermission();
  }, []);

  const renderMarqueeItems = items =>
    items.map((item, index) => (
      <View key={index} style={styles.marqueeItemContainer}>
        <FastImage
          source={item.icon}
          style={styles.marqueeItemIcon}
          resizeMode="contain"
        />
        <Spacing size={12} direction="x" />
        <Text style={styles.marqueeItemText}>{item.title}</Text>
      </View>
    ));

  const getIcons = items =>
    items.map(item => ({
      title: item.title,
      icon: images[global?.isDarkMode ? item.darkIcon : item.lightIcon],
    }));

  const onChangeText = text => {
    setMobileNumber(text);
  };

  const onPressContinue = () => {
    if (mobileNumber?.trim()?.length < 10) {
      Toast.show({
        message: 'Enter valid Phone Number',
        position: 'top',
        type: 'info',
      });
      return;
    }

    Loader.show({key: Routes.LOGIN_SIGNUP_SCREEN});

    dispatch(
      sendOtp(
        {mobileNumber: mobileNumber},
        {
          SuccessCallback: response => {
            Toast.show({message: response?.message, type: 'success'});
            Loader.hide({key: Routes.LOGIN_SIGNUP_SCREEN});
            navigate(Routes.OTP_VERIFICATION_SCREEN, {
              mobileNumber,
            });
          },
          FailureCallback: response => {
            Loader.hide({key: Routes.LOGIN_SIGNUP_SCREEN});
            if (response?.data?.message) {
              Toast.show({message: response?.data?.message});
            }
          },
        },
      ),
    );
  };

  return (
    <View style={styles.mainContainer}>
      <GlobalStatusBar barStyle="light-content" />
      {!global?.isDarkMode ? (
        <Image source={images.ic_background} style={styles.backgroundImage} />
      ) : (
        <React.Fragment />
      )}
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={normalize(20)}
            bounces={false}>
            <Spacing size={35} />
            <Marquee speed={MARQUEE_SPEED}>
              <View style={styles.marqueeRow}>
                {renderMarqueeItems(
                  getIcons([
                    {
                      title: 'Jewellery',
                      lightIcon: 'ic_jewellery_light',
                      darkIcon: 'ic_jewellery_dark',
                    },
                    {
                      title: 'Eyewear',
                      lightIcon: 'ic_eyewear_light',
                      darkIcon: 'ic_eyewear_dark',
                    },
                    {
                      title: 'Watches',
                      lightIcon: 'ic_watches_light',
                      darkIcon: 'ic_watches_dark',
                    },
                  ]),
                )}
              </View>
            </Marquee>
            <Spacing size={20} />
            <Marquee speed={MARQUEE_SPEED} reverse>
              <View style={styles.marqueeRow}>
                {renderMarqueeItems(
                  getIcons([
                    {
                      title: 'Malls',
                      lightIcon: 'ic_malls_light',
                      darkIcon: 'ic_malls_dark',
                    },
                    {
                      title: 'Hubs',
                      lightIcon: 'ic_hubs_light',
                      darkIcon: 'ic_hubs_dark',
                    },
                    {
                      title: 'Multi-brand store',
                      lightIcon: 'ic_multi_brand_store_light',
                      darkIcon: 'ic_multi_brand_store_dark',
                    },
                  ]),
                )}
              </View>
            </Marquee>
            <Spacing size={20} />
            <Marquee speed={MARQUEE_SPEED}>
              <View style={styles.marqueeRow}>
                {renderMarqueeItems(
                  getIcons([
                    {
                      title: 'Furniture',
                      lightIcon: 'ic_furniture_light',
                      darkIcon: 'ic_furniture_dark',
                    },
                    {
                      title: 'Lighting',
                      lightIcon: 'ic_lighting_light',
                      darkIcon: 'ic_lighting_dark',
                    },
                    {
                      title: 'Kitchenware',
                      lightIcon: 'ic_kitchenware_light',
                      darkIcon: 'ic_kitchenware_dark',
                    },
                  ]),
                )}
              </View>
            </Marquee>
            <Spacing size={32} />
            <View style={styles.loginSignupContainer}>
              <Text style={styles.loginSignupText}>
                {strings.login_sign_up}
              </Text>
              <Spacing size={12} />
              <Text style={styles.loginSignupSubText} numberOfLines={4}>
                {
                  strings.join_now_to_explore_the_best_city_wide_shopping_experiences
                }
              </Text>
              <Spacing size={24} />
              <Input
                inputTitle={strings.enter_your_phone_number}
                value={mobileNumber}
                onChangeText={onChangeText}
                inputMode={'tel'}
                leftText={'+91'}
                rightIcon={images.ic_call}
                maxLength={10}
                onSubmitEditing={() => {
                  onPressContinue();
                }}
              />
              <Spacing size={32} />
              <Button title={strings.continue} onPress={onPressContinue} />
              <Spacing size={16} />
              <Text style={styles.grayText}>
                {strings.by_continuing_you_agree_to_our}
                {'\n'}
                <Text
                  style={styles.termsText}
                  onPress={() => {
                    navigate(Routes.TERMS_AND_CONDITIONS_SCREEN);
                  }}>
                  {strings.terms_conditions}
                </Text>
                <Text style={styles.grayText}> {strings.and} </Text>
                <Text
                  style={styles.conditionText}
                  onPress={() => {
                    navigate(Routes.PRIVACY_POLICY_SCREEN);
                  }}>
                  {strings.privacy_policy}
                </Text>
              </Text>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginSignupScreen;

const createStyle = (colors, isDarkMode) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.loginSignupTheme.mainBackgroundColor,
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    safeAreaContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    marqueeRow: {
      flexDirection: 'row',
    },
    marqueeItemContainer: {
      padding: normalize(12),
      borderRadius: normalize(12),
      marginHorizontal: normalize(8),
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: colors.loginSignupTheme.marqueeItemBackgroundColor,
    },
    marqueeItemIcon: {
      width: normalize(48),
      height: normalize(48),
    },
    marqueeItemText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.loginSignupTheme.marqueeItemTextColor,
    },
    loginSignupContainer: {
      marginHorizontal: sizes.marginHorizontal,
      backgroundColor:
        colors.loginSignupTheme.loginSignupContainerBackgroundColor,
      paddingHorizontal: normalize(20),
      paddingTop: normalize(24),
      paddingBottom: normalize(16),
      borderRadius: normalize(16),
    },
    loginSignupText: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: commonColors.brandColor,
      alignSelf: 'center',
    },
    loginSignupSubText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(24),
      color: colors.loginSignupTheme.loginSignupSubText,
      alignSelf: 'center',
      textAlign: 'center',
    },
    grayText: {
      ...fontStyles.archivoRegular,
      textAlign: 'center',
      color: '#828282',
      fontSize: fontPixel(12),
    },
    termsText: {
      ...fontStyles.archivoMedium,
      color: colors.loginSignupTheme.termsTextColor,
      fontSize: fontPixel(12),
    },
    conditionText: {
      ...fontStyles.archivoMedium,
      color: colors.loginSignupTheme.conditionTextColor,
      fontSize: fontPixel(12),
    },
  });
