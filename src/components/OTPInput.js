import Clipboard from '@react-native-clipboard/clipboard';
import {useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, StyleSheet, TextInput, View} from 'react-native';
import {fontPixel, normalize} from '../commonutils/dimensionutils';
import {commonColors} from '../commonutils/theme';
import {fontStyles} from '../commonutils/typography';

const OTPInput = ({submittedOtp = () => {}, setCurrentOtp}) => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const _inputs = useRef([]);
  const {colors} = useTheme();
  const styles = createStyle(colors);

  // Submit OTP when all fields are filled
  useEffect(() => {
    const otpString = otp.join('');
    setCurrentOtp(otpString);
    if (otpString.length === 6) {
      Keyboard.dismiss();
      submittedOtp(otpString);
    }
  }, [otp]);

  // Handle text change
  const handleChangeText = useCallback((text, index) => {
    // Remove any non-numeric characters
    const cleanText = text.replace(/[^0-9]/g, '');

    // Handle pasting or keyboard suggestion of multiple digits
    if (cleanText.length > 1) {
      const otpArray = cleanText.slice(0, 6).split('');
      const filledOtp = [...new Array(6).fill('')];
      otpArray.forEach((digit, idx) => {
        filledOtp[idx] = digit;
      });
      setOtp(filledOtp);
      // Update native input values
      filledOtp.forEach((digit, idx) => {
        _inputs.current[idx]?.setNativeProps({text: digit});
      });
      _inputs.current[Math.min(5, otpArray.length)]?.focus();
      return;
    }

    // Handle single digit input
    setOtp(prevOtp => {
      const newOtp = [...prevOtp];
      newOtp[index] = cleanText;
      return newOtp;
    });

    // Focus next input if value is entered
    if (cleanText && index < 5) {
      _inputs.current[index + 1]?.focus();
    }
  }, []);

  // Handle backspace key press
  const handleKeyPress = useCallback((e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      setOtp(prevOtp => {
        const newOtp = [...prevOtp];
        if (prevOtp[index] === '' && index > 0) {
          newOtp[index - 1] = '';
          _inputs.current[index - 1]?.focus();
        } else {
          newOtp[index] = '';
        }
        return newOtp;
      });
    }
  }, []);

  // Auto-fill OTP from clipboard
  useEffect(() => {
    const checkClipboard = async () => {
      const clipboardContent = await Clipboard.getString();
      if (/^\d{6}$/.test(clipboardContent)) {
        const otpArray = clipboardContent.split('');
        setOtp(otpArray);
        otpArray.forEach((digit, index) => {
          _inputs.current[index]?.setNativeProps({text: digit});
        });
        _inputs.current[5]?.focus();
        clipboardContent && Clipboard.setString(''); // Clear clipboard
      }
    };

    const interval = setInterval(checkClipboard, 1000); // Check clipboard every second
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          style={styles.input}
          keyboardType="numeric"
          maxLength={6}
          value={digit}
          onChangeText={text => handleChangeText(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          ref={ref => (_inputs.current[index] = ref)}
          cursorColor={commonColors.brandColor}
          selectionColor={commonColors.brandColor}
          returnKeyType="done"
          contextMenuHidden={false}
          selectTextOnFocus
          autoComplete="one-time-code"
        />
      ))}
    </View>
  );
};

export default React.memo(OTPInput);

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      ...fontStyles.archivoExtraBold,
      width: normalize(38),
      height: normalize(48),
      borderWidth: 1,
      borderColor: colors.otpInputTheme.borderColor,
      color: colors.otpInputTheme.color,
      marginHorizontal: 5,
      textAlign: 'center',
      fontSize: fontPixel(24),
      borderRadius: normalize(8),
      padding: 0,
    },
  });
