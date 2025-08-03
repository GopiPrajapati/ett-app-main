import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useTheme} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {profileMenu} from '../../../commonutils/constants';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {convertToISO8601, dateOfBirthFormat} from '../../../commonutils/helper';
import {
  goBack,
  navigate,
  navigateAndSimpleReset,
} from '../../../commonutils/navigationutils';
import storage from '../../../commonutils/storage';
import {fontStyles} from '../../../commonutils/typography';
import {
  Button,
  EditProfileDetailsModal,
  EditProfilePictureModal,
  GlobalStatusBar,
  Header,
  Spacing,
  TouchableContainer,
  ViewProfilePictureModal,
} from '../../../components';
import Menu, {CategoryTitle} from '../../../components/Menu';
import Toast from '../../../components/Toast';
import {persistor} from '../../../redux';
import {
  getUserProfile,
  logout,
  resetData,
  setThemeMode,
  setUserDetails,
  updateUserProfile,
} from '../../../redux/actions';
import {Routes} from '../../Routes';
import * as helper from '../../../commonutils/helper';
import API, {Headers} from '../../../networking/NetworkService';
import {disconnect} from '../../../assets/socketIO.js';

const ProfileScreen = () => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const global = useSelector(state => state?.global);
  const _editProfilePictureModalRef = useRef();
  const _editProfileDetailsModalRef = useRef();
  const _viewProfilePictureModalRef = useRef();
  const isFocused = useIsFocused();
  const {firstName, lastName, gender, mobileNumber, dateOfBirth, profileImage} =
    global.user;
  const {isUserLoggedIn} = global;
  const styles = createStyle(colors);

  useEffect(() => {
    if (isFocused && isUserLoggedIn) {
      dispatch(
        getUserProfile({
          SuccessCallback: response => {},
          FailureCallback: response => {},
        }),
      );
    }
  }, [isFocused, isUserLoggedIn]);

  const onPressSave = data => {
    const param = {...data};
    delete param.prevPhoneNumber;
    callUpdateUserProfile(param);
  };

  const callUpdateUserProfile = param => {
    dispatch(
      updateUserProfile(
        {...param},
        {
          SuccessCallback: response => {
            _editProfileDetailsModalRef?.current?.close();
            Toast.show({message: response?.message, type: 'success'});
            dispatch(setUserDetails(response?.data?.updatedUser));
          },
          FailureCallback: response => {
            _editProfileDetailsModalRef?.current?.close();
            Toast.show({message: response?.data?.message});
          },
        },
      ),
    );
  };

  const callLogout = async () => {
    dispatch(
      logout({
        SuccessCallback: async response => {
          if (response?.status) {
            Toast.show({message: response?.message, type: 'success'});
          }
          dispatch(resetData());
          helper.accessToken = '';
          const keys = await AsyncStorage.getAllKeys();
          keys.map(async key => {
            if (key !== storage.WALK_THROUGH_GUIDE)
              await AsyncStorage.removeItem(key);
          });
          await persistor.purge();
          API.getInstance().setHeader(Headers.AUTHORIZATION, ``);
          disconnect();
          setTimeout(() => {
            navigateAndSimpleReset(Routes.YETT_BOTTOM_TAB_BAR);
          }, 500);
        },
        FailureCallback: response => {},
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.profile}
        notification
        notificationBadge={false}
        inbox
        inboxBadge={false}
        onPressInbox={() => navigate(Routes.INBOX_SCREEN)}
      />
      {isUserLoggedIn ? (
        <View style={styles.profileContainer}>
          <View>
            <TouchableContainer
              disabled={!profileImage}
              onPress={() => _viewProfilePictureModalRef.current?.open()}>
              <Image
                source={
                  profileImage ? {uri: profileImage} : images.ic_default_user
                }
                style={styles.profileImage}
                resizeMode="contain"
              />
            </TouchableContainer>
            <TouchableContainer
              onPress={() => {
                _editProfilePictureModalRef.current?.open();
              }}>
              <Image
                source={images.ic_edit_profile_pic}
                style={styles.editProfileIcon}
                resizeMode="contain"
              />
            </TouchableContainer>
          </View>
          <Spacing size={20} direction="x" />
          <View style={{flex: 1}}>
            <Text
              style={[
                fontStyles.archivoBold,
                styles.userName,
                {color: colors.profileTheme.color},
              ]}
              numberOfLines={1}>
              {`${firstName} ${lastName}`}
            </Text>
            <Spacing size={4} />
            <Text style={styles.userDetails}>
              {gender} •{' '}
              {dateOfBirthFormat(new Date(convertToISO8601(dateOfBirth)))}
            </Text>
            <Spacing size={4} />
            <Text style={styles.userDetails}>{mobileNumber}</Text>
          </View>
          <Spacing size={20} direction="x" />
          <TouchableContainer
            onPress={() => {
              _editProfileDetailsModalRef.current?.open();
            }}
            styles={[styles.editButton]}>
            <Image
              source={images.ic_edit_user}
              style={styles.editIcon}
              resizeMode="contain"
            />
          </TouchableContainer>
        </View>
      ) : (
        <View style={{paddingHorizontal: sizes.paddingHorizontal}}>
          <Spacing size={30} />
          <Button
            title="Login/SignUp"
            onPress={() => navigate(Routes.LOGIN_SIGNUP_SCREEN)}
          />
          <Spacing size={50} />
        </View>
      )}
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}>
          <Spacing size={24} />
          {/** Payments */}
          {isUserLoggedIn && <CategoryTitle title={profileMenu[0].title} />}
          {/* <Menu _item={profileMenu[0].options[0]} onPress={() => {}} /> */}
          {isUserLoggedIn && (
            <Menu
              _item={profileMenu[0].options[1]}
              onPress={() => navigate(Routes.RECEIPTS_SCREEN)}
            />
          )}
          {/** Manage */}
          <CategoryTitle title={profileMenu[1].title} />
          {isUserLoggedIn && (
            <Menu
              _item={profileMenu[1].options[0]}
              onPress={() => navigate(Routes.FAVOURITES_SCREEN)}
            />
          )}
          {isUserLoggedIn && (
            <Menu
              _item={profileMenu[1].options[1]}
              onPress={() => {
                navigate(Routes.ACCOUNT_SETTINGS_SCREEN);
              }}
            />
          )}
          {isUserLoggedIn && (
            <Menu
              _item={profileMenu[1].options[2]}
              onPress={() => {
                navigate(Routes.NOTIFICATION_SETTINGS_SCREEN);
              }}
            />
          )}
          <Menu
            _item={{...profileMenu[1].options[3]}}
            onToggle={async enabled => {
              const mode = enabled ? 'dark' : 'light';
              dispatch(setThemeMode(mode));
              await AsyncStorage.setItem(storage.THEME_MODE, mode);
            }}
            enabled={global?.isDarkMode}
          />
          {/** Support */}
          <CategoryTitle title={profileMenu[2].title} />
          <Menu
            _item={profileMenu[2].options[0]}
            onPress={() => {
              navigate(Routes.HELP_CENTER_SCREEN);
            }}
          />
          {isUserLoggedIn && (
            <Menu
              _item={profileMenu[2].options[1]}
              onPress={() => {
                navigate(Routes.SHARE_FEEDBACK_SCREEN);
              }}
            />
          )}
          {/** More */}
          <CategoryTitle title={profileMenu[3].title} />
          <Menu
            _item={profileMenu[3].options[0]}
            onPress={() => {
              navigate(Routes.ABOUT_US_SCREEN);
            }}
          />
          {isUserLoggedIn && (
            <Menu _item={profileMenu[3].options[1]} onPress={callLogout} />
          )}
        </ScrollView>
      </View>
      <EditProfilePictureModal
        ref={_editProfilePictureModalRef}
        onPressEvent={type => {}}
      />
      <EditProfileDetailsModal
        ref={_editProfileDetailsModalRef}
        onSave={onPressSave}
      />
      <ViewProfilePictureModal ref={_viewProfilePictureModalRef} />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.profileTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.profileTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    scrollContent: {flexGrow: 1},
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: normalize(24),
      paddingHorizontal: sizes.paddingHorizontal,
    },
    profileImage: {
      width: normalize(80),
      height: normalize(80),
      borderRadius: 100,
      backgroundColor: 'rgba(91,124,234,0.24)',
    },
    editProfileIcon: {
      width: normalize(24),
      height: normalize(24),
      position: 'absolute',
      right: 0,
      bottom: 0,
    },
    userName: {
      fontSize: fontPixel(18),
    },
    userDetails: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
    editButton: {
      width: normalize(40),
      height: normalize(40),
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.profileTheme.editButtonBackgroundColor,
    },
    editIcon: {
      width: normalize(20),
      height: normalize(20),
    },
  });
