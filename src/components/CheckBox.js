import FastImage from 'react-native-fast-image';
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import images from '../assets/images';
import {normalize} from '../commonutils/dimensionutils';
import TouchableContainer from './TouchableContainer';

const CheckBox = ({checkboxStatus = () => {}}) => {
  const [checked, setChecked] = useState(true);
  return (
    <TouchableContainer
      onPress={() => {
        setChecked(!checked);
        checkboxStatus(!checked);
      }}>
      <FastImage
        source={checked ? images.ic_checked_box : images.ic_unchecked_box}
        style={styles.checkBox}
      />
    </TouchableContainer>
  );
};

export default CheckBox;

const styles = StyleSheet.create({
  checkBox: {width: normalize(20), height: normalize(20)},
});
