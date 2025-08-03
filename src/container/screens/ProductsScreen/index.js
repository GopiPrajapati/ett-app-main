import FastImage from 'react-native-fast-image';
import {useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {sorts} from '../../../commonutils/constants';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
  Input,
  ProductModal,
  Spacing,
  TouchableContainer,
} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import {
  getProducts,
  getStoreProducts,
  getStoreSearchProduct,
  productCategory,
  storeProductCategory,
} from '../../../redux/actions';
import {Routes} from '../../Routes';
import {hapticFeedback} from '../../../commonutils/helper';

const ProductsScreen = props => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyle(colors), [colors]);
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryId, setCategoryId] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isSort, setIsSort] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearch, setIsSearch] = useState(false);
  const global = useSelector(state => state?.global);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const productModalRef = useRef();

  const id = props.route.params?.id;
  const isStore = props.route.params?.isStore;

  useEffect(() => {
    Loader.show({key: Routes.PRODUCTS_SCREEN});
    if (id) {
      callGetProductCategory();
    }
  }, [callGetProductCategory, id]);

  useEffect(() => {
    if (search) {
      setCategoryId(undefined);
      setCurrentIndex(-1);
      pageRef.current = 1;
      totalPagesRef.current = 0;
      setTimeout(() => {
        callGetStoreSearchProduct(true);
      }, 500);
    } else if (categoryId || search?.trim().length === 0) {
      pageRef.current = 1;
      totalPagesRef.current = 0;
      callGetProducts(true);
    }
  }, [
    search,
    categoryId,
    callGetStoreSearchProduct,
    callGetProducts,
    categories,
    isSort,
  ]);

  useEffect(() => {
    if (search) {
      setCategoryId(undefined); // Unselect the category when search is active
      pageRef.current = 1;
      totalPagesRef.current = 0;
      callGetStoreSearchProduct(true);
    }
  }, [search, callGetStoreSearchProduct]);

  const callGetProductCategory = useCallback(() => {
    const action = isStore ? storeProductCategory : productCategory;
    dispatch(
      action(id, {
        SuccessCallback: response => {
          setCategoryId(response?.data[0]?.id);
          setCategories(response?.data);
          Loader.hide({key: Routes.PRODUCTS_SCREEN});
        },
        FailureCallback: response => {
          Loader.hide({key: Routes.PRODUCTS_SCREEN});
        },
      }),
    );
  }, [dispatch, id, isStore]);

  const callGetStoreSearchProduct = useCallback(
    isReset => {
      if (loading) {
        return;
      }

      setLoading(true);
      dispatch(
        getStoreSearchProduct(
          id,
          pageRef.current,
          10,
          search,
          isSort ? sorts.ASC : sorts.DESC,
          {
            SuccessCallback: response => {
              const {pagination, products: _products} = response?.data;
              totalPagesRef.current = pagination?.totalPages;
              if (isReset) {
                setProducts(_products);
              } else {
                setProducts(prev => [...(prev || []), ..._products]);
              }

              pageRef.current = pageRef.current + 1;
              setLoading(false);
            },
            FailureCallback: response => {
              if (pageRef.current === 1) {
                setProducts([]);
              }
              setLoading(false);
            },
          },
        ),
      );
    },
    [dispatch, id, isSort, loading, search],
  );

  const callGetProducts = useCallback(
    isReset => {
      if (loading || !categoryId) {
        return;
      }

      setLoading(true);
      if (isStore) {
        dispatch(
          getStoreProducts(
            id,
            categoryId,
            pageRef.current,
            10,
            undefined,
            isSort ? sorts.ASC : sorts.DESC,
            {
              SuccessCallback: response => {
                const {pagination, products: _products} = response?.data;
                totalPagesRef.current = pagination?.totalPages;
                if (isReset) {
                  setProducts(_products);
                } else {
                  setProducts(prev => [...(prev || []), ..._products]);
                }

                pageRef.current = pageRef.current + 1;
                setLoading(false);
              },
              FailureCallback: response => {
                setLoading(false);
              },
            },
          ),
        );
      } else {
        dispatch(
          getProducts(
            categoryId,
            pageRef.current,
            10,
            undefined,
            isSort ? sorts.ASC : sorts.DESC,
            {
              SuccessCallback: response => {
                const {pagination, products: _products} = response?.data;
                totalPagesRef.current = pagination?.totalPages;
                if (isReset) {
                  setProducts(_products);
                } else {
                  setProducts(prev => [...(prev || []), ..._products]);
                }

                pageRef.current = pageRef.current + 1;
                setLoading(false);
              },
              FailureCallback: response => {
                setLoading(false);
              },
            },
          ),
        );
      }
    },
    [categoryId, dispatch, id, isSort, isStore, loading],
  );

  const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);
  const ListFooterComponent = useCallback(
    () => <Spacing size={sizes.extraBottomMargin} />,
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <TouchableContainer
        onPress={() => {
          productModalRef.current.open(item);
        }}
        styles={[
          styles.cardContainer,
          {
            width: '90%',
            // marginHorizontal: index % 2 === 0 ? 'auto' : undefined,
          },
        ]}>
        <FastImage
          source={
            item?.productImages?.[0]
              ? {uri: item?.productImages?.[0], priority: 'high'}
              : images.ic_brand_rectangle
          }
          style={styles.image}
        />
        <Spacing size={8} />
        <Text style={styles.productTitle} numberOfLines={1}>
          {item?.productName}
        </Text>
        <Spacing size={6} />
        <Text style={styles.price}>
          {item.price > 0 ? `₹${item.price}` : 'On Request'}
        </Text>
      </TouchableContainer>
    ),
    [styles],
  );

  const renderCategoryItem = useCallback(
    ({item, index}) => (
      <View
        style={[
          styles.categoryContainer,
          currentIndex === index && styles.currentCategory,
          currentIndex - 1 === index && styles.previousCategory,
          currentIndex + 1 === index && styles.nextCategory,
          index === 0 && styles.firstCategory,
          index === categories?.length - 1 && styles.lastCategory,
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setCategoryId(item?.id);
            setCurrentIndex(index);
            hapticFeedback();
          }}
          style={[
            styles.categoryTouchable,
            currentIndex === index && styles.currentCategoryTouchable,
          ]}>
          <View
            style={[
              styles.iconContainer,
              currentIndex === index ? styles.currentIcon : styles.defaultIcon,
            ]}>
            <FastImage
              source={
                currentIndex === index
                  ? images.ic_shirt_filled
                  : images.ic_shirt_empty
              }
              style={styles.icon}
            />
          </View>
          <Spacing size={8} />
          <Text
            style={[
              styles.categoryText,
              currentIndex === index && styles.currentCategoryText,
            ]}>
            {item?.category?.categoryName
              ? item?.category?.categoryName
              : item?.categoryName}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [
      categories,
      currentIndex,
      styles.categoryContainer,
      styles.categoryText,
      styles.categoryTouchable,
      styles.currentCategory,
      styles.currentCategoryText,
      styles.currentCategoryTouchable,
      styles.currentIcon,
      styles.defaultIcon,
      styles.firstCategory,
      styles.icon,
      styles.iconContainer,
      styles.lastCategory,
      styles.nextCategory,
      styles.previousCategory,
    ],
  );

  const onEndReached = useCallback(() => {
    if (
      !loading &&
      pageRef.current > 1 &&
      pageRef.current <= totalPagesRef.current
    ) {
      if (search) {
        callGetStoreSearchProduct();
      } else {
        callGetProducts();
      }
    }
  }, [loading, callGetStoreSearchProduct, callGetProducts, search]);

  const ListEmptyComponent = useCallback(() => {
    return (
      <View style={[styles.noProductFound]}>
        <Text style={styles.noProductFoundText}>
          {strings.no_results_found}
        </Text>
      </View>
    );
  }, [styles.noProductFound, styles.noProductFoundText]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back
        onPressLeftArrow={goBack}
        leftText={strings.collections}
        rightIcons={
          <View style={styles.headerRightContainer}>
            <TouchableContainer
              onPress={() => {
                setIsSort(!isSort);
              }}>
              <Image
                source={
                  isSort
                    ? global?.isDarkMode
                      ? images.ic_up_sort_dark
                      : images.ic_up_sort_light
                    : global?.isDarkMode
                    ? images.ic_sort_dark
                    : images.ic_sort_light
                }
                style={styles.sortImage}
              />
            </TouchableContainer>
            <Spacing size={12} direction="x" />
            <TouchableContainer
              onPress={() => {
                setIsSearch(!isSearch);
              }}>
              <Image source={images.ic_search} style={styles.searchImage} />
            </TouchableContainer>
          </View>
        }
      />
      <View
        style={[styles.searchContainer, {display: isSearch ? 'flex' : 'none'}]}>
        <Spacing size={2} />
        <Input
          autoCapitalize="words"
          value={search}
          onChangeText={text => {
            if (text === '') {
              setCategoryId(categories[0]?.id);
              setCurrentIndex(0);
              pageRef.current = 1;
              totalPagesRef.current = 0;
              setTimeout(() => {
                callGetProducts(true);
              }, 500);
            }
            setSearch(text);
          }}
          placeholder={strings.search_collections}
        />
        <Spacing size={10} />
      </View>
      <View style={styles.container}>
        {categories?.length > 0 ? (
          <View style={styles.rowContainer}>
            <View style={styles.sidebarContainer}>
              <FlashList
                data={categories}
                extraData={currentIndex}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={ListFooterComponent}
                style={styles.flashListStyle}
                renderItem={renderCategoryItem}
                estimatedItemSize={normalize(114)}
              />
            </View>
            <Spacing size={20} direction="x" />
            <FlashList
              data={products}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={ItemSeparatorComponent}
              ListFooterComponent={ListFooterComponent}
              numColumns={2}
              estimatedItemSize={normalize(223)}
              onEndReached={onEndReached}
              ListEmptyComponent={!loading && <ListEmptyComponent />}
            />
          </View>
        ) : (
          <View style={styles.noProductFound}>
            <Text style={styles.noProductFoundText}>No product found</Text>
          </View>
        )}
      </View>
      <ProductModal ref={productModalRef} />
    </SafeAreaView>
  );
};

export default ProductsScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.productsTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      backgroundColor: colors.productsTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
      paddingHorizontal: normalize(12),
      paddingTop: normalize(12),
    },
    rowContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    headerRightContainer: {flexDirection: 'row'},
    searchContainer: {
      paddingHorizontal: sizes.paddingHorizontal,
    },
    sortImage: {width: normalize(20), height: normalize(20)},
    searchImage: {
      width: normalize(20),
      height: normalize(20),
      tintColor: commonColors.gray,
    },
    sidebarContainer: {
      width: normalize(84),
    },
    flashListStyle: {
      width: normalize(84),
      borderRadius: normalize(12),
      overflow: 'hidden',
    },
    categoryContainer: {
      height: normalize(113),
      backgroundColor: 'rgba(91,124,253,0.08)',
    },
    currentCategory: {
      borderTopRightRadius: normalize(12),
      borderBottomRightRadius: normalize(12),
    },
    firstCategory: {
      borderTopLeftRadius: normalize(12),
    },
    lastCategory: {
      borderBottomLeftRadius: normalize(12),
    },
    previousCategory: {
      borderBottomRightRadius: normalize(12),
    },
    nextCategory: {
      borderTopRightRadius: normalize(12),
    },
    categoryTouchable: {
      height: normalize(113),
      justifyContent: 'center',
      alignItems: 'center',
    },
    currentCategoryTouchable: {
      backgroundColor: colors.productsTheme.containerBackgroundColor,
      borderRadius: normalize(12),
    },
    iconContainer: {
      width: normalize(60),
      height: normalize(60),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
    },
    currentIcon: {
      backgroundColor: commonColors.brandColor,
    },
    defaultIcon: {
      backgroundColor: colors.productsTheme.categoryImageBackgroundColor,
    },
    icon: {
      width: normalize(28),
      height: normalize(28),
    },
    categoryText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(12),
      color: commonColors.gray,
      textAlign: 'center',
      marginHorizontal: normalize(5),
    },
    currentCategoryText: {
      color: commonColors.brandColor,
    },
    cardContainer: {
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: normalize(12),
    },
    productTitle: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.productsTheme.productTitleColor,
    },
    price: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(16),
      color: commonColors.brandColor,
    },
    noProductFound: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noProductFoundText: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(22),
      color: colors.receiptsTheme.nothingYettColor,
      marginTop: normalize(24),
      marginBottom: normalize(8),
    },
  });

// import {useTheme} from '@react-navigation/native';
// import {FlashList} from '@shopify/flash-list';
// import React, {useCallback, useMemo, useRef, useState} from 'react';
// import {
//   Animated,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import FastImage from 'react-native-fast-image';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import images from '../../../assets/images';
// import strings from '../../../assets/strings';
// import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
// import {goBack} from '../../../commonutils/navigationutils';
// import {commonColors} from '../../../commonutils/theme';
// import {fontStyles} from '../../../commonutils/typography';
// import {
//   GlobalStatusBar,
//   Header,
//   Spacing,
//   TouchableContainer,
// } from '../../../components';

// const data = [
//   {id: '1', title: 'Yett', image: 'https://via.placeholder.com/600'},
//   {id: '2', title: 'Brand Factory', image: 'https://via.placeholder.com/300'},
//   {id: '3', title: 'Nike', image: 'https://via.placeholder.com/300'},
//   {id: '4', title: 'Nike', image: 'https://via.placeholder.com/300'},
//   {id: '5', title: 'Nike', image: 'https://via.placeholder.com/300'},
//   {id: '6', title: 'Nike', image: 'https://via.placeholder.com/300'},
//   {id: '7', title: 'Nike', image: 'https://via.placeholder.com/300'},
//   {id: '8', title: 'Nike', image: 'https://via.placeholder.com/300'},
//   {id: '9', title: 'Nike', image: 'https://via.placeholder.com/300'},
//   {id: '10', title: 'Nike', image: 'https://via.placeholder.com/300'},
// ];

// const ProductsScreen = () => {
//   const {colors} = useTheme();
//   const styles = useMemo(() => createStyle(colors), [colors]);
//   const [currentIndex, setCurrentIndex] = useState(1);
//   const translateY = useRef(new Animated.Value(0)).current;

//   const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);
//   const ListFooterComponent = useCallback(
//     () => <Spacing size={sizes.extraBottomMargin} />,
//     [],
//   );

//   const renderItem = useCallback(
//     ({item, index}) => (
//       <TouchableContainer
//         styles={[
//           styles.cardContainer,
//           {
//             width: '95%',
//             marginRight: index % 2 === 0 ? 'auto' : undefined,
//             marginLeft: index % 2 === 1 ? 'auto' : undefined,
//           },
//         ]}>
//         <FastImage source={images.ic_brand_rectangle} style={styles.image} />
//         <Spacing size={8} />
//         <Text style={styles.productTitle} numberOfLines={2}>
//           Lorem Ipsum is simply dummy
//         </Text>
//         <Spacing size={6} />
//         <Text style={styles.price}>₹199</Text>
//       </TouchableContainer>
//     ),
//     [styles],
//   );

//   const renderCategoryItem = useCallback(
//     ({item, index}) => (
//       <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={() => {
//           Animated.timing(translateY, {
//             toValue: index * normalize(106),
//             delay: 200,
//             useNativeDriver: true,
//           }).start();
//           setCurrentIndex(index);
//         }}
//         style={styles.categoryTouchable}>
//         <View
//           style={[
//             styles.iconContainer,
//             currentIndex === index ? styles.currentIcon : styles.defaultIcon,
//           ]}>
//           <FastImage
//             source={
//               currentIndex === index
//                 ? images.ic_shirt_filled
//                 : images.ic_shirt_empty
//             }
//             style={styles.icon}
//           />
//         </View>
//         <Spacing size={8} />
//         <Text
//           style={[
//             styles.categoryText,
//             currentIndex === index && styles.currentCategoryText,
//           ]}>
//           Category
//         </Text>
//       </TouchableOpacity>
//     ),
//     [currentIndex, styles, translateY],
//   );

//   return (
//     <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
//       <GlobalStatusBar />
//       <Header back onPressLeftArrow={goBack} leftText={strings.products} />
//       <View style={styles.container}>
//         <View style={styles.rowContainer}>
//           <View style={styles.sidebarContainer}>
//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               style={styles.scrollContainer}>
//               <Animated.View
//                 style={[
//                   styles.categoryHighlight,
//                   {transform: [{translateY: translateY}]},
//                 ]}
//               />
//               {data.map((item, index) => renderCategoryItem({item, index}))}
//             </ScrollView>
//           </View>
//           <Spacing size={20} direction="x" />
//           <FlashList
//             data={data}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderItem}
//             showsVerticalScrollIndicator={false}
//             ItemSeparatorComponent={ItemSeparatorComponent}
//             ListFooterComponent={ListFooterComponent}
//             numColumns={2}
//             estimatedItemSize={normalize(223)}
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default ProductsScreen;

// const createStyle = colors =>
//   StyleSheet.create({
//     safeAreaContainer: {
//       flex: 1,
//       backgroundColor: colors.productsTheme.mainBackgroundColor,
//     },
//     container: {
//       flex: 1,
//       backgroundColor: colors.productsTheme.containerBackgroundColor,
//       borderTopLeftRadius: normalize(20),
//       borderTopRightRadius: normalize(20),
//       paddingHorizontal: sizes.paddingHorizontal,
//       paddingTop: normalize(12),
//     },
//     rowContainer: {
//       flex: 1,
//       flexDirection: 'row',
//     },
//     sidebarContainer: {
//       width: normalize(84),
//     },
//     scrollContainer: {
//       backgroundColor: 'rgba(91,124,253,0.08)',
//       borderRadius: normalize(12),
//     },
//     categoryHighlight: {
//       position: 'absolute',
//       width: '100%',
//       height: normalize(106),
//       backgroundColor: commonColors.white,
//       borderTopLeftRadius: normalize(12),
//       borderBottomLeftRadius: normalize(12),
//     },
//     categoryTouchable: {
//       height: normalize(106),
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     iconContainer: {
//       width: normalize(60),
//       height: normalize(60),
//       justifyContent: 'center',
//       alignItems: 'center',
//       borderRadius: 100,
//     },
//     currentIcon: {
//       backgroundColor: commonColors.brandColor,
//     },
//     defaultIcon: {
//       backgroundColor: colors.productsTheme.categoryImageBackgroundColor,
//     },
//     icon: {
//       width: normalize(28),
//       height: normalize(28),
//     },
//     categoryText: {
//       ...fontStyles.archivoBold,
//       fontSize: fontPixel(12),
//       color: commonColors.gray,
//     },
//     currentCategoryText: {
//       color: commonColors.brandColor,
//     },
//     cardContainer: {
//       overflow: 'hidden',
//     },
//     image: {
//       width: '100%',
//       aspectRatio: 1,
//       borderRadius: normalize(12),
//     },
//     productTitle: {
//       ...fontStyles.archivoRegular,
//       fontSize: fontPixel(14),
//       color: colors.productsTheme.productTitleColor,
//     },
//     price: {
//       ...fontStyles.archivoBold,
//       fontSize: fontPixel(16),
//       color: commonColors.brandColor,
//     },
//   });
