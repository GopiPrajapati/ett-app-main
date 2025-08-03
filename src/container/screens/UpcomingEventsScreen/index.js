import FastImage from 'react-native-fast-image';
import {useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, Linking, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  Button,
  GlobalStatusBar,
  Header,
  LoadMoreLoader,
  Spacing,
  TermsAndConditionsModal,
  TouchableContainer,
} from '../../../components';
import {getUpcomingEvent} from '../../../redux/actions';

const UpcomingEventsScreen = props => {
  const {colors} = useTheme();
  const [data, setData] = useState([]);
  const pageRef = useRef(1);
  const [loading, setLoading] = useState(false);
  const _termsAndConditionsModalRef = useRef();
  const totalPagesRef = useRef(0);
  const styles = useMemo(() => createStyle(colors), [colors]);
  const dispatch = useDispatch();

  const {id, type} = props.route.params;
  const isStore =
    type == undefined ||
    type === 'Offline' ||
    type === 'Online' ||
    type === 'Store';

  useEffect(() => {
    if (id) {
      callGetUpcomingEvent(true);
    }
  }, [callGetUpcomingEvent, id]);

  const callGetUpcomingEvent = useCallback(
    isReset => {
      if (loading) {
        return;
      }

      setLoading(true);
      dispatch(
        getUpcomingEvent(id, isStore, pageRef.current, 10, {
          SuccessCallback: response => {
            const {pagination, events, upcomingEvents} = response?.data;
            if (!type) {
            }

            totalPagesRef.current = pagination?.totalPages;

            if (pageRef?.current === 1) {
              setData(events || upcomingEvents);
            } else {
              setData(prev => [...prev, ...(events || upcomingEvents || [])]);
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
    [loading, dispatch, id, type],
  );

  const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);
  const ListHeaderComponent = useCallback(() => <Spacing size={24} />, []);
  const ListFooterComponent = useCallback(
    () =>
      loading && pageRef.current > 1 ? (
        <LoadMoreLoader animating={loading || false} />
      ) : (
        <Spacing size={50} />
      ),
    [loading],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      // Combine startDate and startTime
      const startDateTime = `${item?.startDate.split('T')[0]}T${
        item?.startTime
      }`;

      // Create moment objects for the event start datetime and current datetime
      const eventStart = moment(startDateTime);
      const now = moment();

      // Calculate the difference in days
      const daysRemaining = eventStart.diff(now, 'days');
      return (
        <View style={styles.card}>
          <FastImage
            source={
              item?.bannerUrl
                ? {uri: item?.bannerUrl, priority: 'high'}
                : images.ic_brand_image
            }
            style={styles.eventBanner}
          />
          <View style={styles.organizerRow}>
            <FastImage
              source={
                item?.logoUrl
                  ? {uri: item?.logoUrl, priority: 'high'}
                  : images.ic_brand_name_square
              }
              style={styles.organizerPhoto}
            />
            {daysRemaining > 0 ? (
              <Text
                style={
                  styles.countdownText
                }>{`Start In ${daysRemaining} Day(s)`}</Text>
            ) : (
              <React.Fragment />
            )}
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.eventName} numberOfLines={1}>
                {item?.name}
                {'  '}
              </Text>
              <Text style={styles.duration}>{`(${item.duration} Mins)`}</Text>
            </View>
            {item?.description ? <Spacing size={8} /> : <React.Fragment />}
            {item?.description ? (
              <Text style={styles.description}>{item?.description}</Text>
            ) : (
              <React.Fragment />
            )}
            {item?.address ? <Spacing size={16} /> : <React.Fragment />}
            {item?.address ? (
              <View style={styles.infoRow}>
                <Image source={images.ic_location} style={styles.icon} />
                <Spacing size={8} direction="x" />
                <Text style={styles.address}>{item?.address}</Text>
              </View>
            ) : (
              <React.Fragment />
            )}
            <Spacing size={16} />
            {item?.capacity ? (
              <View style={styles.infoRow}>
                <Image source={images.ic_group} style={styles.icon} />
                <Spacing size={8} direction="x" />
                <Text style={styles.capacity}>
                  {item?.capacity} People Capacity
                </Text>
              </View>
            ) : (
              <React.Fragment />
            )}
            <Spacing size={20} />
            {item?.type ? (
              <Button
                title={item?.type}
                icon={images.ic_share}
                type={
                  item?.type === 'Open for All' || item?.type === 'Invite Only'
                    ? 'disabledButton'
                    : 'primaryIconButton'
                }
                disabled={
                  item?.type === 'Open for All' || item?.type === 'Invite Only'
                }
                onPress={() => {
                  if (item?.type === 'Registration') {
                    Linking.openURL(item?.registrationLink);
                  }
                }}
              />
            ) : (
              <React.Fragment />
            )}
            <Spacing size={16} />
            {item?.termsAndConditions ? (
              <TouchableContainer
                styles={styles.termsContainer}
                onPress={() => {
                  _termsAndConditionsModalRef?.current?.open(
                    item?.termsAndConditions,
                  );
                }}>
                <Text style={styles.termsText}>Terms and Conditions</Text>
              </TouchableContainer>
            ) : (
              <React.Fragment />
            )}
          </View>
        </View>
      );
    },
    [styles],
  );

  const onEndReached = useCallback(() => {
    if (
      !loading &&
      pageRef.current > 1 &&
      pageRef.current <= totalPagesRef.current
    ) {
      callGetUpcomingEvent();
    }
  }, [loading, callGetUpcomingEvent]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.upcomingEvents}
      />
      <View style={styles.container}>
        {!loading && data?.length > 0 ? (
          <FlashList
            data={data}
            extraData={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListFooterComponent={ListFooterComponent}
            estimatedFirstItemOffset={384}
            onEndReached={onEndReached}
          />
        ) : (
          <View style={styles.noUpcomingEvents}>
            <Text style={styles.noUpcomingEventsText}>No Upcoming Events</Text>
          </View>
        )}
      </View>
      <TermsAndConditionsModal ref={_termsAndConditionsModalRef} />
    </SafeAreaView>
  );
};

export default UpcomingEventsScreen;

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
      paddingHorizontal: sizes.paddingHorizontal,
    },
    card: {
      borderRadius: normalize(12),
      backgroundColor: colors.upcomingEventTheme.cardBackgroundColor,
      overflow: 'hidden',
    },
    eventBanner: {
      width: '100%',
      height: normalize(184),
      backgroundColor: commonColors.brandColor,
    },
    organizerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: normalize(16),
    },
    organizerPhoto: {
      width: normalize(60),
      height: normalize(60),
      borderRadius: 100,
      marginTop: -normalize(30),
    },
    countdownText: {
      ...fontStyles.archivoMedium,
      marginTop: normalize(12),
      color: commonColors.brandColor,
    },
    cardContent: {
      paddingHorizontal: normalize(16),
      paddingTop: normalize(12),
      paddingBottom: normalize(17),
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    eventName: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(18),
      color: colors.upcomingEventTheme.eventTitleColor,
      maxWidth: '78%',
    },
    duration: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    description: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
      flex: 1,
    },
    infoRow: {
      flexDirection: 'row',
    },
    icon: {
      width: normalize(14),
      height: normalize(14),
    },
    address: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.upcomingEventTheme.addressColor,
      flex: 1,
    },
    capacity: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.upcomingEventTheme.capacityColor,
      flex: 1,
    },
    termsContainer: {
      alignSelf: 'center',
    },
    termsText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: colors.gray,
    },
    noUpcomingEvents: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noUpcomingEventsText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.receiptsTheme.nothingYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
    },
  });
