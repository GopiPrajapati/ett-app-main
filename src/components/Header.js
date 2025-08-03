import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import images from '../assets/images';
import {fontPixel, normalize, sizes} from '../commonutils/dimensionutils';
import {
  navigate,
  navigateAndSimpleResetWithParam,
} from '../commonutils/navigationutils';
import {fontStyles} from '../commonutils/typography';
import {Routes} from '../container/Routes';
import {
  getLocationStatus,
  getUnreadNotificationCount,
  setCurrentLocation,
  setNewLocation,
} from '../redux/actions/global.js';
import Loader from './Modals/LoaderModal.js';
import SearchCityModal from './Modals/SearchCityModal.js';
import Spacing from './Spacing';
import TouchableContainer from './TouchableContainer';

const Header = ({
  location,
  onPressLocation,
  leftText,
  back = false,
  leftArrowTintColor,
  onPressLeftArrow,
  notification,
  userAvatar,
  inbox,
  inboxBadge = false,
  rightIcons,
}) => {
  const {colors} = useTheme();
  const global = useSelector(state => state.global);
  const styles = useMemo(() => createStyle(colors), [colors]);
  const dispatch = useDispatch();
  const _searchModalRef = useRef();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (notification && isFocused && global?.isUserLoggedIn) {
      dispatch(
        getUnreadNotificationCount({
          SuccessCallback: response => {},
          FailureCallback: response => {},
        }),
      );
    }
  }, [notification, isFocused, dispatch]);

  const callGetLocationStatus = useCallback(
    (latitude, longitude, place, isLocationSwitched) => {
      Loader.show({key: Routes.HOME_SCREEN});
      dispatch(
        getLocationStatus(latitude, longitude, {
          SuccessCallback: response => {
            if (response?.data?.businessAvailable) {
              if (place) {
                if (!isLocationSwitched) {
                  dispatch(
                    setCurrentLocation({
                      latitude,
                      longitude,
                      displayName: place?.displayName || place?.address,
                      city: place?.city,
                      address: place?.address,
                    }),
                  );
                }
                dispatch(
                  setNewLocation({
                    latitude,
                    longitude,
                    displayName: place?.displayName
                      ? place?.displayName
                      : place?.address,
                    city: place?.city,
                    address: place?.address,
                  }),
                );
              }
              Loader.hide({key: Routes.HOME_SCREEN});
            } else {
              dispatch(
                setNewLocation({
                  latitude,
                  longitude,
                  displayName: place?.displayName
                    ? place?.displayName
                    : place?.address,
                  city: place?.city,
                  address: place?.address,
                }),
              );
              Loader.hide({key: Routes.HOME_SCREEN});
              navigateAndSimpleResetWithParam(
                Routes.YETT_NOT_AVAILABLE_SCREEN,
                0,
                {
                  isLocationSwitched: true,
                },
              );
            }
            Loader.hide({key: Routes.HOME_SCREEN});
          },
          FailureCallback: response => {
            Loader.hide({key: Routes.HOME_SCREEN});
            navigateAndSimpleResetWithParam(
              Routes.YETT_NOT_AVAILABLE_SCREEN,
              0,
              {},
            );
          },
        }),
      );
    },
    [dispatch],
  );

  const renderLeftContent = useMemo(() => {
    if (location) {
      return (
        <View style={styles.locationContainer}>
          <TouchableContainer
            styles={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() =>
              onPressLeftArrow
                ? onPressLeftArrow
                : onPressLocation
                ? onPressLocation()
                : _searchModalRef.current.open()
            }>
            <FastImage
              source={images.ic_location}
              style={styles.locationIcon}
            />
            <Spacing size={12} direction="x" />
            <Text
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {location}
            </Text>
          </TouchableContainer>
        </View>
      );
    }

    if (back) {
      return (
        <View style={styles.leftArrowContainer}>
          <TouchableContainer onPress={onPressLeftArrow}>
            <Image
              source={images.ic_arrow_left}
              style={[
                styles.leftArrow,
                {tintColor: leftArrowTintColor || '#828282'},
              ]}
            />
          </TouchableContainer>
          <Spacing size={12} direction="x" />
          <Text style={styles.leftText} numberOfLines={1}>
            {leftText}
          </Text>
        </View>
      );
    }

    return null;
  }, [
    location,
    back,
    styles.locationContainer,
    styles.locationIcon,
    styles.locationText,
    styles.leftArrowContainer,
    styles.leftArrow,
    styles.leftText,
    onPressLeftArrow,
    onPressLocation,
    leftArrowTintColor,
    leftText,
  ]);

  const renderRightContent = useMemo(() => {
    return (
      <>
        {notification ? (
          <TouchableContainer
            onPress={() => navigate(Routes.NOTIFICATION_SCREEN)}
            styles={styles.iconButton}>
            <Image
              source={images.ic_notification}
              tintColor={colors.headerTheme.notificationIconTintColor}
              style={styles.icon}
              resizeMode="contain"
            />
            {global?.unreadNotificationCount > 0 && (
              <View style={styles.badge} />
            )}
          </TouchableContainer>
        ) : (
          <React.Fragment />
        )}
        {inbox ? (
          <>
            <Spacing size={12} direction="x" />
            <TouchableContainer
              onPress={() => navigate(Routes.INBOX_SCREEN)}
              styles={styles.iconButton}>
              <Image
                source={images.ic_inbox}
                tintColor={colors.headerTheme.notificationIconTintColor}
                style={styles.icon}
                resizeMode="contain"
              />
              {inboxBadge && <View style={styles.badge} />}
            </TouchableContainer>
          </>
        ) : (
          <React.Fragment />
        )}
        {userAvatar ? (
          <>
            <Spacing size={12} direction="x" />
            <TouchableContainer
              styles={styles.iconButton}
              onPress={() => navigate(Routes.PROFILE_SCREEN)}>
              <Image
                source={
                  typeof userAvatar === 'string'
                    ? {uri: userAvatar}
                    : images.ic_default_user
                }
                style={styles.userAvatar}
                resizeMode="contain"
              />
            </TouchableContainer>
          </>
        ) : (
          <React.Fragment />
        )}
        {rightIcons && rightIcons}
      </>
    );
  }, [
    notification,
    inbox,
    userAvatar,
    rightIcons,
    global?.unreadNotificationCount,
    inboxBadge,
    colors.headerTheme.notificationIconTintColor,
    styles,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>{renderLeftContent}</View>
      <View style={styles.rightContainer}>{renderRightContent}</View>
      <SearchCityModal
        ref={_searchModalRef}
        onSelectLocation={({
          lat: latitude,
          lng: longitude,
          place: locationDetails,
        }) => {
          callGetLocationStatus(
            latitude,
            longitude,
            {
              displayName: locationDetails?.displayName,
              address: locationDetails?.address,
              city: locationDetails?.city,
            },
            true,
          );
        }}
      />
    </View>
  );
};

export default React.memo(Header);

const createStyle = colors =>
  StyleSheet.create({
    container: {
      width: Dimensions.get('window').width,
      height: normalize(60),
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftArrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {
      width: normalize(24),
      height: normalize(24),
    },
    locationText: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(16),
      color: colors.headerTheme.leftTextColor,
      flex: 0.95,
    },
    leftArrow: {
      width: normalize(24),
      height: normalize(24),
    },
    leftText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.headerTheme.leftTextColor,
      flex: 0.95,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      width: normalize(40),
      height: normalize(40),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.headerTheme.notificationIconBackgroundColor,
      borderRadius: 100,
      overflow: 'hidden',
    },
    icon: {
      width: normalize(22),
      height: normalize(22),
    },
    userAvatar: {
      width: normalize(40),
      height: normalize(40),
    },
    badge: {
      backgroundColor: '#FF0000',
      borderWidth: 1,
      borderColor: 'white',
      width: normalize(7.33),
      height: normalize(7.33),
      borderRadius: 100,
      position: 'absolute',
      top: 10,
      right: 12,
    },
  });
