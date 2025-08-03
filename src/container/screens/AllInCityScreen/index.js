import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import videos from '../../../assets/videos';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {navigate} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
  Input,
  LoadMoreLoader,
  Spacing,
  TouchableContainer,
} from '../../../components';
import {
  getAllInCity,
  getStoreCategory,
  toggleLike,
} from '../../../redux/actions';
import {Routes} from '../../Routes';
import {GreetingContainer} from '../HomeScreen';
import {Tabs} from '../SearchScreen';
import LoginSignupModal from '../../../components/Modals/LoginSignupModal';

const AllInCityScreen = () => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const global = useSelector(state => state?.global);

  const [selectedMenuType, setSelectedMenuType] = useState({
    name: 'All',
    type: 'all',
  });
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);

  useEffect(() => {
    if (isFocused) {
      callGetStoreCategory();
    }
  }, [isFocused, global?.city]);

  useEffect(() => {
    resetDataAndFetch();
    fetchAllInCity(true);
  }, [fetchAllInCity, resetDataAndFetch, selectedMenuType.type]);

  const callGetStoreCategory = () => {
    dispatch(
      getStoreCategory({
        SuccessCallback: response => {
          setCategories(response?.data?.storeCategory);
          setSelectedMenuType(response?.data?.storeCategory?.[0]);
          resetDataAndFetch();
        },
        FailureCallback: response => {},
      }),
    );
  };

  const resetDataAndFetch = useCallback(() => {
    pageRef.current = 1;
    totalPagesRef.current = 0;
    setData([]);
    setLoading(true);
    fetchAllInCity(true);
  }, [fetchAllInCity]);

  const fetchAllInCity = useCallback(
    (isReset = false) => {
      if (loading) {
        return;
      }

      setLoading(true);
      dispatch(
        getAllInCity(
          selectedMenuType?.type === 'all' ? '' : selectedMenuType?.type,
          pageRef.current,
          10,
          {
            SuccessCallback: response => {
              const {pagination, brands} = response?.data;
              totalPagesRef.current = pagination?.totalPages;
              if (isReset) {
                setData(brands);
              } else {
                setData(prev => [...prev, ...brands]);
              }
              pageRef.current += 1;
              setLoading(false);
            },
            FailureCallback: () => {
              setLoading(false);
            },
          },
        ),
      );
    },
    [loading, dispatch, selectedMenuType?.type],
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
        fetchAllInCity();
      }
    },
    [loading, fetchAllInCity],
  );

  const MenuItem = useCallback(
    ({item, index, onPress}) => {
      return (
        <TouchableContainer
          styles={[
            styles.menuContainer,
            selectedMenuType?.type === item?.type
              ? styles.selectedMenu
              : styles.defaultMenu,
          ]}
          onPress={onPress}>
          <Text
            style={
              selectedMenuType?.type === item?.type
                ? styles.selectedMenuTitle
                : styles.defaultMenuTitle
            }>
            {item?.name}
          </Text>
        </TouchableContainer>
      );
    },
    [
      selectedMenuType,
      styles.defaultMenu,
      styles.defaultMenuTitle,
      styles.menuContainer,
      styles.selectedMenu,
      styles.selectedMenuTitle,
    ],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <RenderItem
        key={index}
        item={item}
        title={item.brandName}
        index={index}
        onPress={(_item, _index) =>
          navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
            ..._item,
            id: _item?.id,
          })
        }
        onPressLike={() => onPressLike(item, index)}
        liked={item?.isLiked}
      />
    ),
    [],
  );

  const onPressLike = (item, index) => {
    dispatch(
      toggleLike(item.id, item.type, {
        SuccessCallback: response => {
          setData(prev => {
            const newData = [...prev];
            newData[index] = {
              ...newData[index],
              isLiked: !newData[index].isLiked,
            };
            return newData;
          });
        },
        FailureCallback: error => {
          console.error(error);
        },
      }),
    );
  };

  const ListFooterComponent = useCallback(
    () =>
      loading && pageRef.current > 1 ? (
        <LoadMoreLoader animating={loading || false} />
      ) : null,
    [loading],
  );

  const ItemSeparatorComponent = useCallback(() => {
    return <Spacing size={15} />;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GlobalStatusBar />
      <Header
        key={Routes.ALL_IN_CITY_SCREEN}
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
              ? videos.ic_all_in_city_video_dark
              : videos.ic_all_in_city_video
          }
          bannerHeight={normalize(274)}
          videoPaused={!isFocused}
        />
        <View style={styles.container}>
          <View style={{paddingHorizontal: sizes.paddingHorizontal}}>
            <Input
              leftIcon={images.ic_search}
              placeholder={strings.search_brands}
              editable={false}
              onPress={() => navigate(Routes.SEARCH_SCREEN, {key: Tabs.Brands})}
              isBorderLessContainer
            />
          </View>
          <Spacing size={24} />
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: sizes.paddingHorizontal,
            }}>
            {categories.map((item, index) => (
              <MenuItem
                key={index}
                item={item}
                index={index}
                onPress={() => setSelectedMenuType(item)}
              />
            ))}
          </ScrollView>
          <Spacing size={20} />
          <FlashList
            data={data}
            keyExtractor={(_item, index) => `${index}`}
            estimatedItemSize={normalize(525)}
            contentContainerStyle={{
              paddingHorizontal: sizes.paddingHorizontal,
            }}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListFooterComponent={ListFooterComponent}
            numColumns={2}
          />
          <Spacing size={20} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllInCityScreen;
const createStyle = colors =>
  StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.backgroundColor},
    container: {
      flex: 1,
      paddingVertical: normalize(24),
      zIndex: 2,
      borderTopLeftRadius: normalize(16),
      borderTopRightRadius: normalize(16),
      backgroundColor: colors.homeTheme.locationBackgroundColor,
    },
    divider: {
      height: 0.5,
      marginHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.dividerColor,
      marginTop: normalize(5),
    },
    menuContainer: {
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(9.5),
      borderRadius: normalize(90),
      marginRight: normalize(10),
    },
    selectedMenu: {backgroundColor: commonColors.brandColor},
    defaultMenu: {
      backgroundColor: colors.allInCityTheme.tabBackgroundColor,
    },
    selectedMenuTitle: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: colors.allInCityTheme.menuTitle,
    },
    defaultMenuTitle: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
  });

export const LikeButton = React.memo(({onPress = () => {}, liked = false}) => {
  const [isLiked, setIsLiked] = useState(false);
  const global = useSelector(state => state?.global);
  const {colors} = useTheme();
  const styles = renderItemStyles(colors);

  useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

  return (
    <TouchableContainer
      onPress={() => {
        if (global?.isUserLoggedIn) {
          onPress(isLiked);
          setIsLiked(!isLiked);
        } else {
          LoginSignupModal.show();
        }
      }}
      styles={styles.button}>
      <Image
        source={isLiked ? images.ic_red_heart : images.ic_heart}
        tintColor={isLiked ? undefined : commonColors.white}
        style={styles.buttonImage}
      />
    </TouchableContainer>
  );
});

export const Button = React.memo(({source, onPress}) => {
  const {colors} = useTheme();
  const styles = renderItemStyles(colors);
  return (
    <TouchableContainer onPress={onPress} styles={[styles.button]}>
      <Image
        source={source}
        style={styles.buttonImage}
        tintColor={commonColors.gray}
      />
    </TouchableContainer>
  );
});

export const RenderItem = React.memo(
  ({item, title = '', index, onPress = () => {}, onPressLike = () => {}}) => {
    const {colors} = useTheme();
    const styles = renderItemStyles(colors);
    return (
      <TouchableContainer
        key={index}
        styles={[
          styles.cardContainer,
          styles.halfWidthCard,
          {
            width: '95%',
            marginRight: index % 2 === 0 ? 'auto' : undefined,
            marginLeft: index % 2 === 1 ? 'auto' : undefined,
          },
        ]}
        onPress={() => onPress(item, index)}>
        <FastImage
          source={
            item?.businessDetails?.logo
              ? {uri: item?.businessDetails?.logo, priority: 'high'}
              : images.ic_brand_rectangle
          }
          style={styles.image}
        />
        <View style={styles.likeButton}>
          <LikeButton liked={item?.isLiked} onPress={onPressLike} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </TouchableContainer>
    );
  },
);

const renderItemStyles = colors =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: normalize(12),
      overflow: 'hidden',
      backgroundColor: colors.allInCityTheme.backgroundColor,
    },
    halfWidthCard: {
      width: '90%',
      minHeight: normalize(205),
    },
    image: {
      width: '100%',
      // height: normalize(184),
      aspectRatio: 1,
    },
    title: {
      ...fontStyles.archivoMedium,
      color: colors.allInCityTheme.color,
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
      color: colors.allInCityTheme.color,
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
      overflow: 'hidden',
      backgroundColor: commonColors.transparentBlack,
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
