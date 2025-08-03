import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Modal, View, Text, StyleSheet, Image} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {BlurView} from '@react-native-community/blur';
import Button from '../Button';
import images from '../../assets/images';
import {fontStyles} from '../../commonutils/typography';
import {commonColors} from '../../commonutils/theme';
import {normalize, fontPixel, sizes} from '../../commonutils/dimensionutils';
import TouchableContainer from '../TouchableContainer';
import Spacing from '../Spacing';
import strings from '../../assets/strings';
import {navigate} from '../../commonutils/navigationutils';
import {Routes} from '../../container/Routes';

const LoginSignupModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const {colors} = useTheme();

  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }));

  const handleLogin = () => {
    setVisible(false);
    navigate(Routes.LOGIN_SIGNUP_SCREEN);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => setVisible(false)}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {backgroundColor: colors.loginSignupModalTheme.backgroundColor},
          ]}>
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {color: colors.loginSignupModalTheme.titleColor},
              ]}>
              Login Required
            </Text>
            <TouchableContainer onPress={() => setVisible(false)}>
              <Image source={images.ic_x_close} style={styles.closeIcon} />
            </TouchableContainer>
          </View>
          <Spacing size={12} />
          <Text
            style={[
              styles.description,
              {color: colors.loginSignupModalTheme.descriptionColor},
            ]}>
            Please login or signup to access this feature and enjoy all the
            benefits of our app.
          </Text>
          <Spacing size={24} />
          <View style={styles.buttonContainer}>
            <Button
              title={strings.login_sign_up}
              onPress={handleLogin}
              style={styles.button}
            />
            <Spacing size={15} />
            <TouchableContainer onPress={() => ref.current?.hide()}>
              <Text style={styles.cancel}>{strings.cancel}</Text>
            </TouchableContainer>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: sizes.paddingHorizontal,
  },
  container: {
    padding: normalize(20),
    borderRadius: normalize(12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...fontStyles.archivoBold,
    fontSize: fontPixel(20),
  },
  closeIcon: {
    width: normalize(22),
    height: normalize(22),
    tintColor: commonColors.gray,
  },
  description: {
    ...fontStyles.archivoRegular,
    fontSize: fontPixel(14),
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
  cancel: {
    ...fontStyles.archivoRegular,
    fontSize: fontPixel(14),
    textAlign: 'center',
    color: commonColors.gray,
  },
});

export default LoginSignupModal;

const loginSignupModalRef = React.createRef();
export const LoginSignup = () => <LoginSignupModal ref={loginSignupModalRef} />;

LoginSignupModal.show = ({key} = {}) => {
  // console.log('LoginSignupModal.show - ', key);
  loginSignupModalRef.current?.show({key});
};
LoginSignupModal.hide = ({key} = {}) => {
  // console.log('LoginSignupModal.hide - ', key);
  loginSignupModalRef.current?.hide({key});
};
