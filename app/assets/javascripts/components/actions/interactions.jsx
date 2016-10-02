import api from '../api'

export const REBLOG_REQUEST = 'REBLOG_REQUEST';
export const REBLOG_SUCCESS = 'REBLOG_SUCCESS';
export const REBLOG_FAIL    = 'REBLOG_FAIL';

export const FAVOURITE_REQUEST = 'FAVOURITE_REQUEST';
export const FAVOURITE_SUCCESS = 'FAVOURITE_SUCCESS';
export const FAVOURITE_FAIL    = 'FAVOURITE_FAIL';

export const UNREBLOG_REQUEST = 'UNREBLOG_REQUEST';
export const UNREBLOG_SUCCESS = 'UNREBLOG_SUCCESS';
export const UNREBLOG_FAIL    = 'UNREBLOG_FAIL';

export const UNFAVOURITE_REQUEST = 'UNFAVOURITE_REQUEST';
export const UNFAVOURITE_SUCCESS = 'UNFAVOURITE_SUCCESS';
export const UNFAVOURITE_FAIL    = 'UNFAVOURITE_FAIL';

export function reblog(status) {
  return function (dispatch, getState) {
    dispatch(reblogRequest(status));

    api(getState).post(`/api/v1/statuses/${status.get('id')}/reblog`).then(function (response) {
      // The reblog API method returns a new status wrapped around the original. In this case we are only
      // interested in how the original is modified, hence passing it skipping the wrapper
      dispatch(reblogSuccess(status, response.data.reblog));
    }).catch(function (error) {
      dispatch(reblogFail(status, error));
    });
  };
};

export function unreblog(status) {
  return (dispatch, getState) => {
    dispatch(unreblogRequest(status));

    api(getState).post(`/api/v1/statuses/${status.get('id')}/unreblog`).then(response => {
      dispatch(unreblogSuccess(status, response.data));
    }).catch(error => {
      dispatch(unreblogFail(status, error));
    });
  };
};

export function reblogRequest(status) {
  return {
    type: REBLOG_REQUEST,
    status: status
  };
};

export function reblogSuccess(status, response) {
  return {
    type: REBLOG_SUCCESS,
    status: status,
    response: response
  };
};

export function reblogFail(status, error) {
  return {
    type: REBLOG_FAIL,
    status: status,
    error: error
  };
};

export function unreblogRequest(status) {
  return {
    type: UNREBLOG_REQUEST,
    status: status
  };
};

export function unreblogSuccess(status, response) {
  return {
    type: UNREBLOG_SUCCESS,
    status: status,
    response: response
  };
};

export function unreblogFail(status, error) {
  return {
    type: UNREBLOG_FAIL,
    status: status,
    error: error
  };
};

export function favourite(status) {
  return function (dispatch, getState) {
    dispatch(favouriteRequest(status));

    api(getState).post(`/api/v1/statuses/${status.get('id')}/favourite`).then(function (response) {
      dispatch(favouriteSuccess(status, response.data));
    }).catch(function (error) {
      dispatch(favouriteFail(status, error));
    });
  };
};

export function unfavourite(status) {
  return (dispatch, getState) => {
    dispatch(unfavouriteRequest(status));

    api(getState).post(`/api/v1/statuses/${status.get('id')}/unfavourite`).then(response => {
      dispatch(unfavouriteSuccess(status, response.data));
    }).catch(error => {
      dispatch(unfavouriteFail(status, error));
    });
  };
};

export function favouriteRequest(status) {
  return {
    type: FAVOURITE_REQUEST,
    status: status
  };
};

export function favouriteSuccess(status, response) {
  return {
    type: FAVOURITE_SUCCESS,
    status: status,
    response: response
  };
};

export function favouriteFail(status, error) {
  return {
    type: FAVOURITE_FAIL,
    status: status,
    error: error
  };
};

export function unfavouriteRequest(status) {
  return {
    type: UNFAVOURITE_REQUEST,
    status: status
  };
};

export function unfavouriteSuccess(status, response) {
  return {
    type: UNFAVOURITE_SUCCESS,
    status: status,
    response: response
  };
};

export function unfavouriteFail(status, error) {
  return {
    type: UNFAVOURITE_FAIL,
    status: status,
    error: error
  };
};
