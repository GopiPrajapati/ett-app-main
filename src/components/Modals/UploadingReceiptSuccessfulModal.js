import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize, sizes} from '../../commonutils/dimensionutils';
import {navigateAndSimpleReset} from '../../commonutils/navigationutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {Routes} from '../../container/Routes';
import Button from '../Button';
import Spacing from '../Spacing';

const UploadingReceiptSuccessfulModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const global = useSelector(state => state?.global);

  useImperativeHandle(ref, () => ({
    open: () => {
      if (visible) {
        return;
      }
      setVisible(true);
    },
    close: () => {
      setVisible(false);
    },
  }));

  return (
    <Modal
      key={'UploadingReceiptSuccessfulModal'}
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => ref.current.close()}
      style={styles.modal}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.container}>
        <View style={styles.alertContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={
                global?.isDarkMode
                  ? images.ic_check_mark_square_dark
                  : images.ic_check_mark_square_light
              }
              style={styles.image}
            />
          </View>
          <View style={styles.contentWrapper}>
            <Spacing size={20} />
            <Text style={styles.title}>
              {strings.your_receipt_has_been_uploaded_successfully}
            </Text>
            <Spacing size={12} />
            <Text style={styles.subTitle}>
              {'Your Receipt Has Been Successfully Submitted.'}
            </Text>
            <Spacing size={32} />
            <Button
              title={strings.back_to_store}
              onPress={() => {
                ref.current.close();
              }}
            />
            <Spacing size={20} />
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default UploadingReceiptSuccessfulModal;

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
    },
    alertContainer: {
      borderRadius: normalize(20),
      overflow: 'hidden',
      backgroundColor: colors.productAlertSuccessModalTheme.backgroundColor,
    },
    imageContainer: {
      height: normalize(186),
      backgroundColor: commonColors.brandColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: normalize(90),
      height: normalize(90),
    },
    contentWrapper: {
      paddingHorizontal: normalize(20),
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      textAlign: 'center',
      color: colors.text,
    },
    subTitle: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
      textAlign: 'center',
    },
  });
