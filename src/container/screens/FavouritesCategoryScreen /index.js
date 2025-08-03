import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {sorts} from '../../../commonutils/constants';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack, navigate} from '../../../commonutils/navigationutils';
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
  getFavouriteHubs,
  getFavouriteMalls,
  getFavouriteStoresBrands,
  toggleLike,
} from '../../../redux/actions';
import {Routes} from '../../Routes';
import {LikeButton} from '../AllInCityScreen';
import {categories} from '../FavouritesScreen';

const ITEMS_PER_PAGE = 10;

const FavouritesCategoryScreen = props => {
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [isSort, setIsSort] = useState(false);
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const global = useSelector(state => state?.global);
  const styles = useMemo(() => createStyle(colors), [colors]);
  const isFocused = useIsFocused();
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);

  useEffect(() => {
    if (isFocused) {
      pageRef.current = 1;
      totalPagesRef.current = 0;
      fetchData(true);
    }
  }, [fetchData, isFocused, search, isSort]);

  const fetchData = useCallback(
    async (isReset = false) => {
      if (loading) {
        return;
      }

      setLoading(true);
      const callbacks = {
        SuccessCallback: response => {
          const {pagination, favorites} = response?.data;
          totalPagesRef.current = pagination?.totalPages;

          if (pageRef?.current === 1 || isReset) {
            setData(favorites);
          } else {
            setData(prev => [...prev, ...favorites]);
          }

          pageRef.current = pageRef.current + 1;
          setLoading(false);
        },
        FailureCallback: () => {
          setLoading(false);
        },
      };

      switch (props?.route?.params?.type) {
        case categories.StoresBrands:
          dispatch(
            getFavouriteStoresBrands(
              pageRef.current,
              ITEMS_PER_PAGE,
              search,
              isSort ? sorts.ASC : sorts.DESC,
              callbacks,
            ),
          );
          break;
        case categories.Malls:
          dispatch(
            getFavouriteMalls(
              pageRef.current,
              ITEMS_PER_PAGE,
              search,
              isSort ? sorts.ASC : sorts.DESC,
              callbacks,
            ),
          );
          break;
        case categories.Hubs:
          dispatch(
            getFavouriteHubs(
              pageRef.current,
              ITEMS_PER_PAGE,
              search,
              isSort ? sorts.ASC : sorts.DESC,
              callbacks,
            ),
          );
          break;
      }
    },
    [loading, props?.route?.params?.type, dispatch, search, isSort],
  );

  const onEndReached = useCallback(() => {
    if (
      !loading &&
      pageRef.current > 1 &&
      pageRef.current <= totalPagesRef.current
    ) {
      fetchData();
    }
  }, [loading, fetchData]);

  const onPressLike = useCallback(
    (item, index) => {
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
          FailureCallback: () => {
            // Handle failure case
          },
        }),
      );
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <RenderItem
        item={item}
        index={index}
        title={
          item?.business?.brandName
            ? item?.business?.brandName
            : item?.store?.name
        }
        onPress={() => {
          navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
            ...item,
            id: item?.store?.id ? item?.store?.id : item?.business?.id,
          });
        }}
        onPressLike={() => onPressLike(item, index)}
      />
    ),
    [onPressLike],
  );

  const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);
  const ListHeaderComponent = useCallback(() => <Spacing size={24} />, []);
  const ListFooterComponent = useCallback(
    () =>
      loading && pageRef.current > 1 ? (
        <LoadMoreLoader animating={loading || false} />
      ) : null,
    [loading],
  );

  const keyExtractor = useCallback(item => item.id.toString(), []);

  const ListEmptyComponent = useCallback(() => {
    return (
      <View style={styles.favouriteBrandsNotFound}>
        <FastImage
          source={
            global?.isDarkMode
              ? images.ic_favourite_brands_not_found_dark
              : images.ic_favourite_brands_not_found_light
          }
          style={styles.favouriteBrandsNotFoundImage}
        />
        <Text style={styles.nothingYett}>{strings.nothing_yett}</Text>
        <Text style={styles.subTitle}>
          {
            strings.One_day_your_favorite_brands_malls_and_hubs_will_call_this_space_home_stay_excited
          }
        </Text>
      </View>
    );
  }, [
    global?.isDarkMode,
    styles.favouriteBrandsNotFound,
    styles.favouriteBrandsNotFoundImage,
    styles.nothingYett,
    styles.subTitle,
  ]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.favourites + ' ' + props?.route?.params?.type}
        rightIcons={
          <View style={styles.headerRightContainer}>
            <TouchableContainer
              onPress={() => {
                setIsSort(!isSort);
              }}>
              <Image
                source={
                  isSort
                    ? global?.isDarkMode
                      ? images.ic_up_sort_dark
                      : images.ic_up_sort_light
                    : global?.isDarkMode
                    ? images.ic_sort_dark
                    : images.ic_sort_light
                }
                style={styles.sortImage}
              />
            </TouchableContainer>
            <Spacing size={12} direction="x" />
            <TouchableContainer
              onPress={() => {
                setIsSearch(!isSearch);
              }}>
              <Image source={images.ic_search} style={styles.searchImage} />
            </TouchableContainer>
          </View>
        }
      />
      <View
        style={[styles.searchContainer, {display: isSearch ? 'flex' : 'none'}]}>
        <Spacing size={2} />
        <Input
          autoCapitalize="words"
          value={search}
          onChangeText={text => setSearch(text)}
          placeholder={`Search ${props?.route?.params?.type}`}
        />
        <Spacing size={10} />
      </View>
      <View style={styles.container}>
        {data?.length > 0 ? (
          <FlashList
            data={data}
            extraData={data}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            keyExtractor={keyExtractor}
            estimatedItemSize={normalize(525)}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparatorComponent}
            numColumns={2}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
          />
        ) : (
          <ListEmptyComponent />
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(FavouritesCategoryScreen);

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.inboxTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.inboxTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    contentContainer: {
      paddingBottom: sizes.extraBottomPadding,
    },
    footerLoader: {
      paddingVertical: normalize(20),
      alignItems: 'center',
    },
    headerRightContainer: {flexDirection: 'row'},
    searchContainer: {
      paddingHorizontal: sizes.paddingHorizontal,
    },
    sortImage: {width: normalize(20), height: normalize(20)},
    searchImage: {
      width: normalize(20),
      height: normalize(20),
      tintColor: commonColors.gray,
    },
    favouriteBrandsNotFound: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    favouriteBrandsNotFoundImage: {
      width: normalize(120),
      height: normalize(120),
    },
    nothingYett: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.receiptsTheme.nothingYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
    },
    subTitle: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
      textAlign: 'center',
    },
  });

const RenderItem = React.memo(
  ({item, title = '', index, onPress = () => {}, onPressLike = () => {}}) => {
    const {colors} = useTheme();
    const styles = renderItemStyles(colors);
    return (
      <TouchableContainer
        key={index}
        onPress={onPress}
        styles={[
          styles.cardContainer,
          styles.halfWidthCard,
          {
            width: '95%',
            marginRight: index % 2 === 0 ? 'auto' : undefined,
            marginLeft: index % 2 === 1 ? 'auto' : undefined,
          },
        ]}>
        <FastImage
          source={
            item?.business?.businessDetails?.logo
              ? {uri: item?.business?.businessDetails?.logo, priority: 'high'}
              : item?.store?.logo
              ? {uri: item?.store?.logo, priority: 'high'}
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
        <Spacing size={12} />
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
      backgroundColor: colors.allInCityTheme.buttonBackgroundColor,
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
