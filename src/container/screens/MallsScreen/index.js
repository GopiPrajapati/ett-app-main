import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import videos from '../../../assets/videos';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {groupIntoChunks} from '../../../commonutils/helper';
import {navigate} from '../../../commonutils/navigationutils';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
  Input,
  LoadMoreLoader,
  Spacing,
  TouchableContainer,
} from '../../../components';
import Toast from '../../../components/Toast';
import {getMalls, toggleLike} from '../../../redux/actions';
import {Routes} from '../../Routes';
import {LikeButton} from '../AllInCityScreen';
import {GreetingContainer} from '../HomeScreen';
import {Tabs} from '../SearchScreen';

const MallsScreen = ({display = 'none'}) => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const global = useSelector(state => state?.global);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);

  useEffect(() => {
    if (isFocused) {
      resetDataAndFetch();
    }
  }, [isFocused, resetDataAndFetch, global?.city]);

  const resetDataAndFetch = useCallback(() => {
    pageRef.current = 1;
    totalPagesRef.current = 0;
    setData([]);
    setLoading(true);
    fetchMalls(true);
  }, [fetchMalls]);

  const fetchMalls = useCallback(
    (isReset = false) => {
      if (loading) {
        return;
      }

      setLoading(true);
      dispatch(
        getMalls(pageRef.current, 9, {
          SuccessCallback: response => {
            const {pagination, malls} = response?.data;
            totalPagesRef.current = pagination?.totalPages;
            setData(prev => (isReset ? malls : [...data, ...malls]));
            pageRef.current += 1;
            setLoading(false);
          },
          FailureCallback: () => {
            setLoading(false);
          },
        }),
      );
    },
    [loading, dispatch, data],
  );

  const handleLoadMore = useCallback(
    event => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const currentOffset = contentOffset?.y || 0;
      if (
        currentOffset + layoutMeasurement.height >= contentSize.height - 20 &&
        !loading &&
        pageRef.current > 1 &&
        pageRef.current <= totalPagesRef.current
      ) {
        fetchMalls();
      }
    },
    [loading, fetchMalls],
  );

  const onPressLike = useCallback(
    (item, itemIndex) => {
      setData(prev => {
        const newData = [...prev];
        if (newData[itemIndex]) {
          newData[itemIndex].isLiked = !newData[itemIndex].isLiked;
        }
        return newData;
      });

      dispatch(
        toggleLike(item.id, item.type, {
          SuccessCallback: () => {},
          FailureCallback: () => {
            setData(prev => {
              const newData = [...prev];
              if (newData[itemIndex]) {
                newData[itemIndex].isLiked = !newData[itemIndex].isLiked;
              }
              return newData;
            });
          },
        }),
      );
    },
    [dispatch],
  );

  const ItemSeparatorComponent = useCallback(() => {
    return <Spacing size={15} />;
  }, []);

  const ListFooterComponent = useCallback(
    () =>
      loading && pageRef.current > 1 ? (
        <LoadMoreLoader animating={loading || false} />
      ) : null,
    [loading],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GlobalStatusBar />
      <Header
        location={
          global?.displayName ? global?.displayName : strings.choose_location
        }
        notification
      />
      <Spacing style={styles.divider} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleLoadMore}>
        <GreetingContainer
          illustrationVideo={
            global?.isDarkMode
              ? videos.ic_mall_video_dark
              : videos.ic_mall_video
          }
          bannerHeight={normalize(291)}
          videoPaused={!isFocused}
        />
        <View style={styles.container}>
          <View style={{paddingHorizontal: sizes.paddingHorizontal}}>
            <Input
              leftIcon={images.ic_search}
              placeholder={strings.search_malls}
              editable={false}
              onPress={() => navigate(Routes.SEARCH_SCREEN, {key: Tabs.Malls})}
              isBorderLessContainer
            />
          </View>
          <Spacing size={24} />
          <FlashList
            data={data}
            keyExtractor={(_item, index) => `${index}`}
            estimatedItemSize={normalize(525)}
            renderItem={({item, index}) => {
              return (
                <Grid
                  key={index}
                  index={index}
                  data={item}
                  onPressLike={onPressLike}
                  onPress={(_item, _index) => {
                    navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                      ..._item,
                      id: _item?.id,
                    });
                  }}
                />
              );
            }}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListFooterComponent={ListFooterComponent}
          />
          <Spacing size={20} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MallsScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeArea: {flex: 1},
    container: {
      flex: 1,
      zIndex: 2,
      borderTopLeftRadius: normalize(16),
      borderTopRightRadius: normalize(16),
      paddingVertical: normalize(24),
      backgroundColor: colors.homeTheme.locationBackgroundColor,
    },
    divider: {
      height: 0.5,
      marginHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.dividerColor,
      marginTop: normalize(5),
    },
  });

const openMap = (address, pincode, city) => {
  const fullAddress = `${address}, ${city}, ${pincode}`;
  const encodedAddress = encodeURIComponent(fullAddress);
  const mapAppUrl = `maps://?q=${encodedAddress}`; // Tries to open a map app
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`; // Opens in browser

  Linking.canOpenURL(mapAppUrl)
    .then(supported => {
      if (supported) {
        Linking.openURL(mapAppUrl);
      } else {
        Linking.openURL(fallbackUrl);
      }
    })
    .catch(err => {
      console.log('error', 'Error opening map:', err);
      Toast.show({message: 'Unable to open map.'});
    });
};

const Grid = ({
  index,
  data,
  onPressLike = () => {},
  onPress = () => {},
  chunkIndex,
}) => {
  const {colors} = useTheme();
  const styles = gridStyles(colors);
  return (
    <View style={styles.gridContainer}>
      <TouchableContainer
        key={index}
        onPress={() => onPress(data, index)}
        styles={[styles.cardContainer, styles.fullWidthCard]}>
        <FastImage
          source={
            data?.businessDetails?.coverImage
              ? {uri: data?.businessDetails?.coverImage, priority: 'high'}
              : images.ic_brand_rectangle
          }
          style={styles.fullWidthImage}
        />
        <View style={styles.likeButton}>
          <LikeButton
            liked={data?.isLiked}
            onPress={() => onPressLike(data, index)}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {data.brandName}
          </Text>
        </View>
        <Spacing size={12} />
      </TouchableContainer>
    </View>
  );
};

const gridStyles = colors =>
  StyleSheet.create({
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'space-between',
      rowGap: normalize(12),
      columnGap: normalize(12),
    },
    cardContainer: {
      borderRadius: normalize(12),
      overflow: 'hidden',
      backgroundColor: colors.mallsTheme.backgroundColor,
    },
    fullWidthCard: {
      width: '100%',
      minHeight: normalize(200),
    },
    halfWidthCard: {
      width: '48%',
      minHeight: normalize(251),
    },
    image: {
      width: '100%',
      // height: normalize(184),
      aspectRatio: 1,
    },
    fullWidthImage: {
      width: '100%',
      height: normalize(184),
    },
    title: {
      ...fontStyles.archivoMedium,
      color: colors.mallsTheme.color,
      fontSize: fontPixel(16),
    },
    infoContainer: {
      paddingTop: normalize(16),
      paddingHorizontal: normalize(16),
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    location: {
      width: normalize(20),
      height: normalize(20),
      alignSelf: 'flex-start',
    },
    address: {
      ...fontStyles.archivoRegular,
      color: colors.mallsTheme.color,
      fontSize: fontPixel(12),
      flex: 1,
    },
    actionButton: {
      // justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      gap: normalize(8),
    },
    button: {
      width: normalize(32),
      height: normalize(32),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      backgroundColor: colors.mallsTheme.buttonBackgroundColor,
    },
    buttonImage: {
      width: normalize(18.29),
      height: normalize(18.29),
    },
    likeButton: {
      position: 'absolute',
      top: normalize(12),
      right: normalize(12),
    },
  });
