import types from '../types';

const initialState = {
  themeMode: 'light',
  isDarkMode: false,
  user: {},
  stories: [],
  displayName: '',
  city: '',
  address: '',
  latitude: undefined,
  longitude: undefined,
  currentLocation: {
    displayName: '',
    city: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
  },
  isLocationSwitched: false,
  unreadNotificationCount: 0,
  isUserLoggedIn: false,
};

 

const global = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_THEME_MODE:
      return {
        ...state,
        themeMode: action.payload,
        isDarkMode: action.payload === 'dark',
      };
    case types.SET_USER_DETAILS:
      const _user = {...state.user, ...action.payload};
      return {
        ...state,
        user: _user,
        isUserLoggedIn: Object?.keys?.(_user)?.length > 0,
      };
    case types.SET_CITY:
      let copyState = {
        displayName: action.payload?.displayName || action.payload.address,
        city: action.payload.city,
        address: action.payload.address,
      };

      if (action?.payload?.latitude && action?.payload?.longitude) {
        copyState = {
          ...copyState,
          latitude: action?.payload?.latitude,
          longitude: action?.payload?.longitude,
        };
      }

      return {
        ...state,
        ...copyState,
      };
    case types.SET_STORIES:
      return {
        ...state,
        stories: action.payload,
      };
    case types.SET_CURRENT_LOCATION:
      return {
        ...state,
        currentLocation: {...state.currentLocation, ...action.payload},
      };
    case types.RESET_CITY:
      return {
        ...state,
        city: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        displayName: '',
        currentLocation: {
          displayName: '',
          city: '',
          address: '',
          latitude: undefined,
          longitude: undefined,
        },
      };
    case types.IS_LOCATION_SWITCHED:
      return {
        ...state,
        isLocationSwitched: action.payload,
      };
    case types.NOTIFICATION_UNREAD_COUNT:
      return {
        ...state,
        unreadNotificationCount: action.payload,
      };
    case types.RESET_DATA:
      return {
        ...state,
        user: {},
        isUserLoggedIn: false,
        unreadNotificationCount: 0,
      };
    default:
      return state;
  }
};

export default global;
