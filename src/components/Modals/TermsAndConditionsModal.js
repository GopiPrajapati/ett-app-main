import {BlurView} from '@react-native-community/blur';
import {useTheme} from '@react-navigation/native';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
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
import Button from '../Button';
import Spacing from '../Spacing';
import TouchableContainer from '../TouchableContainer';

const TermsAndConditionsModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(undefined);
  const {colors} = useTheme();
  const {width} = useWindowDimensions();
  const styles = createStyles(colors);

  useImperativeHandle(ref, () => ({
    open: data => {
      if (!visible) setVisible(true);
      setData(data);
    },
    close: () => {
      setVisible(false);
      setData(undefined);
    },
  }));

  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={() => ref.current.close()}>
      <BlurView
        blurType="dark"
        blurAmount={1}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.container}>
        <View style={styles.alertContainer}>
          <Spacing size={20} />
          <View style={styles.header}>
            <Text style={styles.title}>{strings.terms_conditions}</Text>
            <TouchableContainer onPress={() => ref.current.close()}>
              <Image source={images.ic_x_close} style={styles.closeIcon} />
            </TouchableContainer>
          </View>
          <Spacing size={24} />
          <View style={styles.termsConditionContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {data && (
                <RenderHTML
                  contentWidth={width}
                  source={{html: data}}
                  tagsStyles={{
                    body: {color: 'black'},
                    p: {color: 'black'},
                    span: {color: 'black'},
                    div: {color: 'black'},
                    h1: {color: 'black'},
                    h2: {color: 'black'},
                    h3: {color: 'black'},
                    h4: {color: 'black'},
                    h5: {color: 'black'},
                    h6: {color: 'black'},
                    li: {color: 'black'},
                    a: {color: 'black'},
                  }}
                />
              )}
            </ScrollView>
          </View>
          <Spacing size={32} />
          <Button
            title={strings.ok_got_it}
            onPress={() => {
              ref.current.close();
              setTimeout(() => {
                ref?.current?.close();
              }, 500);
            }}
          />
          <Spacing size={20} />
        </View>
      </View>
    </Modal>
  );
});

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: commonColors.transparent,
      paddingHorizontal: sizes.paddingHorizontal,
      justifyContent: 'center',
    },
    alertContainer: {
      borderRadius: normalize(20),
      backgroundColor: colors.productAlertSuccessModalTheme.backgroundColor,
      paddingHorizontal: normalize(20),
      maxHeight: screenHeight * 0.8,
      minHeight: screenHeight * 0.8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.editProfileDetailsModalTheme.titleColor,
    },
    closeIcon: {
      width: normalize(22),
      height: normalize(22),
      tintColor: commonColors.gray,
    },
    termsConditionContainer: {
      padding: normalize(16),
      borderRadius: normalize(12),
      backgroundColor: commonColors.white,
      flex: 1,
    },
  });

export default TermsAndConditionsModal;
