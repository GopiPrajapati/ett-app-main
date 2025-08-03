import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {Keyboard, StyleSheet, Text, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {
  containsNumber,
  dateOfBirthFormat,
  getFCMToken,
  requestLocationPermission,
} from '../../../commonutils/helper';
import {
  goBack,
  navigateAndSimpleReset,
} from '../../../commonutils/navigationutils';
import storage from '../../../commonutils/storage';
import {fontStyles} from '../../../commonutils/typography';
import {
  Button,
  CheckBox,
  GlobalStatusBar,
  Header,
  Input,
  SelectGenderModal,
  Spacing,
} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import Toast from '../../../components/Toast';
import {setUserDetails} from '../../../redux/actions';
import {signup} from '../../../redux/actions/authentication';
import {Routes} from '../../Routes';

const ProfileInfoScreen = props => {
  const {colors} = useTheme();
  const [formFields, setFormFields] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    isShareable: true,
    mobileNumber: props?.route?.params?.mobileNumber,
  });

  const maxDate = new Date();
  const [date, setDate] = useState(maxDate);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const _firstNameRef = useRef();
  const _lastNameRef = useRef();
  const _genderNameRef = useRef();
  const _selectGenderModalRef = useRef();
  const styles = createStyle(colors);

  const handleInputChange = useCallback((fieldName, value) => {
    setFormFields(prevFields => ({...prevFields, [fieldName]: value}));
  }, []);

  const onPressContinue = async () => {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      isShareable,
      mobileNumber,
    } = formFields;

    const fcmToken = await getFCMToken();

    if (!firstName?.trim() || containsNumber(firstName?.trim())) {
      Toast.show({message: 'First Name is required', type: 'info'});
      return;
    }

    if (!lastName?.trim() || containsNumber(lastName?.trim())) {
      Toast.show({message: 'Last Name is required', type: 'info'});
      return;
    }

    if (!gender?.trim()) {
      Toast.show({message: 'Gender is required', type: 'info'});
      return;
    }

    if (!dateOfBirth) {
      Toast.show({message: 'Date of Birth is required', type: 'info'});
      return;
    }

    if (!isShareable) {
      Toast.show({
        message: 'Please agree to share your contact details',
        type: 'info',
      });
      return;
    }

    Loader.show({key: Routes.PROFILE_INFO_SCREEN});

    dispatch(
      signup(
        {
          firstName,
          lastName,
          dateOfBirth: date,
          gender,
          userType: 'Customer',
          isShareable,
          mobileNumber: mobileNumber?.replace('+91', ''),
          fcmToken,
        },
        {
          SuccessCallback: async response => {
            Loader.hide({key: Routes.PROFILE_INFO_SCREEN});
            dispatch(setUserDetails(response?.data?.user));
            await AsyncStorage.setItem(storage.IS_LOGIN, 'true');
            navigateOnOtherScreen();
          },
          FailureCallback: async response => {
            Loader.hide({key: Routes.PROFILE_INFO_SCREEN});
            if (response?.data?.message === 'Customer Already Exist') {
              await AsyncStorage.setItem(storage.IS_LOGIN, 'true');
              navigateOnOtherScreen();
            }
            if (response?.data?.message) {
              Toast.show({message: response?.data?.message});
            }
          },
        },
      ),
    );
  };

  const navigateOnOtherScreen = async () => {
    const isLocationEnabled = await requestLocationPermission();
    if (isLocationEnabled) {
      navigateAndSimpleReset(Routes.YETT_BOTTOM_TAB_BAR);
    } else {
      navigateAndSimpleReset(Routes.YETT_NOT_AVAILABLE_SCREEN);
    }
  };

  const {firstName, lastName, gender, dateOfBirth} = formFields;

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'bottom']}>
      <GlobalStatusBar barStyle="light-content" />
      <Header
        leftArrowTintColor={'#fff'}
        back={true}
        onPressLeftArrow={goBack}
      />
      <View style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={normalize(20)}
          bounces={false}
          keyboardShouldPersistTaps="always">
          <Text style={styles.otpVerificationText}>{strings.profile_info}</Text>
          <Spacing size={12} />
          <Text style={styles.otpVerificationSubText}>
            {strings.please_enter_your_details_to_get_started}
          </Text>
          <Spacing size={24} />
          <View style={styles.profileInfoContainer}>
            <Input
              inputRef={_firstNameRef}
              value={firstName}
              onChangeText={text => {
                handleInputChange('firstName', text);
              }}
              inputTitle={strings.first_name}
              rightIcon={images.ic_user}
              autoCapitalize="words"
              returnKeyType={'next'}
              onSubmitEditing={() => {
                _lastNameRef?.current?.focus();
              }}
            />
            <Spacing size={24} />
            <Input
              inputRef={_lastNameRef}
              value={lastName}
              autoCapitalize="words"
              onChangeText={text => {
                handleInputChange('lastName', text);
              }}
              inputTitle={strings.last_name}
              rightIcon={images.ic_user}
              returnKeyType={'done'}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                // _selectGenderModalRef.current?.open(gender);
              }}
            />
            <Spacing size={24} />
            <Input
              inputRef={_genderNameRef}
              inputTitle={strings.gender}
              value={gender}
              rightIcon={images.ic_chevron_down}
              editable={false}
              onPress={() => {
                _selectGenderModalRef.current?.open(gender);
              }}
              onPressRightIcon={() => {
                _selectGenderModalRef.current?.open(gender);
              }}
            />
            <Spacing size={24} />
            <Input
              inputTitle={strings.date_of_birth}
              rightIcon={images.ic_calendar}
              value={dateOfBirthFormat(date)}
              editable={false}
              onPressRightIcon={() => {
                setOpen(true);
              }}
              onPress={() => {
                setOpen(true);
              }}
            />
            <Spacing size={24} />
            <View style={styles.checkboxContainer}>
              <CheckBox
                checkboxStatus={checked => {
                  handleInputChange('isShareable', checked);
                }}
              />
              <Spacing size={8} direction="x" />
              <Text style={styles.contactDetailsText}>
                {
                  strings.share_your_contact_details_with_just_the_brands_you_shop_from
                }
              </Text>
            </View>
            <Spacing size={32} />
            <Button
              buttonType="primaryButton"
              title={strings.continue}
              onPress={onPressContinue}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
      <SelectGenderModal
        ref={_selectGenderModalRef}
        onPressGender={item => {
          handleInputChange('gender', item.type);
        }}
      />
      <DatePicker
        modal={true}
        date={date}
        open={open}
        mode="date"
        onConfirm={selectedDate => {
          setOpen(false);
          setDate(selectedDate);
          handleInputChange('dateOfBirth', selectedDate);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </SafeAreaView>
  );
};

export default ProfileInfoScreen;

const createStyle = colors =>
  StyleSheet.create({
    backgroundImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.profileInfoTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
    },
    otpVerificationText: {
      ...fontStyles.archivoBold,
      textAlign: 'center',
      fontSize: fontPixel(28),
      color: '#fff',
    },
    otpVerificationSubText: {
      ...fontStyles.archivoRegular,
      textAlign: 'center',
      fontSize: fontPixel(14),
      color: 'rgba(255,255,255,0.48)',
    },
    number: {
      ...fontStyles.archivoMedium,
      textAlign: 'center',
      fontSize: fontPixel(14),
      color: 'rgba(255,255,255,1)',
    },
    profileInfoContainer: {
      padding: normalize(20),
      borderRadius: normalize(16),
      backgroundColor:
        colors.profileInfoTheme.profileInfoContainerBackgroundColor,
      marginHorizontal: sizes.marginHorizontal,
      flex: 1,
    },
    textMessageTitle: {
      ...fontStyles.archivoRegular,
      textAlign: 'center',
      fontSize: fontPixel(14),
      color: '#828282',
    },
    resendTextContainer: {
      textAlign: 'center',
    },
    didnGetOtpText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
    resendOtpButtonText: {
      ...fontStyles.archivoSemiBold,
      fontSize: fontPixel(14),
      color: colors.profileInfoTheme.resendOtpTextColor,
    },
    contactDetailsText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.profileInfoTheme.contactDetailsTextColor,
      flex: 1,
      lineHeight: fontPixel(14),
    },
    checkboxContainer: {flexDirection: 'row', width: '100%'},
  });
