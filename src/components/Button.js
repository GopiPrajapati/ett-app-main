import {useTheme} from '@react-navigation/native';
import React, {useRef} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {fontPixel, normalize} from '../commonutils/dimensionutils';
import {hapticFeedback} from '../commonutils/helper';
import {commonColors} from '../commonutils/theme';
import {fontStyles} from '../commonutils/typography';
import Spacing from './Spacing';

/**
 * Button Component
 * @param {string} title - The text to display on the button.
 * @param {function} onPress - The function to call when the button is pressed.
 * @param {boolean} [disabled=false] - Whether the button is disabled.
 * @param {object} [icon=undefined] - The icon to display alongside the button text (for icon buttons).
 * @param {string} [type='primaryButton'] - The type of button to render. Possible values: 'primaryButton', 'outlineButton', 'disabledButton', 'primaryIconButton'.
 * @param {boolean} [loading=false] - The state of loader. Possible values: 'true', 'false'.
 * @param {boolean} [enableHaptic=true] - The state of enableHaptic. Possible values: 'true', 'false'.
 * @param {string} [hapticType='impactMedium'] - The state of loader. Possible values: 'impactLight', 'impactMedium', and 'impactHeavy.
 */
const Button = ({
  title,
  onPress,
  disabled = false,
  icon = undefined,
  type = 'primaryButton',
  loading = false,
  enableHaptic = true,
  hapticType = 'impactMedium',
}) => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyle(colors), [colors]);

  const getButtonContent = () => {
    switch (type) {
      case 'outlineButton':
        return <Text style={styles.outlineText}>{title}</Text>;
      case 'disabledButton':
        return <Text style={styles.disabledText}>{title}</Text>;
      case 'primaryIconButton':
        return (
          <>
            <Text style={styles.linkText}>{title}</Text>
            {icon && <Spacing size={8} direction="x" />}
            {icon && <Image source={icon} style={styles.linkIcon} />}
          </>
        );
      default:
        return <Text style={styles.primaryText}>{title}</Text>;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'outlineButton':
        return styles.outlineButton;
      case 'disabledButton':
        return styles.disabledButton;
      case 'primaryIconButton':
        return styles.linkButton;
      default:
        return styles.primaryButton;
    }
  };

  const _scale = useRef(new Animated.Value(1)).current;

  // Handle press in animation (scale down)
  const handlePressIn = () => {
    Animated.spring(_scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  // Handle press out animation (scale back to normal)
  const handlePressOut = () => {
    Animated.spring(_scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      activeOpacity={0.8}
      onPress={() => {
        if (enableHaptic && !disabled) {
          hapticFeedback();
        }
        onPress();
      }}
      onPressOut={handlePressOut}
      disabled={disabled || loading || !onPress}
      style={[{transform: [{scale: _scale}]}, getButtonStyle()]}>
      {false ? (
        <ActivityIndicator
          animating={true}
          size="small"
          color={colors.buttonTheme.activityIndicatorColor}
        />
      ) : (
        getButtonContent()
      )}
    </TouchableOpacity>
  );
};

export default Button;

const createStyle = colors =>
  StyleSheet.create({
    primaryButton: {
      height: normalize(44),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalize(8),
      backgroundColor: commonColors.brandColor,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 4,
      elevation: 3, // For Android shadow
    },
    primaryText: {
      ...fontStyles.archivoBold,
      color: colors.buttonTheme.primaryTextColor,
      textAlign: 'center',
      fontSize: fontPixel(14),
    },
    outlineButton: {
      height: normalize(44),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalize(8),
      borderWidth: 1.2,
      borderColor: commonColors.brandColor,
    },
    outlineText: {
      color: commonColors.brandColor,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    disabledButton: {
      height: normalize(44),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalize(8),
      backgroundColor: colors.buttonTheme.disabledButtonBackgroundColor,
    },
    disabledText: {
      ...fontStyles.archivoBold,
      color: commonColors.brandColor,
      textAlign: 'center',
      fontSize: fontPixel(14),
    },
    linkButton: {
      height: normalize(44),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalize(8),
      backgroundColor: commonColors.brandColor,
      flexDirection: 'row',
    },
    linkText: {
      ...fontStyles.archivoBold,
      color: colors.buttonTheme.linkTextColor,
      textAlign: 'center',
      fontSize: fontPixel(14),
    },
    linkIcon: {
      tintColor: colors.buttonTheme.linkIconColor,
      width: normalize(20),
      height: normalize(20),
    },
  });
