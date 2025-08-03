import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import moment from 'moment';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import images from '../../assets/images';
import {fontPixel, normalize} from '../../commonutils/dimensionutils';
import {navigate} from '../../commonutils/navigationutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {Routes} from '../../container/Routes';
import Button from '../Button';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const OfferModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const {colors} = useTheme();
  const styles = createStyle(colors);

  useImperativeHandle(ref, () => ({
    open: data => {
      setOfferData(data);
      setVisible(true);
    },
    close: () => {
      setTimeout(() => setVisible(false), 200);
    },
  }));

  const handleClose = useCallback(() => {
    ref.current?.close();
  }, []);

  const formattedStartDate = moment(offerData?.startDate).format('Do MMM');
  const formattedEndDate = moment(offerData?.endDate).format('Do MMM');
  const result = `Valid from ${formattedStartDate} to ${formattedEndDate}`;

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      animationType="fade">
      <BlurView
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.7)"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.mask}>
        <View
          style={[
            styles.modalContainer,
            {backgroundColor: offerData?.backgroundColor || colors.background},
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>{}</Text>
            <TouchableContainer onPress={handleClose}>
              <Image source={images.ic_x_close} style={styles.closeIcon} />
            </TouchableContainer>
          </View>
          <Spacing size={20} />
          {offerData?.store?.logo && (
            <Image
              source={{uri: offerData?.store?.logo}}
              style={styles.storeLogo}
              resizeMode="cover"
            />
          )}
          <Text style={styles.storeName} numberOfLines={1}>
            {offerData?.store?.name}
          </Text>
          <Spacing size={30} />
          <View style={styles.offerContent}>
            <Text style={styles.offerName}>{offerData?.name}</Text>
            <Spacing size={15} />
            {(offerData?.type === 'Value' ||
              offerData?.type === 'Percentage') &&
            offerData.value ? (
              <Text style={styles.storeName} numberOfLines={1}>
                Flat
              </Text>
            ) : null}
            {offerData?.value ? (
              <Text style={styles.off}>
                {`${offerData?.value}${
                  offerData?.type === 'Percentage'
                    ? '%'
                    : offerData?.type === 'Value'
                    ? ' Off'
                    : ''
                }`}
              </Text>
            ) : null}
            <Spacing size={20} />
            <Text style={styles.discretion}>{offerData?.description}</Text>
            <Spacing size={10} />
            <Text style={styles.termsAndConditions}>
              *T&C apply on each offer
            </Text>
            <Spacing size={10} />
            <View style={styles.validityContainer}>
              <Image source={images.ic_calendar} style={styles.calendarIcon} />
              <Text style={styles.validUpto}>{result}</Text>
            </View>
            <Spacing size={10} />
            {offerData?.store?.area ||
            offerData?.store?.city ||
            offerData?.store?.state ? (
              <View style={styles.validityContainer}>
                <Image
                  source={images.ic_location}
                  style={styles.calendarIcon}
                />
                <Text style={styles.validUpto}>
                  {(offerData?.store?.area ? offerData?.store?.area : '') +
                    (offerData?.store?.city
                      ? (offerData?.store?.area ? ', ' : '') +
                        offerData?.store?.city
                      : '') +
                    (offerData?.store?.state
                      ? (offerData?.store?.city || offerData?.store?.area
                          ? ', '
                          : '') + offerData?.store?.state
                      : '')}
                </Text>
              </View>
            ) : null}
          </View>
          <Spacing size={20} />
          <Button
            title={'Explore Store'}
            onPress={() => {
              ref.current?.close();
              setTimeout(() => {
                navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                  ...offerData?.store,
                });
              }, 500);
            }}
          />
        </View>
      </View>
    </Modal>
  );
});

const createStyle = colors =>
  StyleSheet.create({
    mask: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '95%',
      borderRadius: normalize(12),
      overflow: 'hidden',
      padding: normalize(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    storeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    storeLogo: {
      width: normalize(80),
      height: normalize(80),
      marginRight: 10,
      borderRadius: normalize(12),
      backgroundColor: commonColors.brandColor,
      marginBottom: normalize(10),
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.productModal.titleColor,
      alignSelf: 'center',
    },
    storeName: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: commonColors.brandColor,
    },
    closeButton: {
      padding: 5,
      borderRadius: 20,
    },
    closeIcon: {
      width: normalize(22),
      height: normalize(22),
      tintColor: commonColors.gray,
    },
    offerContent: {},
    offerName: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(18),
      color: commonColors.black,
    },
    flat: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(16),
      color: commonColors.gray,
      letterSpacing: 1,
    },
    off: {
      ...fontStyles.archivoExtraBold,
      fontSize: fontPixel(42),
      color: commonColors.black,
      lineHeight: 50,
    },
    validityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    calendarIcon: {
      width: normalize(16),
      height: normalize(16),
      tintColor: commonColors.gray,
      marginRight: 8,
    },
    discretion: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.black,
    },
    termsAndConditions: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.black,
    },
    validUpto: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    couponCodeContainer: {
      marginTop: 30,
      padding: 15,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
      borderStyle: 'dashed',
      alignItems: 'center',
    },
    couponCodeLabel: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(12),
      color: commonColors.gray,
      letterSpacing: 1,
    },
    couponCode: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(24),
      color: commonColors.black,
      letterSpacing: 2,
      marginTop: 5,
    },
    claimButton: {
      marginTop: 25,
      backgroundColor: commonColors.black,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    claimButtonText: {
      ...fontStyles.archivoSemiBold,
      fontSize: fontPixel(16),
      color: commonColors.white,
      letterSpacing: 1,
    },
  });

export default OfferModal;
