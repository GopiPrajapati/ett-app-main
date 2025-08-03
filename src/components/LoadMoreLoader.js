import {useTheme} from '@react-navigation/native';
import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {fontPixel, normalize} from '../commonutils/dimensionutils';
import {fontStyles} from '../commonutils/typography';
import Spacing from './Spacing';

const LoadMoreLoader = ({animating = false}) => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  return (
    <View style={styles.loadMoreLoaderContainer}>
      <ActivityIndicator
        size={'small'}
        animating={animating}
        color={colors.loadMore.activityIndicatorColor}
      />
      <Spacing size={10} direction="x" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

export default LoadMoreLoader;

const createStyle = colors =>
  StyleSheet.create({
    loadMoreLoaderContainer: {
      width: '100%',
      height: normalize(40),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      ...fontStyles.archivoSemiBold,
      color: colors.loadMore.color,
      fontSize: fontPixel(14),
    },
  });
