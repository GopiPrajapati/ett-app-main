import {endpoints} from '../../networking/endpoints';
import API from '../../networking/NetworkService';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 *
 * @param {*} body
 * @param {*} param1
 * @returns
 */
export const sendOtp = (body = {}, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.sendOtp, defaultHeaders, body, {
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
 * @param {*} body
 * @param {*} param1
 * @returns
 */
export const login = (body = {}, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.signin, defaultHeaders, body, {
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
 * @param {*} body
 * @param {*} param1
 * @returns
 */
export const verifyMobileNumber = (
  body = {},
  {SuccessCallback, FailureCallback},
) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.verifyMobile, defaultHeaders, body, {
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
 * @param {object} body
 * @param {*} param1
 * @returns
 */
export const signup = (body = {}, {SuccessCallback, FailureCallback}) => {
  return dispatch => {
    API.getInstance().Fetch(endpoints.signup, defaultHeaders, body, {
      SuccessCallback: response => {
        SuccessCallback(response);
      },
      FailureCallback: response => {
        FailureCallback(response);
      },
    });
  };
};
