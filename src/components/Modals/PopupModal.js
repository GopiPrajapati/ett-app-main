import {useTheme} from '@react-navigation/native';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const PopupModal = forwardRef(
  ({children, displacement = 0, displacementX = 0}, ref) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({x: 0, y: 0});
    const [animation] = useState(new Animated.Value(0));
    const [menuSize, setMenuSize] = useState({width: 0, height: 0});
    const [adjustedPosition, setAdjustedPosition] = useState(null);

    const {colors} = useTheme();
    const styles = createStyle(colors);
    const screen = Dimensions.get('window');

    useEffect(() => {
      if (visible) {
        // Reset menu size and adjusted position when menu is shown
        setMenuSize({width: 0, height: 0});
        setAdjustedPosition(null);

        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, [animation, visible]);

    useImperativeHandle(ref, () => ({
      open: refButton => {
        refButton.current.measureInWindow((x, y, width, height) => {
          setPosition({x, y: y + height});
          setVisible(true);
        });
      },
      close: () => {
        setVisible(false);
      },
    }));

    const onClose = () => {
      setVisible(false);
    };

    const onPopupLayout = event => {
      const {width, height} = event.nativeEvent.layout;
      if (menuSize.width === 0 && menuSize.height === 0) {
        setMenuSize({width, height});

        let newX = position.x + displacementX;
        let newY = position.y - displacement;

        // Adjust X position to stay within screen
        if (position.x + width > screen.width) {
          newX = screen.width - width - 10; // 10px padding
          if (newX < 10) {
            newX = 10;
          } // minimum padding
        }

        // Adjust Y position to stay within screen
        if (position.y + height > screen.height) {
          newY = position.y - height - 10; // 10px padding above
          if (newY < 10) {
            newY = 10;
          } // minimum padding
        }

        setAdjustedPosition({x: newX, y: newY - 30});
      }
    };

    const finalPosition = adjustedPosition ? adjustedPosition : position;

    const menuStyle = {
      opacity: animation,
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-10, 0],
          }),
        },
      ],
    };

    return (
      <Modal
        visible={visible}
        transparent={true}
        onRequestClose={onClose}
        style={styles.modal}
        animationType='fade'
        >
        <TouchableOpacity activeOpacity={1} style={{flex: 1}} onPress={onClose}>
          <Animated.View
            onLayout={onPopupLayout}
            style={[
              styles.popupContainer,
              {top: finalPosition.y, left: finalPosition.x},
              menuStyle,
            ]}>
            {children}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  },
);

const createStyle = colors =>
  StyleSheet.create({
    modal: {
      margin: 0, // This makes the modal cover the whole screen
      justifyContent: 'flex-start',
      flex: 1,
    },
    popupContainer: {
      position: 'absolute',
      borderRadius: 8,
      backgroundColor: colors.popupModalTheme.mainBackgroundColor,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5, // For Android shadow
    },
  });

export default PopupModal;
