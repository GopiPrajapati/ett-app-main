import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import _ from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import images from '../../../../../assets/images';
import {
  fontPixel,
  normalize,
  sizes,
} from '../../../../../commonutils/dimensionutils';
import {navigate} from '../../../../../commonutils/navigationutils';
import {commonColors} from '../../../../../commonutils/theme';
import {fontStyles} from '../../../../../commonutils/typography';
import {Spacing, TouchableContainer} from '../../../../../components';
import {getSearchedBrands} from '../../../../../redux/actions';
import {Routes} from '../../../../Routes';
import ListEmptyComponent from '../ListEmptyComponent';

const BrandsTabScreen = ({searchTerm = ''}) => {
  const {colors} = useTheme();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const styles = createStyle(colors);

  const fetchResults = useCallback(
    query => {
      dispatch(
        getSearchedBrands(query, {
          SuccessCallback: response => {
            setBrands(response?.data?.brands || []);
            setLoading(false);
          },
          FailureCallback: () => {
            setBrands([]);
            setLoading(false);
          },
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    const debouncedFetchResults = _.debounce(fetchResults, 500);

    if (isFocused) {
      setLoading(true);
      debouncedFetchResults(searchTerm);
    }
  }, [fetchResults, isFocused, searchTerm]);

  const highlightText = (text, highlight) => {
    if (!highlight) {
      return <Text style={styles.brandName}>{text}</Text>;
    }

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Text key={index} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          ),
        )}
      </Text>
    );
  };

  const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);
  const ListHeaderComponent = useCallback(() => <Spacing size={16} />, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={brands}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={({item, index}) => (
          <TouchableContainer
            key={index}
            styles={styles.itemContainer}
            onPress={() => {
              navigate(Routes.BRAND_AND_MALL_DETAILS_SCREEN, {
                ...item,
                id: item?.id,
              });
            }}>
            <FastImage
              source={
                item?.businessDetails?.logo
                  ? {uri: item?.businessDetails?.logo, priority: 'high'}
                  : images.ic_brand_name_square
              }
              style={styles.brandIcon}
            />
            <Text style={styles.brandName}>
              {highlightText(item.brandName, '')}
            </Text>
          </TouchableContainer>
        )}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          !loading && brands?.length === 0 ? (
            ListEmptyComponent
          ) : (
            <React.Fragment />
          )
        }
      />
    </View>
  );
};

export default BrandsTabScreen;

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.searchTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    contentContainerStyle: {flexGrow: 1},
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    brandIcon: {
      width: normalize(48),
      height: normalize(48),
      backgroundColor: '#ccc',
      borderRadius: normalize(12),
      marginRight: normalize(12),
    },
    brandName: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    highlight: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: colors.searchTheme.highlightText, // Highlight color
      fontWeight: 'bold',
    },
  });
