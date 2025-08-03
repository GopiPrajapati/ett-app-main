import {useTheme} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import images from '../../../assets/images';
import strings from '../../../assets/strings';
import {fontPixel, normalize, sizes} from '../../../commonutils/dimensionutils';
import {goBack} from '../../../commonutils/navigationutils';
import {fontStyles} from '../../../commonutils/typography';
import {
  Button,
  GlobalStatusBar,
  Header,
  Input,
  Spacing,
  TouchableContainer,
} from '../../../components';
import Toast from '../../../components/Toast';
import {writeYettReview} from '../../../redux/actions';

const WriteReviewScreen = props => {
  const {colors} = useTheme();
  const maxCharacters = 400;
  const {bottom} = useSafeAreaInsets();
  const [stars, setStars] = useState(Array(5).fill(true));
  const [reviewText, setReviewText] = useState('');
  const dispatch = useDispatch();

  const styles = useMemo(() => createStyle(colors), [colors]);

  const handleStarPress = useCallback(
    index => {
      setStars(stars.map((_, i) => i <= index));
    },
    [stars],
  );

  const handleInputChange = useCallback(text => {
    setReviewText(text.slice(0, maxCharacters));
  }, []);

  const remainingCharacters = maxCharacters - reviewText.length;

  const onPressSubmitReview = () => {
    dispatch(
      writeYettReview(
        props.route.params.id,
        {
          rating: Number(stars.reduce((total, _) => total + (_ ? 1 : 0), 0)),
          review: reviewText?.trim(),
        },
        {
          SuccessCallback: response => {
            Toast.show({message: response?.message, type: 'success'});
            goBack();
          },
          FailureCallback: response => {
            if (response?.data?.message) {
              Toast.show({message: response?.data?.message});
              goBack();
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
        onPressLeftArrow={goBack}
        leftText={strings.write_a_yett_review}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Spacing size={24} />
          <Text style={styles.questionText}>{strings.how_did_we_do}</Text>
          <Spacing size={12} />
          <View style={styles.starsContainer}>
            {stars.map((isFilled, index) => (
              <TouchableContainer
                key={index}
                onPress={() => handleStarPress(index)}>
                <Image
                  source={
                    isFilled ? images.ic_filled_star : images.ic_empty_star
                  }
                  style={styles.starImage}
                />
              </TouchableContainer>
            ))}
          </View>
          <Spacing size={32} />
          <Spacing size={1} style={styles.divider} />
          <Spacing size={32} />
          <Text style={styles.questionText}>
            {strings.want_to_tell_us_more}
          </Text>
          <Spacing size={12} />
          <Input
            multiline
            numberOfLines={5}
            placeholder={strings.share_details_of_your_experience_at_this_store}
            style={styles.inputContainer}
            textInputStyle={styles.inputText}
            value={reviewText}
            autoCapitalize="sentences"
            onChangeText={handleInputChange}
          />
          <Text style={styles.charactersRemaining}>
            {remainingCharacters} {strings.characters_remaining}
          </Text>
        </ScrollView>
        <Button
          type="primaryButton"
          title={strings.submit_review}
          onPress={onPressSubmitReview}
        />
        <Spacing size={bottom + normalize(10)} />
      </View>
    </SafeAreaView>
  );
};

export default WriteReviewScreen;

const createStyle = colors =>
  StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.writeReviewTheme.mainBackgroundColor,
    },
    container: {
      flex: 1,
      paddingHorizontal: sizes.paddingHorizontal,
      backgroundColor: colors.writeReviewTheme.containerBackgroundColor,
      borderTopLeftRadius: normalize(20),
      borderTopRightRadius: normalize(20),
    },
    scrollContent: {
      paddingBottom: normalize(50),
    },
    questionText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.writeReviewTheme.color,
    },
    starsContainer: {
      flexDirection: 'row',
    },
    starImage: {
      width: normalize(40),
      height: normalize(40),
      marginRight: normalize(16),
    },
    divider: {
      backgroundColor: colors.writeReviewTheme.dividerColor,
    },
    inputContainer: {
      height: normalize(200),
      alignItems: 'flex-start',
      paddingVertical: normalize(15),
    },
    inputText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
    },
    charactersRemaining: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(12),
      color: '#828282',
      textAlign: 'right',
      marginTop: normalize(8),
    },
  });
