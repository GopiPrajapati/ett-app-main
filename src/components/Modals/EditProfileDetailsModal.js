import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Image,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize, sizes} from '../../commonutils/dimensionutils';
import {
  containsNumber,
  convertToISO8601,
  dateOfBirthFormat,
} from '../../commonutils/helper';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {sendOtp} from '../../redux/actions/authentication';
import Button from '../Button';
import Input from '../Input';
import LToast, {LocalToast} from '../LocalToast';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';
import SelectGenderModal from './SelectGenderModal';
import VerifyOTPModal from './VerifyOTPModal';

const maxDate = new Date();

const EditProfileDetailsModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const global = useSelector(state => state?.global);
  const user = global.user;
  const [formFields, setFormFields] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    mobileNumber: user.mobileNumber?.replace('+91', ''),
    prevPhoneNumber: user.mobileNumber?.replace('+91', ''),
  });
  const [date, setDate] = useState(
    user?.dateOfBirth ? new Date(convertToISO8601(user.dateOfBirth)) : maxDate,
  );
  const [open, setOpen] = useState(false);
  const _firstNameRef = useRef();
  const _lastNameRef = useRef();
  const _genderNameRef = useRef();
  const _phoneNumberRef = useRef();
  const {colors} = useTheme();
  const _selectGenderModalRef = useRef();
  const _verifyOTPModalRef = useRef();
  const dispatch = useDispatch();
  const styles = createStyle(colors);

  useImperativeHandle(ref, () => ({
    open: () => {
      if (visible) {
        return;
      }
      setFormFields({
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        mobileNumber: user.mobileNumber?.replace('+91', ''),
        prevPhoneNumber: user.mobileNumber?.replace('+91', ''),
      });
      setVisible(true);
    },
    close: () => {
      setVisible(false);
    },
  }));

  const handleInputChange = useCallback((fieldName, value) => {
    setFormFields(prevFields => ({...prevFields, [fieldName]: value}));
  }, []);

  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    mobileNumber,
    prevPhoneNumber,
  } = formFields;

  const handleContinue = () => {
    if (!firstName?.trim() || containsNumber(firstName?.trim())) {
      LToast.show({message: 'First Name is required', type: 'info'});
      return;
    }

    if (!lastName?.trim() || containsNumber(lastName?.trim())) {
      LToast.show({message: 'Last Name is required', type: 'info'});
      return;
    }

    if (!gender?.trim()) {
      LToast.show({message: 'Gender is required', type: 'info'});
      return;
    }

    if (!dateOfBirth) {
      LToast.show({message: 'Date of Birth is required', type: 'info'});
      return;
    }

    if (!mobileNumber) {
      LToast.show({message: 'Phone Number is required', type: 'info'});
      return;
    }

    props.onSave(formFields);
  };

  return (
    <Modal
      key={'EditProfileDetailsModal'}
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => ref.current.close()}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={normalize(20)}
            contentContainerStyle={styles.contentContainerStyle}
            keyboardShouldPersistTaps="always">
            <View style={styles.header}>
              <Text style={styles.title}>{strings.edit_profile}</Text>
              <TouchableContainer onPress={() => ref.current.close()}>
                <Image source={images.ic_x_close} style={styles.closeIcon} />
              </TouchableContainer>
            </View>
            <Spacing size={22} />
            <Input
              inputRef={_firstNameRef}
              value={firstName}
              onChangeText={text => {
                handleInputChange('firstName', text);
              }}
              inputTitle={strings.first_name}
              returnKeyType={'next'}
              autoCapitalize="words"
              onSubmitEditing={() => {
                _lastNameRef?.current?.focus();
              }}
            />
            <Spacing size={24} />
            <Input
              inputRef={_lastNameRef}
              value={lastName}
              onChangeText={text => {
                handleInputChange('lastName', text);
              }}
              inputTitle={strings.last_name}
              autoCapitalize="words"
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
              onPressRightIcon={() => {
                _selectGenderModalRef.current?.open(gender);
              }}
              onPress={() => {
                _selectGenderModalRef.current?.open(gender);
              }}
            />
            <Spacing size={24} />
            <Input
              inputTitle={strings.date_of_birth}
              leftIcon={images.ic_calendar}
              leftIconStyle={{tintColor: commonColors.gray}}
              value={dateOfBirthFormat(date)}
              editable={false}
              onPressLeftIcon={() => {
                setOpen(true);
              }}
              onPress={() => {
                setOpen(true);
              }}
            />
            <Spacing size={24} />
            <Input
              inputRef={_phoneNumberRef}
              leftText={'+91'}
              value={mobileNumber}
              editable={false}
              onChangeText={text => {
                handleInputChange('mobileNumber', text);
              }}
              inputTitle={strings.phone_number}
              returnKeyType={'done'}
              inputMode={'numeric'}
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
            />
            <Spacing size={24} />
            <Button
              title={strings.save}
              onPress={() => {
                if (mobileNumber !== prevPhoneNumber) {
                  dispatch(
                    sendOtp(
                      {mobileNumber: mobileNumber},
                      {
                        SuccessCallback: response => {},
                        FailureCallback: response => {},
                      },
                    ),
                  );
                  _verifyOTPModalRef.current?.open(mobileNumber);
                  return;
                }

                handleContinue();
              }}
            />
            <Spacing size={24} />
          </KeyboardAwareScrollView>
        </View>
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
      <VerifyOTPModal
        ref={_verifyOTPModalRef}
        verified={success => {
          if (success) {
            handleContinue();
          }
        }}
      />
      <LocalToast />
    </Modal>
  );
});

export default EditProfileDetailsModal;

const createStyle = colors =>
  StyleSheet.create({
    contentContainerStyle: {paddingVertical: normalize(20)},
    container: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
    },
    formContainer: {
      backgroundColor: colors.editProfileDetailsModalTheme.backgroundColor,
      paddingHorizontal: normalize(20),
      borderRadius: normalize(12),
      maxHeight: Platform.OS === 'ios' ? normalize(607) : normalize(650),
      flex: 1,
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.editProfileDetailsModalTheme.titleColor,
      alignSelf: 'center',
    },
    closeIcon: {
      width: normalize(22),
      height: normalize(22),
      tintColor: commonColors.gray,
    },
  });
