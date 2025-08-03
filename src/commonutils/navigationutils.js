import {CommonActions, useNavigationState} from '@react-navigation/native';
import * as React from 'react';

export const _navigationRef = React.createRef();

export const goBack = () => {
  _navigationRef.current?.goBack();
};

export const navigate = (name, params) => {
  if (_navigationRef.current?.isReady()) {
    _navigationRef.current?.navigate(name, params);
  }
};

export const navigateAndSimpleReset = (name, index = 0) => {
  if (_navigationRef.current?.isReady()) {
    _navigationRef.current?.dispatch(
      CommonActions.reset({
        index,
        routes: [{name}],
      }),
    );
  }
};

export const navigateAndSimpleResetWithParam = (name, index = 0, params) => {
  if (_navigationRef.current?.isReady()) {
    _navigationRef.current?.dispatch(
      CommonActions.reset({
        index,
        routes: [{name: name, params: params}],
      }),
    );
  }
};

export const currentScreenName = () => {
  return _navigationRef.current?.getCurrentRoute().name;
};

export const usePreviousRouteName = () => {
  return useNavigationState(state =>
    state.routes[state.index - 1]?.name
      ? state.routes[state.index - 1].name
      : 'None',
  );
};
