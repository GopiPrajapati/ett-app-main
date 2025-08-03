import {Method} from './NetworkService';
import * as helpers from '../commonutils/helper';

const isAccessToken = helpers.accessToken;

export const endpoints = {
  sendOtp: {
    endpoint: '/v1/user/send-otp',
    method: Method.POST,
  },
  signup: {
    endpoint: '/v1/user/signup',
    method: Method.POST,
  },
  signin: {
    endpoint: '/v1/user/mobile/login',
    method: Method.POST,
  },
  getProfile: {
    endpoint: '/v1/user/get-profile',
    method: Method.GET,
  },
  updateProfile: {
    endpoint: '/v1/user/mobile/update-profile',
    method: Method.PUT,
  },
  verifyMobile: {
    endpoint: '/v1/user/mobile/verify-mobile',
    method: Method.POST,
  },
  generateToken: {
    endpoint: '/v1/token',
    method: Method.POST,
  },
  getPreference: {
    endpoint: '/v1/preference',
    method: Method.GET,
  },
  getBrandsByCity: (city, storeCategory, page, limit) => {
    let endpoint = isAccessToken
      ? `/v1/business/mobile/cityWiseBrand/${city}`
      : `/v1/business/mobile/cityWiseBrandList/${city}`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
      if (storeCategory) {
        endpoint = `${endpoint}&storeCategory=${storeCategory}`;
      }
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getHome: (city, page, limit) => {
    let endpoint = isAccessToken
      ? `/v1/business/mobile/cityWiseAll/${city}`
      : `/v1/business/mobile/cityWiseAllList/${city}`;
    if (page >= 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }
    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getShoppingMallsByCity: (city, page, limit) => {
    let endpoint = isAccessToken
      ? `/v1/business/mobile/cityWiseMall/${city}`
      : `/v1/business/mobile/cityWiseMallList/${city}`;
    if (page >= 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }
    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getShoppingHubsByCity: (city, page, limit) => {
    let endpoint = isAccessToken
      ? `/v1/business/mobile/cityWiseShoppingHub/${city}`
      : `/v1/business/mobile/cityWiseShoppingHubList/${city}`;
    if (page >= 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }
    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  shareYettFeedback: {
    endpoint: `/v1/feedback/mobile/create`,
    method: Method.POST,
  },
  getUserPreference: {
    endpoint: `/v1/preference/user/mobile/user-preferences`,
    method: Method.GET,
  },
  updatePreference: {
    endpoint: `/v1/preference/user/mobile/update`,
    method: Method.POST,
  },
  getSearchedBrands: (city, search) => {
    return {
      endpoint: isAccessToken
        ? `/v1/business/mobile/cityWiseBrand/${city}?search=${search}`
        : `/v1/business/mobile/cityWiseBrandList/${city}?search=${search}`,
      method: Method.GET,
    };
  },
  getSearchedMalls: (city, search) => {
    return {
      endpoint: isAccessToken
        ? `/v1/business/mobile/cityWiseMall/${city}?search=${search}`
        : `/v1/business/mobile/cityWiseMallList/${city}?search=${search}`,
      method: Method.GET,
    };
  },
  getSearchedHubs: (city, search) => {
    return {
      endpoint: isAccessToken
        ? `/v1/business/mobile/cityWiseShoppingHub/${city}?search=${search}`
        : `/v1/business/mobile/cityWiseShoppingHubList/${city}?search=${search}`,
      method: Method.GET,
    };
  },
  getBrandDetails: id => {
    return {
      endpoint: `/v1/business/mobile/cityWiseShoppingHub/:${id}`,
      method: Method.GET,
    };
  },
  submitInvoice: storeId => {
    return {
      endpoint: `/v1/invoice/mobile/create/${storeId}`,
      method: Method.POST,
    };
  },
  getInvoices: (userId, page, limit, search, sort) => {
    let endpoint = `/v1/invoice/mobile/${userId}`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }
    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  toggleLike: (businessId, type) => {
    let endpoint = `/v1/user/favorite/mobile/togglelike/${businessId}`;

    if (type) {
      if (type === 'Online' || type === 'Offline') {
        endpoint = endpoint + `?type=Store`;
      } else {
        endpoint = endpoint + `?type=${type}`;
      }
    }

    return {
      endpoint: endpoint,
      method: Method.PUT,
    };
  },
  getPresignedObject: {
    endpoint: '/v1/presigned/putObject/',
    method: Method.POST,
  },
  updateProfileImage: {
    endpoint: '/v1/user/mobile/profileImage',
    method: Method.PUT,
  },
  getFavouriteStoresBrands: (page, limit, search, sort) => {
    let endpoint = `/v1/user/favorite/mobile/getFavoriteShops`;
    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getFavouriteMalls: (page, limit, search, sort) => {
    let endpoint = `/v1/user/favorite/mobile/getFavoriteMall`;
    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getFavouriteHubs: (page, limit, search, sort) => {
    let endpoint = `/v1/user/favorite/mobile/getFavoriteShoppingHub`;
    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  termsAndConditions: {
    endpoint: '/v1/utils/terms-and-conditions',
    method: Method.GET,
  },
  privacyPolicy: {
    endpoint: '/v1/utils/privacy-policy',
    method: Method.GET,
  },
  helpCenter: {
    endpoint: '/v1/utils/helpCenter',
    method: Method.GET,
  },
  storeCategory: {
    endpoint: '/v1/business/mobile/storeCategory',
    method: Method.GET,
  },
  getBusiness: businessId => {
    return {
      endpoint: isAccessToken
        ? `/v1/business/mobile/${businessId}`
        : `/v1/business/mobile/public/${businessId}`,
      method: Method.GET,
    };
  },
  getProduct: businessId => {
    return {
      endpoint: `/v1/product/mobile/list/${businessId}`,
      method: Method.GET,
    };
  },
  getOffers: businessId => {
    return {
      endpoint: `/v1/offers/mobile/list/${businessId}`,
      method: Method.GET,
    };
  },
  getStore: businessId => {
    return {
      endpoint: isAccessToken
        ? `/v1/store/mobile/list/${businessId}?type=App`
        : `/v1/store/mobile/public-list/${businessId}?type=App`,
      method: Method.GET,
    };
  },
  getFeedPosts: businessId => {
    return {
      endpoint: `/v1/feed/mobile/posts/${businessId}`,
      method: Method.GET,
    };
  },
  getReview: businessId => {
    return {
      endpoint: `/v1/review/mobile/${businessId}`,
      method: Method.GET,
    };
  },
  getAmenity: businessId => {
    return {
      endpoint: `/v1/amenity/mobile/business/${businessId}`,
      method: Method.GET,
    };
  },
  getStoreDetails: (storeId, lat, lng) => {
    let endpoint = isAccessToken
      ? `/v1/store/mobile/${storeId}`
      : `/v1/store/mobile/public/${storeId}`;

    if (lat && lng) {
      endpoint = endpoint + `?latitude=${lat}&longitude=${lng}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getStoreProduct: storeId => {
    return {
      endpoint: `/v1/product/mobile/list/store/${storeId}`,
      method: Method.GET,
    };
  },
  getStoreProductByCategory: storeId => {
    return {
      endpoint: `/v1/product/mobile/list/store/${storeId}`,
      method: Method.GET,
    };
  },
  getStoreOffers: storeId => {
    return {
      endpoint: `/v1/offers/mobile/list/store/${storeId}`,
      method: Method.GET,
    };
  },
  getStoreFeedPosts: storeId => {
    return {
      endpoint: `/v1/feed/mobile/posts/store/${storeId}`,
      method: Method.GET,
    };
  },
  getStoreReview: storeId => {
    return {
      endpoint: `/v1/review/mobile/store/${storeId}`,
      method: Method.GET,
    };
  },
  getStoreService: storeId => {
    return {
      endpoint: `/v1/service/mobile/list/store/${storeId}`,
      method: Method.GET,
    };
  },
  addReviewReview: businessId => {
    return {
      endpoint: `/v1/review/mobile/${businessId}`,
      method: Method.POST,
    };
  },
  getUpcomingEvent: (storeId, isStore, page = 1, limit = 0) => {
    let endpoint = `/v1/events/mobile`;

    if (isStore) {
      endpoint += `?storeId=${storeId}`;
    } else {
      endpoint += `/business/${storeId}`;
    }

    const queryParams = new URLSearchParams();

    if (page > 0) {
      queryParams.append('page', page);
      queryParams.append('limit', limit);
    }

    if (queryParams.toString()) {
      endpoint += isStore
        ? `&${queryParams.toString()}`
        : `?${queryParams.toString()}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getStories: city => ({
    endpoint: `/v1/admin/media/Stories?city=${city}`,
    method: Method.GET,
  }),
  getBanner: city => ({
    endpoint: `/v1/admin/media/Banner?city=${city}`,
    method: Method.GET,
  }),
  getAdvertisement: city => ({
    endpoint: `/v1/admin/media/Advertisement?city=${city}`,
    method: Method.GET,
  }),
  getLocationStatus: (lat, lng) => {
    let endpoint = `/v1/user/mobile/location`;

    if (lat >= 0 && lng >= 0) {
      endpoint = `${endpoint}?lat=${lat}&lng=${lng}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getAllCommunicationMessage: (page, limit) => {
    let endpoint = `/v1/communication/mobile/messages/all`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getCommunicationMessage: communicationId => {
    let endpoint = `/v1/communication/mobile`;

    if (communicationId) {
      endpoint = `${endpoint}/${communicationId}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  deleteAccount: {
    endpoint: '/v1/user/mobile/deleteAccount',
    method: Method.PUT,
  },
  getStores: (businessId, page, limit, search, sort) => {
    let endpoint = isAccessToken
      ? `/v1/store/mobile/list/${businessId}`
      : `/v1/store/mobile/public-list/${businessId}`;

    if (page > 0) {
      endpoint = `${endpoint}?type=App&page=${page}&limit=${limit}`;
    }

    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  productCategory: businessId => {
    let endpoint = `/v1/product/business-category/mobile/${businessId}`;

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  storeProductCategory: businessId => {
    let endpoint = `/v1/store/mobile/category/${businessId}`;

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getProducts: (productCategoryId, page, limit, search, sort) => {
    let endpoint = `/v1/product/mobile/list/products/${productCategoryId}`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getStoreProducts: (storeId, productCategoryId, page, limit, search, sort) => {
    let endpoint = `/v1/store/mobile/store-products/${storeId}?categoryId=${productCategoryId}`;

    if (page > 0) {
      endpoint = `${endpoint}&page=${page}&limit=${limit}`;
    }

    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getNearbyStore: (businessId, brandName, lat, lng, page, limit, search) => {
    let endpoint = `/v1/store/mobile/nearby-stores/${businessId}`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}&latitude=${lat}&longitude=${lng}&brandName=${brandName}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getNearbyStores: (businessId, lat, lng, page, limit, search) => {
    let endpoint = `/v1/store/mobile/nearby-stores/${businessId}?latitude=${lat}&longitude=${lng}`;

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getChatMessages: (storeId, page, limit) => {
    let endpoint = `/v1/chat/getMessages/${storeId}`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  createProductAlert: storeId => {
    return {
      endpoint: `/v1/product/alert/mobile/${storeId}`,
      method: Method.POST,
    };
  },
  updateFCMToken: fcmToken => {
    return {
      endpoint: `/v1/user/mobile/updateFCMToken/${fcmToken}`,
      method: Method.POST,
    };
  },
  getNotification: (page, limit) => {
    let endpoint = `/v1/notification/mobile/all`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  markAllAsRead: {
    endpoint: '/v1/notification/mobile/markAllAsRead',
    method: Method.PUT,
  },
  updateUserSetting: {
    endpoint: '/v1/user/mobile/updateUserSetting',
    method: Method.PUT,
  },
  logout: {
    endpoint: '/v1/user/mobile/logout',
    method: Method.PUT,
  },
  getStoreSearchProduct: (storeId, page, limit, search, sort) => {
    let endpoint = `/v1/product/mobile/searchProduct/${storeId}`;

    if (page > 0) {
      endpoint = `${endpoint}?page=${page}&limit=${limit}`;
    }

    if (sort) {
      endpoint = `${endpoint}&sort=${sort}`;
    }

    if (search) {
      endpoint = `${endpoint}&search=${search}`;
    }

    return {
      endpoint: endpoint,
      method: Method.GET,
    };
  },
  getUnreadNotificationCount: {
    endpoint: '/v1/notification/mobile',
    method: Method.GET,
  },
  payUsingUpi: {
    endpoint: '/v1/upi/mobile',
    method: Method.POST,
  },
};
