import FastImage from 'react-native-fast-image';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Video from 'react-native-video';
import {useSelector} from 'react-redux';
import images from '../../../assets/images';
import {
  normalize,
  screenHeight,
  screenWidth,
  sizes,
} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {commonColors} from '../../../commonutils/theme';
import {TouchableContainer} from '../../../components';

const {width} = Dimensions.get('window');
const PERSPECTIVE = width;
const ANGLE = Math.atan(PERSPECTIVE / (width / 2));
const RATIO = 2;
const HEADER_HEIGHT = normalize(70);
const EXTRA_SPACE = normalize(10);

const StoryScreen = props => {
  const {index} = props?.route?.params;
  const global = useSelector(state => state.global);
  const [stories, setStories] = useState([
    {
      stories: global?.stories,
    },
  ]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(index);
  const [isPaused, setIsPaused] = useState(false);
  const {top, bottom} = useSafeAreaInsets();
  const x = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const progress = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(null);
  const lastProgress = useRef(0);
  const currentUserStories = stories[currentUserIndex]?.stories || [];
  const currentStory = currentUserStories[currentStoryIndex];
  useEffect(() => {
    if (!isPaused) {
      startProgress(lastProgress.current);
    }
    return () => {
      if (progressAnim.current) {
        progressAnim.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoryIndex, currentUserIndex, isPaused]);

  const getInterpolatedValues = useCallback(
    offset => ({
      translateX: x.interpolate({
        inputRange: [offset - width, offset + width],
        outputRange: [width / RATIO, -width / RATIO],
        extrapolate: 'clamp',
      }),
      rotateY: x.interpolate({
        inputRange: [offset - width, offset + width],
        outputRange: [`${ANGLE}rad`, `-${ANGLE}rad`],
        extrapolate: 'clamp',
      }),
      translateX1: x.interpolate({
        inputRange: [offset - width, offset + width],
        outputRange: [width / 2, -width / 2],
        extrapolate: 'clamp',
      }),
      translateX2: x.interpolate({
        inputRange: [offset - width, offset + width],
        outputRange: [
          -(width / RATIO / Math.cos(ANGLE / 2) - width / RATIO),
          width / RATIO / Math.cos(ANGLE / 2) - width / RATIO,
        ],
        extrapolate: 'clamp',
      }),
      opacity: x.interpolate({
        inputRange: [offset - width, offset, offset + width],
        outputRange: [0.8, 0, 0.8],
        extrapolate: 'clamp',
      }),
    }),
    [x],
  );

  const startProgress = (fromValue = 0) => {
    progress.setValue(fromValue);
    progressAnim.current = Animated.timing(progress, {
      toValue: 1,
      duration: (currentStory?.duration || 5000) * (1 - fromValue),
      useNativeDriver: false,
    });

    progressAnim.current.start(({finished}) => {
      if (finished && !isPaused) {
        handleNextStory();
      }
    });
  };

  const pauseProgress = () => {
    if (progressAnim.current) {
      progressAnim.current.stop();
      progress.stopAnimation(value => {
        lastProgress.current = value;
      });
    }
  };

  const handleNextStory = () => {
    if (progressAnim.current) {
      progressAnim.current.stop();
    }

    const isLastStoryOfLastUser =
      currentUserIndex === stories.length - 1 &&
      currentStoryIndex === currentUserStories.length - 1;

    if (isLastStoryOfLastUser) {
      goBack();
      return;
    }

    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      lastProgress.current = 0; // Reset progress
    } else if (currentUserIndex < stories.length - 1) {
      const nextUserIndex = currentUserIndex + 1;
      setCurrentUserIndex(nextUserIndex);
      setCurrentStoryIndex(0);
      scrollViewRef?.current?.scrollTo({
        x: width * nextUserIndex,
        animated: true,
      });
      lastProgress.current = 0; // Reset progress
    }
  };

  const handlePreviousStory = () => {
    if (progressAnim.current) {
      progressAnim.current.stop();
    }

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      lastProgress.current = 0; // Reset progress
    } else if (currentUserIndex > 0) {
      const previousUserIndex = currentUserIndex - 1;
      setCurrentUserIndex(previousUserIndex);
      setCurrentStoryIndex(stories[previousUserIndex].stories.length - 1);
      scrollViewRef?.current?.scrollTo({
        x: width * previousUserIndex,
        animated: true,
      });
      lastProgress.current = 0; // Reset progress
    } else {
      lastProgress.current = 0; // Reset progress
      startProgress(0);
    }
  };

  const resumeProgress = () => {
    if (!isPaused) {
      startProgress(lastProgress.current);
    }
  };

  const onScrollBeginDrag = () => {
    setIsPaused(true);
    pauseProgress();
  };

  const onScrollEndDrag = e => {
    const targetContentOffset = e.nativeEvent?.targetContentOffset?.x;
    const _currentUserIndex = Math.round(targetContentOffset / width);

    if (_currentUserIndex !== currentUserIndex) {
      setCurrentUserIndex(_currentUserIndex);
      setCurrentStoryIndex(0);
      lastProgress.current = 0; // Reset progress
    }

    setIsPaused(false);
    resumeProgress();
  };

  const onContentSizeChange = () => {
    scrollViewRef?.current?.scrollTo({
      x: width * currentUserIndex,
      animated: false,
    });
  };

  const onLongPress = () => {
    setIsPaused(true);
    pauseProgress();
  };

  const onPressOut = () => {
    setIsPaused(false);
    resumeProgress();
  };

  const handlePressStory = ({nativeEvent}) => {
    const {locationX} = nativeEvent;
    if (locationX < width * 0.5) {
      handlePreviousStory();
    } else if (locationX > width * 0.5) {
      handleNextStory();
    }
  };

  const ProgressBar = useCallback(
    ({item, index}) => {
      return (
        <View style={styles.progressContainer}>
          {item.stories.map((_, storyIndex) => (
            <View
              key={`${index}-${storyIndex}`}
              style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    width:
                      currentUserIndex === index
                        ? storyIndex === currentStoryIndex
                          ? progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            })
                          : storyIndex < currentStoryIndex
                          ? '100%'
                          : '0%'
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>
      );
    },
    [currentStoryIndex, currentUserIndex, progress],
  );

  const StoryContent = useCallback(
    ({item, index}) =>
      currentUserIndex === index ? (
        <View style={{width: screenWidth, height: screenHeight}}>
          {item.stories[currentStoryIndex]?.fileType === 'Image' ? (
            <View style={{width: screenWidth, height: screenHeight}}>
              {item.stories[currentStoryIndex]?.fileType === 'Image' ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{uri: item.stories[currentStoryIndex]?.url}}
                    blurRadius={100}
                    style={styles.storyBackgroundImage}
                    resizeMethod="scale"
                  />
                  <FastImage
                    key={`${index}-${currentStoryIndex}`}
                    source={{
                      uri: item.stories[currentStoryIndex]?.url,
                      priority: 'high',
                    }}
                    style={styles.storyImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <React.Fragment />
              )}
              {item.stories[currentStoryIndex]?.fileType === 'Video' ? (
                <Video
                  source={{
                    uri: item.stories[currentStoryIndex]?.url,
                  }}
                  style={[styles.storyImage, {width}]}
                  muted={true}
                  repeat={true}
                  paused={currentStoryIndex !== index}
                  resizeMode="cover"
                  bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000,
                    backBufferDurationMs: 120000,
                    cacheSizeMB: 0,
                    live: {
                      targetOffsetMs: 500,
                    },
                  }}
                />
              ) : (
                <React.Fragment />
              )}
            </View>
          ) : (
            <React.Fragment />
          )}
          {item.stories[currentStoryIndex]?.fileType === 'Video' ? (
            <Video
              source={{
                uri: item.stories[currentStoryIndex]?.url,
              }}
              style={[styles.storyImage, {width}]}
              muted={true}
              repeat={true}
              paused={currentStoryIndex !== index}
              resizeMode="cover"
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
                backBufferDurationMs: 120000,
                cacheSizeMB: 0,
                live: {
                  targetOffsetMs: 500,
                },
              }}
            />
          ) : (
            <React.Fragment />
          )}
        </View>
      ) : (
        <View style={{width: screenWidth, height: screenHeight}}>
          {item.stories.map((story, storyIndex) =>
            story?.fileType === 'video' ? (
              <Video
                source={{
                  uri: story?.url,
                }}
                style={[styles.storyImage, {width}]}
                paused={true}
                muted={true}
                repeat={true}
                resizeMode="cover"
                bufferConfig={{
                  minBufferMs: 15000,
                  maxBufferMs: 50000,
                  bufferForPlaybackMs: 2500,
                  bufferForPlaybackAfterRebufferMs: 5000,
                  backBufferDurationMs: 120000,
                  cacheSizeMB: 0,
                  live: {
                    targetOffsetMs: 500,
                  },
                }}
              />
            ) : (
              <FastImage
                key={`${index}-${storyIndex}`}
                source={{uri: story?.url, priority: 'high'}}
                style={styles.storyImage}
                resizeMode="cover"
              />
            ),
          )}
        </View>
      ),
    [currentStoryIndex, currentUserIndex],
  );

  return (
    <View style={styles.container}>
      {stories.map((item, index) => {
        const interpolated = getInterpolatedValues(index * width);
        return (
          <Animated.View
            key={index}
            style={[
              styles.storyContainer,
              {
                transform: [
                  {perspective: PERSPECTIVE},
                  {translateX: interpolated.translateX},
                  {rotateY: interpolated.rotateY},
                  {translateX: interpolated.translateX1},
                  {translateX: interpolated.translateX2},
                ],
              },
            ]}>
            <View
              style={[styles.progressbarContainer, {top: top + EXTRA_SPACE}]}>
              <ProgressBar item={item} index={index} />
              <TouchableContainer
                styles={styles.closeIconContainer}
                onPress={() => goBack()}>
                <Image source={images.ic_x_close} style={styles.closeIcon} />
              </TouchableContainer>
            </View>
            <StoryContent item={item} index={index} />
            <Animated.View
              style={[styles.mask, {opacity: interpolated.opacity}]}
            />
          </Animated.View>
        );
      })}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        onScrollEndDrag={onScrollEndDrag}
        style={[
          styles.scrollView,
          {top: top + HEADER_HEIGHT, bottom: bottom + EXTRA_SPACE},
        ]}
        scrollEventThrottle={16}
        snapToInterval={width}
        contentContainerStyle={{
          width: width * stories.length,
        }}
        onContentSizeChange={onContentSizeChange}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {x}}}], {
          useNativeDriver: true,
        })}
        decelerationRate="fast">
        {stories.map((_, index) => (
          <TouchableWithoutFeedback
            key={index}
            onLongPress={onLongPress}
            onPress={handlePressStory}
            onPressOut={onPressOut}
            delayLongPress={150}>
            <View style={styles.touchableArea} />
          </TouchableWithoutFeedback>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const UserInfo = ({item}) => (
  <View style={styles.userInfo}>
    <Image source={{uri: item.userAvatar}} style={styles.avatar} />
    <Text style={styles.username}>{item.username}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: commonColors.black,
  },
  scrollView: {
    ...StyleSheet.absoluteFillObject,
  },
  storyContainer: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: 'hidden',
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyBackgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  progressbarContainer: {
    position: 'absolute',
    top: EXTRA_SPACE,
    height: HEADER_HEIGHT,
    width: screenWidth,
    zIndex: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    width: '100%',
    zIndex: 1,
    paddingHorizontal: normalize(4),
  },
  progressBarBackground: {
    flex: 1,
    height: normalize(1.5),
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 100,
    marginHorizontal: normalize(2),
  },
  progressBar: {
    height: '100%',
    backgroundColor: commonColors.brandColor,
    borderRadius: 100,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(60),
    width: screenWidth,
    zIndex: 2,
    paddingHorizontal: sizes.paddingHorizontal,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: commonColors.black,
  },
  touchableArea: {
    flex: 1,
  },
  closeIconContainer: {
    alignSelf: 'flex-end',
    margin: normalize(10),
  },
  closeIcon: {
    width: normalize(20),
    height: normalize(20),
  },
});

export default StoryScreen;
