import store from 'store'
const LOAD = 'redux-example/auth/LOAD'
const LOGIN = 'redux-example/auth/LOGIN'
const LOGOUT = 'redux-example/auth/LOGOUT'

const initialState = {
  player: null
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        player: action.player
      }
    case LOGIN:
      return {
        ...state,
        player: {
          key: action.key
        }
      }
    case LOGOUT:
      return {
        ...state,
        player: null
      }
    default:
      return state
  }
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded
}

export function load() {
  const player = store.get('player')
  return {
    type: LOAD,
    player
  }
}

export function login(key) {
  store.set('player', { key })
  return {
    type: LOGIN,
    key
  }
}

export function logout() {
  store.remove('player')
  return {
    type: LOGOUT
  }
}
