import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Modal, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {normalize, sizes} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {hapticFeedback} from '../../commonutils/helper';

const ViewProfilePictureModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const global = useSelector(state => state?.global);

  useImperativeHandle(ref, () => ({
    open: () => {
      if (!visible) setVisible(true);
    },
    close: () => {
      setVisible(false);
    },
  }));

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={() => ref.current.close()}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          ref.current.close();
          hapticFeedback();
        }}
        style={styles.container}>
        <FastImage
          source={{uri: global?.user?.profileImage, priority: 'high'}}
          style={styles.image}
        />
      </TouchableOpacity>
    </Modal>
  );
});

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: normalize(300),
      height: normalize(300),
      borderRadius: 50,
    },
  });

export default ViewProfilePictureModal;
