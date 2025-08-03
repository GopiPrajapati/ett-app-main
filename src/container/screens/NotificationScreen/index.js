import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
  LoadMoreLoader,
  Spacing,
  TouchableContainer,
} from '../../../components';
import {getNotification, markAllAsRead} from '../../../redux/actions';

const NotificationScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMarkAllAsReadVisible, setIsMarkAllAsReadVisible] = useState(false);
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const global = useSelector(state => state?.global);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const isFocused = useIsFocused();
  const styles = createStyle(colors);

  useEffect(() => {
    if (isFocused) {
      pageRef.current = 1;
      totalPagesRef.current = 0;
      fetchData(true);
    }
  }, [fetchData, isFocused]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setIsMarkAllAsReadVisible(false);
      return;
    }

    const hasReadItems = data.some(item => !item?.isRead);
    setIsMarkAllAsReadVisible(hasReadItems);
  }, [data]);

  const fetchData = useCallback(
    async (isReset = false) => {
      if (loading) {
        return;
      }

      setLoading(true);

      dispatch(
        getNotification(pageRef.current, 10, {
          SuccessCallback: response => {
            const {pagination, notifications} = response?.data;
            totalPagesRef.current = pagination?.totalPages;
            if (isReset) {
              setData(notifications);
            } else {
              setData(prev => [...(prev || []), ...notifications]);
            }

            pageRef.current = pageRef.current + 1;
            setLoading(false);
          },
          FailureCallback: response => {
            setLoading(false);
          },
        }),
      );
    },
    [dispatch, loading],
  );

  const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);

  const renderItem = useCallback(
    ({item, index}) => {
      const _unread = !item?.isRead;
      return (
        <TouchableContainer
          key={index}
          styles={[styles.renderItemContainer]}
          onPress={() => {}}>
          <View style={_unread ? styles.unreadBadge : styles.readBadge} />
          <Spacing size={10} direction="x" />
          <FastImage
            source={
              item?.notification?.storeImage
                ? {uri: item?.notification?.storeImage, priority: 'high'}
                : images.ic_brand_story
            }
            style={styles.brandImage}
          />
          <Spacing size={12} direction="x" />
          <View style={styles.leftContainer}>
            <Text style={styles.title}>{item?.notification?.title}</Text>
            {item?.notification?.description && (
              <Text
                style={_unread ? styles.unreadDescription : styles.description}>
                {item?.notification?.description}
              </Text>
            )}
            <Spacing size={2} />
            <Text style={styles.dateTime}>
              {moment(item?.notification?.createdAt)
                .local()
                .format('hh:mm A, DD MMM - YYYY')}
            </Text>
          </View>
        </TouchableContainer>
      );
    },
    [
      styles.brandImage,
      styles.dateTime,
      styles.description,
      styles.leftContainer,
      styles.readBadge,
      styles.renderItemContainer,
      styles.title,
      styles.unreadBadge,
      styles.unreadDescription,
    ],
  );

  const ListEmptyComponent = useCallback(
    () =>
      !loading ? (
        <View style={styles.notificationNotFound}>
          <FastImage
            source={
              global?.isDarkMode
                ? images.ic_notification_not_found_dark
                : images.ic_notification_not_found_light
            }
            style={styles.notificationNotFoundImage}
          />
          <Text style={styles.nothingYett}>{strings.nothing_yett}</Text>
          <Text style={styles.localBusinesses}>{strings.local_businesses}</Text>
        </View>
      ) : null,
    [
      global?.isDarkMode,
      loading,
      styles.localBusinesses,
      styles.nothingYett,
      styles.notificationNotFound,
      styles.notificationNotFoundImage,
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
        leftText={strings.notification}
        rightIcons={
          isMarkAllAsReadVisible ? (
            <TouchableContainer
              onPress={() => {
                dispatch(
                  markAllAsRead({
                    SuccessCallback: response => {
                      pageRef.current = 1;
                      totalPagesRef.current = 0;
                      setIsMarkAllAsReadVisible(false);
                      fetchData(true);
                    },
                    FailureCallback: response => {},
                  }),
                );
              }}>
              <Text style={styles.markAllAsRead}>
                {strings.mark_all_as_read}
              </Text>
            </TouchableContainer>
          ) : (
            <></>
          )
        }
      />
      <View style={styles.container}>
        {data?.length > 0 ? (
          <FlashList
            data={data}
            keyExtractor={(_, index) => `${index}`}
            contentContainerStyle={styles.contentContainerStyle}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparatorComponent}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={normalize(105)}
            onEndReached={onEndReached}
            ListFooterComponent={ListFooterComponent}
          />
        ) : (
          <ListEmptyComponent />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.notificationTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      backgroundColor: colors.notificationTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    renderItemContainer: {
      padding: normalize(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    contentContainerStyle: {
      paddingTop: normalize(16),
      paddingBottom: sizes.extraBottomMargin,
    },
    unreadBadge: {
      width: normalize(6),
      height: normalize(6),
      backgroundColor: commonColors.brandColor,
      borderRadius: 100,
    },
    readBadge: {
      width: normalize(6),
      height: normalize(6),
    },
    brandImage: {
      width: normalize(48),
      height: normalize(48),
      borderRadius: 100,
    },
    leftContainer: {flex: 1},
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: colors.notificationTheme.discretionColor,
    },
    description: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    unreadDescription: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: colors.notificationTheme.discretionColor,
    },
    dateTime: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },

    notificationNotFound: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    notificationNotFoundImage: {
      width: normalize(120),
      height: normalize(120),
    },
    nothingYett: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.notificationTheme.nothingYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
    },
    localBusinesses: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
      textAlign: 'center',
    },
    markAllAsRead: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: commonColors.brandColor,
    },
  });
