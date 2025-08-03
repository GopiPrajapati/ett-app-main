import {useTheme} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import images from '../assets/images';
import {normalize} from '../commonutils/dimensionutils';
import {commonColors} from '../commonutils/theme';
import {fontStyles} from '../commonutils/typography';
import Spacing from './Spacing';

export const TABS = [
  {
    title: 'Home',
    type: 'home',
    selectedTabImage: images.ic_selected_home_tab,
    selectedTabDarkImage: images.ic_selected_home_dark_tab,
    tabImage: images.ic_home_tab,
  },
  {
    title: 'All in City',
    type: 'all_in_city',
    selectedTabImage: images.ic_selected_category_tab,
    selectedTabDarkImage: images.ic_selected_category_dark_tab,
    tabImage: images.ic_category_tab,
  },
  {
    title: 'Malls',
    type: 'malls',
    selectedTabImage: images.ic_selected_building,
    selectedTabDarkImage: images.ic_selected_building_dark,
    tabImage: images.ic_building,
  },
  {
    title: 'Hubs',
    type: 'hubs',
    selectedTabImage: images.ic_selected_road_sign,
    selectedTabDarkImage: images.ic_selected_road_sign_dark,
    tabImage: images.ic_road_sign,
  },
];

const TabBar = ({selectedTab, activeTabIndex}) => {
  const [activeTab, setActiveTab] = useState(0);
  const global = useSelector(state => state?.global);
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const tabWidth = containerWidth / TABS.length;

  useEffect(() => {
    handleTabPress(activeTabIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex]);

  // Handle tab press
  const handleTabPress = index => {
    setActiveTab(index);
    Animated.spring(translateX, {
      toValue: index * tabWidth, // Move the indicator
      useNativeDriver: true,
    }).start();
    selectedTab(TABS[index]);
  };

  // Capture container width on layout
  const handleLayout = event => {
    const {width} = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer} onLayout={handleLayout}>
        {TABS.map((tab, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={[styles.tab, {width: tabWidth}]} // Set tab width dynamically
              onPress={() => handleTabPress(index)}>
              <Image
                source={
                  activeTab === index
                    ? global?.isDarkMode
                      ? tab.selectedTabDarkImage
                      : tab.selectedTabImage
                    : tab.tabImage
                }
                style={styles.tabImage}
                resizeMode="contain"
              />
              <Spacing size={6} />
              <Text
                style={[
                  activeTab === index ? styles.selectedTabText : styles.tabText,
                ]}>
                {tab.title}
              </Text>
              {/* Conditional Divider */}
            </TouchableOpacity>
            {index !== TABS.length - 1 &&
              ((activeTab === 0 && index >= 1) || // For 1st tab, show between 2-3 and 3-4
                (activeTab === 1 && index === 2) || // For 2nd tab, show between 2-3
                (activeTab === 2 && index === 0) || // For 3rd tab, show between 1-2
                (activeTab === 3 && index <= 1)) && ( // For 4th tab, show between 1-2 and 2-3
                <View style={styles.divider} />
              )}
          </React.Fragment>
        ))}

        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{translateX}],
              width: tabWidth, // Indicator width based on container
            },
          ]}
        />
      </View>
    </View>
  );
};

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      width: '100%', // Full width of parent container
      height: normalize(76),
    },
    tab: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
    },
    tabImage: {
      width: normalize(24),
      height: normalize(24),
    },
    tabText: {
      ...fontStyles.archivoRegular,
      fontSize: normalize(14),
      color: '#828282',
    },
    selectedTabText: {
      ...fontStyles.archivoBold,
      fontSize: normalize(14),
      color: colors.tabBarTheme.color,
    },
    activeTabText: {
      color: '#000',
      fontWeight: 'bold',
    },
    indicator: {
      position: 'absolute',
      backgroundColor: commonColors.brandColor,
      borderRadius: 12,
      top: 0,
      bottom: 0,
      zIndex: -1,
    },
    divider: {
      width: 1,
      height: '60%',
      backgroundColor: colors.tabBarTheme.dividerColor,
      alignSelf: 'center',
    },
  });

export default TabBar;

// import {useTheme} from '@react-navigation/native';
// import React, {useRef, useState} from 'react';
// import {
//   Animated,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import {useSelector} from 'react-redux';
// import images from '../assets/images';
// import {normalize, sizes} from '../commonutils/dimensionutils';
// import {commonColors} from '../commonutils/theme';
// import {fontStyles} from '../commonutils/typography';
// import Spacing from './Spacing';

// export const TABS = [
//   {
//     title: 'Home',
//     type: 'home',
//     selectedTabImage: images.ic_selected_home_tab,
//     selectedTabDarkImage: images.ic_selected_home_dark_tab,
//     tabImage: images.ic_home_tab,
//   },
//   {
//     title: 'All in City',
//     type: 'all_in_city',
//     selectedTabImage: images.ic_selected_category_tab,
//     selectedTabDarkImage: images.ic_selected_category_dark_tab,
//     tabImage: images.ic_category_tab,
//   },
//   {
//     title: 'Malls',
//     type: 'malls',
//     selectedTabImage: images.ic_selected_building,
//     selectedTabDarkImage: images.ic_selected_building_dark,
//     tabImage: images.ic_building,
//   },
//   {
//     title: 'Hubs',
//     type: 'hubs',
//     selectedTabImage: images.ic_selected_road_sign,
//     selectedTabDarkImage: images.ic_selected_road_sign_dark,
//     tabImage: images.ic_road_sign,
//   },
// ];

// const TabBar = ({state, descriptors, navigation, position}) => {
//   const global = useSelector(state => state?.global);
//   const {colors} = useTheme();
//   const styles = createStyle(colors);
//   const translateX = useRef(new Animated.Value(0)).current;
//   const [containerWidth, setContainerWidth] = useState(0);
//   const tabWidth = containerWidth / state.routes.length;

//   const handleTabPress = (route, index, isFocused) => {
//     Animated.spring(translateX, {
//       toValue: index * tabWidth, // Move the indicator
//       useNativeDriver: true,
//     }).start();
//     const event = navigation.emit({
//       type: 'tabPress',
//       target: route.key,
//       canPreventDefault: true,
//     });

//     if (!isFocused && !event.defaultPrevented) {
//       navigation.navigate(route.name, route.params);
//     }
//   };
//   const handleLayout = event => {
//     const {width} = event.nativeEvent.layout;
//     setContainerWidth(width);
//   };

//   return (
//     <View style={{paddingHorizontal: sizes.paddingHorizontal}}>
//       <View style={styles.tabContainer} onLayout={handleLayout}>
//         {state.routes.map((route, index) => {
//           const {options} = descriptors[route.key];
//           const label =
//             options.tabBarLabel !== undefined
//               ? options.tabBarLabel
//               : options.title !== undefined
//               ? options.title
//               : route.name;

//           const isFocused = state.index === index;

//           return (
//             <React.Fragment>
//               <TouchableOpacity
//                 key={index}
//                 activeOpacity={0.8}
//                 style={[styles.tab, {width: tabWidth}]} // Set tab width dynamically
//                 onPress={() => handleTabPress(route, index, isFocused)}>
//                 <Image
//                   source={
//                     state.index === index
//                       ? global?.isDarkMode
//                         ? TABS[state.index].selectedTabDarkImage
//                         : TABS[state.index].selectedTabImage
//                       : TABS[index].tabImage
//                   }
//                   style={{width: normalize(24), height: normalize(24)}}
//                   resizeMode="contain"
//                 />
//                 <Spacing size={6} />
//                 <Text
//                   style={[
//                     state.index === index
//                       ? styles.selectedTabText
//                       : styles.tabText,
//                   ]}>
//                   {label}
//                 </Text>
//               </TouchableOpacity>
//               {index !== TABS.length - 1 &&
//                 ((state.index === 0 && index >= 1) || // For 1st tab, show between 2-3 and 3-4
//                   (state.index === 1 && index === 2) || // For 2nd tab, show between 2-3
//                   (state.index === 2 && index === 0) || // For 3rd tab, show between 1-2
//                   (state.index === 3 && index <= 1)) && ( // For 4th tab, show between 1-2 and 2-3
//                   <View style={styles.divider} />
//                 )}
//             </React.Fragment>
//           );
//         })}
//         <Animated.View
//           style={[
//             styles.indicator,
//             {
//               transform: [{translateX}],
//               width: tabWidth, // Indicator width based on container
//             },
//           ]}
//         />
//       </View>
//     </View>
//   );
// };

// const createStyle = colors =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     tabContainer: {
//       flexDirection: 'row',
//       width: '100%', // Full width of parent container
//       height: normalize(76),
//     },
//     tab: {
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingVertical: 12,
//     },
//     tabImage: {
//       width: normalize(24),
//       height: normalize(24),
//     },
//     tabText: {
//       ...fontStyles.archivoRegular,
//       fontSize: normalize(14),
//       color: '#828282',
//     },
//     selectedTabText: {
//       ...fontStyles.archivoBold,
//       fontSize: normalize(14),
//       color: colors.tabBarTheme.color,
//     },
//     activeTabText: {
//       color: '#000',
//       fontWeight: 'bold',
//     },
//     indicator: {
//       position: 'absolute',
//       backgroundColor: commonColors.brandColor,
//       borderRadius: 12,
//       top: 0,
//       bottom: 0,
//       zIndex: -1,
//     },
//     divider: {
//       width: 1,
//       height: '60%',
//       backgroundColor: colors.tabBarTheme.dividerColor,
//       alignSelf: 'center',
//     },
//   });

// export default TabBar;
