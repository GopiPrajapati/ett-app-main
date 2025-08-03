import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import _ from 'lodash';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize} from '../../commonutils/dimensionutils';
import * as helper from '../../commonutils/helper';
import storage from '../../commonutils/storage';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {useKeyboard} from '../../hooks';
import API from '../../networking/NetworkService';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const {height} = Dimensions.get('window');

const url = API.getBaseURL();

const SearchCityModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const {isOpen} = useKeyboard();
  const global = useSelector(state => state.global);

  const styles = useMemo(() => createStyle(colors), [colors]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setResults([]);
    setQuery('');
  }, []);

  React.useImperativeHandle(ref, () => ({
    open: () => {
      if (!visible) setVisible(true);
    },
    close: handleClose,
  }));

  React.useEffect(() => {
    const toValue = isOpen
      ? Platform.OS === 'ios'
        ? height / 1.1
        : height / 1.8
      : height / 1.4;

    Animated.timing(animatedHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animatedHeight, isOpen]);

  const fetchResults = useCallback(async query => {
    setLoading(true);
    const token = await AsyncStorage.getItem(storage.ACCESS_TOKEN);
    if (!helper.accessToken) {
      helper.accessToken = token;
    }
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      if (helper.accessToken || token) {
        myHeaders.append(
          'Authorization',
          `Bearer ${helper.accessToken ? helper.accessToken : token}`,
        );
      }

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify({input: query}),
      };

      const response = await fetch(
        `${url}/v1/utils/google-service`,
        requestOptions,
      );

      const _data = await response.json();
      const data = JSON.parse(JSON.stringify(_data));
      if (data?.status || data?.statusCode === '200') {
        setResults(data?.data?.suggestions || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error:', error.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchResults = _.debounce(fetchResults, 1500);

  useEffect(() => {
    debouncedFetchResults(query);
  }, [query]);

  const searchPlaces = text => {
    setQuery(text);
  };

  const handleSelectPlace = useCallback(
    async place => {
      Keyboard.dismiss();
      handleClose();
      try {
        const token = await AsyncStorage.getItem(storage.ACCESS_TOKEN);
        if (!helper.accessToken) {
          helper.accessToken = token;
        }

        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        if (helper.accessToken || token) {
          myHeaders.append(
            'Authorization',
            `Bearer ${helper.accessToken ? helper.accessToken : token}`,
          );
        }

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          redirect: 'follow',
        };

        const urlPart = `${place?.placePrediction?.placeId}?fields=id,address_components,displayName,location`;
        const encodedUrlPart = encodeURIComponent(urlPart);
        const placeInfoUrl = `${url}/v1/utils/google-service?urlPart=${encodedUrlPart}`;
        const response = await fetch(placeInfoUrl, requestOptions);
        const _data = await response.json();
        const data = JSON.parse(JSON.stringify(_data));
        if (data?.status || data?.statusCode === 200) {
          const {latitude: lat, longitude: lng} = data.data.location;
          // Extract Display Name
          let displayName = data?.data?.displayName?.text || 'Unknown';

          // Extract City
          const cityComponent = data?.data?.addressComponents?.find(
            comp =>
              comp.types.includes('locality') &&
              comp.types.includes('political'),
          );
          const city = cityComponent?.longText || 'Unknown';

          // Extract Address (Formatted as "City, State, Country")
          const stateComponent = data?.data?.addressComponents?.find(comp =>
            comp.types.includes('administrative_area_level_1'),
          );
          const countryComponent = data?.data?.addressComponents?.find(comp =>
            comp.types.includes('country'),
          );

          const address = `${city}, ${stateComponent?.longText || 'Unknown'}, ${
            countryComponent?.longText || 'Unknown'
          }`;

          if (address && !address?.includes(displayName)) {
            displayName = displayName + ', ' + address;
          } else {
            displayName = address;
          }

          props.onSelectLocation?.({
            lat,
            lng,
            place: {
              ...place,
              displayName: displayName || city,
              city: city,
              address: address,
              // city: place?.placePrediction?.structuredFormat?.mainText?.text,
              // address: place?.placePrediction?.text?.text,
            },
          });
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    },
    [handleClose, props],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <TouchableOpacity
        key={`${JSON.stringify(item)}-${index}`}
        style={styles.item}
        onPress={() => handleSelectPlace(item)}>
        <Image
          source={
            global?.isDarkMode
              ? images.ic_location_dark
              : images.ic_location_light
          }
          style={styles.locationIcon}
        />
        <View style={styles.locationContainer}>
          <Text style={styles.mainLocation}>
            {item?.placePrediction?.structuredFormat?.mainText?.text}
          </Text>
          <Text style={styles.address}>
            {item?.placePrediction?.structuredFormat?.secondaryText?.text}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [styles, global?.isDarkMode, handleSelectPlace],
  );

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.bottomContainer, {height: animatedHeight}]}>
        <TouchableContainer
          styles={styles.closeIconContainer}
          onPress={handleClose}>
          <FastImage source={images.ic_x_close} style={styles.closeIcon} />
        </TouchableContainer>
        <Spacing size={20} />
        <View style={styles.content}>
          <Text style={styles.title}>{strings.search_location}</Text>
          <Spacing size={16} />
          <View style={styles.inputContainer}>
            <View style={styles.searchInputContainer}>
              <Image source={images.ic_search} style={styles.searchIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Search"
                placeholderTextColor={commonColors.gray}
                value={query}
                onChangeText={searchPlaces}
              />
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={commonColors.brandColor} />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(_, index) => `${index}`}
                renderItem={renderItem}
                ListHeaderComponent={
                  global?.currentLocation?.city ? (
                    <TouchableOpacity
                      style={[styles.item]}
                      onPress={() => {
                        const {
                          displayName,
                          city,
                          address,
                          latitude,
                          longitude,
                        } = global?.currentLocation;
                        props.onSelectLocation?.({
                          lat: latitude,
                          lng: longitude,
                          place: {
                            displayName: displayName || city,
                            city: city,
                            address: address,
                          },
                        });
                        Keyboard.dismiss();
                        handleClose();
                      }}>
                      <Image
                        source={
                          global?.isDarkMode
                            ? images.ic_location_dark
                            : images.ic_location_light
                        }
                        style={styles.locationIcon}
                      />
                      <View style={styles.locationContainer}>
                        <Text style={styles.mainLocation} numberOfLines={1}>
                          {global?.currentLocation?.displayName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null
                }
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  query &&
                  results?.length === 0 && (
                    <Text style={styles.emptyText}>
                      {strings.no_results_found}
                    </Text>
                  )
                }
              />
            )}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
});

const createStyle = colors =>
  StyleSheet.create({
    bottomContainer: {
      bottom: 0,
      position: 'absolute',
      left: 0,
      right: 0,
      height: height / 1.3,
    },
    content: {
      backgroundColor: colors.editProfileModalTheme.backgroundColor,
      paddingTop: normalize(24),
      borderTopLeftRadius: normalize(12),
      borderTopRightRadius: normalize(12),
      flex: 1,
    },
    closeIconContainer: {
      alignSelf: 'center',
      width: normalize(36),
      height: normalize(36),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.19)',
      borderRadius: 100,
    },
    closeIcon: {
      width: normalize(16),
      height: normalize(16),
    },
    searchIcon: {
      width: normalize(20),
      height: normalize(20),
      marginRight: normalize(8),
    },
    searchInputContainer: {
      height: normalize(48),
      backgroundColor: colors.editProfileModalTheme.input,
      borderRadius: normalize(8),
      paddingHorizontal: normalize(16),
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.editProfileModalTheme.titleColor,
      alignSelf: 'center',
    },
    locationIcon: {
      width: normalize(24),
      height: normalize(24),
      marginRight: normalize(12),
    },
    mainLocation: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: colors.text,
    },
    address: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
    },
    inputContainer: {
      paddingHorizontal: 16,
      flex: 1,
    },
    textInput: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      padding: 0,
      color: colors.inputTheme.textInputColor,
      flex: 1,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: normalize(20),
    },
    locationContainer: {
      flex: 1,
    },
    emptyText: {
      ...fontStyles.archivoBold,
      textAlign: 'center',
      color: commonColors.gray,
      marginTop: normalize(16),
    },
  });

export default React.memo(SearchCityModal);
