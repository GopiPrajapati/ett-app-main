import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {fontPixel, normalize} from '../../commonutils/dimensionutils';
import {getFileName} from '../../commonutils/helper';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {updateUserProfileImage, uploadImage} from '../../redux/actions';
import types from '../../redux/types';
import Spacing from '../Spacing';
import Toast from '../Toast';
import TouchableContainer from '../TouchableContainer';
import Loader from './LoaderModal';

const EditProfilePictureModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const {bottom} = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const dispatch = useDispatch();
  const global = useSelector(state => state?.global);
  const {profileImage} = global.user;

  const profileActions = [
    {
      source: images.ic_camera_modal,
      title: 'Camera',
      type: 'camera',
      backgroundColor: colors.editProfileModalTheme.iconBackgroundColor,
    },
    {
      source: images.ic_gallery_modal,
      title: 'Gallery',
      type: 'gallery',
      backgroundColor: colors.editProfileModalTheme.iconBackgroundColor,
    },
    {
      source: images.ic_delete_modal,
      title: 'Delete Photo',
      type: 'delete_photo',
      backgroundColor: colors.editProfileModalTheme.deleteIconBackgroundColor,
    },
  ];

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      if (!visible) setVisible(true);
    },
    close: handleClose,
  }));

  const processImage = useCallback(
    async (response, isCamera = false) => {
      try {
        const name = getFileName(response.path);
        const binaryData = await RNFS.readFile(response.path, 'base64');

        const mediaData = {
          data: binaryData,
          type: response.mime,
          name: name,
        };
        Loader.show({key: 'EditProfilePictureModal'});
        uploadImage(
          {
            fileName: name,
            prefix: 'profile',
            isPublic: true,
          },
          mediaData,
          {
            SuccessCallback: result => {
              dispatch(
                updateUserProfileImage(
                  {profileImage: result},
                  {
                    SuccessCallback: response => {
                      handleClose();
                      dispatch({
                        type: types.SET_USER_DETAILS,
                        payload: {
                          profileImage: result,
                        },
                      });
                      Loader.hide({key: 'EditProfilePictureModal'});
                      Toast.show({
                        message: response?.message,
                        type: 'success',
                      });
                    },
                    FailureCallback: error => {
                      Loader.hide({key: 'EditProfilePictureModal'});
                    },
                  },
                ),
              );
            },
            FailureCallback: error => {
              console.error('Upload failed:', error);
              Loader.hide({key: 'EditProfilePictureModal'});
            },
          },
        );
      } catch (error) {
        console.error('Image processing error:', error);
      }
    },
    [dispatch, handleClose],
  );

  const handleActionPress = useCallback(
    type => {
      if (type === 'camera') {
        ImagePicker.openCamera({
          mediaType: 'photo',
          width: normalize(283),
          height: normalize(283),
          freeStyleCropEnabled: false,
          cropping: true,
        })
          .then(response => processImage(response, true))
          .catch(error => console.error('Camera ImagePicker error:', error));
      } else if (type === 'gallery') {
        ImagePicker.openPicker({
          mediaType: 'photo',
          width: normalize(283),
          height: normalize(283),
          freeStyleCropEnabled: false,
          cropping: true,
        })
          .then(processImage)
          .catch(error => console.error('Gallery ImagePicker error:', error));
      } else if (type === 'delete_photo') {
        dispatch(
          updateUserProfileImage(
            {profileImage: ''},
            {
              SuccessCallback: response => {
                handleClose();
                dispatch({
                  type: types.SET_USER_DETAILS,
                  payload: {
                    profileImage: '',
                  },
                });
                Loader.hide({key: 'EditProfilePictureModal'});
                Toast.show({
                  message: response?.message,
                  type: 'success',
                });
              },
              FailureCallback: error => {
                Loader.hide({key: 'EditProfilePictureModal'});
              },
            },
          ),
        );
      }
    },
    [dispatch, handleClose, processImage],
  );

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
      style={styles.modal}>
      <TouchableOpacity
        onPress={() => ref.current?.close()}
        activeOpacity={1}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: commonColors.transparent,
          },
        ]}>
        <BlurView
          blurType="dark"
          blurAmount={1}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bottomContainer}>
          <TouchableContainer
            styles={styles.closeIconContainer}
            onPress={handleClose}>
            <FastImage source={images.ic_x_close} style={styles.closeIcon} />
          </TouchableContainer>
          <Spacing size={20} />
          <View style={styles.content}>
            <Text style={styles.title}>{strings.profile_photo}</Text>
            <Spacing size={normalize(26)} />
            <View style={styles.buttonContainer}>
              {profileActions.map((item, index) => {
                if (!profileImage && item.type === profileActions[2].type) {
                  return (
                    <View key={index} style={styles.item}>
                      <View style={styles.iconButton} />
                    </View>
                  );
                }

                return (
                  <View key={index} style={styles.item}>
                    <TouchableContainer
                      styles={[
                        styles.iconButton,
                        {backgroundColor: item.backgroundColor},
                      ]}
                      onPress={() => handleActionPress(item.type)}>
                      <FastImage
                        source={item.source}
                        style={styles.icon}
                        resizeMode="contain"
                      />
                    </TouchableContainer>
                    <Spacing size={8} />
                    <Text style={styles.iconTitle}>{item.title}</Text>
                  </View>
                );
              })}
            </View>
            <Spacing size={bottom === 0 ? 24 : bottom} />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

export default EditProfilePictureModal;

const createStyle = colors =>
  StyleSheet.create({
    modal: {
      flex: 1,
    },
    bottomContainer: {
      bottom: 0,
      position: 'absolute',
      left: 0,
      right: 0,
    },
    content: {
      backgroundColor: colors.editProfileModalTheme.backgroundColor,
      paddingHorizontal: normalize(24),
      paddingTop: normalize(24),
      borderTopLeftRadius: normalize(12),
      borderTopRightRadius: normalize(12),
    },
    closeIconContainer: {
      alignSelf: 'center',
      width: normalize(36),
      height: normalize(36),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.19)',
      borderRadius: 100,
    },
    closeIcon: {
      width: normalize(16),
      height: normalize(16),
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.editProfileModalTheme.titleColor,
      alignSelf: 'center',
    },
    buttonContainer: {
      flexGrow: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    item: {alignItems: 'center'},
    iconButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: normalize(74),
      height: normalize(74),
      borderRadius: normalize(100),
    },
    icon: {
      width: normalize(32),
      height: normalize(32),
    },
    iconTitle: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.editProfileModalTheme.titleColor,
      alignSelf: 'center',
    },
  });
