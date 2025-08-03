import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
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
import {getStores, toggleLike} from '../../../redux/actions';
import {Routes} from '../../Routes';
import {LikeButton} from '../AllInCityScreen';

const ITEMS_PER_PAGE = 10;

const StoresScreen = props => {
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [isSort, setIsSort] = useState(false);
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyle(colors), [colors]);
  const isFocused = useIsFocused();
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const id = props.route.params?.id;

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

      dispatch(
        getStores(
          id,
          pageRef.current,
          ITEMS_PER_PAGE,
          search,
          isSort ? sorts.ASC : sorts.DESC,
          {
            SuccessCallback: response => {
              const {pagination, result} = response?.data;
              totalPagesRef.current = pagination?.totalPages;

              if (pageRef?.current === 1) {
                setData(result);
              } else {
                setData(prev => [...prev, ...result]);
              }

              pageRef.current = pageRef.current + 1;
              setLoading(false);
            },
            FailureCallback: () => {
              setLoading(false);
            },
          },
        ),
      );
    },
    [loading, dispatch, id, search, isSort],
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
        toggleLike(item.id, 'Store', {
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
        title={item?.name}
        onPressLike={() => onPressLike(item, index)}
        onPress={() => {
          navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
            ...item,
            id: item?.id,
            type: item?.type,
          });
        }}
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

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.stores}
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
          placeholder={strings.search_stores}
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

export default React.memo(StoresScreen);

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
  });

const RenderItem = React.memo(
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
            item?.logo
              ? {uri: item?.logo, priority: 'high'}
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

const ListEmptyComponent = React.memo(() => {
  const {colors} = useTheme();
  const styles = listEmptyComponentStyles(colors);
  return (
    <View style={styles.container}>
      <FastImage
        source={images.ic_search_result_not_found}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.search_results_not_found}>
        {strings.no_data_found}
      </Text>
    </View>
  );
});

const listEmptyComponentStyles = colors =>
  StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    image: {width: normalize(120), height: normalize(120)},
    search_results_not_found: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.receiptsTheme.nothingYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
    },
  });
