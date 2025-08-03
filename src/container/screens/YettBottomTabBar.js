import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '@react-navigation/native';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AllInCityScreen, HubsScreen, MallsScreen, ProfileScreen} from '.';
import images from '../../assets/images';
import strings from '../../assets/strings';
import {
  fontPixel,
  normalize,
  screenWidth,
} from '../../commonutils/dimensionutils';
import {commonColors} from '../../commonutils/theme';
import {fontStyles} from '../../commonutils/typography';
import {Spacing} from '../../components';
import {Routes} from '../Routes';
import HomeScreen from './HomeScreen';
import {hapticFeedback} from '../../commonutils/helper';
import {useSound} from '../../hooks/useSound';

export const TABS = [
  {
    title: 'Home',
    type: 'home',
    selectedTabImage: images.ic_selected_bottom_tab_home,
    selectedTabDarkImage: images.ic_selected_bottom_tab_home_dark,
    tabImage: images.ic_bottom_tab_home,
  },
  {
    title: 'All in City',
    type: 'all_in_city',
    selectedTabImage: images.ic_selected_bottom_tab_category,
    selectedTabDarkImage: images.ic_selected_bottom_tab_category_dark,
    tabImage: images.ic_bottom_tab_category,
  },
  {
    title: 'Malls',
    type: 'malls',
    selectedTabImage: images.ic_selected_bottom_tab_mall,
    selectedTabDarkImage: images.ic_selected_bottom_tab_mall_dark,
    tabImage: images.ic_bottom_tab_mall,
  },
  {
    title: 'Hubs',
    type: 'hubs',
    selectedTabImage: images.ic_selected_bottom_tab_road_sign,
    selectedTabDarkImage: images.ic_selected_bottom_tab_road_sign_dark,
    tabImage: images.ic_bottom_tab_road_sign,
  },
  {
    title: 'Profile',
    type: 'profile',
    selectedTabImage: images.ic_selected_bottom_tab_profile,
    selectedTabDarkImage: images.ic_selected_bottom_tab_profile_dark,
    tabImage: images.ic_bottom_tab_profile,
  },
];

const Tab = createBottomTabNavigator();

const YettBottomTabBar = () => {
  const {colors} = useTheme();
  return (
    <Tab.Navigator
      key={`Tab-Navigator`}
      initialRouteName={strings.home}
      screenOptions={props => {
        return {
          headerShown: false,
        };
      }}
      tabBar={props => <TabBar {...props} />}>
      <Tab.Screen
        key={Routes.HOME_SCREEN}
        name={strings.home}
        component={HomeScreen}
      />
      <Tab.Screen
        key={Routes.ALL_IN_CITY_SCREEN}
        name={strings.all_in_city}
        component={AllInCityScreen}
      />
      <Tab.Screen
        key={Routes.MALL_SCREENS}
        name={strings.malls}
        component={MallsScreen}
      />
      <Tab.Screen
        key={Routes.HUBS_SCREEN}
        name={strings.hubs}
        component={HubsScreen}
      />
      <Tab.Screen
        key={Routes.PROFILE_SCREEN}
        name={strings.profile}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export default YettBottomTabBar;

const TabBar = React.memo(({state, descriptors, navigation}) => {
  const {colors} = useTheme();
  const {bottom} = useSafeAreaInsets();
  const global = useSelector(state => state.global);
  const styles = createStyle(colors);
  const {play} = useSound();
  return (
    <View
      style={[
        styles.tabBarContainer,
        {paddingBottom: bottom > 0 ? bottom : normalize(12)},
      ]}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          play();
          hapticFeedback();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={index}
            onPress={onPress}
            style={styles.pressableContainer}
            onLayout={event => {}}>
            <Image
              source={
                state.index === index
                  ? global?.isDarkMode
                    ? TABS[state.index].selectedTabDarkImage
                    : TABS[state.index].selectedTabImage
                  : TABS[index].tabImage
              }
              style={{width: normalize(24), height: normalize(24)}}
            />
            <Spacing size={4} />
            <Text
              style={[
                isFocused ? styles.currentLabel : styles.label,
                {
                  color: isFocused
                    ? colors.bottomBarTheme.color
                    : commonColors.gray,
                },
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const createStyle = colors =>
  StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      paddingVertical: normalize(12),
      alignItems: 'center',
      backgroundColor: colors.bottomBarTheme.backgroundColor,
    },
    pressableContainer: {
      width: screenWidth / 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: colors.bottomBarTheme.color,
    },
    currentLabel: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(12),
      color: colors.bottomBarTheme.color,
    },
  });
