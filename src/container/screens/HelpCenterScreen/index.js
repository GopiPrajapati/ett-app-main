import {useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {fontStyles} from '../../../commonutils/typography';
import {GlobalStatusBar, Header, Spacing} from '../../../components';
import {getHelpCenter} from '../../../redux/actions';
import Loader from '../../../components/Modals/LoaderModal';
import {Routes} from '../../Routes';
import {hapticFeedback} from '../../../commonutils/helper';

const HelpCenterScreen = () => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const styles = useMemo(() => createStyle(colors), [colors]);

  useEffect(() => {
    Loader.show({key: Routes.HELP_CENTER_SCREEN});
    dispatch(
      getHelpCenter({
        SuccessCallback: response => {
          setData(response?.data?.[0]);
          Loader.hide({key: Routes.HELP_CENTER_SCREEN});
        },
        FailureCallback: response => {
          Loader.hide({key: Routes.HELP_CENTER_SCREEN});
        },
      }),
    );
  }, [dispatch]);

  const ContactItem = useCallback(
    ({title, image, onPress = () => {}}) => {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.contactItem}
          onPress={() => {
            onPress();
            hapticFeedback();
          }}>
          <Image
            source={image}
            style={{width: normalize(40), height: normalize(40)}}
          />
          <Spacing size={12} direction="x" />
          <Text style={styles.contactItemTitle}>{title}</Text>
        </TouchableOpacity>
      );
    },
    [styles.contactItem, styles.contactItemTitle],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.help_center}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Spacing size={24} />
          <Text style={styles.title}>{strings.reach_out_us}</Text>
          <Spacing size={24} />
          <Text style={styles.title}>{strings.customer_care}</Text>
          {data?.email ? <Spacing size={12} /> : null}
          {data?.email ? (
            <ContactItem
              title={data?.email}
              image={images.ic_help_center_mail}
              onPress={() => Linking.openURL(`mailto:${data?.email}`)}
            />
          ) : null}
          {data?.phoneNumber ? <Spacing size={12} /> : null}
          {data?.phoneNumber ? (
            <ContactItem
              title={data?.phoneNumber}
              image={images.ic_help_center_call}
              onPress={() => Linking.openURL(`tel:${data?.phoneNumber}`)}
            />
          ) : null}
          <Spacing size={24} />
          <Text style={styles.title}>{strings.thank_you_message}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HelpCenterScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.helpCenterTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.helpCenterTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    scrollContent: {
      paddingBottom: normalize(50),
    },
    title: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
    contactItem: {flexDirection: 'row', alignItems: 'center'},
    contactItemTitle: {color: colors.helpCenterTheme.color},
  });
