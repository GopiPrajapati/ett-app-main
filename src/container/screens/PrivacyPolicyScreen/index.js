import {useTheme} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {GlobalStatusBar, Header} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import {getPrivacyPolicy} from '../../../redux/actions';
import {Routes} from '../../Routes';

const PrivacyPolicyScreen = () => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const {width} = useWindowDimensions();
  const [data, setData] = useState({
    html: ``,
  });
  const styles = createStyle(colors);

  useEffect(() => {
    Loader.show({key: Routes.PRIVACY_POLICY_SCREEN});
    dispatch(
      getPrivacyPolicy({
        SuccessCallback: response => {
          setData({html: response});
          Loader.hide({key: Routes.PRIVACY_POLICY_SCREEN});
        },
        FailureCallback: response => {
          Loader.hide({key: Routes.PRIVACY_POLICY_SCREEN});
        },
      }),
    );
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        leftText={strings.privacy_policy}
        back={true}
        onPressLeftArrow={goBack}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainerStyle}>
          {data && (
            <RenderHTML
              contentWidth={width}
              source={data}
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
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      // backgroundColor: colors.privacyPolicyTheme.containerBackgroundColor,
      backgroundColor: commonColors.white,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    contentContainerStyle: {
      paddingVertical: normalize(24),
    },
    lastUpdated: {
      ...fontStyles.archivoRegular,
      color: '#828282',
      fontSize: fontPixel(14),
    },
    text: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
    },
    level0: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.privacyPolicyTheme.level0TextColor,
    },
    boldText: {
      ...fontStyles.archivoMedium,
      color: colors.privacyPolicyTheme.level0TextColor,
    },
    linkText: {
      ...fontStyles.archivoMedium,
      color: colors.privacyPolicyTheme.level0TextColor,
    },
    defaultLevel: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
  });
