import React from 'react';
import {StatusBar, View} from 'react-native';
import {useSelector} from 'react-redux';
import {commonColors} from '../commonutils/theme';

/**
 * GlobalStatusBar Component
 *
 * @param {string} barStyle - Determines the text color of the status bar.
 * Possible values: 'light-content' | 'dark-content'.
 * If not provided, it defaults based on the global `isDarkMode` state.
 *
 * @returns {JSX.Element}
 */
const GlobalStatusBar = ({barStyle}) => {
  const global = useSelector(state => state?.global);
  return (
    <View>
      <StatusBar
        translucent={true}
        backgroundColor={commonColors.transparent}
        barStyle={
          barStyle
            ? barStyle
            : global?.isDarkMode
            ? 'light-content'
            : 'dark-content'
        }
      />
    </View>
  );
};

export default React.memo(GlobalStatusBar);
