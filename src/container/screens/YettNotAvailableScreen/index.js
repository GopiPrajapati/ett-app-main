import {useIsFocused, useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {location, requestLocationPermission} from '../../../commonutils/helper';
import {navigateAndSimpleResetWithParam} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
  SearchCityModal,
  Spacing,
  TouchableContainer,
} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import Toast from '../../../components/Toast';
import useNetwork from '../../../hooks/useNetwork';
import {
  getLocationStatus,
  resetLocation,
  setCurrentLocation,
  setIsLocationSwitched,
  setNewLocation,
} from '../../../redux/actions';
import {Routes} from '../../Routes';

const YettNotAvailableScreen = props => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const global = useSelector(state => state.global);
  const _searchModalRef = useRef();
  const initialLoad = useRef(true);
  const isFocused = useIsFocused();
  const styles = useMemo(() => createStyle(colors), [colors]);
  const {isConnected} = useNetwork();
  const _isLocationSwitched = props.route.params?.isLocationSwitched;

  useEffect(() => {
    if (isFocused) {
      dispatch(
        getLocationStatus(undefined, undefined, {
          SuccessCallback: response => {
            setLocations(response?.data?.result);
          },
          FailureCallback: response => {},
        }),
      );
    }
  }, [dispatch, isFocused, isConnected]);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      setUp();
    }
  }, [dispatch, isConnected]);

  const setUp = useCallback(async () => {
    setLoading(true);
    Loader.show({key: Routes.YETT_NOT_AVAILABLE_SCREEN});
    const isLocationEnabled = await requestLocationPermission();
    if (isLocationEnabled) {
      if (_isLocationSwitched) {
        callGetLocationStatus(
          global?.latitude,
          global?.longitude,
          undefined,
          false,
        );
        return;
      }

      setTimeout(() => {
        location()
          .then(data => {
            callGetLocationStatus(data.latitude, data.longitude, data, false);
            Loader.hide({key: Routes.YETT_NOT_AVAILABLE_SCREEN});
          })
          .catch(error => {
            Loader.hide({key: Routes.YETT_NOT_AVAILABLE_SCREEN});
            setLoading(false);
            Toast.show({
              message:
                Platform.OS === 'ios'
                  ? strings.enabled_location
                  : strings.enabled_precise_location,
              type: 'info',
            });
            console.error(error);
          });
      }, 800);
    } else {
      setLoading(false);
      Loader.hide({key: Routes.YETT_NOT_AVAILABLE_SCREEN});
      Toast.show({
        message:
          Platform.OS === 'ios'
            ? strings.enabled_location
            : strings.enabled_precise_location,
        type: 'info',
      });
      if (!_isLocationSwitched) {
        dispatch(resetLocation());
      }
    }
  }, [_isLocationSwitched, global?.latitude, global?.longitude]);

  const callGetLocationStatus = useCallback(
    (latitude, longitude, place, isLocationSwitched) => {
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
                      displayName: place?.displayName
                        ? place?.displayName
                        : place?.address,
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
              dispatch(setIsLocationSwitched(isLocationSwitched));
              navigateAndSimpleResetWithParam(
                Routes.YETT_BOTTOM_TAB_BAR,
                0,
                {},
              );
            } else {
              setLoading(false);
              if (isLocationSwitched) {
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
            }
            Loader.hide({key: Routes.YETT_NOT_AVAILABLE_SCREEN});
          },
          FailureCallback: response => {
            setLoading(false);
            Loader.hide({key: Routes.YETT_NOT_AVAILABLE_SCREEN});
          },
        }),
      );
    },
    [],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        location={
          global.displayName ? global.displayName : strings.choose_location
        }
        notification
        onPressLocation={() => _searchModalRef.current.open()}
      />
      <Spacing style={styles.divider} />
      {isConnected ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Spacing size={12} />
          <FastImage
            source={images.ic_yett_coming_soon}
            style={styles.imageComingSoon}
          />
          <Spacing size={24} />
          <Text style={styles.notEverywhereYett}>
            {global.displayName
              ? `Oops! We’re not live in ${global.displayName} yet`
              : strings.we_are_not_everywhere_yett}
          </Text>
          <Spacing size={4} />
          <Text style={styles.exploreYett}>But we're working on it!</Text>
          <Spacing size={16} />
          <Text style={styles.exploreCities}>
            Meanwhile, Explore the shopping scene in these cities
          </Text>
          <Spacing size={24} />
          {locations?.map((item, index) => {
            return (
              <TouchableContainer
                key={index}
                styles={styles.cityItemContainer}
                onPress={() => {
                  if (item?.latitude && item?.longitude) {
                    callGetLocationStatus(
                      item?.latitude,
                      item?.longitude,
                      {
                        displayName: item?.city,
                        address: item?.city,
                        city: item?.city,
                      },
                      true,
                    );
                  }
                }}>
                <FastImage
                  source={{uri: item?.cityImage}}
                  resizeMode="cover"
                  style={styles.cityImage}
                />
                <View style={styles.cityTextContainer}>
                  <Text style={styles.cityName}>{item.city}</Text>
                  <Image
                    source={images.ic_arrow_right_2}
                    style={styles.arrowIcon}
                    resizeMode={'cover'}
                  />
                </View>
              </TouchableContainer>
            );
          })}
          <Spacing size={60} />
        </ScrollView>
      ) : (
        <View style={styles.cityListContainer}>
          <Text style={styles.notEverywhereYett}>
            {strings.check_your_internet_connection}
          </Text>
        </View>
      )}
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
              displayName:
                locationDetails?.displayName || locationDetails?.address,
              address: locationDetails?.address,
              city: locationDetails?.city,
            },
            true,
          );
        }}
      />
    </SafeAreaView>
  );
};

export default YettNotAvailableScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
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
    notEverywhereYett: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.homeTheme.notEverywhereYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
      textAlign: 'center',
      paddingHorizontal: '10%',
    },
    exploreYett: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(16),
      color: commonColors.gray,
      textAlign: 'center',
    },
    exploreCities: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.homeTheme.notEverywhereYettColor,
      textAlign: 'center',
      paddingHorizontal: '15%',
    },
    city: {
      fontSize: fontPixel(15.2),
      textDecorationLine: 'underline',
      color: commonColors.brandColor,
    },
    locationNotFound: {
      flex: 1,
      zIndex: 2,
      borderRadius: normalize(16),
      backgroundColor: colors.homeTheme.locationBackgroundColor,
    },
    locationNotFoundImage: {width: normalize(120), height: normalize(120)},
    cityListContainer: {
      minHeight: '90%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: normalize(20),
    },
    imageComingSoon: {
      width: '100%',
      height: normalize(330),
    },
    cityItemContainer: {
      flexDirection: 'row',
      marginBottom: normalize(12),
      marginHorizontal: sizes.marginHorizontal,
      borderRadius: normalize(24),
      overflow: 'hidden',
      backgroundColor: colors.homeTheme.cityItem,
    },
    cityImage: {
      width: normalize(128),
      height: normalize(72),
      backgroundColor: commonColors.brandColor,
    },
    cityTextContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(12),
      flex: 1,
    },
    cityName: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(16),
      color: colors.homeTheme.cityName,
    },
    arrowIcon: {
      width: normalize(20),
      height: normalize(20),
      tintColor: colors.homeTheme.arrow,
    },
  });
