import {useTheme} from '@react-navigation/native';
import React, {useState} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {normalize, sizes} from '../../../commonutils/dimensionutils';
import {hapticFeedback} from '../../../commonutils/helper';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';

const SearchTabBar = ({state, descriptors, navigation, position}) => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  const [containerWidth, setContainerWidth] = useState(0);
  const tabWidth = containerWidth / state.routes.length;

  // Use position instead of translateX for smooth animations
  const inputRange = state.routes.map((_, i) => i);
  const translateX = position.interpolate({
    inputRange,
    outputRange: inputRange.map(i => i * tabWidth),
  });

  const handleTabPress = (route, index, isFocused) => {
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

  const handleLayout = event => {
    const {width} = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  return (
    <View style={{paddingHorizontal: sizes.paddingHorizontal}}>
      <View style={styles.tabContainer} onLayout={handleLayout}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          return (
            <React.Fragment key={index}>
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[styles.tab, {width: tabWidth}]} // Set tab width dynamically
                onPress={() => {
                  handleTabPress(route, index, isFocused);
                  hapticFeedback();
                }}>
                <Text
                  style={[
                    state.index === index
                      ? styles.selectedTabText
                      : styles.tabText,
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
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
      height: normalize(44),
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
      color: commonColors.gray,
    },
    selectedTabText: {
      ...fontStyles.archivoBold,
      fontSize: normalize(14),
      color: commonColors.brandColor,
    },
    activeTabText: {
      color: '#000',
      fontWeight: 'bold',
    },
    indicator: {
      position: 'absolute',
      backgroundColor: commonColors.brandColor,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      bottom: 0,
      height: normalize(2),
    },
  });

export default SearchTabBar;
