import {useTheme} from '@react-navigation/native';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import strings from '../../../assets/strings';
import {aboutUs} from '../../../commonutils/constants';
import {normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack, navigate} from '../../../commonutils/navigationutils';
import {GlobalStatusBar, Header, Menu, Spacing} from '../../../components';
import {Routes} from '../../Routes';

const AboutUsScreen = () => {
  const {colors} = useTheme();
  const styles = createStyle(colors);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.about_us}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Spacing size={24} />
          <Menu
            _item={aboutUs[0].options[0]}
            onPress={() => {
              navigate(Routes.TERMS_AND_CONDITIONS_SCREEN);
            }}
          />
          <Menu
            _item={aboutUs[0].options[1]}
            onPress={() => {
              navigate(Routes.PRIVACY_POLICY_SCREEN);
            }}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AboutUsScreen;

const createStyle = colors =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
    },
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.aboutUsTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.aboutUsTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    scrollContent: {
      paddingBottom: normalize(50),
    },
  });
