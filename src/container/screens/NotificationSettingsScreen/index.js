import {useTheme} from '@react-navigation/native';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import strings from '../../../assets/strings';
import {notificationSettings} from '../../../commonutils/constants';
import {normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {GlobalStatusBar, Header, Menu, Spacing} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import {setUserDetails, updateUserSetting} from '../../../redux/actions';
import {Routes} from '../../Routes';

const NotificationSettingsScreen = () => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const global = useSelector(state => state.global);
  const styles = createStyle(colors);

  const {userSetting} = global?.user;

  const callUpdateUserSetting = param => {
    dispatch(
      updateUserSetting(param, {
        SuccessCallback: response => {
          dispatch(setUserDetails(response?.data));
          Loader.hide({key: Routes.NOTIFICATION_SETTINGS_SCREEN});
        },
        FailureCallback: response => {
          Loader.hide({key: Routes.NOTIFICATION_SETTINGS_SCREEN});
        },
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.notification_settings}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Spacing size={24} />
          <Menu
            _item={notificationSettings[0].options[0]}
            onToggle={enabled => {
              Loader.show({key: Routes.NOTIFICATION_SETTINGS_SCREEN});
              callUpdateUserSetting({isEnabledAll: enabled});
            }}
            enabled={userSetting?.isEnableAll}
          />
          <Menu
            _item={notificationSettings[0].options[1]}
            onToggle={enabled => {
              Loader.show({key: Routes.NOTIFICATION_SETTINGS_SCREEN});
              callUpdateUserSetting({isPromosAndOffers: enabled});
            }}
            enabled={userSetting?.isPromosAndOffers}
          />
          <Menu
            _item={notificationSettings[0].options[2]}
            onToggle={enabled => {
              Loader.show({key: Routes.NOTIFICATION_SETTINGS_SCREEN});
              callUpdateUserSetting({isProductAlert: enabled});
            }}
            enabled={userSetting?.isProductAlert}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.notificationSettingsTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor:
        colors.notificationSettingsTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    scrollContent: {
      paddingBottom: normalize(50),
    },
  });
