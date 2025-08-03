import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack, navigate} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
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

export const categories = {
  StoresBrands: 'Stores/Brands',
  Malls: 'Malls',
  Hubs: 'Hubs',
};

const Category = React.memo(({title, onPress}) => {
  const {colors} = useTheme();
  const styles = useMemo(() => categoryStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.leftText}>{title}</Text>
      <Text style={styles.viewAll} onPress={onPress}>
        {strings.view_all}
      </Text>
    </View>
  );
});

const FavouritesScreen = () => {
  const {colors} = useTheme();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [storesBrands, setStoresBrands] = useState([]);
  const [malls, setMalls] = useState([]);
  const [hubs, setHubs] = useState([]);

  const fetchFavourites = useCallback(() => {
    if (isFocused) {
      dispatch(
        getFavouriteStoresBrands(1, 4, null, null, {
          SuccessCallback: response => {
            setStoresBrands(response?.data?.favorites?.slice(0, 4) || []);
          },
          FailureCallback: () => {
            setStoresBrands([]);
          },
        }),
      );

      dispatch(
        getFavouriteMalls(1, 4, null, null, {
          SuccessCallback: response => {
            setMalls(response?.data?.favorites?.slice(0, 4) || []);
          },
          FailureCallback: () => {
            setMalls([]);
          },
        }),
      );

      dispatch(
        getFavouriteHubs(1, 4, null, null, {
          SuccessCallback: response => {
            setHubs(response?.data?.favorites?.slice(0, 4) || []);
          },
          FailureCallback: () => {
            setHubs([]);
          },
        }),
      );
    }
  }, [isFocused, dispatch]);

  useEffect(() => {
    if (isFocused) {
      fetchFavourites();
    }
  }, [fetchFavourites, isFocused]);

  const styles = useMemo(() => createStyle(colors), [colors]);
  const ItemSeparatorComponent = useMemo(() => () => <Spacing size={16} />, []);
  const ListHeaderComponent = useMemo(() => () => <Spacing size={24} />, []);

  const renderItem = useCallback(
    ({item, index}) => (
      <RenderItem
        key={`${index}-${JSON.stringify(item)}`}
        item={item}
        title={
          item?.business?.brandName
            ? item?.business?.brandName
            : item?.store?.name
        }
        index={index}
        onPress={() => {
          navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
            ...item,
            id: item?.store?.id ? item?.store?.id : item?.business?.id,
          });
        }}
        onPressLike={() => onPressLike(item, index)}
      />
    ),
    [],
  );

  const onPressLike = item => {
    dispatch(
      toggleLike(
        item?.store?.id ? item?.store?.id : item?.business?.id,
        item.type,
        {
          SuccessCallback: response => {},
          FailureCallback: error => {
            console.error(error);
          },
        },
      ),
    );
  };

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
    styles.favouriteBrandsNotFound,
    styles.favouriteBrandsNotFoundImage,
    styles.nothingYett,
    styles.subTitle,
  ]);

  const categoriesData = useMemo(
    () => [
      {
        title: categories.StoresBrands,
        data: storesBrands,
        onPress: () =>
          navigate(Routes.FAVOURITES_CATEGORY_SCREEN, {
            type: categories.StoresBrands,
          }),
      },
      {
        title: categories.Malls,
        data: malls,
        onPress: () =>
          navigate(Routes.FAVOURITES_CATEGORY_SCREEN, {
            type: categories.Malls,
          }),
      },
      {
        title: categories.Hubs,
        data: hubs,
        onPress: () =>
          navigate(Routes.FAVOURITES_CATEGORY_SCREEN, {
            type: categories.Hubs,
          }),
      },
    ],
    [storesBrands, malls, hubs],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.favourites}
      />
      <View style={styles.container}>
        {storesBrands.length > 0 || malls.length > 0 || hubs.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}>
            <Spacing size={24} />
            {categoriesData.map((category, index) =>
              category?.data?.length === 0 ? (
                <React.Fragment key={index} />
              ) : (
                <React.Fragment key={index}>
                  <Category title={category.title} onPress={category.onPress} />
                  <FlashList
                    data={category?.data || []}
                    ListHeaderComponent={ListHeaderComponent}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    estimatedItemSize={normalize(525)}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    numColumns={2}
                  />
                  <Spacing size={20} />
                </React.Fragment>
              ),
            )}
          </ScrollView>
        ) : (
          <ListEmptyComponent />
        )}
      </View>
    </SafeAreaView>
  );
};

export default React.memo(FavouritesScreen);

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
    contentContainerStyle: {
      paddingBottom: sizes.extraBottomPadding,
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

const categoryStyles = colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.text,
      height: normalize(32),
      textAlignVertical: 'center',
    },
    viewAll: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.text,
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
          resizeMode="cover"
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
