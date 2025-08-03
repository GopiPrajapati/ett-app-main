import FastImage from 'react-native-fast-image';
import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack, navigate} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
  LoadMoreLoader,
  Spacing,
  TouchableContainer,
} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import {getAllCommunicationMessage} from '../../../redux/actions';
import {Routes} from '../../Routes';
import ListEmptyComponent from '../SearchScreen/SearchTabs/ListEmptyComponent';

const InboxScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const styles = createStyle(colors);

  useEffect(() => {
    Loader.show({key: Routes.INBOX_SCREEN});
    callFetchGetAllCommunicationMessage(1);
  }, [callFetchGetAllCommunicationMessage]);

  const callFetchGetAllCommunicationMessage = useCallback(
    (page = 1) => {
      if (loading) {
        return;
      }

      setLoading(true);
      dispatch(
        getAllCommunicationMessage(page, 10, {
          SuccessCallback: response => {
            const {pagination, communicationMessages} = response?.data;
            totalPagesRef.current = pagination?.totalPages;
            if (page === 1) {
              Loader.hide({key: Routes.INBOX_SCREEN});
              setData(communicationMessages);
            } else {
              setData(prev => [...prev, ...communicationMessages]);
            }
            pageRef.current = page + 1;
            setLoading(false);
          },
          FailureCallback: response => {
            Loader.hide({key: Routes.INBOX_SCREEN});
            setLoading(false);
          },
        }),
      );
    },
    [dispatch, loading],
  );

  const ItemSeparatorComponent = useCallback(() => <Spacing size={16} />, []);

  const renderItem = useCallback(
    ({item, index}) => {
      if (item?.isDelete) {
        return;
      }

      return (
        <TouchableContainer
          styles={[styles.renderItemContainer]}
          onPress={() => navigate(Routes.CONVERSATION_SCREEN, {...item})}>
          <View style={styles.leftContainer}>
            <Text style={styles.title}>
              {item?.communication?.store?.brandName}
            </Text>
            <Spacing size={4} />
            <Text style={styles.description} numberOfLines={1}>
              {item?.communication?.subject}
            </Text>
            <Spacing size={10} />
            {item?.createdAt ? (
              <Text style={styles.dateTime}>
                {moment(item?.createdAt).format('hh:mm A, DD MMM - YYYY')}
              </Text>
            ) : (
              <React.Fragment />
            )}
          </View>
          <Spacing size={10} direction="x" />
          <FastImage
            source={images.ic_chevron_right}
            style={styles.rightChevron}
          />
        </TouchableContainer>
      );
    },
    [
      styles.dateTime,
      styles.description,
      styles.leftContainer,
      styles.renderItemContainer,
      styles.rightChevron,
      styles.title,
    ],
  );

  const onEndReached = useCallback(() => {
    if (
      !loading &&
      pageRef.current > 1 &&
      pageRef.current <= totalPagesRef.current
    ) {
      callFetchGetAllCommunicationMessage(pageRef.current);
    }
  }, [loading, callFetchGetAllCommunicationMessage]);

  const ListFooterComponent = useCallback(
    () =>
      loading && pageRef.current > 1 ? (
        <LoadMoreLoader animating={loading || false} />
      ) : null,
    [loading],
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header back={true} onPressLeftArrow={goBack} leftText={strings.inbox} />
      <View style={styles.container}>
        {data?.length > 0 ? (
          <FlashList
            data={data}
            keyExtractor={(_, index) => `${index}`}
            renderItem={renderItem}
            estimatedItemSize={normalize(118)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainerStyle}
            ItemSeparatorComponent={ItemSeparatorComponent}
            onEndReached={onEndReached}
            ListFooterComponent={ListFooterComponent}
          />
        ) : !loading ? (
          <ListEmptyComponent />
        ) : (
          <></>
        )}
      </View>
    </SafeAreaView>
  );
};

export default InboxScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.inboxTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.inboxTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    renderItemContainer: {
      backgroundColor: colors.inboxTheme.itemBackgroundColor,
      padding: normalize(16),
      borderRadius: normalize(12),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    contentContainerStyle: {
      paddingTop: normalize(16),
      paddingBottom: sizes.extraBottomMargin,
    },
    leftContainer: {flex: 1},
    title: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(14),
      color: commonColors.brandColor,
    },
    description: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(18),
      color: colors.inboxTheme.discretionColor,
    },
    dateTime: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: commonColors.gray,
    },
    rightChevron: {
      width: normalize(24),
      height: normalize(24),
    },
  });
