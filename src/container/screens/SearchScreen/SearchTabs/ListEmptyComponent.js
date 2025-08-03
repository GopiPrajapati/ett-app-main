import FastImage from 'react-native-fast-image';
import {useTheme} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import images from '../../../../assets/images';
import strings from '../../../../assets/strings';
import {fontPixel, normalize} from '../../../../commonutils/dimensionutils';
import {fontStyles} from '../../../../commonutils/typography';

const ListEmptyComponent = () => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  return (
    <View style={styles.container}>
      <FastImage
        source={images.ic_search_result_not_found}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.search_results_not_found}>
        {strings.no_data_found}
      </Text>
    </View>
  );
};

export default ListEmptyComponent;

const createStyle = colors =>
  StyleSheet.create({
    container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    image: {width: normalize(120), height: normalize(120)},
    search_results_not_found: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.receiptsTheme.nothingYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
    },
  });
