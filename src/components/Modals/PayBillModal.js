import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {Image, Linking, Modal, StyleSheet, Text, View} from 'react-native';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize, sizes} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {Button, Input, Spacing, TouchableContainer} from '../index';
import {payUsingUpi} from '../../redux/actions';
import {useDispatch} from 'react-redux';
import LToast, {LocalToast} from '../LocalToast';

const PayBillModal = React.forwardRef(({onClose}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [data, setData] = useState('');
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const styles = createStyle(colors);

  const open = useCallback(url => {
    setData(url);
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setAmount('');
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (isNaN(Number(amount))) {
      LToast.show({message: 'Enter valid amount'});
    }

    if (amount && data) {
      dispatch(
        payUsingUpi(
          {...data, amount: Number(amount)},
          {
            SuccessCallback: response => {
              Linking.openURL(response?.data);
            },
            FailureCallback: response => {},
          },
        ),
      );
      close();
    }
  }, [amount, data, close]);

  React.useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{strings.enterAmount}</Text>
            <TouchableContainer onPress={() => ref.current?.close()}>
              <Image source={images.ic_x_close} style={styles.closeIcon} />
            </TouchableContainer>
          </View>
          <Spacing size={12} />
          <Input
            placeholder="₹0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor={commonColors.gray}
          />
          <Spacing size={20} />
          <Button title="Pay" onPress={handleSubmit} disabled={!amount} />
        </View>
      </View>
      <LocalToast />
    </Modal>
  );
});

const createStyle = colors =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
    },
    container: {
      backgroundColor: colors.editProfileDetailsModalTheme.backgroundColor,
      paddingHorizontal: normalize(20),
      borderRadius: normalize(12),
      paddingVertical: normalize(20),
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

export default PayBillModal;
