import {useTheme} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import images from '../assets/images';
import {fontPixel, normalize} from '../commonutils/dimensionutils';
import {commonColors} from '../commonutils/theme';
import {fontStyles} from '../commonutils/typography';
import Spacing from './Spacing';
import ToggleSwitch from './ToggleSwitch';
import TouchableContainer from './TouchableContainer';

const Menu = ({
  _item,
  onPress,
  onToggle,
  enabled = false,
  menuEnabled = true,
}) => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  return (
    <TouchableContainer onPress={onPress}>
      <View style={styles.profileMenuOption}>
        <View style={styles.optionLeft}>
          {_item.source && (
            <Image
              source={_item.source}
              style={styles.optionIcon}
              resizeMode="contain"
            />
          )}
          {_item.source && <Spacing size={12} direction="x" />}
          <Text
            style={{
              ...styles.optionText,
              color: !menuEnabled
                ? commonColors.gray
                : _item?.color
                ? _item?.color
                : colors.text,
            }}>
            {_item.title}
          </Text>
        </View>
        {_item.menuType === 'chevron-right' && (
          <Image
            source={images.ic_chevron_right}
            style={styles.chevronIcon}
            resizeMode="contain"
          />
        )}
        {_item.menuType === 'switch' && (
          <ToggleSwitch
            isEnabled={enabled}
            disabled={!menuEnabled}
            onToggle={enabled => onToggle(enabled)}
          />
        )}
      </View>
    </TouchableContainer>
  );
};

export const CategoryTitle = ({title}) => {
  const {colors} = useTheme();
  const styles = createStyle(colors);
  return (
    <>
      <Text style={styles.profileMenuTitle}>{title}</Text>
      <Spacing size={18} />
    </>
  );
};

export default React.memo(Menu);

const createStyle = colors =>
  StyleSheet.create({
    profileMenuContainer: {
      flex: 1,
    },
    profileMenuTitle: {
      ...fontStyles.archivoBold,
      fontSize: fontPixel(20),
      color: colors.text,
    },
    profileMenuOption: {
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: normalize(16),
      marginBottom: normalize(12),
      borderRadius: normalize(12),
      backgroundColor: colors.background,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: normalize(12),
    },
    optionIcon: {
      width: normalize(20),
      height: normalize(20),
    },
    optionText: {
      ...fontStyles.archivoRegular,
      fontSize: fontPixel(16),
      flex: 1,
    },
    chevronIcon: {
      width: normalize(20),
      height: normalize(20),
      alignSelf: 'center',
    },
  });
