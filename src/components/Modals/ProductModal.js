import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {
  fontPixel,
  normalize,
  screenHeight,
  sizes,
} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const {width: screenWidth} = Dimensions.get('window');
const IMAGE_SIZE = screenWidth - sizes.marginHorizontal * 2;

const ProductModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [productData, setProductData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const {colors} = useTheme();
  const styles = createStyle(colors);

  // Expose show and hide methods to parent
  useImperativeHandle(ref, () => ({
    open: data => {
      setProductData(data);
      setVisible(true);
      setActiveIndex(0); // Reset carousel index
    },
    close: () => {
      setVisible(false);
    },
  }));

  // Handle carousel scroll
  const handleScroll = useCallback(event => {
    const slideSize = IMAGE_SIZE;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  }, []);

  // Render carousel item
  const renderCarouselItem = useCallback(
    ({item}) => (
      <FastImage
        style={styles.carouselImage}
        source={{uri: item}}
        resizeMode={FastImage.resizeMode.cover}
      />
    ),
    [styles.carouselImage],
  );

  // Handle close modal
  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  // Render pagination dots
  const renderPagination = useCallback(() => {
    if (!productData?.productImages?.length <= 1) return null;

    return (
      <React.Fragment>
        <Spacing size={5} />
        <View style={styles.paginationContainer}>
          {productData?.productImages?.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </React.Fragment>
    );
  }, [
    activeIndex,
    productData?.productImages,
    styles.activeDot,
    styles.paginationContainer,
    styles.paginationDot,
  ]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      animationType="fade">
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.mask}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{strings.product}</Text>
            <TouchableContainer onPress={() => ref.current.close()}>
              <Image source={images.ic_x_close} style={styles.closeIcon} />
            </TouchableContainer>
          </View>
          <Spacing size={22} />
          {productData && (
            <>
              {/* Custom Carousel */}
              <FlatList
                ref={flatListRef}
                data={productData.productImages}
                renderItem={renderCarouselItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item, index) => index.toString()}
              />
              {/* Pagination Dots */}
              {renderPagination()}
              {/* Product Details */}
              <View style={styles.detailsContainer}>
                <Spacing size={10} />
                <Text style={styles.productName} numberOfLines={1}>
                  {productData.productName}
                </Text>
                <Spacing size={5} />
                <Text style={styles.productDescription} numberOfLines={4}>
                  {productData.description}
                </Text>
                <Spacing size={10} />
                <Text style={styles.productPrice}>
                  {productData.price > 0
                    ? `₹${productData.price}`
                    : 'On Request'}
                </Text>
              </View>
            </>
          )}
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
      //   alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.productModal.backgroundColor,
      borderRadius: normalize(12),
      marginHorizontal: sizes.marginHorizontal,
      overflow: 'hidden',
      paddingVertical: normalize(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.productModal.titleColor,
      alignSelf: 'center',
    },
    closeIcon: {
      width: normalize(22),
      height: normalize(22),
      tintColor: commonColors.gray,
    },
    detailsContainer: {
      paddingHorizontal: normalize(20),
    },
    carouselImage: {
      width: IMAGE_SIZE,
      height: normalize(screenHeight / 2.3),
    },
    productName: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.productModal.name,
    },
    productDescription: {
      fontSize: fontPixel(16),
      color: colors.productModal.description,
    },
    productPrice: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      fontWeight: 'bold',
      color: colors.productModal.price,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationDot: {
      width: normalize(8),
      height: normalize(8),
      borderRadius: normalize(4),
      backgroundColor: commonColors.gray,
      marginHorizontal: normalize(4),
    },
    activeDot: {
      backgroundColor: colors.productModal.dot,
    },
  });

export default ProductModal;
