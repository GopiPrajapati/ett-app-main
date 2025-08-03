import {useTheme} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {fontStyles} from '../../../commonutils/typography';
import {GlobalStatusBar, Header} from '../../../components';
import {getTermsAndConditions} from '../../../redux/actions';
import Loader from '../../../components/Modals/LoaderModal';
import {Routes} from '../../Routes';
import {commonColors} from '../../../commonutils/theme';

const TermsAndConditionsScreen = () => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const dispatch = useDispatch();
  const {width} = useWindowDimensions();
  const [data, setData] = useState({html: ``});

  useEffect(() => {
    Loader.show({key: Routes.TERMS_AND_CONDITIONS_SCREEN});
    dispatch(
      getTermsAndConditions({
        SuccessCallback: response => {
          setData({html: response});
          Loader.hide({key: Routes.TERMS_AND_CONDITIONS_SCREEN});
        },
        FailureCallback: response => {
          Loader.hide({key: Routes.TERMS_AND_CONDITIONS_SCREEN});
        },
      }),
    );
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        leftText={strings.terms_conditions}
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

export default TermsAndConditionsScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.termsAndConditionsTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      // backgroundColor: colors.termsAndConditionsTheme.containerBackgroundColor,
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
  });
