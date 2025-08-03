import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import {Linking, PermissionsAndroid, Platform, Share} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import DeviceInfo from 'react-native-device-info';

import {
  PERMISSIONS,
  RESULTS,
  check,
  checkNotifications,
  request,
  requestNotifications,
} from 'react-native-permissions';
import Toast from '../components/Toast';
import API from '../networking/NetworkService';
import storage from './storage';

/**
 * Checks and requests storage read permission based on the platform and system version.
 *
 * @returns {Promise<boolean>} - A promise that resolves to `true` if permission is granted, otherwise `false`.
 *
 * Function Details:
 * - For iOS:
 *   - Automatically returns `true` as no explicit read permissions are required.
 * - For Android:
 *   - Checks the system version:
 *     - If below Android 13 (API level < 33), requests `READ_EXTERNAL_STORAGE` permission.
 *     - If Android 13 or later, assumes permission is not needed and returns `true`.
 * - Handles permission requests via `PermissionsAndroid` and shows appropriate messages.
 *
 * Error Handling:
 * - Logs any errors that occur during the permission request process.
 * - Returns `false` if an error occurs.
 *
 * @example
 * const hasPermission = await checkStoragePermission();
 * if (hasPermission) {
 *   // Proceed with accessing storage
 * }
 */
export const checkStoragePermission = async () => {
  try {
    if (Platform.OS === 'android' && DeviceInfo.getSystemVersion() < 13) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'Allow Yett to access storage.',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      return true; // For iOS and Android versions >= 13, no need to request permission
    }
  } catch (error) {
    console.error('Check Storage Permission - ', error);
    return false;
  }
};

/**
 * Checks for and requests write permission based on the platform.
 * - On iOS: Automatically grants permission (no explicit permission required).
 * - On Android: Checks the API level and requests write permission if needed.
 *
 * @returns {Promise<boolean>} - A promise that resolves to `true` if permission is granted, otherwise `false`.
 *
 * Function Details:
 * - For iOS:
 *   - Returns `true` since iOS doesn't require explicit write permissions for downloading.
 * - For Android:
 *   - If the API level is greater than 32 (Android 13 or later), permissions are not needed.
 *   - For older versions, requests `WRITE_EXTERNAL_STORAGE` permission using `PermissionsAndroid`.
 *   - Displays a toast notification if the permission is denied.
 *
 * Error Handling:
 * - Catches and logs any exceptions that occur during the permission request process.
 *
 * @example
 * const hasPermission = await checkWritePermission();
 * if (hasPermission) {
 *   // Proceed with file download
 * }
 */
export const checkWritePermission = async imageUrl => {
  // Check the platform and handle permissions accordingly
  if (Platform.OS === 'ios') {
    return true;
  } else {
    const apiLevel = await DeviceInfo.getApiLevel();
    if (apiLevel > 32) {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to download Photos',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission granted
        console.log('Storage Permission Granted.');
        return true;
      } else {
        // Permission denied
        Toast.show({message: 'Storage Permission Not Granted'});
        return false;
      }
    } catch (error) {
      // Handle exceptions related to permission requests
      console.error('Check Write Permission - ', error);
      return false;
    }
  }
};

/**
 * Downloads a media file (image or video) from a given URL to the local device storage.
 * Supports both iOS and Android platforms and handles permissions and file sharing.
 *
 * @param {string} url - The URL of the media file to be downloaded.
 * @param {boolean} isVideo - Specifies whether the media is a video (default is `false`, indicating an image).
 * @returns {Promise<void>} - A promise that resolves when the download and optional sharing are completed.
 *
 * Function Details:
 * - Determines the appropriate directory for saving the file based on the platform (iOS or Android).
 * - Generates a unique file name using the current date and time (`YYYYMMDD_HHmmss`) and the appropriate extension (`mp4` for video, `jpg` for image).
 * - Checks for and requests storage read/write permissions.
 * - Creates the target directory if it does not exist.
 * - Downloads the file using `ReactNativeBlobUtil` with platform-specific options (e.g., using the download manager on Android).
 * - On iOS, shares the downloaded file using the `Share` module.
 *
 * Error Handling:
 * - Displays a toast notification if the download fails or if permissions are denied.
 *
 * @example
 * // Download an image
 * await downloadMedia('https://example.com/image.jpg');
 *
 * // Download a video
 * await downloadMedia('https://example.com/video.mp4', true);
 */
export const downloadMedia = async (url, isVideo = false) => {
  const {config, fs} = ReactNativeBlobUtil;
  let directory =
    fs?.dirs?.[Platform.OS === 'ios' ? 'DocumentDir' : 'LegacyDownloadDir'];
  const extension = isVideo ? 'mp4' : 'jpg';
  const newDoc = `${moment().format('YYYYMMDD_HHmmss')}.${extension}`;
  const filePath = `${directory}/${newDoc}`;

  let options = Platform.select({
    ios: {
      fileCache: true,
      path: filePath,
    },
    android: {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: isVideo ? 'Video' : 'Image',
      },
    },
  });

  try {
    const hasReadPermission = await checkStoragePermission();
    const hasWritePermission = await checkWritePermission();
    if (hasWritePermission || hasReadPermission) {
      // Check if the directory exists
      const dirExists = await ReactNativeBlobUtil.fs.exists(directory);

      if (!dirExists) {
        // Create the directory only if it doesn't exist
        await ReactNativeBlobUtil.fs.mkdir(directory);
      }

      config(options)
        .fetch('GET', url)
        .then(res => {
          if (Platform.OS === 'ios') {
            Share.share({
              url: `file://${filePath}`,
            })
              .then(() => {})
              .catch(error => {
                Toast.show({
                  message: 'Image Download Failed - ' + error.message,
                });
              });
          }
        })
        .catch(error => {
          Toast.show({message: 'Image Download Failed:' + error.message});
        });
    } else {
      Toast.show({
        message: 'Allow access to storage for media backups.',
        type: 'info',
      });
    }
  } catch (error) {
    console.error('Download Media - ', error);
  }
};

/**
 * Groups an array into chunks of a specified size.
 * @param {Array} array - The array to be split into chunks.
 * @param {number} size - The size of each chunk.
 * @returns {Array[]} - An array of chunks, where each chunk is an array of the specified size.
 *
 * @example
 * const data = [1, 2, 3, 4, 5];
 * const chunks = groupIntoChunks(data, 2);
 * console.log(chunks); // Outputs: [[1, 2], [3, 4], [5]]
 */
export const groupIntoChunks = (array, size) =>
  array.reduce((acc, _, index) => {
    if (index % size === 0) {
      acc.push(array.slice(index, index + size));
    }
    return acc;
  }, []);

/**
 * Formats a given date into "DD MMM YYYY" format.
 * @param {string|Date} data - The date to format. Can be a string or a Date object.
 * @returns {string} - The formatted date in "DD MMM YYYY" format (e.g., "09 Jan 2007").
 */
export const dateOfBirthFormat = data =>
  data ? moment(String(data)).format('DD MMM YYYY') : '';

/**
 * Converts a date string to ISO 8601 format with a specific time.
 * @param {string} dateStr - The input date string in "YYYY-MM-DD" format.
 * @param {number} hour - The hour to set.
 * @param {number} minute - The minute to set.
 * @param {number} second - The second to set.
 * @param {number} millisecond - The millisecond to set.
 * @returns {string} The formatted ISO 8601 date string.
 */
export const convertToISO8601 = (
  date,
  hour = 18,
  minute = 30,
  second = 0,
  millisecond = 0,
) => {
  return moment(String(date), 'YYYY-MM-DD')
    .utc()
    .local()
    .set({hour, minute, second, millisecond})
    .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
};

/**
 * It will find the file name from the given url/path.
 *
 * @param {*} path
 * @returns
 */
export const getFileName = path => {
  return path.substring(path.lastIndexOf('/') + 1);
};

/**
 * Determines the media type (image or video) from a URL based on its file extension.
 *
 * @param {string} url - The URL of the media file
 * @returns {'image' | 'video' | null} - Returns 'image' for image files,
 *                                      'video' for video files, or null if unknown
 *
 * @example
 * getMediaTypeFromUrl('https://example.com/photo.jpg') // returns 'image'
 * getMediaTypeFromUrl('https://example.com/video.mp4') // returns 'video'
 */
export const getMediaTypeFromUrl = url => {
  if (!url) return null;

  const extension = url.split('.').pop().toLowerCase();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic'];
  const videoExtensions = [
    'mp4',
    'mov',
    'avi',
    'mkv',
    'wmv',
    'webm',
    '3gp',
    'm4v',
    'flv',
  ];

  if (imageExtensions.includes(extension)) {
    return 'image';
  }

  if (videoExtensions.includes(extension)) {
    return 'video';
  }

  // Handle URLs that might contain query parameters
  if (url.includes('video') || url.includes('mp4')) {
    return 'video';
  }

  return null;
};

/**
 * Asking permission for the app.
 */
export const askForPermission = async () => {
  if (Platform.OS === 'android') {
    await Promise.all([
      await request(PERMISSIONS.ANDROID.CAMERA).then(_res => ({
        type: 'CAMERA',
        permissionType: _res,
      })),
      await checkNotifications().then(_res => {
        if (_res?.status === 'denied') {
          requestNotifications(['alert', 'badge', 'sound']).then(res => ({
            type: 'POST_NOTIFICATIONS',
            permissionType: res,
          }));
        }

        return {
          type: 'POST_NOTIFICATIONS',
          permissionType: _res?.status,
        };
      }),
      await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(_res => ({
        type: 'ACCESS_FINE_LOCATION',
        permissionType: _res,
      })),
      await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION).then(_res => ({
        type: 'ACCESS_COARSE_LOCATION',
        permissionType: _res,
      })),
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE).then(_res => ({
        type: 'READ_EXTERNAL_STORAGE',
        permissionType: _res,
      })),
    ]).then(_res => {
      console.log('Permission - ', JSON.stringify(_res));
    });
  } else {
    await Promise.all([
      await request(PERMISSIONS.IOS.CAMERA).then(_res => ({
        type: 'CAMERA',
        permissionType: _res,
      })),
      await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(async res => {
        if (res === RESULTS.UNAVAILABLE) {
          return {
            type: 'LOCATION_WHEN_IN_USE',
            permissionType: res,
          };
        }
        return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(
          _res => ({
            type: 'LOCATION_WHEN_IN_USE',
            permissionType: _res,
          }),
        );
      }),
      await getMessaging()
        .requestPermission()
        .then(_res => ({
          type: 'NOTIFICATION',
          permissionType: _res,
        })),
    ]).then(_res => {
      console.log('Permission - ', JSON.stringify(_res));
    });
  }
};

/**
 * Fetches the city name based on latitude and longitude using the Google Maps Geocoding API.
 *
 * @param {number} lat - The latitude of the location (default is 23.0204741).
 * @param {number} lng - The longitude of the location (default is 72.4149322).
 * @returns {Promise<string|null>} - Returns the city name as a string if found, otherwise null.
 */
export const getCityFromCoordinates = async (
  lat = 23.0204741,
  lng = 72.4149322,
) => {
  const latitude = lat || 23.0204741;
  const longitude = lng || 72.4149322;

  const url = API.getBaseURL();
  try {
    const accessToken = await AsyncStorage.getItem(storage.ACCESS_TOKEN);
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    if (accessToken) {
      myHeaders.append('Authorization', `Bearer ${accessToken}`);
    }

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
    };
    const response = await fetch(
      `${url}/v1/utils/google-service?urlPart=geocode/json?latlng=${latitude},${longitude}`,
      requestOptions,
    );
    const _data = await response.json();
    const data = JSON.parse(JSON.stringify(_data));
    if (data?.status || data?.statusCode === 200) {
      // Loop through the address components to find the "locality" (city)
      const addressComponents = data?.data?.results?.[0]?.address_components;
      const formattedAddress = data?.data?.results?.[0]?.formatted_address;
      // Remove Plus Codes (e.g., 2CC7+5X) from the formatted address
      const cleanAddress = formattedAddress
        .replace(/\b\w{4}\+\w{3}\b/g, '')
        .trim();

      const cityComponent = addressComponents.find(component =>
        component.types.includes('locality'),
      );

      if (cityComponent) {
        const city = cityComponent.long_name;
        return {city, address: cleanAddress};
      } else {
        console.error('City not found in address components');
        return null;
      }
    } else {
      console.error('Error:', data);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

/**
 * Fetches the user's current location using `GetLocation.getCurrentPosition`
 * and retrieves the corresponding city and address from the coordinates.
 *
 * - Uses high accuracy mode for better precision.
 * - Resolves with an object containing latitude, longitude, and location details.
 * - Logs the retrieved location data to the console.
 * - If an error occurs, it is logged and rejected.
 *
 * @returns {Promise<Object>} A promise that resolves with location data or rejects with an error.
 */
// import GetLocation from 'react-native-get-location';
// export const location = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const accessFineLocation = await check(
//         PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//       );
//       const loc = await GetLocation.getCurrentPosition({
//         timeout: 60000,
//         enableHighAccuracy:
//           Platform.OS === 'ios'
//             ? true
//             : accessFineLocation === 'granted' ||
//               accessFineLocation === 'limited'
//             ? true
//             : false,
//       });

//       const {latitude, longitude} = loc;
//       if (latitude && longitude) {
//         const _data = await getCityFromCoordinates(latitude, longitude);
//         const data = {...(loc || {}), ...(_data || {})};
//         console.log('Location - ', data);
//         resolve(data);
//       }
//       // resolve({
//       //   ...(loc || {}),
//       //   city: 'Ahmedabad',
//       //   address: 'Ahmedabad, Gujarat, India',
//       // });
//     } catch (error) {
//       console.error('Location Error:', error);
//       reject(error);
//     }
//   });
// };

// TODO: do not remove this code.
import Geolocation from '@react-native-community/geolocation';
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'auto',
  locationProvider: 'auto',
  enableBackgroundLocationUpdates: false,
});
export const location = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const locationPermission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      const permission = await check(locationPermission);

      const options = Platform.select({
        ios: {
          timeout: 60000,
          enableHighAccuracy: true, // iOS always uses high accuracy
        },
        android: {
          timeout: 60000,
        },
      });

      Geolocation.getCurrentPosition(
        async ({coords}) => {
          const {latitude, longitude} = coords;
          if (latitude && longitude) {
            const _data = await getCityFromCoordinates(latitude, longitude);
            resolve({...(coords || {}), ...(_data || {})});
          } else {
            reject(new Error('No coordinates received'));
          }
        },
        error => {
          console.error('Location Error:', error);
          reject(error);
        },
        options,
      );
    } catch (error) {
      console.error('Location Error:', error);
      reject(error);
    }
  });
};

/**
 * Requests location permission from the user.
 * @returns {Promise<boolean>} - Returns `true` if permission is granted, otherwise `false`.
 */
const locationPermission = Platform.select({
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
});

export async function requestLocationPermission() {
  try {
    const status = await check(locationPermission);

    if (status === RESULTS.GRANTED) {
      return true;
    }

    if (status === RESULTS.BLOCKED) {
      return false;
    }
    const result = await request(locationPermission);

    switch (result) {
      case RESULTS.GRANTED:
        return true;
      case RESULTS.DENIED:
        return false;
      case RESULTS.BLOCKED:
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
}

/**
 * Opens a map application (e.g., Apple Maps or Google Maps) using either coordinates or an address.
 * @param {string} address - The street address.
 * @param {string} pincode - The postal code or ZIP code.
 * @param {string} city - The city name.
 * @param {number} latitude - The latitude coordinate (optional).
 * @param {number} longitude - The longitude coordinate (optional).
 */
export const openMap = (address, pincode, city, latitude, longitude) => {
  if (latitude && longitude) {
    // Open using coordinates if provided
    const mapAppUrl = `maps://?q=${latitude},${longitude}`; // For Apple Maps
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`; // For Google Maps
    openMapUrl(mapAppUrl, fallbackUrl);
  } else {
    // Open using address if no coordinates are given
    const fullAddress = `${address}, ${city}, ${pincode}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const mapAppUrl = `maps://?q=${encodedAddress}`;
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    openMapUrl(mapAppUrl, fallbackUrl);
  }
};

/**
 * Helper function to open a map URL using the device's default map app or a fallback URL.
 * @param {string} mapAppUrl - The URL for the native map application (e.g., Apple Maps).
 * @param {string} fallbackUrl - The fallback URL (e.g., Google Maps) if the native app is not supported.
 */
const openMapUrl = (mapAppUrl, fallbackUrl) => {
  Linking.canOpenURL(mapAppUrl)
    .then(supported => {
      if (supported) {
        Linking.openURL(mapAppUrl);
      } else {
        Linking.openURL(fallbackUrl);
      }
    })
    .catch(err => {
      console.log('Error opening map:', err);
      Toast.show({message: 'Unable to open map.'});
    });
};

/**
 * Checks if a string contains at least one number.
 * @param {string} str - The string to check.
 * @returns {boolean} - Returns `true` if the string contains a number, otherwise `false`.
 */
export const containsNumber = str => {
  // Use a regular expression to check if the string contains any digit (0-9)
  return /\d/.test(str);
};

/**
 * Check the internet connection status
 * @returns {Promise<boolean>} - Returns true if the device is connected to the internet, otherwise false.
 */
export const checkInternetConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};

/**
 * To generate FCM Token
 *
 * @returns
 */
import {getMessaging, getToken} from '@react-native-firebase/messaging';
import {getApp, getApps, initializeApp} from '@react-native-firebase/app';
export const getFCMToken = async () => {
  try {
    const firebaseConfig = Platform.select({
      ios: {
        apiKey: 'AIzaSyAToGLA6FXh0wH2sbxT2vaomcVoa3KLqIE',
        authDomain: 'yett-69ab1.firebaseapp.com',
        projectId: 'yett-69ab1',
        storageBucket: 'yett-69ab1.firebasestorage.app',
        messagingSenderId: '703859549997',
        appId: '1:703859549997:ios:3c1c7afff567490c2c95a4',
      },
      android: {
        apiKey: 'AIzaSyCWdLJSRzNycuEAMtOZvKTJxWRslb46JvM',
        authDomain: 'yett-69ab1.firebaseapp.com',
        projectId: 'yett-69ab1',
        storageBucket: 'yett-69ab1.firebasestorage.app',
        messagingSenderId: '703859549997',
        appId: '1:703859549997:android:0d1fcff2efed27b32c95a4',
      },
    });

    // Initialize Firebase
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    const fcmToken = await getToken(messaging);
    return fcmToken ? fcmToken : 'yettFCMToken';
  } catch (error) {
    console.log(error);
  }
};

/**
 * Triggers haptic feedback on the device with platform-specific behavior.
 *
 * @param {('impactLight'|'impactMedium'|'impactHeavy'|'rigid'|'soft'|'notificationSuccess'|'notificationWarning'|'notificationError')} [hapticType='impactMedium'] - The type of haptic feedback to trigger (Android only)
 *
 * @example
 * // Default medium impact
 * hapticFeedback();
 *
 * // Specific feedback type
 * hapticFeedback('notificationSuccess');
 */
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
export const hapticFeedback = (hapticType = 'impactMedium') => {
  ReactNativeHapticFeedback.trigger(
    Platform.select({
      ios: 'selection',
      android: hapticType,
    }),
    {
      enableVibrateFallback: false,
      ignoreAndroidSystemSettings: true,
    },
  );
};

/**
 * Creates a promise that resolves after a specified time delay.
 *
 * @param {number} ms - The number of milliseconds to delay
 * @returns {Promise<void>} A promise that resolves after the specified delay
 *
 * @example
 * // Wait for 1 second
 * await sleep(1000);
 *
 * // Use in an async function
 * async function example() {
 *   console.log('Start');
 *   await sleep(2000);
 *   console.log('2 seconds later');
 * }
 */
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Global variable to store the current access token.
 * @type {string}
 */
export let accessToken = '';
