import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Platform} from 'react-native';
import {Keyboard, ScrollView, TextInput, StatusBar} from 'react-native';

const KeyboardScrollView = ({
  children,
  additionalScrollHeight,
  contentContainerStyle,
  ...props
}) => {
  const _scrollViewRef = useRef(null);
  const _scrollPositionRef = useRef(0);
  const _scrollContentSizeRef = useRef(0);
  const _scrollViewSizeRef = useRef(0);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [additionalPadding, setAdditionalPadding] = useState(0);

  const scrollToPosition = useCallback((toPosition, animated) => {
    _scrollViewRef.current?.scrollTo({y: toPosition, animated: !!animated});
    _scrollPositionRef.current = toPosition;
  }, []);

  const additionalScroll = useMemo(
    () => additionalScrollHeight ?? 0,
    [additionalScrollHeight],
  );
  const androidStatusBarOffset = useMemo(
    () => StatusBar.currentHeight ?? 0,
    [],
  );

  useEffect(() => {
    const didShowListener = Keyboard.addListener('keyboardDidShow', frames => {
      const keyboardY = frames.endCoordinates.screenY;
      const keyboardHeight = frames.endCoordinates.height;
      setAdditionalPadding(Math.ceil(keyboardHeight));

      setTimeout(() => {
        setIsKeyboardVisible(true);
      }, 100);

      const currentlyFocusedInput = TextInput.State.currentlyFocusedInput();
      const currentScrollY = _scrollPositionRef.current;

      currentlyFocusedInput?.measureInWindow((_x, y, _width, height) => {
        const endOfInputY = y + height + androidStatusBarOffset;
        const deltaToScroll = endOfInputY - keyboardY;

        if (deltaToScroll < 0) {
          return;
        }

        const scrollPositionTarget =
          currentScrollY + deltaToScroll + additionalScroll;
        scrollToPosition(scrollPositionTarget, true);
      });
    });

    const didHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setAdditionalPadding(0);
      setIsKeyboardVisible(false);
    });

    const willHideListener = Keyboard.addListener(
      'keyboardWillHide',
      frames => {
        // iOS only, scroll back to initial position to avoid flickering
        const keyboardHeight = frames.endCoordinates.height;
        const currentScrollY = _scrollPositionRef.current;

        if (currentScrollY <= 0) {
          return;
        }

        const scrollPositionTarget = currentScrollY - keyboardHeight;
        scrollToPosition(scrollPositionTarget, true);
      },
    );

    return () => {
      didShowListener.remove();
      didHideListener.remove();
      willHideListener.remove();
    };
  }, [additionalScroll, androidStatusBarOffset, scrollToPosition]);

  return (
    <ScrollView
      ref={_scrollViewRef}
      contentContainerStyle={[contentContainerStyle]}
      contentInset={{bottom: additionalPadding}}
      keyboardShouldPersistTaps="never"
      onMomentumScrollEnd={event => {
        _scrollPositionRef.current = event.nativeEvent.contentOffset.y;
      }}
      onScrollEndDrag={event => {
        _scrollPositionRef.current = event.nativeEvent.contentOffset.y;
      }}
      onLayout={event => {
        _scrollViewSizeRef.current = event.nativeEvent.layout.height;
      }}
      onContentSizeChange={(_width, height) => {
        const currentContentHeight = _scrollContentSizeRef.current;
        const contentSizeDelta = height - currentContentHeight;
        _scrollContentSizeRef.current = height;
        if (!isKeyboardVisible) {
          return;
        }
        const currentScrollY = _scrollPositionRef.current;
        const scrollPositionTarget = currentScrollY + contentSizeDelta;
        scrollToPosition(scrollPositionTarget, true);
      }}
      {...props}>
      <View
        style={{paddingBottom: Platform.OS === 'ios' ? 0 : additionalPadding}}>
        {children}
      </View>
    </ScrollView>
  );
};

export default KeyboardScrollView;
