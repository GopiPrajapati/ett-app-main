import {location} from '../../commonutils/helper';
import {endpoints} from '../../networking/endpoints';
import API from '../../networking/NetworkService';
import types from '../types';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * Sets the theme mode for the application.
 *
 * @param {string} mode - The theme mode to set, either 'dark' or 'light'.
 * @returns {object} The action object with type and payload.
 */
export const setThemeMode = mode => ({
  type: types.SET_THEME_MODE,
  payload: mode,
});

/**
 *
 * @param {object} data - The user details
 * @returns {object} The action object with type and payload.
 */
export const setUserDetails = data => ({
  type: types.SET_USER_DETAILS,
  payload: data,
});

/**
 *
 * @param {*} param0
 * @returns
 */
export const getPreference = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.getUserPreference, defaultHeaders, '', {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const updatePreference = (body, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.updatePreference, defaultHeaders, body, {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getUserProfile = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.getProfile, defaultHeaders, '', {
      SuccessCallback: response => {
        const {
          mobileNumber,
          dateOfBirth,
          profileImage,
          firstName,
          lastName,
          gender,
          email,
          isMobileVerified,
          loyaltyPoints,
          isDeleted,
          isProfileCompleted,
          isShareable,
          createdAt,
          updatedAt,
          userSetting,
        } = response?.data;
        dispatch({
          type: types.SET_USER_DETAILS,
          payload: {
            mobileNumber,
            dateOfBirth,
            profileImage,
            firstName,
            lastName,
            gender,
            email,
            isMobileVerified,
            loyaltyPoints,
            isDeleted,
            isProfileCompleted,
            isShareable,
            createdAt,
            updatedAt,
            userSetting,
          },
        });
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const updateUserProfile = (body, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.updateProfile, defaultHeaders, body, {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const updateUserProfileImage = (
  body,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.updateProfileImage,
      defaultHeaders,
      body,
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getHome = ({SuccessCallback, FailureCallback}) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getHome(global.city),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} storeCategory
 * @param {*} page
 * @param {*} limit
 * @param {*} param4
 * @returns
 */
export const getAllInCity = (
  storeCategory,
  page,
  limit,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getBrandsByCity(global.city, storeCategory, page, limit),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} page
 * @param {*} limit
 * @param {*} param2
 * @returns
 */
export const getMalls = (
  page = 0,
  limit = 10,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getShoppingMallsByCity(global.city, page, limit),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getHubs = (
  page = 0,
  limit = 10,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getShoppingHubsByCity(global.city, page, limit),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const submitYettReview = (
  body = {},
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.shareYettFeedback, defaultHeaders, body, {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const toggleLike = (
  businessId,
  type,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.toggleLike(businessId, type),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getSearchedBrands = (
  search,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getSearchedBrands(global.city, search),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getSearchedMalls = (
  search,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getSearchedMalls(global.city, search),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getSearchedHubs = (search, {SuccessCallback, FailureCallback}) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getSearchedHubs(global.city, search),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const uploadImage = (
  preSignedObject = {},
  imageObject = {},
  {SuccessCallback, FailureCallback},
) => {
  API.getInstance().Fetch(
    endpoints.getPresignedObject,
    defaultHeaders,
    preSignedObject,
    {
      SuccessCallback: response => {
        const {presignedUrl, url} = response?.data;

        const requestOptions = {
          method: 'PUT',
          // eslint-disable-next-line no-undef
          body: Buffer.from(imageObject.data, 'base64'), // Convert base64 to binary
          headers: {
            'Content-Type': imageObject.type, // Set correct content type
          },
        };

        fetch(presignedUrl, requestOptions)
          .then(async uploadResponse => {
            if (!uploadResponse.ok) {
              throw new Error(`HTTP error! status: ${uploadResponse.status}`);
            }

            SuccessCallback(url); // Try parsing JSON
          })
          .catch(error => FailureCallback(error));
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    },
  );
};

export const uploadReceiptImage = (
  preSignedObject = {},
  imageObject = {},
  {SuccessCallback, FailureCallback},
) => {
  API.getInstance().Fetch(
    endpoints.getPresignedObject,
    defaultHeaders,
    preSignedObject,
    {
      SuccessCallback: response => {
        const {presignedUrl, url} = response?.data;

        const requestOptions = {
          method: 'PUT',
          // eslint-disable-next-line no-undef
          body: Buffer.from(imageObject.data, 'base64'), // Convert base64 to binary
          headers: {
            'Content-Type': imageObject.type, // Set correct content type
          },
        };

        fetch(presignedUrl, requestOptions)
          .then(async uploadResponse => {
            if (!uploadResponse.ok) {
              throw new Error(`HTTP error! status: ${uploadResponse.status}`);
            }

            SuccessCallback(url); // Try parsing JSON
          })
          .catch(error => FailureCallback(error));
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    },
  );
};

/**
 *
 * @param {*} page
 * @param {*} limit
 * @param {*} param2
 * @returns
 */
export const getFavouriteStoresBrands = (
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    API.getInstance().Fetch(
      endpoints.getFavouriteStoresBrands(page, limit, search, sort),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} page
 * @param {*} limit
 * @param {*} param2
 * @returns
 */
export const getFavouriteMalls = (
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    API.getInstance().Fetch(
      endpoints.getFavouriteMalls(page, limit, search, sort),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} page
 * @param {*} limit
 * @param {*} param2
 * @returns
 */
export const getFavouriteHubs = (
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    API.getInstance().Fetch(
      endpoints.getFavouriteHubs(page, limit, search, sort),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getTermsAndConditions = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.termsAndConditions, defaultHeaders, '', {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getPrivacyPolicy = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.privacyPolicy, defaultHeaders, '', {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getHelpCenter = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.helpCenter, defaultHeaders, '', {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStoreCategory = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.storeCategory, defaultHeaders, '', {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getBusiness = (businessId, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getBusiness(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getProduct = (businessId, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getProduct(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getOffers = (businessId, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getOffers(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStore = (businessId, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStore(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getFeedPosts = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getFeedPosts(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getReview = (businessId, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getReview(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getAmenity = (businessId, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getAmenity(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStoreDetails = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getStoreDetails(
        businessId,
        global?.latitude,
        global?.longitude,
      ),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStoreProduct = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStoreProduct(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStoreOffers = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStoreOffers(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStoreFeedPosts = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStoreFeedPosts(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStoreReview = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStoreReview(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStoreService = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStoreService(businessId),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const writeYettReview = (
  id,
  body = {},
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.addReviewReview(id),
      defaultHeaders,
      body,
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} id
 * @param {*} page
 * @param {*} limit
 * @param {*} param3
 * @returns
 */
export const getUpcomingEvent = (
  id,
  isStore,
  page,
  limit,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getUpcomingEvent(id, isStore, page, limit),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getStories = ({SuccessCallback, FailureCallback}) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getStories(global.city),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          dispatch({type: types.SET_STORIES, payload: response?.data});
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getBanner = ({SuccessCallback, FailureCallback}) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getBanner(global.city),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getAdvertisement = ({SuccessCallback, FailureCallback}) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getAdvertisement(global.city),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} lat
 * @param {*} lng
 * @param {*} param2
 * @returns
 */
export const getLocationStatus = (
  lat,
  lng,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getLocationStatus(lat, lng),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} data
 * @returns
 */
export const setNewLocation = data => {
  return async dispatch => {
    dispatch({
      type: types.SET_CITY,
      payload: data,
    });
  };
};

/**
 *
 * @param {*} data
 * @returns
 */
export const resetLocation = () => {
  return async dispatch => {
    dispatch({
      type: types.RESET_CITY,
    });
  };
};

export const getAllCommunicationMessage = (
  page,
  limit,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getAllCommunicationMessage(page, limit),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getCommunicationMessage = (
  communicationId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getCommunicationMessage(communicationId),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const deleteAccount = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.deleteAccount,
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getInvoices = (
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    const {id} = global.user;
    API.getInstance().Fetch(
      endpoints.getInvoices(id, page, limit, search, sort),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getStores = (
  businessId,
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStores(businessId, page, limit, search, sort),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const productCategory = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.productCategory(businessId),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const storeProductCategory = (
  businessId,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.storeProductCategory(businessId),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getProducts = (
  productCategoryId,
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getProducts(productCategoryId, page, limit, search, sort),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getStoreProducts = (
  storeId,
  productCategoryId,
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStoreProducts(
        storeId,
        productCategoryId,
        page,
        limit,
        search,
        sort,
      ),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getNearbyStore = (
  storeId,
  brandName,
  page,
  limit,
  search,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getNearbyStore(
        storeId,
        brandName,
        global?.latitude,
        global?.longitude,
        page,
        limit,
        search,
      ),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getNearbyStores = (
  storeId,
  page,
  limit,
  search,
  {SuccessCallback, FailureCallback},
) => {
  return (dispatch, getState) => {
    const global = getState().global;
    API.getInstance().Fetch(
      endpoints.getNearbyStores(
        storeId,
        global?.latitude,
        global?.longitude,
        page,
        limit,
        search,
      ),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const uploadReceipt = (
  storeId,
  param,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.submitInvoice(storeId),
      defaultHeaders,
      param,
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getChatMessages = (
  storeId,
  page,
  limit,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getChatMessages(storeId, page, limit),
      defaultHeaders,
      '',
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const createProductAlert = (
  storeId,
  param,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.createProductAlert(storeId),
      defaultHeaders,
      param,
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const updateFCMToken = (
  fcmToken,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.updateFCMToken(fcmToken),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const getNotification = (
  page,
  limit,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getNotification(page, limit),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const markAllAsRead = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.markAllAsRead,
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const updateUserSetting = (
  param,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.updateUserSetting,
      defaultHeaders,
      param,
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} data
 * @returns
 */
export const setCurrentLocation = data => {
  return async dispatch => {
    dispatch({
      type: types.SET_CURRENT_LOCATION,
      payload: data,
    });
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const logout = ({SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.logout,
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

export const setIsLocationSwitched = mode => ({
  type: types.IS_LOCATION_SWITCHED,
  payload: mode,
});

export const getStoreSearchProduct = (
  storeId,
  page,
  limit,
  search,
  sort,
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getStoreSearchProduct(storeId, page, limit, search, sort),
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          SuccessCallback(response);
        },
        FailureCallback: response => {
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const getUnreadNotificationCount = ({
  SuccessCallback,
  FailureCallback,
}) => {
  return dispatch => {
    API.getInstance().Fetch(
      endpoints.getUnreadNotificationCount,
      defaultHeaders,
      {},
      {
        SuccessCallback: response => {
          dispatch({
            type: types.NOTIFICATION_UNREAD_COUNT,
            payload: response?.data || 0,
          });
          SuccessCallback(response);
        },
        FailureCallback: response => {
          dispatch({
            type: types.NOTIFICATION_UNREAD_COUNT,
            payload: 0,
          });
          FailureCallback(response);
        },
      },
    );
  };
};

/**
 *
 * @param {*} param
 * @param {*} param1
 * @returns
 */
export const payUsingUpi = (param, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.payUsingUpi, defaultHeaders, param, {
      SuccessCallback: response => {
        dispatch({
          type: types.NOTIFICATION_UNREAD_COUNT,
          payload: response?.data || 0,
        });
        SuccessCallback(response);
      },
      FailureCallback: response => {
        dispatch({
          type: types.NOTIFICATION_UNREAD_COUNT,
          payload: 0,
        });
        FailureCallback(response);
      },
    });
  };
};

export const resetData = () => {
  return async dispatch => {
    dispatch({
      type: types.RESET_DATA,
    });
  };
};
