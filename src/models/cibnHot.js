import _ from 'lodash';
import stringify from 'json-stable-stringify';
import { queryCIBNHotFilter, queryCIBNHotPlayCount } from '../services/api';

export default {
  namespace: 'cibnHot',

  state: {
    loading: false,
    filter: {},
    playCount: {}
  },

  effects: {
    *fetchFilter({ payload }, { call, put }) {
      yield put({
        type: 'load',
        loading: true,
      });
      const filter = yield call(queryCIBNHotFilter, payload);
      yield put({
        type: 'save',
        payload: {
          filter,
        },
      });
    },
    *fetchPlayCount({ payload }, { call, put }) {
      const playCount = yield call(queryCIBNHotPlayCount, payload);
      yield put({
        type: 'savePlayCount',
        playCount: {
          [stringify(payload)]: playCount,
        },
      });
    },
  },

  reducers: {
    load(state, { loading }) {
      return {
        ...state,
        loading,
      }
    },
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
        loading: false,
      };
    },
    savePlayCount(state, { playCount }) {
      return {
        ...state,
        playCount: {
          ...state.playCount,
          ...playCount
        },
        loading: false,
      };
    },
    clear() {
      return {
      };
    },
  },
};
