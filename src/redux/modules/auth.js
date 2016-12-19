import store from 'store';
const LOAD = 'redux-example/auth/LOAD';
const LOGIN = 'redux-example/auth/LOGIN';
const LOGOUT = 'redux-example/auth/LOGOUT';

const initialState = {
  user: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        user: action.user
      };
    case LOGIN:
      return {
        ...state,
        user: {
          name: action.name
        }
      };
    case LOGOUT:
      return {
        ...state,
        user: null
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  const user = store.get('user');
  return {
    type: LOAD,
    user
  };
}

export function login(name) {
  store.set('user', { name });
  return {
    type: LOGIN,
    name
  };
}

export function logout() {
  store.remove('user');
  return {
    type: LOGOUT
  };
}
