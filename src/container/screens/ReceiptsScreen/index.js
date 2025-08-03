import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
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
import {getInvoices} from '../../../redux/actions';
import {Routes} from '../../Routes';

const ReceiptsScreen = () => {
  const [isSearch, setIsSearch] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isSort, setIsSort] = useState(false);
  const {colors} = useTheme();
  const global = useSelector(state => state?.global);
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyle(colors), [colors]);
  const isFocused = useIsFocused();
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);

  const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);

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
        getInvoices(
          pageRef.current,
          10,
          search,
          isSort ? sorts.ASC : sorts.DESC,
          {
            SuccessCallback: response => {
              const {pagination, invoices} = response?.data;
              totalPagesRef.current = pagination?.totalPages;
              if (isReset) {
                setData(invoices);
              } else {
                setData(prev => [...(prev || []), ...invoices]);
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
    [dispatch, isSort, loading, search],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      return (
        <TouchableContainer
          styles={[styles.renderItemContainer]}
          onPress={() => navigate(Routes.VIEW_RECEIPT_SCREEN, {...item})}>
          <FastImage
            source={
              item?.store?.logo
                ? {uri: item?.store?.logo, priority: 'high'}
                : images.ic_brand_story
            }
            style={styles.brandImage}
          />
          <Spacing size={12} direction="x" />
          <View style={styles.leftContainer}>
            <Text style={styles.title}>{item?.store?.brandName}</Text>
            <Spacing size={2} />
            <Text style={styles.dateTime}>
              {moment(item?.createdAt).format('hh:mm A, DD MMM - YYYY')}
            </Text>
          </View>
          <Text style={styles.amount}>₹{item?.amount}</Text>
        </TouchableContainer>
      );
    },
    [
      styles.amount,
      styles.brandImage,
      styles.dateTime,
      styles.leftContainer,
      styles.renderItemContainer,
      styles.title,
    ],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.receiptsNotFound}>
        <FastImage
          source={
            global?.isDarkMode
              ? images.ic_receipts_not_found_dark
              : images.ic_receipts_not_found_light
          }
          style={styles.receiptsNotFoundImage}
        />
        <Text style={styles.nothingYett}>{strings.nothing_yett}</Text>
        <Text style={styles.localBusinesses}>{strings.local_businesses}</Text>
      </View>
    ),
    [
      global?.isDarkMode,
      styles.localBusinesses,
      styles.nothingYett,
      styles.receiptsNotFound,
      styles.receiptsNotFoundImage,
    ],
  );

  const ListFooterComponent = useCallback(
    () =>
      loading && pageRef.current > 1 ? (
        <LoadMoreLoader animating={loading || false} />
      ) : null,
    [loading],
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

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.receipts}
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
          placeholder={strings.search}
        />
        <Spacing size={10} />
      </View>
      <View style={styles.container}>
        {data?.length > 0 ? (
          <FlashList
            data={data}
            keyExtractor={(_, index) => `${index}`}
            contentContainerStyle={styles.contentContainerStyle}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListFooterComponent={ListFooterComponent}
            onEndReached={onEndReached}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={normalize(105)}
          />
        ) : (
          <ListEmptyComponent />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ReceiptsScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.receiptsTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      backgroundColor: colors.receiptsTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
      paddingHorizontal: sizes.paddingHorizontal,
    },
    renderItemContainer: {
      backgroundColor: colors.inboxTheme.itemBackgroundColor,
      padding: normalize(16),
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: normalize(12),
      justifyContent: 'space-between',
    },
    contentContainerStyle: {
      paddingTop: normalize(16),
      paddingBottom: sizes.extraBottomMargin,
    },
    brandImage: {
      width: normalize(48),
      height: normalize(48),
      borderRadius: 100,
    },
    leftContainer: {flex: 1},
    title: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(16),
      color: colors.receiptsTheme.titleColor,
    },
    dateTime: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    amount: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(16),
      color: colors.receiptsTheme.amountColor,
    },
    receiptsNotFound: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    receiptsNotFoundImage: {
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
    localBusinesses: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
      textAlign: 'center',
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
