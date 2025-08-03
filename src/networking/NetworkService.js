import {DEVELOPMENT_URL, PRODUCTION_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import httpClient from 'axios';
import {Platform} from 'react-native';
import _package from '../../package.json';
import * as helper from '../commonutils/helper';
import {navigateAndSimpleReset} from '../commonutils/navigationutils';
import storage from '../commonutils/storage';
import {Routes} from '../container/Routes';
import {persistor} from '../redux';
import {endpoints} from './endpoints';
import {resetData} from '../redux/actions';

export const apiConfig = {
  productionBaseURL: `${PRODUCTION_URL}/api`, // For Release.
  developmentBaseURL: `${DEVELOPMENT_URL}/api`, // For development.
};

const axios = httpClient.create();
axios.defaults.timeout = 60000;
let instance = null;
let isNavigatedToLoginScreen = false;

export const DevelopmentMode = {
  PRODUCTION: 'PRODUCTION',
  DEVELOPMENT: 'DEVELOPMENT',
};

export const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  OPTIONS: 'OPTIONS',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

export const Headers = {
  AUTHORIZATION: 'Authorization',
  COOKIE: 'Cookie',
};

const defaultHeader = {
  'Content-Type': 'application/json',
  app_version:
    Platform.OS === 'ios' ? _package.iOSVersion : _package.androidVersion,
  platform: Platform.OS,
  'x-business-id': 0,
};

const KEYS = {
  SuccessCallback: 'success',
  FailureCallback: 'failure',
  Param: 'Param - ',
  URL: 'URL - ',
  Method: 'Method - ',
  Headers: 'Header - ',
  SuccessCallbackUrl: 'success of URL - ',
  FailureCallbackUrl: 'failure of URL - ',
};

class API {
  static baseURL;
  _DevMode;
  _method;
  _endPoint;
  _Headers;
  _params;

  constructor() {}

  static getInstance() {
    if (!instance) {
      instance = new API();
    }
    return instance;
  }

  build(mode, config) {
    this._DevMode = mode;
    switch (this._DevMode) {
      case DevelopmentMode.PRODUCTION:
        API.baseURL = config.productionBaseURL;
        break;
      case DevelopmentMode.TESTING:
        API.baseURL = config.testingBaseURL;
        break;
      case DevelopmentMode.DEVELOPMENT:
        API.baseURL = config.developmentBaseURL;
        break;
      default:
        API.baseURL = config.developmentBaseURL;
    }
    this.setupResponseInterceptor(API.baseURL);
  }

  setHeader(key, value) {
    axios.defaults.headers.common[key] = value;
  }

  setupResponseInterceptor(baseURL) {
    axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // Check if it's a 401 error (use error.response.status instead of error.status)
        if (error.response?.status === 401) {
          const refreshToken = await AsyncStorage.getItem(
            storage.REFRESH_TOKEN,
          );

          if (refreshToken === null) {
            return Promise.reject(error);
          }

          // Skip token refresh for login and generateToken endpoints
          if (
            [
              endpoints.verifyMobile.endpoint,
              endpoints.generateToken.endpoint,
            ].some(endpoint => originalRequest.url.includes(endpoint))
          ) {
            await this.forceLogout();
            return Promise.reject(error);
          }

          // Only attempt refresh if not already retried and refreshToken exists
          if (!originalRequest._retry && refreshToken) {
            originalRequest._retry = true;

            try {
              const response = await axios.post(
                baseURL + endpoints.generateToken.endpoint,
                {refreshToken},
                {headers: {Authorization: false}},
              );

              if (response?.status === 200) {
                const _accessToken = response?.data?.data?.tokens?.accessToken;
                helper.accessToken = _accessToken;
                await AsyncStorage.setItem(
                  storage.ACCESS_TOKEN,
                  String(_accessToken),
                );
                axios.defaults.headers.common.Authorization =
                  'Bearer ' + _accessToken;
                originalRequest.headers.Authorization = `Bearer ${_accessToken}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              console.log('ResponseInterceptor - ', refreshError);
              // Logout on any refresh error
              await this.forceLogout();
            }
          } else {
            // No refresh token or already retried - force logout
            await this.forceLogout();
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Add this helper method if not already present
  async forceLogout() {
    if (!isNavigatedToLoginScreen) {
      isNavigatedToLoginScreen = true;
      const keys = await AsyncStorage.getAllKeys();
      keys.map(async key => {
        if (key !== storage.WALK_THROUGH_GUIDE)
          await AsyncStorage.removeItem(key);
      });
      await persistor.purge();
      navigateAndSimpleReset(Routes.LOGIN_SIGNUP_SCREEN);
      setTimeout(async () => {
        isNavigatedToLoginScreen = false;
      }, 800);
    }
  }

  getDevMode() {
    return this._DevMode;
  }

  retry({SuccessCallback, FailureCallback}) {
    this.getResult(this._method, this._endPoint, this._Headers, this._params, {
      SuccessCallback,
      FailureCallback,
    });
  }

  networkLog(TAG, response) {
    if (this._DevMode !== DevelopmentMode.PRODUCTION) {
      console.log(TAG, response);
    }
  }

  async Fetch(
    endpointConfig,
    _headers,
    params,
    {SuccessCallback, FailureCallback},
  ) {
    this._method = endpointConfig.method;
    this._endPoint = endpointConfig.endpoint;
    const headers = {...defaultHeader, ..._headers};
    this._params = params;

    this.getResult(
      endpointConfig.method,
      endpointConfig.endpoint,
      headers,
      params,
      {
        SuccessCallback,
        FailureCallback,
      },
    );
  }

  async getResult(
    method,
    endPoint,
    _headers,
    params,
    {SuccessCallback, FailureCallback},
  ) {
    const url = API.baseURL + endPoint;
    const headers = {...headers, ...defaultHeader};
    this.networkLog(KEYS.Param, params);
    this.networkLog(KEYS.URL, url);
    this.networkLog(KEYS.Method, method);
    this.networkLog(KEYS.Headers, headers);

    try {
      let res;
      switch (method) {
        case Method.GET:
          res = await axios.get(url, {
            headers: headers,
            params,
          });
          break;
        case Method.POST:
          res = await axios.post(url, params, {headers});
          break;
        case Method.PUT:
          res = await axios.put(url, params, {headers});
          break;
        case Method.DELETE:
          res = await axios.delete(url, {headers, data: params});
          break;
        case Method.PATCH:
          res = await axios.patch(url, params, {headers});
          break;
        default:
          return null;
      }
      if (res.status === 200 || res.status === 201) {
        this.networkLog(KEYS.SuccessCallbackUrl, url);
        this.networkLog(KEYS.SuccessCallback, res);
        SuccessCallback(res.data);
      } else {
        this.networkLog(KEYS.FailureCallbackUrl, url);
        this.networkLog(KEYS.FailureCallback, res);
        FailureCallback(res);
      }
    } catch (error) {
      this.networkLog(KEYS.FailureCallbackUrl, url);
      this.networkLog(KEYS.FailureCallback, error);
      FailureCallback(error.response || error);
    }
  }

  static getBaseURL() {
    return API.baseURL;
  }
}

export default API;
