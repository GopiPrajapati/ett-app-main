import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  _navigationRef,
  navigateAndSimpleReset,
} from '../commonutils/navigationutils';
import storage from '../commonutils/storage';
import {colors} from '../commonutils/theme';
import {LoaderModal} from '../components/Modals/LoaderModal';
import {LoginSignup} from '../components/Modals/LoginSignupModal';
import {GlobalToast} from '../components/Toast';
import useNetwork from '../hooks/useNetwork';
import {setThemeMode} from '../redux/actions';
import {Routes} from './Routes';
import {
  AboutUsScreen,
  AccountSettingsScreen,
  BrandAndMallDetailsScreen,
  ChatScreen,
  ConversationScreen,
  FavouritesCategoryScreen,
  FavouritesScreen,
  HelpCenterScreen,
  InboxScreen,
  LoginSignupScreen,
  NotificationScreen,
  NotificationSettingsScreen,
  OTPVerificationScreen,
  PreferencesScreen,
  PrivacyPolicyScreen,
  ProductsScreen,
  ProfileInfoScreen,
  ReceiptsScreen,
  SearchScreen,
  SelectPreferencesScreen,
  ShareFeedbackScreen,
  SplashScreen,
  StoresScreen,
  StoryScreen,
  TermsAndConditionsScreen,
  UpcomingEventsScreen,
  ViewReceiptScreen,
  WriteReviewScreen,
  YettNotAvailableScreen,
} from './screens';
import YettBottomTabBar from './screens/YettBottomTabBar';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const global = useSelector(state => state?.global);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const _routeNameRef = useRef();
  const styles = createStyle();
  const {isConnected} = useNetwork();

  useEffect(() => {
    if (!isConnected) {
      navigateAndSimpleReset(Routes.YETT_NOT_AVAILABLE_SCREEN);
    }
  }, [isConnected]);

  useEffect(() => {
    const setUp = async () => {
      var themeMode = null;
      themeMode = await AsyncStorage.getItem(storage.THEME_MODE);
      dispatch(setThemeMode(themeMode || colorScheme));
    };

    setUp();
  }, [colorScheme, dispatch]);

  const onStateChange = useCallback(() => {
    const _currentScreenName = _navigationRef.current.getCurrentRoute().name;
    console.log(`current-screen: ${_currentScreenName}`);
    _routeNameRef.current = _currentScreenName;
  }, []);

  return (
    <NavigationContainer
      key={'navigation-container'}
      ref={_navigationRef}
      theme={global.isDarkMode ? colors?.dark : colors?.light}
      onReady={() => {
        const _name = _navigationRef.current?.getCurrentRoute()?.name;
        _routeNameRef.current = _name;
      }}
      onStateChange={onStateChange}>
      <SafeAreaProvider style={styles.navigationContainer}>
        <GlobalToast />
        <Stack.Navigator
          key="root-navigator"
          initialRouteName={Routes.SPLASH_SCREEN}>
          <Stack.Screen
            key={Routes.SPLASH_SCREEN}
            name={Routes.SPLASH_SCREEN}
            component={SplashScreen}
            options={{headerShown: false, animation: 'fade'}}
          />
          <Stack.Screen
            key={Routes.LOGIN_SIGNUP_SCREEN}
            name={Routes.LOGIN_SIGNUP_SCREEN}
            component={LoginSignupScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.OTP_VERIFICATION_SCREEN}
            name={Routes.OTP_VERIFICATION_SCREEN}
            component={OTPVerificationScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.PROFILE_INFO_SCREEN}
            name={Routes.PROFILE_INFO_SCREEN}
            component={ProfileInfoScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.SELECT_PREFERENCES_SCREEN}
            name={Routes.SELECT_PREFERENCES_SCREEN}
            component={SelectPreferencesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.YETT_BOTTOM_TAB_BAR}
            name={Routes.YETT_BOTTOM_TAB_BAR}
            component={YettBottomTabBar}
            options={{headerShown: false, animation: 'fade'}}
          />
          <Stack.Screen
            key={Routes.TERMS_AND_CONDITIONS_SCREEN}
            name={Routes.TERMS_AND_CONDITIONS_SCREEN}
            component={TermsAndConditionsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.PRIVACY_POLICY_SCREEN}
            name={Routes.PRIVACY_POLICY_SCREEN}
            component={PrivacyPolicyScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.NOTIFICATION_SETTINGS_SCREEN}
            name={Routes.NOTIFICATION_SETTINGS_SCREEN}
            component={NotificationSettingsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.ACCOUNT_SETTINGS_SCREEN}
            name={Routes.ACCOUNT_SETTINGS_SCREEN}
            component={AccountSettingsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.WRITE_REVIEW_SCREEN}
            name={Routes.WRITE_REVIEW_SCREEN}
            component={WriteReviewScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.SHARE_FEEDBACK_SCREEN}
            name={Routes.SHARE_FEEDBACK_SCREEN}
            component={ShareFeedbackScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.HELP_CENTER_SCREEN}
            name={Routes.HELP_CENTER_SCREEN}
            component={HelpCenterScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.ABOUT_US_SCREEN}
            name={Routes.ABOUT_US_SCREEN}
            component={AboutUsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.INBOX_SCREEN}
            name={Routes.INBOX_SCREEN}
            component={InboxScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.NOTIFICATION_SCREEN}
            name={Routes.NOTIFICATION_SCREEN}
            component={NotificationScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.RECEIPTS_SCREEN}
            name={Routes.RECEIPTS_SCREEN}
            component={ReceiptsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.PREFERENCES_SCREEN}
            name={Routes.PREFERENCES_SCREEN}
            component={PreferencesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.FAVOURITES_SCREEN}
            name={Routes.FAVOURITES_SCREEN}
            component={FavouritesScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.FAVOURITES_CATEGORY_SCREEN}
            name={Routes.FAVOURITES_CATEGORY_SCREEN}
            component={FavouritesCategoryScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.UPCOMING_EVENTS_SCREEN}
            name={Routes.UPCOMING_EVENTS_SCREEN}
            component={UpcomingEventsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.PRODUCTS_SCREEN}
            name={Routes.PRODUCTS_SCREEN}
            component={ProductsScreen}
            options={{headerShown: false}}
            getId={({params}) => `${params?.id}`}
          />
          <Stack.Screen
            key={Routes.BRAND_AND_MALL_DETAILS_SCREEN}
            name={Routes.BRAND_AND_MALL_DETAILS_SCREEN}
            component={BrandAndMallDetailsScreen}
            options={{headerShown: false, animation: 'fade'}}
            getId={({params}) => `${params?.id}`}
          />
          <Stack.Screen
            key={Routes.CHAT_SCREEN}
            name={Routes.CHAT_SCREEN}
            component={ChatScreen}
            options={{headerShown: false}}
            getId={({params}) => `${params?.id}`}
          />
          <Stack.Screen
            key={Routes.CONVERSATION_SCREEN}
            name={Routes.CONVERSATION_SCREEN}
            component={ConversationScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.VIEW_RECEIPT_SCREEN}
            name={Routes.VIEW_RECEIPT_SCREEN}
            component={ViewReceiptScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.STORY_SCREEN}
            name={Routes.STORY_SCREEN}
            component={StoryScreen}
            options={{headerShown: false, animation: 'fade'}}
          />
          <Stack.Screen
            key={Routes.SEARCH_SCREEN}
            name={Routes.SEARCH_SCREEN}
            component={SearchScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            key={Routes.YETT_NOT_AVAILABLE_SCREEN}
            name={Routes.YETT_NOT_AVAILABLE_SCREEN}
            component={YettNotAvailableScreen}
            options={{headerShown: false, animation: 'fade'}}
          />
          <Stack.Screen
            key={Routes.STORES_SCREEN}
            name={Routes.STORES_SCREEN}
            component={StoresScreen}
            options={{headerShown: false}}
            getId={({params}) => `${params?.id}`}
          />
        </Stack.Navigator>
        <LoaderModal />
        <LoginSignup />
      </SafeAreaProvider>
    </NavigationContainer>
  );
};

export default React.memo(RootNavigator);

const createStyle = () =>
  StyleSheet.create({
    navigationContainer: {
      flex: 1,
    },
  });
