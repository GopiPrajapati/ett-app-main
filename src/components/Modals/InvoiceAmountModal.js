import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {
  fontPixel,
  normalize,
  screenHeight,
  sizes,
} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {uploadReceipt} from '../../redux/actions';
import Button from '../Button';
import Input from '../Input';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const InvoiceAmountModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const dispatch = useDispatch();
  const [formFields, setFormFields] = useState({
    amount: '',
  });
  const {colors} = useTheme();
  const styles = createStyle(colors);

  useImperativeHandle(ref, () => ({
    open: (_storeId, _receiptImage) => {
      if (visible) {
        return;
      }
      handleInputChange('amount', '');
      setReceiptImage(_receiptImage);
      setStoreId(_storeId);
      setVisible(true);
    },
    close: () => {
      setVisible(false);
      setReceiptImage(null);
      setStoreId(null);
    },
  }));

  const handleInputChange = useCallback((fieldName, value) => {
    setFormFields(prevFields => ({...prevFields, [fieldName]: value}));
  }, []);

  const {amount} = formFields;
  const {top} = useSafeAreaInsets();
  return (
    <Modal
      key={'InvoiceAmountModal'}
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => ref.current.close()}
      style={styles.modal}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            height: screenHeight + top,
            position: 'absolute',
            ...StyleSheet.absoluteFillObject,
          }}>
          {receiptImage && (
            <Image
              source={{uri: receiptImage}}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
          )}
          {Platform.OS === 'ios' ? (
            <BlurView
              blurType="dark"
              blurAmount={1}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={styles.containerAndroid} />
          )}
        </View>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={normalize(20)}
          contentContainerStyle={styles.contentContainerStyle}
          keyboardShouldPersistTaps="always">
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>{strings.invoice_amount}</Text>
                <TouchableContainer onPress={() => ref.current.close()}>
                  <Image source={images.ic_x_close} style={styles.closeIcon} />
                </TouchableContainer>
              </View>
              <Spacing size={22} />
              <Input
                value={amount}
                onChangeText={text => {
                  handleInputChange('amount', text);
                }}
                inputTitle={strings.fetched_amount}
                inputMode={'numeric'}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
              />
              <Spacing size={24} />
              <Button
                title={strings.add}
                onPress={() => {
                  ref?.current?.close();
                  setTimeout(() => {
                    dispatch(
                      uploadReceipt(
                        storeId,
                        {amount: amount, image: receiptImage},
                        {
                          SuccessCallback: response => {},
                          FailureCallback: response => {},
                        },
                      ),
                    );
                    props?.onPressAdd();
                  }, 500);
                }}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </ScrollView>
    </Modal>
  );
});

export default InvoiceAmountModal;

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
      minHeight: Dimensions.get('window').height,
    },
    formContainer: {
      paddingVertical: normalize(20),
      backgroundColor: colors.addProductAlertModalTheme.backgroundColor,
      paddingHorizontal: normalize(20),
      borderRadius: normalize(12),
      maxHeight: normalize(240),
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
    containerAndroid: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      flex: 1,
    },
  });
