import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {
  fontPixel,
  normalize,
  screenHeight,
  sizes,
} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {useKeyboard} from '../../hooks';
import {sendOtp, verifyMobileNumber} from '../../redux/actions/authentication';
import Button from '../Button';
import LToast, {LocalToast} from '../LocalToast';
import OTPInput from '../OTPInput';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const VerifyOTPModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [otp, setOtp] = useState(null);
  const [mobileNumber, setMobilNumber] = useState('');
  const [timer, setTimer] = useState(30); // Timer in seconds
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null); // Ref to store the interval ID
  const {colors} = useTheme();
  const {keyboardHeight} = useKeyboard();
  const translateY = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const styles = createStyle(colors);

  useEffect(() => {
    const thresholdHeight = 600; // Example threshold for smaller screens
    if (screenHeight <= thresholdHeight && keyboardHeight > 0) {
      Animated.timing(translateY, {
        toValue: -keyboardHeight / 2,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [keyboardHeight, translateY]);

  useImperativeHandle(ref, () => ({
    open: mobileNumber => {
      if (!visible) {
        setMobilNumber(mobileNumber);
        setVisible(true);
        startTimer(); // Start timer when modal opens
      }
    },
    close: () => {
      setVisible(false);
      stopTimer(); // Stop timer when modal closes
    },
  }));

  // Start the timer
  const startTimer = () => {
    stopTimer(); // Clear any existing timer
    setTimer(30); // Reset timer to 30 seconds
    setCanResend(false); // Disable resend initially

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) {
          setCanResend(true); // Enable resend when timer ends
          stopTimer();
          return 30; // Reset timer value
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stop the timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTimer(); // Cleanup on component unmount
  }, []);

  const handleResendOtp = () => {
    if (canResend) {
      dispatch(
        sendOtp(
          {mobileNumber: mobileNumber},
          {
            SuccessCallback: response => {},
            FailureCallback: response => {
              if (response?.data?.message) {
                LToast.show({message: response?.data?.message});
              }
            },
          },
        ),
      );
      startTimer(); // Restart the timer when OTP is resent
    }
  };

  const onPressSubmit = () => {
    setLoading(true);
    dispatch(
      verifyMobileNumber(
        {otp: otp, mobileNumber: mobileNumber},
        {
          SuccessCallback: response => {
            ref.current.close();
            props.verified(true);
            setLoading(false);
          },
          FailureCallback: response => {
            props.verified(false);
            if (response?.data?.message) {
              LToast.show({message: response?.data?.message});
              setLoading(false);
            }
          },
        },
      ),
    );
  };

  return (
    <Modal
      key={'VerifyOTPModal'}
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      style={styles.modal}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[styles.container, {transform: [{translateY: translateY}]}]}>
        <View style={styles.formContainer}>
          <ScrollView
            enableOnAndroid={true}
            contentContainerStyle={styles.contentContainerStyle}>
            <View style={styles.header}>
              <Text style={styles.title}>{strings.otp_verification}</Text>
              <TouchableContainer onPress={() => ref.current.close()}>
                <Image source={images.ic_x_close} style={styles.closeIcon} />
              </TouchableContainer>
            </View>
            <Spacing size={12} />
            <Text style={styles.otpVerificationSubText}>
              {strings.we_have_sent_a_6_digit_verification_code_to}
            </Text>
            <Spacing size={2} />
            <Text style={styles.number}>{`+91 ${mobileNumber}`}</Text>
            <Spacing size={20} />
            <OTPInput
              submittedOtp={otp => {
                setOtp(otp);
              }}
            />
            <Spacing size={24} />
            <Text style={styles.resendOtpButtonText} onPress={handleResendOtp}>
              {canResend
                ? strings.resend_sms
                : `${strings.resend_sms_in} ${timer}s`}
            </Text>
            <Spacing size={33} />
            <Button
              disabled={loading}
              title={strings.submit}
              onPress={onPressSubmit}
            />
          </ScrollView>
        </View>
      </Animated.View>
      <LocalToast />
    </Modal>
  );
});

export default VerifyOTPModal;

const createStyle = colors =>
  StyleSheet.create({
    modal: {
      flex: 1,
    },
    contentContainerStyle: {paddingVertical: normalize(20)},
    container: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
    },
    formContainer: {
      backgroundColor: colors.verifyOTPModalTheme.backgroundColor,
      paddingHorizontal: normalize(20),
      borderRadius: normalize(12),
      minHeight: normalize(309),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.verifyOTPModalTheme.titleColor,
      alignSelf: 'center',
    },
    closeIcon: {
      width: normalize(22),
      height: normalize(22),
      tintColor: commonColors.gray,
    },
    otpVerificationSubText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.verifyOTPModalTheme.weHaveSentColor,
    },
    number: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: colors.verifyOTPModalTheme.phoneNumberColor,
    },
    resendOtpButtonText: {
      ...fontStyles.archivoSemiBold,
      fontSize: fontPixel(14),
      textAlign: 'center',
      color: commonColors.gray,
    },
  });
