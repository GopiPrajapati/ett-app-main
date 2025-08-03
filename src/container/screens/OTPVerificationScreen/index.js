import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {AppState, StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {
  getFCMToken,
  requestLocationPermission,
} from '../../../commonutils/helper';
import {
  goBack,
  navigate,
  navigateAndSimpleReset,
} from '../../../commonutils/navigationutils';
import storage from '../../../commonutils/storage';
import {fontStyles} from '../../../commonutils/typography';
import {
  Button,
  GlobalStatusBar,
  Header,
  OTPInput,
  Spacing,
} from '../../../components';
import Toast from '../../../components/Toast';
import API, {Headers} from '../../../networking/NetworkService';
import {setUserDetails} from '../../../redux/actions';
import {login, sendOtp} from '../../../redux/actions/authentication';
import {Routes} from '../../Routes';
import * as helper from '../../../commonutils/helper';

const OTPVerificationScreen = props => {
  const {colors} = useTheme();
  const global = useSelector(state => state?.global);
  const dispatch = useDispatch();
  const styles = createStyle(colors, global?.isDarkMode);
  const [timer, setTimer] = useState(30); // Timer in seconds
  const [otp, setOtp] = useState(null);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const {mobileNumber} = props?.route.params;

  // Handle AppState changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
      if (nextAppState === 'active') {
        calculateRemainingTime(); // Calculate remaining time when coming to foreground
      }
    });

    return () => subscription.remove();
  }, []);

  // Handle timer update every second when in the foreground
  useEffect(() => {
    let timerInterval;
    if (!canResend) {
      timerInterval = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) {
            setCanResend(true);
            clearInterval(timerInterval); // Stop the timer when time is up
            return 30; // Reset to initial timer value
          }
          return prev - 1;
        });
      }, 1000); // Update every second

      return () => clearInterval(timerInterval);
    }
  }, [canResend]);

  // Function to save the timer start time
  const saveStartTime = async () => {
    const startTime = new Date().getTime(); // Get current timestamp
    await AsyncStorage.setItem('otpStartTime', startTime.toString());
    setCanResend(false); // Disable resend until timer expires
  };

  // Function to calculate remaining time based on the start time
  const calculateRemainingTime = async () => {
    const startTime = await AsyncStorage.getItem('otpStartTime');
    if (startTime) {
      const elapsedTime = Math.floor(
        (new Date().getTime() - parseInt(startTime)) / 1000,
      ); // seconds
      const remainingTime = Math.max(0, 30 - elapsedTime); // 30 seconds limit
      setTimer(remainingTime);
      if (remainingTime === 0) {
        setCanResend(true);
        setTimer(30);
      } else {
        setCanResend(false);
      }
    } else {
      setTimer(30); // If no start time, reset timer
      setCanResend(true); // Enable resend immediately if no previous timer
    }
  };

  const onPressResend = async () => {
    if (canResend) {
      saveStartTime();
      dispatch(
        sendOtp(
          {mobileNumber: mobileNumber},
          {
            SuccessCallback: response => {
              Toast.show({message: response?.message, type: 'success'});
            },
            FailureCallback: response => {
              if (response?.data?.message) {
                Toast.show({message: response?.data?.message});
              }
            },
          },
        ),
      );
    }
  };

  const onPressSubmit = async otp => {
    const fcmToken = await getFCMToken();

    if (otp?.length < 6) {
      Toast.show({
        message: 'Enter valid OTP',
        position: 'top',
        type: 'info',
      });
      return;
    }

    setLoading(true);
    dispatch(
      login(
        {
          otp: otp,
          fcmToken,
          mobileNumber: props.route.params.mobileNumber,
        },
        {
          SuccessCallback: async response => {
            const {tokens, user} = response?.data;
            if (!tokens?.accessToken || !tokens?.refreshToken) {
              Toast.show({message: 'Something went wrong!'});
              return;
            }
            helper.accessToken = tokens?.accessToken;
            await AsyncStorage.setItem(
              storage.ACCESS_TOKEN,
              tokens?.accessToken,
            );
            await AsyncStorage.setItem(
              storage.REFRESH_TOKEN,
              tokens?.refreshToken,
            );

            API.getInstance().setHeader(
              Headers.AUTHORIZATION,
              `Bearer ${tokens?.accessToken}`,
            );
            if (!user?.isProfileCompleted) {
              navigate(Routes.PROFILE_INFO_SCREEN, {
                ...tokens,
                ...user,
                user: user,
              });
            } else {
              dispatch(setUserDetails(user));
              await AsyncStorage.setItem(storage.IS_LOGIN, 'true');
              const isLocationEnabled = await requestLocationPermission();
              if (isLocationEnabled) {
                navigateAndSimpleReset(Routes.YETT_BOTTOM_TAB_BAR);
              } else {
                navigateAndSimpleReset(Routes.YETT_NOT_AVAILABLE_SCREEN);
              }
            }
            setLoading(false);
          },
          FailureCallback: response => {
            if (response?.data?.message) {
              Toast.show({message: response?.data?.message});
            }

            setLoading(false);
          },
        },
      ),
    );
  };

  return (
    <View style={styles.mainContainer}>
      <GlobalStatusBar barStyle="light-content" />
      {!global?.isDarkMode ? (
        <FastImage
          source={images.ic_background}
          style={styles.backgroundImage}
        />
      ) : (
        <React.Fragment />
      )}
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'bottom']}>
        <Header
          leftArrowTintColor={'#fff'}
          back={true}
          onPressLeftArrow={goBack}
        />
        <View style={styles.container}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={normalize(20)}
            bounces={false}
            keyboardShouldPersistTaps="always">
            <Text style={styles.otpVerificationText}>
              {strings.otp_verification}
            </Text>
            <Spacing size={12} />
            <Text style={styles.otpVerificationSubText}>
              {strings.we_have_sent_a_verification_code_to}
            </Text>
            <Spacing size={2} />
            <Text style={styles.number}>{`+91 ${mobileNumber}`}</Text>
            <Spacing size={24} />
            <View style={styles.otpVerificationContainer}>
              <Text style={styles.textMessageTitle}>
                {strings.check_text_message_for_your_otp}
              </Text>
              <Spacing size={16} />
              <OTPInput
                setCurrentOtp={otp => setOtp(otp)}
                submittedOtp={otp => {
                  setTimeout(() => {
                    if (otp?.length === 6 && !loading) {
                      onPressSubmit(otp);
                    }
                  }, 500);
                }}
              />
              <Spacing size={24} />
              <Text style={styles.resendTextContainer}>
                <Text style={styles.didnGetOtpText}>
                  {strings.didnt_get_the_otp}
                </Text>
                {'  '}
                <Text
                  style={styles.resendOtpButtonText}
                  onPress={onPressResend}>
                  {canResend
                    ? strings.resend_sms
                    : `${strings.resend_sms_in} ${timer}s`}
                </Text>
              </Text>
              <Spacing size={32} />
              <Button
                buttonType="primaryButton"
                title={strings.submit}
                disabled={loading}
                onPress={() => onPressSubmit(otp)}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OTPVerificationScreen;

const createStyle = (colors, isDarkMode) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.otpVerificationTheme.mainBackgroundColor,
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
    otpVerificationText: {
      ...fontStyles.archivoBold,
      textAlign: 'center',
      fontSize: fontPixel(28),
      color: '#fff',
    },
    otpVerificationSubText: {
      ...fontStyles.archivoRegular,
      textAlign: 'center',
      fontSize: fontPixel(14),
      color: 'rgba(255,255,255,0.48)',
    },
    number: {
      ...fontStyles.archivoMedium,
      textAlign: 'center',
      fontSize: fontPixel(14),
      color: 'rgba(255,255,255,1)',
    },
    otpVerificationContainer: {
      padding: normalize(20),
      borderRadius: normalize(16),
      backgroundColor:
        colors.otpVerificationTheme.otpVerificationContainerBackgroundColor,
      marginHorizontal: sizes.marginHorizontal,
    },
    textMessageTitle: {
      ...fontStyles.archivoRegular,
      textAlign: 'center',
      fontSize: fontPixel(14),
      color: '#828282',
    },
    didnGetOtpText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
    resendOtpButtonText: {
      ...fontStyles.archivoSemiBold,
      fontSize: fontPixel(14),
      color: colors.otpVerificationTheme.resendOtpTextColor,
    },
    resendTextContainer: {
      textAlign: 'center',
    },
  });
