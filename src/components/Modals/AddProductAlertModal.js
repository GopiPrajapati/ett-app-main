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
import {dateOfBirthFormat} from '../../commonutils/helper';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {createProductAlert} from '../../redux/actions';
import Button from '../Button';
import Input from '../Input';
import LToast, {LocalToast} from '../LocalToast';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';
import Loader from './LoaderModal';

const minimumDate = new Date();

const AddProductAlertModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [formFields, setFormFields] = useState({
    productName: '',
    description: '',
    productId: '',
    notificationExpiry: '',
  });
  const [date, setDate] = useState(minimumDate);
  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const dispatch = useDispatch(undefined);
  const global = useSelector(state => state?.global);
  const _productNamerRef = useRef();
  const _descriptionRef = useRef();
  const _productIdRef = useRef();
  const _notificationExpiryRef = useRef();
  const {colors} = useTheme();
  const styles = createStyle(colors);

  useImperativeHandle(ref, () => ({
    open: _storeId => {
      if (visible) {
        return;
      }
      setStoreId(_storeId);
      setVisible(true);
    },
    close: () => {
      setStoreId(undefined);
      setFormFields({
        productName: '',
        description: '',
        productId: '',
        notificationExpiry: '',
      });
      setVisible(false);
    },
  }));

  const handleInputChange = useCallback((fieldName, value) => {
    setFormFields(prevFields => ({...prevFields, [fieldName]: value}));
  }, []);

  const {productName, description, productId, notificationExpiry} = formFields;

  const {firstName, mobileNumber} = global.user;

  const onPressAdd = () => {
    if (!productName?.trim()) {
      LToast.show({
        message: 'Product Name is required',
        type: 'info',
      });
      return;
    }

    if (!description?.trim()) {
      LToast.show({
        message: 'Description is required',
        type: 'info',
      });
      return;
    }

    if (!productId?.trim()) {
      LToast.show({message: 'ProductID required', type: 'info'});
      return;
    }

    if (!notificationExpiry) {
      LToast.show({
        message: 'Notification Expiry Date is required',
        type: 'info',
      });
      return;
    }

    setTimeout(() => {
      Loader.show({key: 'AddProductAlertModal'});
      dispatch(
        createProductAlert(
          storeId,
          {
            mobileNumber: mobileNumber,
            firstName: firstName,
            productName: productName,
            hnuCode: productId,
            description: description,
            expiryDate: notificationExpiry,
          },
          {
            SuccessCallback: response => {
              Loader.hide({key: 'AddProductAlertModal'});
              ref?.current?.close();
              setTimeout(() => {
                props?.onPressAdd({productName, description});
              }, 500);
            },
            FailureCallback: response => {
              Loader.hide({key: 'AddProductAlertModal'});
              ref.current.close();
            },
          },
        ),
      );
    }, 500);
  };

  return (
    <Modal
      key={'AddProductAlertModal'}
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => ref.current.close()}
      style={styles.modal}>
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
              <Text style={styles.title}>{strings.add_product_alert}</Text>
              <TouchableContainer onPress={() => ref.current.close()}>
                <Image source={images.ic_x_close} style={styles.closeIcon} />
              </TouchableContainer>
            </View>
            <Spacing size={22} />
            <Input
              inputRef={_productNamerRef}
              value={productName}
              onChangeText={text => {
                handleInputChange('productName', text);
              }}
              autoCapitalize="words"
              inputTitle={strings.product_name}
              returnKeyType={'next'}
              onSubmitEditing={() => {
                _descriptionRef?.current?.focus();
              }}
            />
            <Spacing size={24} />
            <Input
              inputRef={_descriptionRef}
              value={description}
              onChangeText={text => {
                handleInputChange('description', text);
              }}
              inputTitle={strings.description}
              returnKeyType={'next'}
              onSubmitEditing={() => {
                _productIdRef?.current?.focus();
              }}
            />
            <Spacing size={24} />
            <Input
              inputRef={_productIdRef}
              inputTitle={strings.product_id}
              value={productId}
              onChangeText={text => {
                handleInputChange('productId', text?.trim());
              }}
              returnKeyType={'done'}
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
              autoCapitalize="characters"
            />
            <Spacing size={24} />
            <Input
              inputRef={_notificationExpiryRef}
              value={dateOfBirthFormat(notificationExpiry)}
              leftIcon={images.ic_calendar}
              leftIconStyle={{tintColor: commonColors.gray}}
              inputTitle={strings.notification_expiry_date}
              editable={false}
              onPressLeftIcon={() => {
                setOpen(true);
              }}
              onPress={() => {
                setOpen(true);
              }}
            />
            <Spacing size={24} />
            <Button title={strings.add} onPress={onPressAdd} />
            {Platform.OS === 'android' ? (
              <Spacing size={24} />
            ) : (
              <React.Fragment />
            )}
          </KeyboardAwareScrollView>
        </View>
      </View>
      <DatePicker
        modal={true}
        date={date}
        open={open}
        mode="date"
        minimumDate={minimumDate}
        onConfirm={selectedDate => {
          setOpen(false);
          setDate(selectedDate);
          handleInputChange('notificationExpiry', selectedDate);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <LocalToast />
    </Modal>
  );
});

export default AddProductAlertModal;

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
      backgroundColor: colors.addProductAlertModalTheme.backgroundColor,
      paddingHorizontal: normalize(20),
      borderRadius: normalize(12),
      maxHeight: normalize(540),
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
      color: colors.addProductAlertModalTheme.titleColor,
      alignSelf: 'center',
    },
    closeIcon: {
      width: normalize(22),
      height: normalize(22),
      tintColor: commonColors.gray,
    },
  });
