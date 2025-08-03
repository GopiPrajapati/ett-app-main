import {useTheme} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import strings from '../../../assets/strings';
import {
  fontPixel,
  normalize,
  screenWidth,
  sizes,
} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {
  GlobalStatusBar,
  Header,
  Spacing,
  TouchableContainer,
} from '../../../components';
import Loader from '../../../components/Modals/LoaderModal';
import {getCommunicationMessage} from '../../../redux/actions';
import {Routes} from '../../Routes';

const ConversationScreen = props => {
  const [data, setData] = useState({});
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const styles = createStyle(colors);

  useEffect(() => {
    Loader.show({key: Routes.CONVERSATION_SCREEN});
    dispatch(
      getCommunicationMessage(props?.route?.params?.communication?.id, {
        SuccessCallback: response => {
          Loader.hide({key: Routes.CONVERSATION_SCREEN});
          setData(response?.data);
        },
        FailureCallback: response => {
          Loader.hide({key: Routes.CONVERSATION_SCREEN});
        },
      }),
    );
  }, [dispatch, props?.route?.params?.communication?.id]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top']}>
      <GlobalStatusBar />
      <Header
        back={true}
        onPressLeftArrow={goBack}
        leftText={strings.conversation}
      />
      <TouchableContainer
        styles={[styles.renderItemContainer]}
        onPress={() => {}}>
        <View style={styles.leftContainer}>
          <Text style={styles.title}>{data?.store?.brandName}</Text>
          <Spacing size={4} />
          <Text style={styles.description} numberOfLines={1}>
            {data?.subject}
          </Text>
          <Spacing size={12} />
          <Text style={styles.dateTime}>
            {moment(data?.createdAt).format('hh:mm A, DD MMM - YYYY')}
          </Text>
          <Spacing size={24} />
        </View>
      </TouchableContainer>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Spacing size={24} />
          {data?.message ? (
            <RenderHTML
              contentWidth={screenWidth}
              source={{html: `${data?.message}`}}
              tagsStyles={{
                body: {color: 'black'},
                p: {color: 'black'},
                span: {color: 'black'},
                div: {color: 'black'},
                h1: {color: 'black'},
                h2: {color: 'black'},
                h3: {color: 'black'},
                h4: {color: 'black'},
                h5: {color: 'black'},
                h6: {color: 'black'},
                li: {color: 'black'},
                a: {color: 'black'},
              }}
            />
          ) : (
            <React.Fragment />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ConversationScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.conversationTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: commonColors.white,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    renderItemContainer: {
      backgroundColor: colors.conversationTheme.itemBackgroundColor,
      paddingHorizontal: sizes.paddingHorizontal,
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
      color: colors.conversationTheme.discretionColor,
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
