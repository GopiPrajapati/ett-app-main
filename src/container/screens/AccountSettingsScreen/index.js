import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@react-navigation/native';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import strings from '../../../assets/strings';
import {accountSettings} from '../../../commonutils/constants';
import {normalize, sizes} from '../../../commonutils/dimensionutils';
import {
  goBack,
  navigate,
  navigateAndSimpleReset,
} from '../../../commonutils/navigationutils';
import {GlobalStatusBar, Header, Menu, Spacing} from '../../../components';
import Toast from '../../../components/Toast';
import {persistor} from '../../../redux';
import {
  deleteAccount,
  resetData,
  setUserDetails,
  updateUserProfile,
} from '../../../redux/actions';
import {Routes} from '../../Routes';

const AccountSettingsScreen = () => {
  const {colors} = useTheme();
  const global = useSelector(state => state?.global);
  const dispatch = useDispatch();
  const styles = createStyle(colors);
  const {
    firstName,
    lastName,
    gender,
    mobileNumber,
    dateOfBirth,
    profileImage,
    isShareable,
  } = global?.user;

  const callUpdateUserProfile = param => {
    dispatch(
      updateUserProfile(
        {...param},
        {
          SuccessCallback: response => {
            Toast.show({message: response?.message, type: 'success'});
            dispatch(setUserDetails(response?.data?.updatedUser));
          },
          FailureCallback: response => {
            Toast.show({message: response?.data?.message});
          },
        },
      ),
    );
  };

  const onPressDelete = () => {
    dispatch(
      deleteAccount({
        SuccessCallback: async response => {
          await AsyncStorage.clear();
          persistor.purge();
          dispatch(resetData());
          navigateAndSimpleReset(Routes.LOGIN_SIGNUP_SCREEN);
          Toast.show({message: response?.message, type: 'success'});
        },
        FailureCallback: response => {
          Toast.show({
            message: response?.data?.message,
          });
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
        leftText={strings.account_settings}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Spacing size={24} />
          <Menu
            _item={accountSettings[0].options[0]}
            enabled={isShareable}
            onToggle={enabled => {
              callUpdateUserProfile({
                firstName,
                lastName,
                gender,
                mobileNumber,
                dateOfBirth,
                profileImage,
                isShareable: enabled,
              });
            }}
          />
          <Menu
            _item={accountSettings[0].options[1]}
            onPress={() => navigate(Routes.PREFERENCES_SCREEN)}
          />
          <Menu _item={accountSettings[0].options[2]} onPress={onPressDelete} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AccountSettingsScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.accountSettingsTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.accountSettingsTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    scrollContent: {
      paddingBottom: normalize(50),
    },
  });
