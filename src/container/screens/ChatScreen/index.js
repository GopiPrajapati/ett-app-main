import {useIsFocused, useTheme} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import images from '../../../assets/images';
import {
  emitMessageSend,
  getMessage,
  initSocket,
} from '../../../assets/socketIO.js';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import * as helper from '../../../commonutils/helper.js';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {fontStyles} from '../../../commonutils/typography';
import {Input, Spacing, TouchableContainer} from '../../../components';
import {useKeyboard} from '../../../hooks';
import {getChatMessages} from '../../../redux/actions';
import Toast from '../../../components/Toast.js';

const limit = 10;

const ChatScreen = props => {
  const {colors} = useTheme();
  const {bottom} = useSafeAreaInsets();
  const dispatch = useDispatch();
  const global = useSelector(state => state.global);
  const translateY = useRef(new Animated.Value(0)).current;
  const {isOpen, keyboardHeight} = useKeyboard();
  const styles = createStyle(colors);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const pageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const flashListRef = useRef();
  const isFocused = useIsFocused();
  const {name, logo, id} = props.route.params;
  const {profileImage, id: userId} = global?.user;

  useEffect(() => {
    pageRef.current = 1;
    totalPagesRef.current = 0;
    setData([]);
    setLoading(true);
    callGetChatMessages(true);
    helper.checkInternetConnection();
  }, [callGetChatMessages]);

  useEffect(() => {
    if (isFocused) {
      registerSocket();
    }
  }, [isFocused]);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOpen
        ? Platform.OS === 'ios'
          ? -keyboardHeight + 20
          : -25
        : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [translateY, isOpen, keyboardHeight]);

  const callGetChatMessages = useCallback(
    (isReset = false) => {
      if (loading) {
        return;
      }

      setLoading(true);
      dispatch(
        getChatMessages(id, pageRef?.current, limit, {
          SuccessCallback: response => {
            const {chatDetails, pagination} = response?.data;
            totalPagesRef.current = pagination?.totalPages;
            if (pageRef?.current === 1 || isReset) {
              setData(chatDetails);
            } else {
              setData(prev => [...prev, ...chatDetails]);
            }

            pageRef.current = pageRef.current + 1;
            setLoading(false);
          },
          FailureCallback: response => {
            setLoading(false);
            console.error(JSON.stringify(response));
          },
        }),
      );
    },
    [dispatch, id, loading],
  );

  const registerSocket = async () => {
    initSocket(helper?.accessToken);
    getMessage(data => {
      setData(prev => [data?.message?.data, ...(prev || [])]);
      setTimeout(() => {
        flashListRef?.current?.scrollToOffset({
          offset: 0,
          animated: true,
        });
      }, 100);
    });
  };

  const ItemSeparatorComponent = useCallback(() => <Spacing size={22} />, []);
  const ListHeaderComponent = useCallback(() => <Spacing size={24} />, []);
  const ListFooterComponent = useCallback(() => <Spacing size={24} />, []);

  const onEndReached = useCallback(() => {
    if (
      !loading &&
      pageRef.current > 1 &&
      pageRef.current <= totalPagesRef.current
    ) {
      callGetChatMessages();
    }
  }, [loading, callGetChatMessages]);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colors.chatTheme.mainBackgroundColor},
      ]}>
      <SafeAreaView style={styles.flexOne} edges={['top']}>
        <View style={styles.headerContainer}>
          <TouchableContainer onPress={goBack}>
            <Image
              source={images.ic_arrow_left}
              style={[styles.leftArrow, {tintColor: '#828282'}]}
            />
          </TouchableContainer>
          <Spacing size={12} direction="x" />
          <Image
            source={logo ? {uri: logo} : images.ic_brand_image}
            style={styles.brandImage}
          />
          <Spacing size={12} direction="x" />
          <Text
            style={[styles.headerText, {color: colors.text}]}
            numberOfLines={1}>
            {name}
          </Text>
        </View>
        <View
          style={[
            styles.chatContainer,
            {backgroundColor: colors.chatTheme.containerBackgroundColor},
          ]}>
          <Animated.View
            style={[styles.flexOne, {transform: [{translateY: translateY}]}]}>
            <FlashList
              ref={flashListRef}
              data={data}
              keyExtractor={(_, index) => `${index}`}
              estimatedItemSize={100}
              renderItem={({item}) => {
                const formattedTime = moment
                  .utc(String(item?.createdAt))
                  .local()
                  .format('hh:mm A');
                if (item.senderId === userId) {
                  return (
                    <View style={styles.userMessageContainer}>
                      <View
                        style={[
                          styles.messageBubble,
                          styles.userMessageBubble,
                          {
                            backgroundColor:
                              colors.chatTheme.brandChatContainer,
                          },
                        ]}>
                        <Text
                          style={[styles.messageText, {color: colors.text}]}>
                          {item.message}
                        </Text>
                        <Spacing size={8} />
                        <Text style={styles.timeText}>{formattedTime}</Text>
                      </View>
                      <Spacing size={10} direction="x" />
                      <Image
                        source={
                          profileImage
                            ? {uri: profileImage}
                            : images.ic_brand_image
                        }
                        style={styles.avatar}
                      />
                    </View>
                  );
                }

                return (
                  <View style={styles.otherMessageContainer}>
                    <Image
                      source={logo ? {uri: logo} : images.ic_brand_image}
                      style={styles.avatar}
                    />
                    <Spacing size={10} direction="x" />
                    <View
                      style={[
                        styles.messageBubble,
                        styles.otherMessageBubble,
                        {backgroundColor: colors.chatTheme.brandChatContainer},
                      ]}>
                      <Text style={[styles.messageText, {color: colors.text}]}>
                        {item.message}
                      </Text>
                      <Spacing size={8} />
                      <Text
                        style={[styles.timeText, {alignSelf: 'flex-start'}]}>
                        {formattedTime}
                      </Text>
                    </View>
                  </View>
                );
              }}
              ItemSeparatorComponent={ItemSeparatorComponent}
              ListHeaderComponent={ListHeaderComponent}
              onEndReached={onEndReached}
              inverted
              showsVerticalScrollIndicator={false}
              ListFooterComponent={ListFooterComponent}
            />
            {Platform.OS === 'ios' && (
              <View
                style={[
                  styles.inputContainer,
                  {backgroundColor: colors.chatTheme.containerBackgroundColor},
                ]}>
                <View style={styles.flexOne}>
                  <Input
                    autoCapitalize="words"
                    placeholder={'Type something...'}
                    value={message}
                    onChangeText={text => {
                      setMessage(text);
                    }}
                  />
                </View>
                <Spacing size={12} direction="x" />
                <TouchableContainer
                  onPress={async () => {
                    if (message?.trim()?.length === 0) {
                      Toast.show({message: 'Write a message', type: 'info'});
                      return;
                    }
                    const isoTimestamp = moment().toISOString();
                    emitMessageSend({
                      message,
                      senderId: userId,
                      createdAt: isoTimestamp,
                      storeId: id,
                    });
                    setData(prev => [
                      {message, senderId: userId, createdAt: isoTimestamp},
                      ...prev,
                    ]);
                    setMessage('');
                  }}>
                  <Image
                    source={
                      global?.isDarkMode
                        ? images.ic_send_dark
                        : images.ic_send_light
                    }
                    style={styles.sendIcon}
                  />
                </TouchableContainer>
              </View>
            )}
            <Spacing size={bottom || 20} />
          </Animated.View>
          {Platform.OS === 'android' && (
            <View>
              <View
                style={[
                  styles.inputContainer,
                  {backgroundColor: colors.chatTheme.containerBackgroundColor},
                ]}>
                <View style={styles.flexOne}>
                  <Input
                    autoCapitalize="words"
                    placeholder={'Type something...'}
                    value={message}
                    onChangeText={text => {
                      setMessage(text);
                    }}
                  />
                </View>
                <Spacing size={12} direction="x" />
                <TouchableContainer
                  onPress={async () => {
                    if (message?.trim()?.length === 0) {
                      Toast.show({message: 'Write a message', type: 'info'});
                      return;
                    }
                    const isoTimestamp = moment().toISOString();
                    emitMessageSend({
                      message,
                      senderId: userId,
                      createdAt: isoTimestamp,
                      storeId: id,
                    });
                    setData(prev => [
                      {message, senderId: userId, createdAt: isoTimestamp},
                      ...prev,
                    ]);
                    setMessage('');
                  }}>
                  <Image
                    source={
                      global?.isDarkMode
                        ? images.ic_send_dark
                        : images.ic_send_light
                    }
                    style={styles.sendIcon}
                  />
                </TouchableContainer>
              </View>
              <Spacing size={bottom || 20} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ChatScreen;

const createStyle = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    flexOne: {
      flex: 1,
    },
    headerContainer: {
      height: normalize(84),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sizes.paddingHorizontal,
    },
    leftArrow: {
      width: normalize(24),
      height: normalize(24),
    },
    brandImage: {
      width: normalize(48),
      height: normalize(48),
      borderRadius: 100,
    },
    headerText: {
      ...fontStyles.archivoMedium,
      fontSize: fontPixel(16),
      flex: 1,
    },
    chatContainer: {
      flex: 1,
      borderRadius: normalize(20),
      paddingHorizontal: sizes.paddingHorizontal,
      overflow: 'hidden',
    },
    userMessageContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
    otherMessageContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    avatar: {
      width: normalize(28),
      height: normalize(28),
      borderRadius: 100,
    },
    messageBubble: {
      maxWidth: '70%',
      padding: normalize(12),
      borderRadius: normalize(12),
    },
    userMessageBubble: {
      borderBottomRightRadius: 0,
    },
    otherMessageBubble: {
      borderBottomLeftRadius: 0,
    },
    messageText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
    },
    timeText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: commonColors.gray,
      alignSelf: 'flex-end',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    sendIcon: {
      width: normalize(48),
      height: normalize(48),
    },
  });
