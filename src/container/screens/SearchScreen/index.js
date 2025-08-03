import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation, useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import images from '../../../assets/images';
import {normalize, sizes} from '../../../commonutils/dimensionutils';
import {commonColors} from '../../../commonutils/theme';
import {
  GlobalStatusBar,
  Input,
  Spacing,
  TouchableContainer,
} from '../../../components';
import {Routes} from '../../Routes';
import SearchTabBar from './SearchTabBar';
import BrandsTabScreen from './SearchTabs/BrandsTabScreen';
import HubsTabScreen from './SearchTabs/HubsTabScreen';
import MallsTabScreen from './SearchTabs/MallsTabScreen';

export const Tabs = {
  Brands: 'Brands',
  Malls: 'Malls',
  Hubs: 'Hubs',
};

const Tab = createMaterialTopTabNavigator();

const BrandsTabComponent = React.memo(({searchTerm}) => (
  <BrandsTabScreen searchTerm={searchTerm} />
));

const MallsTabComponent = React.memo(({searchTerm}) => (
  <MallsTabScreen searchTerm={searchTerm} />
));

const HubsTabComponent = React.memo(({searchTerm}) => (
  <HubsTabScreen searchTerm={searchTerm} />
));

const SearchScreen = props => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyle(colors), [colors]);
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const tabBar = useCallback(props => {
    const _index = props?.state?.index;
    setActiveTabIndex(_index);
    return <SearchTabBar {...props} />;
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.navigate(Routes.SEARCH_SCREEN, {
        screen: props?.route?.params?.key || Tabs.Brands,
      });
    }, 500);

    () => clearTimeout(timeout);
  }, [navigation]);

  useEffect(() => {
    setSearch('');
  }, [activeTabIndex]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GlobalStatusBar />
      <View style={styles.headerContainer}>
        <TouchableContainer
          onPress={() => navigation.goBack()}
          styles={styles.backButtonContainer}>
          <Image
            source={images.ic_arrow_header}
            style={styles.backButtonImage}
            tintColor={commonColors.gray}
          />
        </TouchableContainer>
        <Spacing size={12} direction="x" />
        <View style={styles.inputContainer}>
          <Input
            value={search}
            autoCapitalize="words"
            onChangeText={setSearch}
            leftIcon={images.ic_search}
            placeholder={
              'Search for ' +
              (activeTabIndex === 0
                ? Tabs.Brands
                : activeTabIndex === 1
                ? Tabs.Malls
                : Tabs.Hubs)
            }
            isBorderLessContainer
            externalBorderLessTextInputContainer={{
              backgroundColor: colors.searchTheme.input,
            }}
          />
        </View>
      </View>
      <Tab.Navigator
        key={'SearchBarTabNavigator'}
        screenOptions={{
          swipeEnabled: true, // Enable swipe
          tabBarScrollEnabled: false,
          animationEnabled: true,
        }}
        tabBar={tabBar}>
        <Tab.Screen
          key={Tabs.Brands}
          name={Tabs.Brands}
          children={() => <BrandsTabComponent searchTerm={search} />}
        />
        <Tab.Screen
          key={Tabs.Malls}
          name={Tabs.Malls}
          children={() => <MallsTabComponent searchTerm={search} />}
        />
        <Tab.Screen
          key={Tabs.Hubs}
          name={Tabs.Hubs}
          children={() => <HubsTabComponent searchTerm={search} />}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default SearchScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.searchTheme.mainBackgroundColor,
    },
    headerContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
      height: normalize(60),
    },
    backButtonContainer: {
      width: normalize(24),
      height: normalize(24),
      justifyContent: 'center',
      alignItems: 'center',
    },
    backButtonImage: {
      width: normalize(24),
      height: normalize(24),
    },
    inputContainer: {
      flex: 1,
    },
  });
