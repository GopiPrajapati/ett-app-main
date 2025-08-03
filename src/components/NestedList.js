import {useTheme} from '@react-navigation/native';
import React from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {fontPixel} from '../commonutils/dimensionutils';
import {fontStyles} from '../commonutils/typography';
import Spacing from './Spacing';

const ParseText = ({input = ''}) => {
  const regex = /(<b>.*?<\/b>)|(<a href=".*?">.*?<\/a>)/g;
  const parts = input.split(regex); // Split text by <b> and <a> tags
  const {colors} = useTheme();
  const styles = createStyle(colors);

  return parts.map((part, index) => {
    if (/<b>.*?<\/b>/.test(part)) {
      // Handle bold text
      const boldText = part.slice(3, -4); // Remove <b> and </b>
      return (
        <Text key={index} style={styles.boldText}>
          {boldText}
        </Text>
      );
    } else if (/<a href=".*?">.*?<\/a>/.test(part)) {
      // Handle link
      const linkText = part.match(/>(.*?)<\/a>/)[1]; // Extract link text
      const linkHref = part.match(/<a href="(.*?)">/)[1]; // Extract href
      return (
        <Text
          key={index}
          style={styles.linkText}
          onPress={() => Linking.openURL(`mailto:${linkHref}`)}>
          {linkText}
        </Text>
      );
    }

    return <Text key={index}>{part}</Text>;
  });
};

const NestedList = ({items, level = 0}) => {
  const {colors} = useTheme();
  const styles = createStyle(colors);

  if (!items) return null;

  return (
    <View style={level > 0 ? {paddingLeft: level * 6} : null}>
      {items.map((item, index) => (
        <View key={index}>
          {item.subItems && <Spacing size={5} />}
          <Text style={styles[`level${level}`] || styles.defaultLevel}>
            <ParseText input={item.text} />
          </Text>
          {item.subItems && <Spacing size={5} />}
          {item.subItems && (
            <NestedList items={item.subItems} level={level + 1} />
          )}
        </View>
      ))}
    </View>
  );
};

export default NestedList;

const createStyle = colors =>
  StyleSheet.create({
    text: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
    },
    level0: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: colors.privacyPolicyTheme.level0TextColor,
    },
    boldText: {
      ...fontStyles.archivoMedium,
      color: colors.privacyPolicyTheme.level0TextColor,
    },
    linkText: {
      ...fontStyles.archivoMedium,
      color: colors.privacyPolicyTheme.level0TextColor,
    },
    defaultLevel: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(14),
      color: '#828282',
    },
  });
