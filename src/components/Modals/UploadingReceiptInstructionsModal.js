import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize, sizes} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import Button from '../Button';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const UploadingReceiptInstructionsModal = forwardRef((props, ref) => {
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
      <View style={styles.container}>
        <View style={styles.alertContainer}>
          <Spacing size={20} />
          <View style={styles.header}>
            <Text style={styles.title}>
              {strings.instructions_for_uploading_receipt}
            </Text>
            <Spacing size={8} />
            <TouchableContainer onPress={() => ref.current.close()}>
              <Image source={images.ic_x_close} style={styles.closeIcon} />
            </TouchableContainer>
          </View>
          <Spacing size={24} />
          <Text style={styles.pleaseCheck}>
            Please check below points while uploading receipt picture
          </Text>
          <Spacing size={12} />
          <View style={styles.productDetailsContainer}>
            {bulletPoints.map((point, index) => (
              <View key={index} style={styles.bulletPointContainer}>
                <Text style={styles.bulletPoint}>{'•   '}</Text>
                <Text style={styles.value}>{point}</Text>
              </View>
            ))}
          </View>
          <Spacing size={32} />
          <Button
            title={strings.ok_got_it}
            onPress={() => {
              ref.current.close();
              setTimeout(() => {
                props.onPressOkGotIt();
              }, 500);
            }}
          />
          <Spacing size={20} />
        </View>
      </View>
    </Modal>
  );
});

const bulletPoints = [
  'Please upload clear and complete bill',
  'Kindly upload the bill within 15 days from the date of purchase',
  'Ensure correct store is selected',
  'Please do not upload the bill which is already submitted',
];

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
    },
    alertContainer: {
      borderRadius: normalize(20),
      backgroundColor: colors.productAlertSuccessModalTheme.backgroundColor,
      paddingHorizontal: normalize(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.editProfileDetailsModalTheme.titleColor,
      flex: 0.9,
    },
    closeIcon: {
      width: normalize(22),
      height: normalize(22),
      tintColor: commonColors.gray,
    },
    pleaseCheck: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    productDetailsContainer: {
      padding: normalize(16),
      borderRadius: normalize(12),
      backgroundColor:
        colors.productAlertSuccessModalTheme.productDetailsBackgroundColor,
    },
    bulletPointContainer: {
      flexDirection: 'row',
      marginBottom: normalize(16),
    },
    bulletPoint: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: colors.text,
    },
    value: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: colors.text,
      flex: 1,
    },
  });

export default UploadingReceiptInstructionsModal;
