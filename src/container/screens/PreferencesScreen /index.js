import {useTheme} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {Button, GlobalStatusBar, Header, Spacing} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import Toast from '../../../components/Toast';
import {getPreference, updatePreference} from '../../../redux/actions';
import {Routes} from '../../Routes';
import {hapticFeedback} from '../../../commonutils/helper';

const PreferencesScreen = () => {
  const {colors} = useTheme();
  const global = useSelector(state => state?.global);
  const styles = createStyle(colors);
  const [categories, setCategories] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    Loader.show({key: Routes.PREFERENCES_SCREEN});
    dispatch(
      getPreference({
        SuccessCallback: response => {
          setCategories(response.data || []);
          setTimeout(() => {
            Loader.hide({key: Routes.PREFERENCES_SCREEN});
          }, 500);
        },
        FailureCallback: response => {
          Loader.hide({key: Routes.PREFERENCES_SCREEN});
        },
      }),
    );
  }, [dispatch]);

  const toggleSelection = useCallback((mainCategoryIndex, itemIndex) => {
    setCategories(prevCategories => {
      const updatedCategories = [...prevCategories];
      const selectedCategory = updatedCategories[mainCategoryIndex];
      const selectedItem = selectedCategory.data[itemIndex];
      selectedItem.selected = !selectedItem.selected;
      return updatedCategories;
    });
  }, []);

  const onPressSave = () => {
    let data = categories.reduce((acc, category) => {
      const selectedItems = category.data
        .filter(dataItem => dataItem.selected)
        .map(dataItem => dataItem.id);
      return acc.concat(selectedItems);
    }, []);
    dispatch(
      updatePreference(
        {preferenceIds: data},
        {
          SuccessCallback: response => {
            Toast.show({message: response.message, type: 'success'});
            goBack();
          },
          FailureCallback: response => {
            if (response?.data?.message) {
              Toast.show({message: response?.data?.message});
            }
          },
        },
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        leftText={strings.preferences}
        onPressLeftArrow={goBack}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainerStyle}>
          <Spacing size={24} />
          {categories.map((category, categoryIndex) => (
            <MainCategory
              key={categoryIndex}
              category={category}
              categoryIndex={categoryIndex}
              toggleSelection={toggleSelection}
              styles={styles}
              colors={colors}
            />
          ))}
          {categories?.length > 0 ? (
            <Button
              buttonType="primaryButton"
              title={strings.save}
              onPress={onPressSave}
            />
          ) : null}
          <Spacing size={sizes.extraBottomMargin} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export const MainCategory = ({
  category,
  categoryIndex,
  toggleSelection,
  styles,
  colors,
}) => (
  <View>
    <Text style={styles.mainCategoryText}>{category.title}</Text>
    <Spacing size={12} />
    <View style={styles.categoryItemsContainer}>
      {category.data.map((item, itemIndex) => (
        <CategoryItem
          key={item.id}
          item={item}
          itemIndex={itemIndex}
          categoryIndex={categoryIndex}
          toggleSelection={toggleSelection}
          styles={styles}
          colors={colors}
        />
      ))}
    </View>
    <Spacing size={24} />
  </View>
);

export const CategoryItem = ({
  item,
  itemIndex,
  categoryIndex,
  toggleSelection,
  styles,
}) => (
  <TouchableOpacity
    onPress={() => {
      toggleSelection(categoryIndex, itemIndex);
      hapticFeedback();
    }}
    activeOpacity={0.8}
    style={[
      styles.categoryItem,
      item.selected ? styles.selected : styles.unselect,
    ]}>
    <Text
      style={
        item.selected
          ? styles.selectedCategoryItemText
          : styles.categoryItemText
      }>
      {item.name}
    </Text>
    <Spacing size={10} direction="x" />
    <TouchableOpacity
      onPress={() => {
        toggleSelection(categoryIndex, itemIndex);
        hapticFeedback();
      }}>
      <Image
        source={item.selected ? images.ic_remove : images.ic_add}
        style={styles.icon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default PreferencesScreen;

const createStyle = colors =>
  StyleSheet.create({
    backgroundImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.preferencesTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      borderRadius: normalize(16),
      backgroundColor:
        colors.preferencesTheme.selectPrefContainerBackgroundColor,
    },
    selectWhatYouLikeText: {
      ...fontStyles.archivoBold,
      textAlign: 'center',
      fontSize: fontPixel(28),
      color: '#fff',
    },
    contentContainerStyle: {
      paddingHorizontal: sizes.paddingHorizontal,
    },
    mainCategoryText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
    categoryItemsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: normalize(10),
    },
    categoryItem: {
      padding: normalize(10),
      borderRadius: normalize(90),
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedCategoryItemText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: commonColors.brandColor,
    },
    categoryItemText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.preferencesTheme.color,
    },
    icon: {
      width: normalize(20),
      height: normalize(20),
    },
    selected: {
      backgroundColor: 'rgba(91,124,253,0.24)',
    },
    unselect: {
      backgroundColor: colors.preferencesTheme.itemBackgroundColor,
    },
  });
