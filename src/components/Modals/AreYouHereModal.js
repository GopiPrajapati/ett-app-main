import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import {useDispatch} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize, sizes} from '../../commonutils/dimensionutils';
import {navigate} from '../../commonutils/navigationutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {Routes} from '../../container/Routes';
import {useKeyboard} from '../../hooks';
import {getNearbyStores} from '../../redux/actions';
import Input from '../Input';
import LoadMoreLoader from '../LoadMoreLoader';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';
import _ from 'lodash';

const {height} = Dimensions.get('window');

const AreYouHereModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [currentStore, setCurrentStore] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const dispatch = useDispatch('');
  const {colors} = useTheme();
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const {isOpen} = useKeyboard();
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const styles = createStyle(colors);

  useEffect(() => {
    if (visible) {
      pageRef.current = 1;
      totalPagesRef.current = 0;
      fetchData(true);
    }
  }, [fetchData, visible]);

  useEffect(() => {
    const debouncedFetchResults = _.debounce(fetchData, 1000);

    if (visible) {
      debouncedFetchResults(true);
    }
  }, [fetchData, search, visible]);

  useImperativeHandle(ref, () => ({
    open: storeDetails => {
      if (visible) {
        return;
      }
      setCurrentStore(storeDetails);
      setVisible(true);
    },
    close: () => {
      setVisible(false);
    },
  }));

  useEffect(() => {
    const toValue = isOpen
      ? Platform.OS === 'ios'
        ? height / 1.1
        : height / 1.8
      : height / 1.4;
    Animated.timing(animatedHeight, {
      toValue,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [animatedHeight, isOpen]);

  const fetchData = useCallback(
    async (isReset = false) => {
      if (loading) {
        return;
      }

      setLoading(true);

      dispatch(
        getNearbyStores(currentStore?.id, pageRef.current, 10, search, {
          SuccessCallback: response => {
            // const {pagination, invoices} = response?.data;
            // totalPagesRef.current = pagination?.totalPages;
            // if (isReset) {
            //   setData(invoices);
            // } else {
            //   setData(prev => [...(prev || []), ...invoices]);
            // }

            setData(response?.data);
            // pageRef.current = pageRef.current + 1;
            setLoading(false);
          },
          FailureCallback: () => {
            setLoading(false);
          },
        }),
      );
    },
    [currentStore?.id, dispatch, loading, search],
  );

  const ListFooterComponent = useCallback(
    () =>
      loading && pageRef.current > 1 ? (
        <LoadMoreLoader animating={loading || false} />
      ) : null,
    [loading],
  );

  return (
    <Modal
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <Animated.View
          style={[styles.bottomContainer, {height: animatedHeight}]}>
          <TouchableContainer
            styles={styles.closeIconContainer}
            onPress={() => ref.current.close()}>
            <FastImage source={images.ic_x_close} style={styles.closeIcon} />
          </TouchableContainer>
          <Spacing size={20} />
          <View style={styles.content}>
            <Text style={styles.title}>{strings.are_you_here}</Text>
            <Spacing size={normalize(26)} />
            <View style={styles.brandContainer}>
              <FastImage
                source={
                  currentStore?.logo
                    ? {uri: currentStore?.logo, priority: 'high'}
                    : images.ic_brand_image
                }
                defaultSource={images.ic_brand_image}
                style={styles.brandImage}
              />
              <Spacing size={12} direction="x" />
              <View style={{flex: 1}}>
                <Text style={styles.brandName} numberOfLines={1}>
                  {currentStore?.name}
                </Text>

                <Spacing size={8} />
                <View style={styles.rowCentered}>
                  <Image
                    source={images.ic_location}
                    style={styles.locationIcon}
                  />
                  <Spacing size={6} direction="x" />
                  <Text style={styles.location} numberOfLines={1}>
                    {currentStore?.address}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Spacing size={20} />
              <Input
                autoCapitalize="words"
                value={search}
                onChangeText={text => setSearch(text)}
                leftIcon={images.ic_search}
                isBorderLessContainer
                placeholder={strings.search}
              />
              <Spacing size={20} />
              {data?.length > 0 ? (
                <FlashList
                  data={data}
                  estimatedItemSize={normalize(72)}
                  keyExtractor={(_, index) => `${index}`}
                  renderItem={({item, index}) => (
                    <TouchableContainer
                      styles={styles.listItem}
                      onPress={() => {
                        ref.current.close();
                        setTimeout(() => {
                          navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                            ...item,
                            id: item?.id,
                          });
                        }, 500);
                      }}>
                      <FastImage
                        source={
                          item?.logo
                            ? {uri: item?.logo, priority: 'high'}
                            : images.ic_brand_image
                        }
                        defaultSource={images.ic_brand_image}
                        style={styles.brandImage}
                      />
                      <Spacing size={12} direction="x" />
                      <View style={{flex: 1}}>
                        <View style={styles.storeNameContainer}>
                          <Text style={styles.brandName} numberOfLines={1}>
                            {item?.name}
                          </Text>
                          <Text
                            style={
                              styles.kms
                            }>{`${item?.distance} km(s)`}</Text>
                        </View>
                        <Spacing size={8} />
                        <View style={styles.rowCentered}>
                          <Image
                            source={images.ic_location}
                            style={styles.locationIcon}
                          />
                          <Spacing size={6} />
                          <Text style={styles.location} numberOfLines={1}>
                            {item?.address}
                          </Text>
                        </View>
                      </View>
                    </TouchableContainer>
                  )}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={ListFooterComponent}
                />
              ) : (
                <React.Fragment />
              )}
              <Spacing size={20} />
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default AreYouHereModal;

const createStyle = colors =>
  StyleSheet.create({
    modal: {
      flex: 1,
    },
    bottomContainer: {
      bottom: 0,
      position: 'absolute',
      left: 0,
      right: 0,
      height: Dimensions.get('window').height / 1.3,
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: colors.editProfileModalTheme.backgroundColor,
      paddingTop: normalize(24),
      borderTopLeftRadius: normalize(12),
      borderTopRightRadius: normalize(12),
      flex: 1,
    },
    closeIconContainer: {
      alignSelf: 'center',
      width: normalize(36),
      height: normalize(36),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.19)',
      borderRadius: 100,
    },
    closeIcon: {
      width: normalize(16),
      height: normalize(16),
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.editProfileModalTheme.titleColor,
      alignSelf: 'center',
    },
    rowCentered: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    location: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.gray,
      flex: 1,
    },
    locationIcon: {
      width: normalize(18),
      height: normalize(18),
    },
    brandContainer: {
      backgroundColor: commonColors.brandColorLight,
      height: normalize(68),
      paddingHorizontal: sizes.paddingHorizontal,
      flexDirection: 'row',
      alignItems: 'center',
    },
    storeNameContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brandImage: {
      width: normalize(52),
      height: normalize(52),
      borderRadius: 100,
    },
    brandName: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(16),
      color: colors.text,
    },
    kms: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    inputContainer: {
      paddingHorizontal: sizes.paddingHorizontal,
      flex: 1,
    },
    listItem: {
      height: normalize(68),
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
