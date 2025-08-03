import {useEffect, useRef, useState} from 'react';
import {Keyboard, Platform} from 'react-native';

const useKeyboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const _keyboardHideListenerRef = useRef(null);
  const _keyboardShowListenerRef = useRef(null);

  const onKeyboardShow = e => {
    setKeyboardHeight(e.endCoordinates.height);
    setIsOpen(true);
  };

  const onKeyboardHide = () => {
    setKeyboardHeight(0);
    setIsOpen(false);
  };

  useEffect(() => {
    _keyboardShowListenerRef.current = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardShow,
    );
    _keyboardHideListenerRef.current = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardHide,
    );

    return () => {
      _keyboardShowListenerRef.current?.remove();
      _keyboardHideListenerRef.current?.remove();
    };
  }, []);

  return {
    isOpen: isOpen,
    keyboardHeight: keyboardHeight,
    keyboardPlatform: Platform.OS,
  };
};

export default useKeyboard;
