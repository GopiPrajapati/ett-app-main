import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import videos from '../../../assets/videos';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {
  askForPermission,
  getFCMToken,
  groupIntoChunks,
  location,
} from '../../../commonutils/helper';
import {
  navigate,
  navigateAndSimpleResetWithParam,
} from '../../../commonutils/navigationutils';
import storage from '../../../commonutils/storage';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  AppPreviewModal,
  GlobalStatusBar,
  Header,
  Input,
  Spacing,
  TouchableContainer,
} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import useNetwork from '../../../hooks/useNetwork';
import {
  getAdvertisement,
  getBanner,
  getHome,
  getLocationStatus,
  getStories,
  getUserProfile,
  setCurrentLocation,
  setNewLocation,
} from '../../../redux/actions';
import {Routes} from '../../Routes';

const HomeScreen = props => {
  const {colors} = useTheme();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const global = useSelector(state => state.global);
  const [data, setData] = useState({
    brands: [],
    malls: [],
    shoppingHubs: [],
  });
  const [banner, setBanner] = useState([]);
  const [advertisement, setAdvertisement] = useState([]);
  const {isConnected} = useNetwork();
  const appPreviewModalRef = useRef();
  const isFocused = useIsFocused();
  const styles = createStyle(colors);
  const _isLocationSwitched = global?.isLocationSwitched;

  useEffect(() => {
    askForPermission();
    callSetLocation();
    if (global?.isUserLoggedIn) {
      dispatch(
        getUserProfile({
          SuccessCallback: response => {},
          FailureCallback: response => {},
        }),
      );
    }
    getFCMToken();
  }, [isConnected]);

  useEffect(() => {
    if (isFocus) {
      dispatch(
        getBanner({
          SuccessCallback: response => {
            setBanner(response?.data);
          },
          FailureCallback: response => {},
        }),
      );
      callAdvertisement();
      callGetHome();
      openWalkThroughGuide();
    } else {
      setTimeout(() => {
        appPreviewModalRef.current?.close();
      }, 500);
    }
  }, [isFocus, global?.city]);

  const callGetHome = useCallback(() => {
    if (!global.city) {
      return;
    }

    dispatch(
      getHome({
        SuccessCallback: response => {
          setData(response?.data);
        },
        FailureCallback: response => {},
      }),
    );
  }, [dispatch, global.city]);

  const callSetLocation = useCallback(() => {
    if (_isLocationSwitched) {
      return;
    }

    Loader.show({key: Routes.HOME_SCREEN});

    location()
      .then(data => {
        callGetLocationStatus(data?.latitude, data?.longitude, data, false);
      })
      .catch(error => {
        Loader.hide({key: Routes.HOME_SCREEN});
        navigateAndSimpleResetWithParam(
          Routes.YETT_NOT_AVAILABLE_SCREEN,
          0,
          {},
        );
      });
  }, [_isLocationSwitched]);

  const callAdvertisement = useCallback(() => {
    dispatch(
      getAdvertisement({
        SuccessCallback: response => {
          setAdvertisement(response?.data);
        },
        FailureCallback: response => {},
      }),
    );
  }, [dispatch]);

  const isBrand = data?.brands && data?.brands?.length > 0;
  const isMalls = data?.malls && data?.malls?.length > 0;
  const isShoppingHubs = data?.shoppingHubs && data?.shoppingHubs?.length > 0;

  const callGetLocationStatus = useCallback(
    (latitude, longitude, place, isLocationSwitched) => {
      Loader.show({key: Routes.HOME_SCREEN});
      if (latitude && longitude) {
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
                  // callGetHome();
                }
                Loader.hide({key: Routes.HOME_SCREEN});
                openWalkThroughGuide();
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
        navigateAndSimpleResetWithParam(Routes.YETT_NOT_AVAILABLE_SCREEN, 0, {
          isLocationSwitched: true,
        });
      }
    },
    [dispatch],
  );

  const openWalkThroughGuide = async () => {
    const isWalkThroughGuide = JSON.parse(
      await AsyncStorage.getItem(storage.WALK_THROUGH_GUIDE),
    );

    if (isWalkThroughGuide === null) {
      setTimeout(() => {
        appPreviewModalRef.current?.open();
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        location={
          global?.displayName ? global?.displayName : strings.choose_location
        }
        notification
      />
      <Spacing style={styles.divider} />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <GreetingContainer
          illustrationVideo={
            global?.isDarkMode
              ? videos.ic_home_video_dark
              : videos.ic_home_video
          }
          bannerHeight={normalize(298)}
          videoPaused={!isFocused}
        />
        <View style={styles.container}>
          <View style={{paddingHorizontal: sizes.paddingHorizontal}}>
            <Input
              leftIcon={images.ic_search}
              editable={false}
              onPress={() => {
                navigate(Routes.SEARCH_SCREEN);
              }}
              placeholder={'Search for Brands, Malls, or Hubs'}
              animatePlaceholderText={true}
              isBorderLessContainer
            />
          </View>
          <Spacing size={24} />
          {banner?.length > 0 ? (
            <View style={{paddingHorizontal: sizes.paddingHorizontal}}>
              <Carousal data={banner} />
            </View>
          ) : (
            <React.Fragment />
          )}
          {banner?.length > 0 && <Spacing style={styles.carouselDivider} />}
          {isBrand ? (
            <Category
              title="Explore"
              specialWord="Brands"
              onPress={() => {
                navigate(Routes.YETT_BOTTOM_TAB_BAR, {
                  screen: strings.all_in_city,
                });
              }}
            />
          ) : (
            <React.Fragment />
          )}
          {isBrand ? <Spacing size={24} /> : <React.Fragment />}
          {isBrand ? (
            <BrandGrid
              data={data.brands}
              onPress={(_item, _index) => {
                navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                  ..._item,
                  id: _item?.id,
                });
              }}
            />
          ) : (
            <React.Fragment />
          )}
          {isBrand ? <Spacing size={24} /> : <React.Fragment />}
          {isMalls ? (
            <Category
              title="Explore"
              specialWord="Malls"
              onPress={() => {
                navigate(Routes.YETT_BOTTOM_TAB_BAR, {
                  screen: strings.malls,
                });
              }}
            />
          ) : (
            <React.Fragment />
          )}
          {isMalls ? <Spacing size={24} /> : <React.Fragment />}
          {isMalls ? (
            groupIntoChunks(data?.malls?.slice(0, 3) || [], 3)
              .slice(0, 3)
              .map((item, index) => (
                <React.Fragment key={index}>
                  <Grid
                    chunkIndex={index}
                    data={item}
                    onPress={(_item, _index) => {
                      navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                        ..._item,
                        id: _item?.id,
                      });
                    }}
                  />
                  <Spacing size={12} />
                </React.Fragment>
              ))
          ) : (
            <React.Fragment />
          )}
          {isShoppingHubs ? <Spacing size={24} /> : <React.Fragment />}
          {isShoppingHubs ? (
            <Category
              title="Explore"
              specialWord="Hubs"
              onPress={() => {
                navigate(Routes.YETT_BOTTOM_TAB_BAR, {
                  screen: strings.hubs,
                });
              }}
            />
          ) : (
            <React.Fragment />
          )}
          {isShoppingHubs ? <Spacing size={24} /> : <React.Fragment />}
          {isShoppingHubs ? (
            groupIntoChunks(data?.shoppingHubs?.slice(0, 3) || [], 3).map(
              (item, index) => (
                <React.Fragment key={index}>
                  <Grid
                    chunkIndex={index}
                    data={item}
                    onPress={(_item, _index) => {
                      navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                        ..._item,
                        id: _item?.id,
                      });
                    }}
                  />
                  <Spacing size={12} />
                </React.Fragment>
              ),
            )
          ) : (
            <React.Fragment />
          )}
          {advertisement?.length > 0 && (
            <Spacing style={[styles.divider, {marginHorizontal: 0}]} />
          )}
          {advertisement?.length > 0 ? (
            <View style={{transform: [{translateY: normalize(25)}]}}>
              <FastImage
                source={{
                  uri: global?.isDarkMode
                    ? advertisement?.find(item => item?.theme === 'Dark')?.url
                    : advertisement?.find(item => item?.theme === 'Light')?.url,
                  priority: 'high',
                }}
                style={styles.bottomBannerImage}
              />
            </View>
          ) : (
            <React.Fragment />
          )}
        </View>
      </ScrollView>
      <AppPreviewModal ref={appPreviewModalRef} />
    </SafeAreaView>
  );
};

export default HomeScreen;

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
    scrollView: {
      paddingBottom: sizes.extraBottomPadding,
      flex: 1,
    },
    greetingContainer: {
      marginHorizontal: sizes.marginHorizontal,
      paddingTop: normalize(24),
    },
    greetingText: {
      ...fontStyles.archivoMedium,
      color: colors.text,
      fontSize: fontPixel(18),
    },
    nameText: {
      ...fontStyles.borelRegular,
      color: commonColors.brandColor,
      fontSize: fontPixel(18),
    },
    gatewayText: {
      ...fontStyles.archivoRegular,
      color: commonColors.gray,
      fontSize: fontPixel(16),
      marginBottom: normalize(20),
    },
    shoppingText: {
      ...fontStyles.archivoRegular,
      color: commonColors.brandColor,
      fontSize: fontPixel(16),
    },
    storyContainer: {
      width: normalize(68),
      height: normalize(68),
      borderRadius: 100,
      borderWidth: 2,
      borderColor: commonColors.brandColor,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    storyImage: {
      borderRadius: 100,
      overflow: 'hidden',
      width: normalize(58.29),
      height: normalize(58.29),
    },
    bannerContainer: {
      width: '100%',
      height: normalize(291),
      justifyContent: 'flex-end',
      transform: [{translateY: normalize(20)}],
    },
    bannerImage: {
      width: '100%',
      height: normalize(274),
    },
    notEverywhereYett: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.homeTheme.notEverywhereYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
    },
    exploreYett: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
      textAlign: 'center',
    },
    locationNotFound: {
      flex: 1,
      paddingVertical: normalize(20),
      zIndex: 2,
      borderRadius: normalize(16),
      backgroundColor: colors.homeTheme.locationBackgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    locationNotFoundImage: {width: normalize(120), height: normalize(120)},
    carouselDivider: {
      height: 1,
      backgroundColor: colors.dividerColor,
      marginVertical: normalize(24),
    },
    bottomBannerImage: {
      width: '100%',
      height: normalize(305),
    },
    illustrationVideo: {
      width: '100%',
      height: '100%',
    },
  });

const ItemSeparatorComponent = React.memo(() => {
  return <Spacing size={12} direction="x" />;
});

export const GreetingContainer = React.memo(
  ({illustration, illustrationVideo, bannerHeight, videoPaused}) => {
    const dispatch = useDispatch();
    const [stories, setStories] = useState([]);
    const {colors} = useTheme();
    const global = useSelector(state => state.global);
    const styles = createStyle(colors);
    const {firstName, lastName} = global?.user;

    useEffect(() => {
      dispatch(
        getStories({
          SuccessCallback: response => {
            setStories(response?.data);
          },
          FailureCallback: response => {},
        }),
      );
    }, [dispatch]);

    const renderItem = useCallback(
      ({item, index}) => {
        return (
          <TouchableContainer
            key={index}
            styles={styles.storyContainer}
            onPress={() => navigate(Routes.STORY_SCREEN, {index: index})}>
            <FastImage
              source={{uri: item?.url, priority: 'high'}}
              style={styles.storyImage}
            />
          </TouchableContainer>
        );
      },
      [styles.storyContainer, styles.storyImage],
    );

    return (
      <View>
        <View
          style={styles.greetingContainer}
          illustration={
            global?.isDarkMode
              ? images.ic_home_image_dark
              : images.ic_home_image
          }>
          <Text style={styles.greetingText} numberOfLines={1}>
            Hi,
            <Text style={styles.nameText} numberOfLines={1}>
              {firstName ? ` ${firstName}!` : ' There!'}
            </Text>
          </Text>
          <Text style={styles.gatewayText} numberOfLines={1}>
            Your gateway to city wide{' '}
            <Text style={styles.shoppingText} numberOfLines={1}>
              {'shopping'}
            </Text>
          </Text>
        </View>
        {stories?.length > 0 && (
          <FlashList
            data={stories}
            keyExtractor={(_, index) => `${index}`}
            horizontal={true}
            estimatedItemSize={normalize(68)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: sizes.paddingHorizontal,
            }}
            ItemSeparatorComponent={ItemSeparatorComponent}
            bounces={false}
            renderItem={renderItem}
          />
        )}
        <View style={styles.bannerContainer}>
          {illustration ? (
            <FastImage
              source={illustration}
              style={[
                styles.bannerImage,
                {height: bannerHeight ?? normalize(274)},
              ]}
            />
          ) : (
            <React.Fragment />
          )}
          {illustrationVideo ? (
            <Video
              style={styles.illustrationVideo}
              source={illustrationVideo}
              repeat={true}
              resizeMode="cover"
              paused={videoPaused}
              ignoreSilentSwitch="obey"
              volume={0}
            />
          ) : (
            <React.Fragment />
          )}
        </View>
      </View>
    );
  },
);

const DOT_SIZE = normalize(4);
const ACTIVE_DOT_SIZE = normalize(20);
export const Carousal = ({data = []}) => {
  const [width, setWidth] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const global = useSelector(state => state.global);

  const onLayout = event => {
    const {width: _width} = event.nativeEvent.layout;
    setWidth(_width);
  };

  return (
    <View>
      <View style={styles.container} onLayout={onLayout}>
        <FlashList
          data={data}
          estimatedItemSize={width}
          keyExtractor={(_, index) => `${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 90,
          }}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={16}
          renderItem={({item, index}) => {
            return (
              <View
                key={index}
                style={{
                  width: width,
                }}>
                <FastImage
                  source={{uri: item?.url, priority: 'high'}}
                  style={[styles.image, {width: width}]}
                />
              </View>
            );
          }}
        />
      </View>
      <Spacing size={15} />
      {data?.length > 1 ? (
        <View style={styles.paginationWrapper}>
          {data.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const animatedWidth = scrollX.interpolate({
              inputRange,
              outputRange: [DOT_SIZE, ACTIVE_DOT_SIZE, DOT_SIZE],
              extrapolate: 'clamp',
            });
            const animatedColor = scrollX.interpolate({
              inputRange,
              outputRange: [
                commonColors.gray,
                !global?.isDarkMode ? commonColors.black : commonColors.white,
                commonColors.gray,
              ],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    width: animatedWidth,
                    backgroundColor: animatedColor,
                  },
                ]}
              />
            );
          })}
        </View>
      ) : (
        <React.Fragment />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: normalize(12),
  },
  image: {height: normalize(184)},
  paginationWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    // position: 'absolute',
    // bottom: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
  },
  paginationDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    marginHorizontal: normalize(3),
    borderRadius: 100,
  },
});

const Category = ({title = '', specialWord = '', onPress}) => {
  const {colors} = useTheme();
  const styles = categoryStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.leftText}>
        {title}{' '}
        <Text adjustsFontSizeToFit style={styles.categoryText}>
          {specialWord}
        </Text>
      </Text>
      <Text style={styles.viewAll} onPress={onPress}>
        {strings.view_all}
      </Text>
    </View>
  );
};

const categoryStyles = colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    leftText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.text,
      height: normalize(32),
      textAlignVertical: 'center',
    },
    categoryText: {
      ...fontStyles.borelRegular,
      fontSize: fontPixel(20),
      color: commonColors.brandColor,
      height: fontPixel(20),
    },
    viewAll: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.text,
    },
  });

const Grid = ({data = [], onPress = () => {}, chunkIndex}) => {
  return (
    <View style={gridStyles.gridContainer}>
      {data.map((item, index) => (
        <TouchableContainer
          key={index}
          onPress={() => onPress(item, index)}
          styles={[
            gridStyles.cardContainer,
            index === 0 ? gridStyles.fullWidthCard : gridStyles.halfWidthCard,
          ]}>
          <FastImage
            source={
              item?.businessDetails?.coverImage
                ? {uri: item?.businessDetails?.coverImage, priority: 'high'}
                : images.ic_brand_rectangle
            }
            style={gridStyles.image}
          />
          <View style={gridStyles.overlay} />
          <Text style={gridStyles.title} numberOfLines={2}>
            {item.brandName}
          </Text>
          <Image
            source={images.ic_arrow_right}
            tintColor={commonColors.white}
            style={gridStyles.rightArrow}
          />
        </TouchableContainer>
      ))}
    </View>
  );
};

const gridStyles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: sizes.paddingHorizontal,
    justifyContent: 'space-between',
    rowGap: normalize(12),
  },
  cardContainer: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidthCard: {
    width: '100%',
    height: normalize(184),
  },
  halfWidthCard: {
    width: '48%',
    height: normalize(184),
  },
  image: {
    width: '100%',
    height: normalize(184),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    ...fontStyles.archivoBold,
    position: 'absolute',
    color: commonColors.white,
    fontSize: fontPixel(18),
    textAlign: 'center',
  },
  rightArrow: {
    width: normalize(20),
    height: normalize(20),
    position: 'absolute',
    bottom: normalize(16),
    right: normalize(16),
  },
});

const BrandGrid = ({data = [], onPress = () => {}}) => {
  const _data = data.slice(0, 6);
  return (
    <View style={brandGridStyles.gridContainer}>
      {_data.map((item, index) => {
        return (
          <TouchableContainer
            key={index}
            onPress={() => onPress(item, index)}
            styles={brandGridStyles.brandContainer}>
            <FastImage
              source={
                item?.businessDetails?.logo
                  ? {uri: item?.businessDetails?.logo, priority: 'high'}
                  : images.ic_brand_name_square
              }
              style={brandGridStyles.brandImage}
            />
          </TouchableContainer>
        );
      })}
    </View>
  );
};

const brandGridStyles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.paddingHorizontal,
    rowGap: normalize(12),
  },
  brandContainer: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    width: '31%',
    height: normalize(101),
  },
  brandImage: {width: '100%', height: normalize(101)},
});

export const RoundedContainer = () => {
  return (
    <View style={roundedContainerStyles.outerContainer}>
      <View style={roundedContainerStyles.innerContainer} />
    </View>
  );
};

const roundedContainerStyles = StyleSheet.create({
  outerContainer: {
    width: '95%', // Responsive width with padding
    height: 150, // Fixed height, adjust as needed
    backgroundColor: '#FDF6F2', // Light background color
    borderRadius: 20, // Rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '5 5 5 0 rgba(1,1,1,1)',
  },
  innerContainer: {
    width: '97%', // Slightly smaller for inset effect
    height: '90%', // Proportional height
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 18, // Rounded corners slightly smaller
    borderWidth: 1,
    borderColor: '#E5D9D2', // Light inner border color
  },
});
