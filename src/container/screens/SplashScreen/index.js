import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import Video from 'react-native-video';
import {useDispatch} from 'react-redux';
import videos from '../../../assets/videos';
import {fontPixel, normalize} from '../../../commonutils/dimensionutils';
import * as helper from '../../../commonutils/helper';
import {requestLocationPermission} from '../../../commonutils/helper';
import {navigateAndSimpleReset} from '../../../commonutils/navigationutils';
import storage from '../../../commonutils/storage';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import API, {Headers} from '../../../networking/NetworkService';
import {setIsLocationSwitched} from '../../../redux/actions';
import {Routes} from '../../Routes';

const SplashScreen = () => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const styles = createStyle(colors);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const isLogin = await AsyncStorage.getItem(storage.IS_LOGIN);
      const accessToken = await AsyncStorage.getItem(storage.ACCESS_TOKEN);
      const isLocationEnabled = await requestLocationPermission();
      if (isLogin && accessToken && !isLocationEnabled) {
        if (accessToken) {
          API.getInstance().setHeader(
            Headers.AUTHORIZATION,
            `Bearer ${accessToken}`,
          );
          helper.accessToken = accessToken;
        }

        navigateAndSimpleReset(Routes.YETT_NOT_AVAILABLE_SCREEN);
      } else {
        if (isLogin && accessToken && isLocationEnabled) {
          if (accessToken) {
            API.getInstance().setHeader(
              Headers.AUTHORIZATION,
              `Bearer ${accessToken}`,
            );
            helper.accessToken = accessToken;
          }
          dispatch(setIsLocationSwitched(false));
        }

        navigateAndSimpleReset(Routes.YETT_BOTTOM_TAB_BAR);
      }
    }, 5000);

    () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        translucent={true}
        backgroundColor={commonColors.transparent}
        hidden={true}
        barStyle={'dark-content'}
      />
      <Video
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
        source={videos.splash_animation_yett}
        repeat={false}
        resizeMode="cover"
      />
      {/*
      {!global?.isDarkMode ? (
        <FastImage
          source={images.ic_background}
          style={styles.backgroundImage}
        />
      ) : (
        <React.Fragment />
      )}
      <View style={styles.container}>
        <Spacing size={172} /> 
        <Image
          source={images.ic_app_name}
          style={styles.appName}
          resizeMode="contain"
        />
        <Spacing size={24} />
        <Text style={styles.tagLine}>
          {strings.for_every_shopping_move_you_make}
        </Text>
      </View> */}
    </View>
  );
};

export default SplashScreen;

const createStyle = colors =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: commonColors.white,
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    container: {
      flex: 1,
      alignItems: 'center',
    },
    appName: {
      width: normalize(135),
      height: normalize(70),
      tintColor: colors.splashTheme.appName,
    },
    tagLine: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(16),
      color: colors.splashTheme.tagLine,
    },
  });
