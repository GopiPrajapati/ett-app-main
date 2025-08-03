import {useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {fontPixel, normalize} from '../commonutils/dimensionutils';
import {commonColors} from '../commonutils/theme';
import {fontStyles} from '../commonutils/typography';
import Spacing from './Spacing';
import TouchableContainer from './TouchableContainer';

const Input = ({
  inputRef,
  placeholder,
  value,
  onChangeText = () => {},
  onSubmitEditing,
  inputTitle,
  inputMode,
  keyboardType,
  editable = true,
  leftText = undefined,
  leftTextStyle = {},
  leftIcon = undefined,
  leftIconStyle = {},
  onPressLeftIcon = () => {},
  rightIcon = undefined,
  rightIconStyle = {},
  numberOfLines = 1,
  multiline = false,
  onPressRightIcon,
  returnKeyType,
  maxLength = undefined,
  autoCapitalize = 'none',
  textContentType = 'none',
  style = {},
  textInputStyle = {},
  placeholderStyle = {},
  onPress,
  animatePlaceholderText = false,
  isBorderLessContainer = false,
  externalBorderLessTextInputContainer = {},
}) => {
  const {colors} = useTheme();
  const styles = createStyle(colors);

  const placeholders = useMemo(() => [`Brands`, `Malls`, `Hubs`], []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const translateY = useRef(new Animated.Value(30)).current; // Start off-screen
  const opacity = useRef(new Animated.Value(0)).current; // Start transparent

  const animatePlaceholder = useCallback(() => {
    Animated.sequence([
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
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({finished}) => {
      if (finished) {
        setCurrentIndex(prevIndex => (prevIndex + 1) % placeholders.length);
        translateY.setValue(10); // Reset position
        opacity.setValue(0); // Reset opacity
        animatePlaceholder(); // Loop animation
      }
    });
  }, [opacity, translateY, placeholders]);

  useEffect(() => {
    if (animatePlaceholderText) {
      animatePlaceholder();
    } // Start animation loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatePlaceholderText]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={editable}
      onPress={() => !editable && onPress && onPress()}>
      <View style={styles.container} pointerEvents={editable ? 'auto' : 'none'}>
        {inputTitle && <Text style={styles.inputTitle}>{inputTitle}</Text>}
        {inputTitle && <Spacing size={8} />}
        <View
          style={
            multiline
              ? [styles.textInputMultilineContainer, {...style}]
              : [
                  isBorderLessContainer
                    ? [
                        styles.borderLessTextInputContainer,
                        externalBorderLessTextInputContainer,
                      ]
                    : styles.textInputContainer,
                ]
          }>
          {leftText && (
            <Text style={[styles.leftText, leftTextStyle]}>{leftText}</Text>
          )}
          {leftIcon && (
            <TouchableContainer onPress={onPressLeftIcon}>
              <Image
                source={leftIcon}
                style={[styles.leftIcon, leftIconStyle]}
                resizeMode="contain"
              />
            </TouchableContainer>
          )}
          {(leftText || leftIcon) && <Spacing size={8} direction="x" />}
          <View style={styles.inputContainer}>
            {animatePlaceholderText ? (
              <React.Fragment />
            ) : (
              <TextInput
                ref={inputRef}
                placeholder={animatePlaceholderText ? '' : placeholder}
                placeholderTextColor={'#828282'}
                value={value}
                onChangeText={text => {
                  onChangeText(text);
                }}
                onSubmitEditing={onSubmitEditing}
                style={
                  placeholder
                    ? [
                        styles.placeholder,
                        {
                          ...placeholderStyle,
                          textAlignVertical: multiline ? 'top' : undefined,
                        },
                      ]
                    : [
                        styles.textInput,
                        {
                          ...textInputStyle,
                          textAlignVertical: multiline ? 'top' : undefined,
                        },
                      ]
                }
                inputMode={inputMode}
                keyboardType={keyboardType}
                editable={editable}
                cursorColor={commonColors.brandColor}
                selectionColor={commonColors.brandColor}
                numberOfLines={numberOfLines}
                multiline={multiline}
                returnKeyType={returnKeyType}
                autoCapitalize={autoCapitalize}
                textContentType={textContentType}
                maxLength={maxLength}
              />
            )}
            {animatePlaceholderText && (!value || value?.length === 0) ? (
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.animatedPlaceholder}>Search for </Text>
                <Animated.Text
                  style={[
                    styles.animatedPlaceholder,
                    {
                      transform: [{translateY}],
                      opacity,
                    },
                  ]}>
                  {placeholders[currentIndex]}
                </Animated.Text>
              </View>
            ) : (
              <React.Fragment />
            )}
          </View>
          {rightIcon && <Spacing size={8} direction="x" />}
          {rightIcon && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onPressRightIcon}
              disabled={!onPressRightIcon}>
              <Image
                source={rightIcon}
                style={[styles.rightIcon, rightIconStyle]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(Input);

const createStyle = colors =>
  StyleSheet.create({
    container: {minHeight: normalize(48)},
    textInputContainer: {
      height: normalize(48),
      maxHeight: normalize(200),
      backgroundColor: colors.inputTheme.textInputContainerBackgroundColor,
      borderColor: colors.inputTheme.textInputContainerBorderColor,
      borderWidth: 1,
      borderRadius: normalize(12),
      flexDirection: 'row',
      paddingHorizontal: normalize(16),
      alignItems: 'center',
    },
    borderLessTextInputContainer: {
      height: normalize(48),
      maxHeight: normalize(200),
      backgroundColor: colors.inputTheme.textInputContainerBackgroundColor,
      borderRadius: normalize(12),
      flexDirection: 'row',
      paddingHorizontal: normalize(16),
      alignItems: 'center',
    },
    inputTitle: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
    textInputMultilineContainer: {
      flex: 1,
      minHeight: normalize(48),
      backgroundColor: colors.inputTheme.textInputContainerBackgroundColor,
      borderColor: colors.inputTheme.textInputContainerBorderColor,
      borderWidth: 1,
      borderRadius: normalize(12),
      flexDirection: 'row',
      padding: 0,
      paddingHorizontal: normalize(16),
      alignItems: 'center',
    },
    inputContainer: {flex: 1, overflow: 'hidden'},
    textInput: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(18),
      padding: 0,
      color: colors.inputTheme.textInputColor,
    },
    placeholder: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      padding: 0,
      color: '#828282',
    },
    animatedPlaceholder: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      padding: 0,
      color: '#828282',
      // position: 'absolute',
    },
    leftText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
    leftIcon: {
      width: normalize(20),
      height: normalize(20),
    },
    rightIcon: {
      width: normalize(20),
      height: normalize(20),
    },
  });
