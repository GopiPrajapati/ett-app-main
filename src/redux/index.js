import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import logger from 'redux-logger';
import rootReducer from './reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    __DEV__
      ? getDefaultMiddleware({
          immutableCheck: false,
          serializableCheck: false,
        }).concat(logger)
      : getDefaultMiddleware({
          immutableCheck: false,
          serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
export default store;
