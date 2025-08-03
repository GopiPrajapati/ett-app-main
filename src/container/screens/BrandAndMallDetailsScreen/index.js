import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import ImageCropPicker from 'react-native-image-crop-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {
  getFileName,
  getMediaTypeFromUrl,
  openMap,
} from '../../../commonutils/helper';
import {goBack, navigate} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  AreYouHereModal,
  Button,
  GlobalStatusBar,
  InvoiceAmountModal,
  OfferModal,
  PopupModal,
  ProductAlertSuccessModal,
  Spacing,
  TouchableContainer,
  UploadingReceiptInstructionsModal,
  UploadingReceiptSuccessfulModal,
  ViewBrandPictureModal,
} from '../../../components';
import AddProductAlertModal from '../../../components/Modals/AddProductAlertModal';
import Loader from '../../../components/Modals/LoaderModal';
import PayBillModal from '../../../components/Modals/PayBillModal';
import QRScannerModal from '../../../components/Modals/QRScannerModal';
import Toast from '../../../components/Toast';
import {
  getAmenity,
  getBusiness,
  getFeedPosts,
  getNearbyStore,
  getOffers,
  getProduct,
  getReview,
  getStore,
  getStoreDetails,
  getStoreFeedPosts,
  getStoreOffers,
  getStoreProduct,
  getStoreReview,
  toggleLike,
  uploadReceiptImage,
} from '../../../redux/actions';
import {Routes} from '../../Routes';
import LoginSignupModal from '../../../components/Modals/LoginSignupModal';

const BrandAndMallDetailsScreen = props => {
  const [details, setDetails] = useState({});
  const {colors} = useTheme();
  const global = useSelector(state => state.global);
  const styles = createStyle(colors);
  const {bottom} = useSafeAreaInsets();
  const _addProductAlertModalRef = useRef();
  const _productAlertSuccessModalRef = useRef();
  const _uploadingReceiptInstructionsModalRef = useRef();
  const _invoiceAmountModalRef = useRef();
  const _uploadingReceiptSuccessfulModalRef = useRef();
  const _areYouHereModalRef = useRef();
  const _popupModalRef = useRef();
  const _openNowContainerRef = useRef();
  const _viewBrandPictureModalRef = useRef();
  const _offerModalRef = useRef();
  const _qrScannerModalRef = useRef(null);
  const _payBillModalRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const isScrolling = useRef(false);
  const scrollEndTimeout = useRef(null);
  const translateYButtons = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const {id, type} = props?.route?.params;

  const isMall = type === 'Mall';
  const isShoppingHub = type === 'ShoppingHub';
  const isBrand = type === 'Shops';
  const isStore =
    type == undefined ||
    type === 'Offline' ||
    type === 'Online' ||
    type === 'Store';

  useEffect(() => {
    if (isFocused) {
      if (isStore) {
        dispatch(
          getStoreDetails(id, {
            SuccessCallback: response => {
              setDetails(prev => ({
                ...prev,
                ...response?.data,
              }));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getStoreProduct(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, products: response?.data}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getStoreOffers(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, offers: response?.data?.offers}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getStoreFeedPosts(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, posts: response?.data?.result}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getStoreReview(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, reviews: response?.data}));
            },
            FailureCallback: response => {},
          }),
        );
        // DO not remove this code(future scope)
        // dispatch(
        //   getStoreService(id, {
        //     SuccessCallback: response => {
        //       setDetails(prev => ({...prev, services: response?.data}));
        //     },
        //     FailureCallback: response => {},
        //   }),
        // );
      } else {
        Loader.show({key: Routes.BRAND_AND_MALL_DETAILS_SCREEN});
        dispatch(
          getBusiness(id, {
            SuccessCallback: response => {
              Loader.hide({key: Routes.BRAND_AND_MALL_DETAILS_SCREEN});
              if (response?.data?.singleStore && isBrand) {
                goBack();
                navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                  id: response?.data?.storeId,
                  type: 'Store',
                });
              }
              setDetails(prev => ({
                ...prev,
                ...response?.data,
              }));
            },
            FailureCallback: response => {
              Loader.hide({key: Routes.BRAND_AND_MALL_DETAILS_SCREEN});
              if (response?.data?.message === 'Business Does Not Exist') {
                Toast.show({message: 'Business Does Not Exist', type: 'info'});
                goBack();
              }
            },
          }),
        );
        dispatch(
          getProduct(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, products: response?.data}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getOffers(id, {
            SuccessCallback: response => {
              console.log('response', response);
              setDetails(prev => ({...prev, offers: response?.data}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getStore(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, stores: response?.data?.result}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getFeedPosts(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, posts: response?.data}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getReview(id, {
            SuccessCallback: response => {
              setDetails(prev => ({...prev, reviews: response?.data}));
            },
            FailureCallback: response => {},
          }),
        );
        dispatch(
          getAmenity(id, {
            SuccessCallback: response => {
              setDetails(prev => ({
                ...prev,
                amenities: response?.data?.amenities,
              }));
            },
            FailureCallback: response => {},
          }),
        );
      }
    }
  }, [
    details?.brandName,
    dispatch,
    id,
    isStore,
    props.route.params.type,
    isFocused,
    isBrand,
  ]);

  useEffect(() => {
    if (details?.brandName) {
      dispatch(
        getNearbyStore(id, details?.brandName, 1, 1, undefined, {
          SuccessCallback: response => {
            setDetails(prev => ({...prev, currentStore: response?.data}));
          },
          FailureCallback: response => {},
        }),
      );
    }
  }, [details?.brandName, dispatch, id]);

  useEffect(() => {
    scrollY.addListener(({value}) => {
      if (!isScrolling.current) {
        isScrolling.current = true;
        Animated.timing(translateYButtons, {
          toValue: 102, // Move out of view
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }

      scrollEndTimeout.current = setTimeout(() => {
        isScrolling.current = false;
        Animated.timing(translateYButtons, {
          toValue: 0, // Move back into view
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 100); // Adjust timeout for better responsiveness
    });

    return () => {
      scrollY.removeAllListeners();
      clearTimeout(scrollEndTimeout.current);
    };
  }, [scrollY, translateYButtons]);

  useEffect(() => {}, [details]);

  const onPressLike = () => {
    if (global?.isUserLoggedIn) {
      dispatch(
        toggleLike(id, isStore ? 'Store' : details?.type, {
          SuccessCallback: response => {
            setDetails(prev => ({...prev, isLiked: !prev?.isLiked}));
          },
          FailureCallback: error => {
            console.error(error);
          },
        }),
      );
    } else {
      LoginSignupModal.show();
    }
  };

  const processImage = useCallback(
    async (response, isCamera = false) => {
      try {
        const name = getFileName(response.path);
        const binaryData = await RNFS.readFile(response.path, 'base64');

        const mediaData = {
          data: binaryData,
          type: response.mime,
          name: name,
        };
        Loader.show({key: 'Upload Receipt API loader'});
        uploadReceiptImage(
          {
            fileName: name,
            prefix: 'receipt',
            isPublic: true,
          },
          mediaData,
          {
            SuccessCallback: result => {
              Loader.hide({key: 'Upload Receipt API loader'});
              setTimeout(() => {
                _invoiceAmountModalRef.current.open(id, result);
              }, 500);
            },
            FailureCallback: error => {
              console.error('Upload failed:', error);
              Loader.hide({key: 'Upload Receipt API loader'});
            },
          },
        );
      } catch (error) {
        console.error('Image processing error:', error);
      }
    },
    [id],
  );

  const formatTime = time => {
    const [hours, minutes] = time?.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const isStoreOpen = (openingTime, closingTime) => {
    const currentTime = new Date().toTimeString().slice(0, 8); // Get current time in HH:MM:SS format
    return currentTime >= openingTime && currentTime < closingTime;
  };

  const getStoreTimingsList = timing => {
    if (!timing || timing?.flat()?.length === 0) {
      return [];
    }

    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const currentDayIndex = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)

    return days.map((day, index) => {
      // Calculate the correct array index for today
      const expectedArrayIndex = (currentDayIndex + 6) % 7; // Maps Sunday (0) to 6, Monday (1) to 0, etc.
      const isToday = index === expectedArrayIndex;

      const dayData = timing.find(t => t.day === day);
      const isClosed = dayData?.isClosed;
      const isOpen24Hours = dayData?.isOpen24Hours;

      let timeDisplay;
      if (isClosed) {
        timeDisplay = 'Closed';
      } else if (isOpen24Hours) {
        timeDisplay = 'Open 24 hours';
      } else {
        const opening = dayData?.openingTime
          ? formatTime(dayData.openingTime)
          : '...';
        const closing = dayData?.closingTime
          ? formatTime(dayData.closingTime)
          : '...';
        timeDisplay = `${opening} - ${closing}`;
      }

      const status = isClosed
        ? 'Closed'
        : isOpen24Hours
        ? 'Open'
        : isStoreOpen(dayData?.openingTime, dayData?.closingTime)
        ? 'Open'
        : 'Closed';

      return {
        timing: isToday ? `Today (${timeDisplay})` : `${day} (${timeDisplay})`,
        isToday,
        status,
      };
    });
  };

  const getTodayStoreTiming = timing => {
    if (!timing || timing?.flat()?.length === 0) {
      return {
        day: '',
        timing: '',
        status: undefined,
      };
    }

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const todayIndex = new Date().getDay(); // Get today's index (0 for Sunday, 1 for Monday, etc.)
    const todayName = days[todayIndex];

    const dayData = timing?.find(t => t.day === todayName);
    const isClosed = dayData?.isClosed;
    const isOpen24Hours = dayData?.isOpen24Hours;

    let timingDisplay;
    if (isClosed) {
      timingDisplay = 'Closed';
    } else if (isOpen24Hours) {
      timingDisplay = 'Open 24 hours';
    } else {
      const openingTime = dayData?.openingTime
        ? formatTime(dayData.openingTime)
        : '...';
      const closingTime = dayData?.closingTime
        ? formatTime(dayData.closingTime)
        : '...';
      timingDisplay = `${openingTime} - ${closingTime}`;
    }

    const status = isClosed
      ? 'Closed'
      : isOpen24Hours
      ? 'Open'
      : isStoreOpen(dayData?.openingTime, dayData?.closingTime)
      ? 'Open'
      : 'Closed';

    return {
      day: `Today (${todayName})`,
      timing: timingDisplay,
      status,
    };
  };

  const formatWebUrl = url => {
    if (!url) return '';

    // Remove any leading/trailing whitespace and convert to lowercase
    let formattedUrl = url.trim().toLowerCase();

    // Check if the URL starts with a protocol
    if (
      !formattedUrl.startsWith('http://') &&
      !formattedUrl.startsWith('https://')
    ) {
      // If it starts with www., add https://
      if (formattedUrl.startsWith('www.')) {
        formattedUrl = 'https://' + formattedUrl;
      } else {
        // If no www., add https://www.
        formattedUrl = 'https://www.' + formattedUrl;
      }
    }

    return formattedUrl;
  };

  const {day, status, timing} = getTodayStoreTiming(
    details?.timing?.[0] || details?.storeTiming || [],
  );

  const handleQRCodeScanned = data => {
    console.log('QR Code scanned:', {
      data,
      timestamp: new Date().toISOString(),
      storeId: id,
      storeName: details?.name,
      ...(global?.user || {}),
    });
    _payBillModalRef.current?.open({
      link: data,
      userId: global.user?.id,
      storeId: id,
    });
  };

  return (
    <View style={styles.container}>
      <GlobalStatusBar />
      <Header
        scrollY={scrollY}
        chat={isStore}
        isLiked={details?.isLiked}
        onPressLike={onPressLike}
        onPressChat={() =>
          navigate(Routes.CHAT_SCREEN, {
            id: details?.id,
            name: details?.name,
            logo: details?.logo,
          })
        }
      />
      <ScrollView
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        style={styles.scrollContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <Carousel
          data={
            details?.coverImages?.length > 0
              ? [...(details?.coverImages || [])]
              : [details?.coverImage]
          }
        />
        <View
          style={{
            borderTopLeftRadius: normalize(20),
            borderTopRightRadius: normalize(20),
            marginTop: -20,
            backgroundColor: colors.brandAndMallDetails.mainBackgroundColor,
          }}>
          <View style={styles.brandDetailsContainer}>
            <TouchableContainer
              styles={styles.brandContainer}
              onPress={() => {
                if (details?.businessDetails?.logo || details?.logo) {
                  _viewBrandPictureModalRef.current.open(
                    details?.businessDetails?.logo
                      ? details?.businessDetails?.logo
                      : details?.logo,
                  );
                }
              }}>
              <FastImage
                source={
                  details?.businessDetails?.logo
                    ? {uri: details?.businessDetails?.logo, priority: 'high'}
                    : details?.logo
                    ? {uri: details?.logo, priority: 'high'}
                    : images.ic_brand_name_square
                }
                style={styles.brandImage}
              />
            </TouchableContainer>
            <Spacing size={13} direction="x" />
            <View style={styles.rightContainer}>
              <View style={styles.distanceWrapper}>
                {isStore &&
                details?.distance &&
                Number(details?.distance) > 0 ? (
                  <View style={styles.locationContainer}>
                    <Image
                      source={images.ic_location}
                      style={styles.locationIcon}
                    />
                    <Spacing size={6} direction="x" />
                    <Text style={styles.distanceText} numberOfLines={1}>
                      {`${details?.distance} kms away`}
                    </Text>
                  </View>
                ) : (
                  <React.Fragment />
                )}
                {isStore ? <Spacing size={8} /> : <React.Fragment />}
                {(details?.businessDetails?.address || details?.address) &&
                  !isBrand && (
                    <TouchableContainer
                      disabled={!isStore}
                      onPress={() => {
                        _areYouHereModalRef.current.open({
                          id: id,
                          name: isStore ? details?.name : details?.brandName,
                          logo: details?.businessDetails?.logo || details?.logo,
                          address:
                            details?.businessDetails?.address ||
                            details?.address,
                        });
                      }}
                      styles={styles.addressContainer}>
                      <Text style={styles.address} numberOfLines={1}>
                        {details?.businessDetails?.address || details?.address}
                      </Text>
                      <Spacing size={6} direction="x" />
                      {isStore ? (
                        <Image
                          source={images.ic_chevron_down}
                          style={styles.chevronDown}
                        />
                      ) : (
                        <React.Fragment />
                      )}
                    </TouchableContainer>
                  )}
                {isBrand ? (
                  <Text
                    style={{
                      ...fontStyles.archivoRegular,
                      fontSize: fontPixel(14),
                      color: commonColors.gray,
                    }}>
                    {details?.name}
                  </Text>
                ) : null}
              </View>
              <Spacing size={12} direction="x" />
              {details?.rating > 0 ? (
                <View style={styles.ratingContainer}>
                  <View style={styles.rating}>
                    <FastImage
                      source={images.ic_rating_star}
                      style={styles.starIcon}
                    />
                    <Spacing size={3} direction="x" />
                    <Text style={styles.ratingText}>
                      {Number(details?.rating)?.toFixed(1)}
                    </Text>
                  </View>
                </View>
              ) : (
                <React.Fragment />
              )}
            </View>
          </View>
        </View>
        <Spacing size={16} />
        <View style={styles.detailsContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {isStore ? details?.name : details?.brandName}
          </Text>
          {day && status && !isBrand ? <Spacing size={15} /> : null}
          {day && status && !isBrand ? (
            <TouchableContainer
              onPress={() => _popupModalRef.current.open(_openNowContainerRef)}
              styles={styles.openNowContainer}>
              <Text
                style={[
                  styles.openNow,
                  {
                    color:
                      status !== 'Closed'
                        ? commonColors.green
                        : commonColors.red,
                  },
                ]}
                ref={_openNowContainerRef}>
                {status !== 'Closed' ? 'Open now ' : 'Close now '}
              </Text>
              <Spacing size={6} direction="x" />
              <Text style={styles.time}>{`(${timing})`}</Text>
              <Spacing size={2} direction="x" />
              <Image
                source={images.ic_chevron_down}
                style={styles.chevronDown2}
              />
            </TouchableContainer>
          ) : (
            <React.Fragment />
          )}
          {details?.businessDetails?.description && <Spacing size={8} />}
          {details?.businessDetails?.description ? (
            <Text style={styles.description}>
              {details?.businessDetails?.description}
            </Text>
          ) : (
            <React.Fragment />
          )}
          <Spacing size={16} />
          {details?.storeCategories?.length > 0 ? (
            <View style={styles.eventContainer}>
              <Image source={images.ic_category} style={styles.eventIcon} />
              <Spacing size={12} direction="x" />
              <View style={styles.categoryContainer}>
                {details?.storeCategories?.map((item, index) => {
                  return (
                    <View key={index}>
                      <Text style={styles.categoryText}>
                        {item}
                        {index !== details?.storeCategories?.length - 1 &&
                          '  •  '}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <React.Fragment />
          )}
          {details?.storeCategories?.length > 0 ? (
            <Spacing size={16} />
          ) : (
            <React.Fragment />
          )}
          {details?.eventCount ? (
            <TouchableContainer
              styles={styles.eventContainer}
              onPress={() =>
                navigate(Routes.UPCOMING_EVENTS_SCREEN, {
                  id: id,
                  type: type,
                })
              }>
              <Image
                source={images.ic_calendar_starred}
                style={styles.eventIcon}
              />
              <Spacing size={12} direction="x" />
              <Text
                style={
                  styles.eventText
                }>{`${details?.eventCount} Upcoming events`}</Text>
            </TouchableContainer>
          ) : (
            <React.Fragment />
          )}
          {details?.eventCount > 0 ? <Spacing size={24} /> : <React.Fragment />}
          <View
            style={[
              styles.actionContainer,
              (details?.phoneNumber &&
                (details?.businessDetails || details?.address)) ||
              details?.website ||
              details?.share ||
              details?.address ||
              details?.businessDetails?.website
                ? {justifyContent: 'space-between'}
                : {gap: normalize(25)},
            ]}>
            {details?.phoneNumber ? (
              <TouchableContainer
                styles={styles.actionButtonContainer}
                onPress={() => {
                  Linking.openURL(`tel:${details?.phoneNumber}`);
                }}>
                <Image
                  source={images.ic_profile_call}
                  style={styles.actionButtonIcon}
                />
              </TouchableContainer>
            ) : (
              <React.Fragment />
            )}
            {details?.businessDetails || details?.address ? (
              <TouchableContainer
                styles={styles.actionButtonContainer}
                onPress={() => {
                  try {
                    if (details?.businessDetails) {
                      const {address, city, pincode} = details?.businessDetails;
                      openMap(address, pincode, city);
                    } else if (details?.address) {
                      openMap(details?.address);
                    }
                  } catch (error) {}
                }}>
                <Image
                  source={images.ic_profile_direction}
                  style={styles.actionButtonIcon}
                />
              </TouchableContainer>
            ) : (
              <React.Fragment />
            )}
            {details?.businessDetails?.website || details?.website ? ( // TODO: update website with exact key.
              <TouchableContainer
                styles={styles.actionButtonContainer}
                onPress={() => {
                  Linking.openURL(
                    formatWebUrl(
                      details?.businessDetails?.website || details?.website,
                    ),
                  ).catch(err => console.error('An error occurred', err));
                }}>
                <Image
                  source={images.ic_profile_web}
                  style={styles.actionButtonIcon}
                />
              </TouchableContainer>
            ) : (
              <React.Fragment />
            )}
            {details?.share ? ( // TODO: update share url with exact key.
              <TouchableContainer styles={styles.actionButtonContainer}>
                <Image
                  source={images.ic_profile_share}
                  style={styles.actionButtonIcon}
                />
              </TouchableContainer>
            ) : (
              <React.Fragment />
            )}
          </View>
        </View>
        {!isStore && details?.stores?.length > 0 && <Spacing size={20} />}
        {!isStore && details?.stores?.length > 0 ? (
          <StoresGrid
            data={details?.stores || []}
            onPressViewAll={() => {
              navigate(Routes.STORES_SCREEN, {id: id});
            }}
            onPress={(item, index) => {
              if (isMall) {
                return;
              }

              navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                id: item?.id,
                type: item?.type,
              });
            }}
          />
        ) : (
          <React.Fragment />
        )}
        {isStore && details?.products?.length > 0 ? (
          <Products
            data={details?.products}
            onPressViewAll={() =>
              navigate(Routes.PRODUCTS_SCREEN, {id: id, isStore, isBrand})
            }
          />
        ) : (
          <React.Fragment />
        )}
        {isStore && <Spacing size={20} />}
        {isStore ? (
          <View paddingHorizontal={sizes.paddingHorizontal}>
            <Button
              title={strings.add_product_alert}
              type="outlineButton"
              onPress={() => {
                if (global?.isUserLoggedIn) {
                  _addProductAlertModalRef?.current?.open(id);
                } else {
                  LoginSignupModal.show();
                }
              }}
            />
          </View>
        ) : (
          <React.Fragment />
        )}
        {details?.offers?.length > 0 ? (
          <Offers
            data={details?.offers?.filter(
              item => item?.status === 'Active' || item?.status === 'Upcoming',
            )}
            onPressOffer={item => _offerModalRef?.current?.open(item)}
          />
        ) : (
          <React.Fragment />
        )}
        {(isBrand || isStore) && details?.posts?.length > 0 ? (
          <Posts data={details?.posts} />
        ) : (
          <React.Fragment />
        )}
        {false ? (
          <Services
            data={new Array(5).fill({
              serviceName: 'Service Name',
              amount: 999,
              time: 30,
            })}
          />
        ) : (
          <React.Fragment />
        )}
        {details.amenities?.length > 0 ? (
          <Amenities data={details?.amenities} />
        ) : (
          <React.Fragment />
        )}
        {details?.reviews?.length > 0 ? (
          <Reviews data={details?.reviews} />
        ) : (
          <React.Fragment />
        )}
        {isStore ? <Spacing size={20} /> : null}
        {isStore ? (
          <View paddingHorizontal={sizes.paddingHorizontal}>
            <Button
              title={strings.write_a_review}
              type="outlineButton"
              onPress={() => {
                if (global?.isUserLoggedIn) {
                  navigate(Routes.WRITE_REVIEW_SCREEN, {id: details?.id});
                } else {
                  LoginSignupModal.show();
                }
              }}
            />
          </View>
        ) : null}
        {details?.socialMedia?.length > 0 ? (
          <SocialMedia data={details?.socialMedia} />
        ) : (
          <React.Fragment />
        )}
        <Spacing size={sizes.extraBottomMargin + normalize(35)} />
      </ScrollView>
      {isStore && global?.isUserLoggedIn ? (
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              paddingBottom: bottom ? bottom : normalize(20),
              transform: [{translateY: translateYButtons}],
            },
          ]}>
          <View style={{flex: 1}}>
            <Button
              title={strings.pay_bill}
              onPress={() => {
                _qrScannerModalRef.current.open();
              }}
            />
          </View>
          <Spacing size={13} direction="x" />
          <View style={{flex: 1}}>
            <Button
              title={strings.upload_receipt}
              type="outlineButton"
              onPress={() => {
                _uploadingReceiptInstructionsModalRef.current.open();
              }}
            />
          </View>
        </Animated.View>
      ) : (
        <React.Fragment />
      )}
      <AddProductAlertModal
        ref={_addProductAlertModalRef}
        onPressAdd={data => {
          setTimeout(() => {
            _productAlertSuccessModalRef?.current?.open(data);
          }, 500);
        }}
      />
      <ProductAlertSuccessModal ref={_productAlertSuccessModalRef} />
      <UploadingReceiptInstructionsModal
        ref={_uploadingReceiptInstructionsModalRef}
        onPressOkGotIt={() => {
          setTimeout(() => {
            ImageCropPicker.openPicker({mediaType: 'photo'})
              .then(processImage)
              .catch(error =>
                console.error('Gallery ImagePicker error:', error),
              );
          }, 500);
        }}
      />
      <InvoiceAmountModal
        ref={_invoiceAmountModalRef}
        onPressAdd={() => {
          setTimeout(() => {
            _uploadingReceiptSuccessfulModalRef.current.open();
          }, 500);
        }}
      />
      <UploadingReceiptSuccessfulModal
        ref={_uploadingReceiptSuccessfulModalRef}
      />
      <AreYouHereModal ref={_areYouHereModalRef} />
      <PopupModal ref={_popupModalRef} displacement={-normalize(30)}>
        <View style={{padding: normalize(16)}}>
          {getStoreTimingsList(
            details?.timing?.[0] || details?.storeTiming || [],
          )?.map((item, index) => (
            <View key={index}>
              <Text
                style={
                  item.isToday
                    ? {
                        ...fontStyles.archivoBold,
                        fontSize: fontPixel(12),
                        color: colors.text,
                      }
                    : item.status === 'Closed'
                    ? {
                        ...fontStyles.archivoRegular,
                        fontSize: fontPixel(12),
                        color: commonColors.gray,
                      }
                    : {
                        ...fontStyles.archivoRegular,
                        fontSize: fontPixel(12),
                        color: colors.text,
                      }
                }>
                {item.timing} {item.isToday && `(${item.status})`}
              </Text>
              {index !== 6 && <Spacing size={8} />}
            </View>
          ))}
        </View>
      </PopupModal>
      <ViewBrandPictureModal ref={_viewBrandPictureModalRef} />
      <OfferModal ref={_offerModalRef} />
      <PayBillModal ref={_payBillModalRef} />
      <QRScannerModal
        ref={_qrScannerModalRef}
        onScanSuccess={handleQRCodeScanned}
      />
    </View>
  );
};

export default BrandAndMallDetailsScreen;

const HeaderButton = ({source, onPress = () => {}}) => {
  const {colors} = useTheme();
  const styles = headerStyle(colors);
  return (
    <TouchableContainer onPress={onPress} styles={styles.buttonContainer}>
      <Image
        source={source}
        style={{width: normalize(20), height: normalize(20)}}
      />
    </TouchableContainer>
  );
};

const Header = ({
  scrollY,
  headerHeight = 60,
  chat,
  isLiked,
  onPressLike,
  onPressChat,
}) => {
  const global = useSelector(state => state.global);
  const {top} = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = headerStyle(colors);

  // Create animated value for background color
  const backgroundColor = scrollY.interpolate({
    inputRange: [0, headerHeight * 5], // Increased range for smoother transition
    outputRange: [
      'transparent',
      colors.brandAndMallDetails.mainBackgroundColor,
    ],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, {backgroundColor}]}>
      <Spacing size={top} />
      <View style={styles.headerContainer}>
        <HeaderButton source={images.ic_arrow_header} onPress={goBack} />
        <View style={styles.buttonWrapper}>
          <HeaderButton
            source={isLiked ? images.ic_red_heart : images.ic_heart_header}
            onPress={onPressLike}
          />
          {chat && global?.isUserLoggedIn && (
            <Spacing size={12} direction="x" />
          )}
          {chat && global?.isUserLoggedIn ? (
            <HeaderButton
              source={images.ic_chat_header}
              onPress={onPressChat}
            />
          ) : (
            <React.Fragment />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const headerStyle = colors =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: sizes.paddingHorizontal,
      zIndex: 2,
      overflow: 'hidden',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: normalize(60),
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonContainer: {
      width: normalize(40),
      height: normalize(40),
      borderRadius: 100,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(35,37,34,0.32)',
    },
  });

const DOT_SIZE = normalize(4);
const ACTIVE_DOT_SIZE = normalize(20);

const Carousel = React.memo(({data = []}) => {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const {colors} = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const styles = createStyle(colors);

  const onLayout = event => {
    const {width: _width} = event.nativeEvent.layout;
    setWidth(_width);
  };

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems?.[0]?.index !== undefined) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
    minimumViewTime: 100,
  }).current;

  const renderItem = ({item, index}) => {
    const isVideo = getMediaTypeFromUrl(item) === 'video';
    const isVisible = index === activeIndex;

    if (isVideo) {
      return (
        <View style={{width}}>
          <Video
            source={{
              uri: item,
            }}
            style={[styles.image, {width}]}
            paused={!isVisible}
            muted={true}
            repeat={true}
            resizeMode="cover"
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 50000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
              backBufferDurationMs: 120000,
              cacheSizeMB: 0,
              live: {
                targetOffsetMs: 500,
              },
            }}
          />
        </View>
      );
    }

    return (
      <View style={{width}}>
        <FastImage
          source={
            item
              ? {uri: item, priority: 'high'}
              : images.ic_brand_carousel_placeholder
          }
          style={[styles.image, {width}]}
        />
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer} onLayout={onLayout}>
      <Image
        source={images.ic_brand_carousel_placeholder}
        style={{width: '100%', height: normalize(330), position: 'absolute'}}
      />
      <FlashList
        data={data}
        estimatedItemSize={width}
        keyExtractor={(_, index) => `${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        scrollEnabled={data?.length > 1}
        scrollEventThrottle={16}
        renderItem={renderItem}
        extraData={activeIndex}
      />
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
                'rgba(255,255,255,0.4)',
                'rgba(255,255,255,1)',
                'rgba(255,255,255,0.4)',
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
      ) : null}
    </View>
  );
});

const Category = ({
  title = '',
  specialWord = '',
  onPress,
  paddingHorizontal = false,
}) => {
  const {colors} = useTheme();
  const styles = categoryStyles(colors);
  return (
    <View
      style={[
        styles.container,
        {paddingHorizontal: paddingHorizontal ? sizes.paddingHorizontal : 0},
      ]}>
      <Text style={styles.leftText}>
        {title}{' '}
        <Text adjustsFontSizeToFit style={styles.categoryText}>
          {specialWord}
        </Text>
      </Text>
      {onPress ? (
        <Text style={styles.viewAll} onPress={onPress}>
          {strings.view_all}
        </Text>
      ) : (
        <React.Fragment />
      )}
    </View>
  );
};

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

const Products = React.memo(({data = [], onPressViewAll}) => {
  const {colors} = useTheme();
  const styles = productStyle(colors);

  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={12} direction="x" />,
    [],
  );

  const renderProductItem = useCallback(
    ({item, index}) => (
      <TouchableContainer
        key={index}
        styles={[styles.cardContainer]}
        onPress={onPressViewAll}>
        <FastImage
          source={
            item?.productImages
              ? {uri: item?.productImages?.[0], priority: 'high'}
              : images.ic_brand_rectangle
          }
          style={styles.productImage}
        />
        <Spacing size={8} />
        <Text style={styles.productTitle} numberOfLines={1}>
          {item?.productName}
        </Text>
        <Spacing size={6} />
        <Text style={styles.price}>
          {item.price > 0 ? `₹${item.price}` : 'On Request'}
        </Text>
      </TouchableContainer>
    ),
    [
      onPressViewAll,
      styles.cardContainer,
      styles.price,
      styles.productImage,
      styles.productTitle,
    ],
  );

  return (
    <View>
      <Spacing size={32} />
      <Category
        title={strings.collections}
        paddingHorizontal
        onPress={onPressViewAll}
      />
      <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderProductItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        estimatedItemSize={normalize(223)}
        horizontal={true}
        contentContainerStyle={{
          paddingHorizontal: sizes.paddingHorizontal,
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
});

const productStyle = colors =>
  StyleSheet.create({
    cardContainer: {
      overflow: 'hidden',
      width: normalize(109),
    },
    productImage: {
      width: normalize(109),
      height: normalize(109),
      borderRadius: normalize(12),
      borderWidth: normalize(1),
      borderColor: colors.productsTheme.productBorderColor,
    },
    productTitle: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.productsTheme.productTitleColor,
    },
    price: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(16),
      color: commonColors.brandColor,
    },
  });

const Offers = React.memo(({data = [], onPressOffer}) => {
  const {colors} = useTheme();
  const styles = offersStyle(colors);
  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={12} direction="x" />,
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      const formattedStartDate = moment(item?.startDate).format('Do MMM');
      const formattedEndDate = moment(item?.endDate).format('Do MMM');

      const result = `Valid from ${formattedStartDate} upto ${formattedEndDate}`;

      return (
        <React.Fragment key={index}>
          <TouchableContainer
            onPress={() => onPressOffer(item, index)}
            styles={styles.offerContainer}>
            <View
              style={[
                styles.offerContainerBackground,
                {backgroundColor: item.backgroundColor},
              ]}
            />
            <Image
              source={images.ic_offer}
              style={styles.offerIcon}
              tintColor={item.backgroundColor}
            />
            <View style={styles.wrapper}>
              <Text
                style={[styles.title]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}>
                {item?.store?.name}
              </Text>
              <Text style={[styles.title]} numberOfLines={1}>
                {item.name}
              </Text>
              <View>
                {(item.type === 'Value' || item.type === 'Percentage') &&
                item.value ? (
                  <Text style={styles.flat}>Flat</Text>
                ) : null}
                {item.value ? (
                  <Text style={styles.off} numberOfLines={1}>
                    {`${item.value}${
                      item?.type === 'Percentage'
                        ? '%'
                        : item?.type === 'Value'
                        ? ' Off'
                        : ''
                    }`}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.validUpto}>{result}</Text>
            </View>
          </TouchableContainer>
          <ItemSeparatorComponent />
        </React.Fragment>
      );
    },
    [
      styles.flat,
      styles.off,
      styles.offerContainer,
      styles.offerContainerBackground,
      styles.offerIcon,
      styles.title,
      styles.validUpto,
      styles.wrapper,
    ],
  );

  if (data?.length === 0) {
    return null;
  }

  return (
    <View>
      <Spacing size={32} />
      <Category title={strings.offers} paddingHorizontal />
      <Spacing size={5} />
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={normalize(159)}
        horizontal={true}
        contentContainerStyle={{
          paddingHorizontal: sizes.paddingHorizontal,
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
});

const offersStyle = colors =>
  StyleSheet.create({
    offerContainer: {
      width: normalize(160),
      height: normalize(160),
      borderRadius: normalize(12),
      overflow: 'hidden',
      backgroundColor: commonColors.white,
    },
    offerContainerBackground: {
      width: normalize(160),
      height: normalize(160),
      opacity: 0.7,
    },
    offerIcon: {
      width: normalize(86),
      height: normalize(81.22),
      position: 'absolute',
      bottom: -20,
      right: -20,
      opacity: 1,
    },
    wrapper: {
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      position: 'absolute',
      padding: normalize(16),
      justifyContent: 'space-between',
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: commonColors.black,
    },
    flat: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    off: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: commonColors.black,
    },
    validUpto: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
  });

const Posts = React.memo(({data}) => {
  const {colors} = useTheme();
  const styles = postsStyle(colors);

  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={12} direction="x" />,
    [],
  );
  const renderItem = useCallback(
    ({item, index}) =>
      item?.isDeleted ? (
        <></>
      ) : (
        <TouchableContainer key={index} styles={styles.postItemContainer}>
          <Image
            source={
              item?.mediaUrl
                ? {uri: item?.mediaUrl}
                : images.ic_brand_carousel_placeholder
            }
            style={styles.postImage}
          />
          {item?.caption && <Spacing size={12} />}
          {item?.caption && (
            <Text style={styles.description}>{item?.caption}</Text>
          )}
        </TouchableContainer>
      ),
    [styles.description, styles.postImage, styles.postItemContainer],
  );

  return (
    <View>
      <Spacing size={32} />
      <Category title={strings.posts} paddingHorizontal />
      <Spacing size={5} />
      <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        estimatedItemSize={normalize(306)}
        horizontal={true}
        contentContainerStyle={{
          paddingHorizontal: sizes.paddingHorizontal,
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
});

const postsStyle = colors =>
  StyleSheet.create({
    postItemContainer: {width: normalize(277)},
    postImage: {
      width: normalize(277),
      height: normalize(277),
      borderRadius: normalize(12),
    },
    description: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: colors.brandAndMallDetails.postDescription,
    },
  });

const Services = React.memo(({data = []}) => {
  const {colors} = useTheme();
  const styles = servicesStyle(colors);

  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={12} direction="x" />,
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <View key={index} style={styles.serviceItemContainer}>
        <View style={styles.toolsContainer}>
          <Image source={images.ic_tool} style={styles.toolsIcon} />
        </View>
        <Spacing size={12} />
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Spacing size={4} />
        <Text style={styles.time}>{`${item.time} min`}</Text>
        <Spacing size={13} />
        <Text style={styles.amount}>{`₹${item.amount}`}</Text>
        <Spacing size={14} />
        <Button title={strings.book_now} onPress={() => {}} />
      </View>
    ),
    [
      styles.amount,
      styles.serviceItemContainer,
      styles.serviceName,
      styles.time,
      styles.toolsContainer,
      styles.toolsIcon,
    ],
  );

  return (
    <View>
      <Spacing size={32} />
      <Category title={strings.services} paddingHorizontal />
      <Spacing size={5} />
      <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        horizontal={true}
        contentContainerStyle={{
          paddingHorizontal: sizes.paddingHorizontal,
        }}
        estimatedItemSize={normalize(157)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
});

const servicesStyle = colors =>
  StyleSheet.create({
    serviceItemContainer: {
      width: 148,
      backgroundColor: colors.brandAndMallDetails.serviceContainer,
      padding: normalize(16),
      borderRadius: normalize(12),
    },
    toolsContainer: {
      width: normalize(52),
      height: normalize(52),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalize(100),
      backgroundColor: colors.brandAndMallDetails.toolsBackgroundColor,
    },
    toolsIcon: {width: normalize(24), height: normalize(24)},
    serviceName: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(14),
      color: colors.text,
    },
    time: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: colors.gray,
    },
    amount: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(18),
      color: colors.text,
    },
  });

const Reviews = React.memo(({data, onPressReview}) => {
  const {colors} = useTheme();
  const styles = reviewsStyle(colors);

  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={12} direction="x" />,
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      return (
        <View key={index} style={styles.reviewContainer}>
          <View style={styles.leftContainer}>
            <View>
              <Text style={styles.reviewerName}>
                {item.user?.firstName}
                {'  '}
                {item.user?.lastName}
              </Text>
              <Spacing size={4} />
              <Text style={styles.date}>
                {moment(item?.createdAt)
                  .utc() // Ensure it's parsed in UTC
                  .local()
                  .format('hh:mm A, DD MMM - YYYY')}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.rating}>
                <FastImage
                  source={images.ic_rating_star}
                  style={styles.starIcon}
                />
                <Spacing size={3} direction="x" />
                <Text style={styles.ratingText}>
                  {Number(item?.rating)?.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
          <Spacing size={18} />
          <Text style={styles.description}>{item?.review}</Text>
        </View>
      );
    },
    [
      styles.date,
      styles.description,
      styles.leftContainer,
      styles.rating,
      styles.ratingContainer,
      styles.ratingText,
      styles.reviewContainer,
      styles.reviewerName,
      styles.starIcon,
    ],
  );

  return (
    <View>
      <Spacing size={32} />
      <Category title={strings.reviews} paddingHorizontal />
      <Spacing size={5} />
      <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        horizontal={true}
        contentContainerStyle={{
          paddingHorizontal: sizes.paddingHorizontal,
        }}
        estimatedItemSize={normalize(157)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
});

const reviewsStyle = colors =>
  StyleSheet.create({
    reviewContainer: {
      width: normalize(278),
      padding: normalize(16),
      borderRadius: normalize(12),
      backgroundColor: colors.brandAndMallDetails.reviewContainer,
      minHeight: normalize(168),
    },
    leftContainer: {flexDirection: 'row', justifyContent: 'space-between'},
    reviewerName: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.brandAndMallDetails.reviewerName,
    },
    date: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    ratingContainer: {justifyContent: 'center'},
    rating: {
      paddingHorizontal: normalize(6),
      paddingVertical: normalize(3.5),
      backgroundColor: commonColors.green,
      borderRadius: normalize(6),
      flexDirection: 'row',
      alignItems: 'center',
    },
    starIcon: {width: normalize(12), height: normalize(12)},
    ratingText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(12),
      color: commonColors.white,
    },
    description: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.brandAndMallDetails.reviewDiscretion,
    },
  });

const socialMediaImages = {
  Instagram: {image: images.ic_instagram, url: 'https://www.instagram.com/'},
  Facebook: {image: images.ic_facebook, url: 'https://www.facebook.com/'},
  YouTube: {image: images.ic_youtube, url: 'https://www.youtube.com/'},
  Youtube: {image: images.ic_youtube, url: 'https://www.youtube.com/'},
};

const SocialMedia = React.memo(({data}) => {
  const {colors} = useTheme();
  const styles = socialMediaStyle(colors);

  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={35} direction="x" />,
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      return (
        <TouchableContainer
          key={index}
          onPress={() => {
            Linking.openURL(socialMediaImages[item.type].url + item?.userName);
          }}
          styles={styles.socialMediaContainer}>
          <FastImage
            source={socialMediaImages[item.type].image}
            style={styles.socialMediaIcon}
          />
          <Spacing size={12} direction="x" />
          <Text style={styles.title}>{item.type}</Text>
        </TouchableContainer>
      );
    },
    [styles.socialMediaContainer, styles.socialMediaIcon, styles.title],
  );

  return (
    <View>
      <Spacing size={32} />
      <Category title={strings.social_media} paddingHorizontal />
      <Spacing size={5} />
      <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        horizontal={true}
        contentContainerStyle={{
          paddingHorizontal: sizes.paddingHorizontal,
        }}
        estimatedItemSize={normalize(157)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
});

const socialMediaStyle = colors =>
  StyleSheet.create({
    socialMediaContainer: {
      minWidth: normalize(132),
      flexDirection: 'row',
      alignItems: 'center',
    },
    socialMediaIcon: {width: normalize(48), height: normalize(48)},
    title: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(16),
      color: colors.text,
    },
  });

const Amenities = React.memo(({data = []}) => {
  const {colors} = useTheme();
  const styles = amenitiesStyle(colors);

  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={12} direction="x" />,
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <View key={index} style={styles.amenitiesItemContainer}>
        <View style={styles.row}>
          <View style={styles.amenitiesIconContainer}>
            <Image source={{uri: item?.amenity?.iconUrl}} style={styles.icon} />
          </View>
          <Spacing size={12} direction="x" />
          <View style={{flex: 1}}>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
              {item?.amenity?.name}
            </Text>
            <View style={styles.rowCentered}>
              <Image source={images.ic_location} style={styles?.locationIcon} />
              <Spacing size={6} />
              <Text style={styles.location} numberOfLines={1}>
                {item?.location}
              </Text>
            </View>
          </View>
        </View>
        <Spacing size={12} />
        <Text style={styles.description} numberOfLines={1}>
          {item?.description}
        </Text>
        <Spacing size={12} />
        <Text style={styles.amount}>
          {Number(item?.charge) > 0 ? `₹${item?.charge}` : 'Ticket'}
        </Text>
      </View>
    ),
    [
      styles.amenitiesIconContainer,
      styles.amenitiesItemContainer,
      styles.amount,
      styles.description,
      styles.icon,
      styles.location,
      styles.locationIcon,
      styles.row,
      styles.rowCentered,
      styles.title,
    ],
  );

  return (
    <View>
      <Spacing size={32} />
      <Category title={strings.amenities} paddingHorizontal />
      <Spacing size={5} />
      <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        horizontal={true}
        contentContainerStyle={styles.flashListContent}
        estimatedItemSize={normalize(192)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
});

const StoresGrid = ({data = [], onPressViewAll, onPress = () => {}}) => {
  const {colors} = useTheme();
  const styles = brandGridStyles(colors);

  const ItemSeparatorComponent = useCallback(
    () => <Spacing size={12} direction="x" />,
    [],
  );

  const renderItem = ({item, index}) => {
    return (
      <View style={{width: normalize(140)}}>
        <TouchableContainer
          key={index}
          onPress={() => onPress(item, index)}
          styles={styles.storeItemContainer}>
          <FastImage
            source={
              item?.logo
                ? {uri: item?.logo, priority: 'high'}
                : images.ic_brand_name_square
            }
            style={styles.storageImage}
          />
        </TouchableContainer>
        <Spacing size={8} />
        <Text style={styles.storeName} numberOfLines={1}>
          {item?.name}
        </Text>
        <Spacing size={6} />
        <Text style={styles.storeAddress} numberOfLines={1}>
          {item?.area ? item?.area : item?.address}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <Category
        title={strings.stores}
        paddingHorizontal
        onPress={onPressViewAll}
      />
      <Spacing size={5} />
      <FlashList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        horizontal={true}
        contentContainerStyle={styles.flashListContent}
        estimatedItemSize={normalize(157)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const brandGridStyles = colors =>
  StyleSheet.create({
    gridContainer: {
      paddingLeft: sizes.paddingHorizontal,
    },
    storeItemContainer: {
      borderRadius: normalize(12),
      overflow: 'hidden',
      width: normalize(140),
      height: normalize(140),
    },
    storageImage: {width: '100%', height: '100%'},
    storeName: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(16),
      color: commonColors.brandColor,
    },
    storeAddress: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.storesTheme.storeNameColor,
    },
    flashListContent: {
      paddingHorizontal: sizes.paddingHorizontal,
    },
  });

const amenitiesStyle = colors =>
  StyleSheet.create({
    amenitiesItemContainer: {
      width: normalize(200),
      backgroundColor: colors.brandAndMallDetails.amenitiesContainer,
      padding: normalize(16),
      borderRadius: normalize(12),
    },
    amenitiesIconContainer: {
      width: normalize(52),
      height: normalize(52),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalize(100),
      backgroundColor: colors.brandAndMallDetails.amenitiesIconBackgroundColor,
    },
    icon: {
      width: normalize(52),
      height: normalize(52),
    },
    row: {
      flexDirection: 'row',
    },
    rowCentered: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(16),
      color: colors.text,
    },
    locationIcon: {
      width: normalize(18),
      height: normalize(18),
    },
    location: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.gray,
    },
    description: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.gray,
    },
    amount: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(18),
      color: colors.text,
    },
    flashListContent: {
      paddingHorizontal: sizes.paddingHorizontal,
    },
  });

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.brandAndMallDetails.mainBackgroundColor,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.brandAndMallDetails.mainBackgroundColor,
    },
    carouselContainer: {
      height: normalize(330),
    },
    image: {height: normalize(330)},
    paginationWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignSelf: 'center',
      bottom: normalize(36),
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
    brandContainer: {
      width: normalize(78),
      height: normalize(78),
      borderRadius: normalize(100),
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: commonColors.gray,
      borderWidth: 2,
      marginTop: -normalize(21),
    },
    brandDetailsContainer: {
      flexDirection: 'row',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    brandImage: {
      width: normalize(72),
      height: normalize(72),
      borderRadius: normalize(100),
      backgroundColor: commonColors.brandColor,
    },
    rightContainer: {
      flex: 1,
      marginTop: normalize(18),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {width: normalize(14), height: normalize(14)},
    distanceWrapper: {flexShrink: 1},
    distanceText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
      textAlignVertical: 'center',
      flexShrink: 1,
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    address: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(12),
      color: commonColors.brandColor,
      textAlignVertical: 'center',
      flexShrink: 1,
    },
    chevronDown: {width: normalize(14), height: normalize(14)},
    ratingContainer: {justifyContent: 'center'},
    rating: {
      paddingHorizontal: normalize(6),
      paddingVertical: normalize(3.5),
      backgroundColor: commonColors.green,
      borderRadius: normalize(6),
      flexDirection: 'row',
      alignItems: 'center',
    },
    starIcon: {width: normalize(12), height: normalize(12)},
    ratingText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(12),
      color: commonColors.white,
    },
    detailsContainer: {paddingHorizontal: sizes.paddingHorizontal},
    name: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(24),
      color: colors.brandAndMallDetails.titleColor,
    },
    openNowContainer: {flexDirection: 'row', alignItems: 'center'},
    openNow: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: commonColors.green,
    },
    time: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.brandAndMallDetails.timeColor,
    },
    chevronDown2: {width: normalize(16), height: normalize(16)},
    description: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    eventContainer: {flexDirection: 'row', alignItems: 'center'},
    eventIcon: {width: normalize(20), height: normalize(20)},
    eventText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.brandAndMallDetails.categoryColor,
    },
    categoryText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.brandAndMallDetails.categoryColor,
    },
    categorySeparator: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    categoryContainer: {flexGrow: 1, flexWrap: 'wrap', flexDirection: 'row'},
    actionContainer: {
      flexDirection: 'row',
    },
    actionButtonContainer: {
      width: normalize(40),
      height: normalize(40),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      backgroundColor: commonColors.brandColorLight,
    },
    actionButtonIcon: {width: normalize(20), height: normalize(20)},
    buttonsContainer: {
      flexDirection: 'row',
      paddingHorizontal: sizes.paddingHorizontal,
      paddingTop: normalize(20),
      position: 'absolute',
      bottom: 0,
      backgroundColor: colors.brandAndMallDetails.mainBackgroundColor,
    },
  });
