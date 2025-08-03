import FastImage from 'react-native-fast-image';
import {useTheme} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import images from '../../../assets/images';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {downloadMedia} from '../../../commonutils/helper';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Spacing,
  TouchableContainer,
} from '../../../components';

const ViewReceiptScreen = props => {
  const [data, setData] = useState({});
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const id = props?.route?.params?.id;
  useEffect(() => {
    setData(props?.route?.params);
  }, [id, props?.route?.params]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'bottom']}>
      <GlobalStatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TouchableContainer onPress={goBack}>
            <Image source={images.ic_arrow_left} style={styles.leftArrow} />
          </TouchableContainer>
          <Spacing size={12} direction="x" />
          <View style={{flex: 1}}>
            <Text style={styles.storeName}>
              {data?.store?.brandName} ₹{data?.amount}
            </Text>
            <Spacing size={6} />
            <Text style={styles.storeDetails}>
              {moment(data?.createdAt).format('hh:mm A, DD MMM - YYYY')}
            </Text>
          </View>
        </View>
        <TouchableContainer onPress={() => downloadMedia(data?.image)}>
          <Image source={images.ic_download} style={styles.downloadIcon} />
        </TouchableContainer>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FastImage
          source={{
            uri: data?.image,
            priority: 'high',
          }}
          style={styles.receiptImage}
          resizeMode="contain"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewReceiptScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: commonColors.black,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
      paddingBottom: normalize(24),
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    leftArrow: {
      width: normalize(24),
      height: normalize(24),
      tintColor: '#828282',
    },
    storeName: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: commonColors.white,
    },
    storeDetails: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    downloadIcon: {
      width: normalize(36),
      height: normalize(36),
    },
    receiptImage: {
      width: '100%',
      aspectRatio: 0.5,
      // height: '100%',
    },
  });
