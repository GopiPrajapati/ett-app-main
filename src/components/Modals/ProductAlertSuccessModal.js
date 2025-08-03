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

const ProductAlertSuccessModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({});
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const global = useSelector(state => state?.global);

  useImperativeHandle(ref, () => ({
    open: data => {
      if (visible) {
        return;
      }

      setData(data);
      setVisible(true);
    },
    close: () => {
      setVisible(false);
      setData({});
    },
  }));

  return (
    <Modal
      key={'ProductAlertSuccessModal'}
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
              {strings.your_product_alert_has_been_sent_successfully}
            </Text>
            <Spacing size={16} />
            <View style={styles.productDetailsContainer}>
              <Text style={styles.label}>Product</Text>
              <Spacing size={4} />
              <Text style={styles.value}>{data?.productName}</Text>
              <Spacing size={16} />
              <Text style={styles.label}>Description</Text>
              <Spacing size={4} />
              <Text style={styles.value}>{data?.description}</Text>
            </View>
            <Spacing size={32} />
            <Button
              title={strings.back_to_store}
              onPress={() => ref.current.close()}
            />
            <Spacing size={20} />
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default ProductAlertSuccessModal;

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
    productDetailsContainer: {
      padding: normalize(16),
      borderRadius: normalize(12),
      backgroundColor:
        colors.productAlertSuccessModalTheme.productDetailsBackgroundColor,
    },
    label: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    value: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: colors.text,
    },
  });
