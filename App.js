import {APP_CONFIG} from '@env';
import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import RootNavigator from './src/container/RootNavigator';
import {apiConfig} from './src/networking';
import API, {DevelopmentMode} from './src/networking/NetworkService';
import store, {persistor} from './src/redux';

API.getInstance().build(DevelopmentMode?.[APP_CONFIG], apiConfig);

function App() {
  console.info(APP_CONFIG);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <RootNavigator />
      </PersistGate>
    </Provider>
  );
}

export default App;
