import api   from '../api';
import axios from 'axios';

export const STATUS_FETCH         = 'STATUS_FETCH';
export const STATUS_FETCH_REQUEST = 'STATUS_FETCH_REQUEST';
export const STATUS_FETCH_SUCCESS = 'STATUS_FETCH_SUCCESS';
export const STATUS_FETCH_FAIL    = 'STATUS_FETCH_FAIL';

export function fetchStatusRequest(id) {
  return {
    type: STATUS_FETCH_REQUEST,
    id: id
  };
};

export function fetchStatus(id) {
  return (dispatch, getState) => {
    const boundApi = api(getState);

    dispatch(fetchStatusRequest(id));

    axios.all([boundApi.get(`/api/statuses/${id}`), boundApi.get(`/api/statuses/${id}/context`)]).then(values => {
      dispatch(fetchStatusSuccess(values[0].data, values[1].data));
    }).catch(error => {
      dispatch(fetchStatusFail(id, error));
    });
  };
};

export function fetchStatusSuccess(status, context) {
  return {
    type: STATUS_FETCH_SUCCESS,
    status: status,
    context: context
  };
};

export function fetchStatusFail(id, error) {
  return {
    type: STATUS_FETCH_FAIL,
    id: id,
    error: error
  };
};
