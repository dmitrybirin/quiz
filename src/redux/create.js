import { createStore as _createStore, applyMiddleware, compose } from 'redux'
import createMiddleware from './middleware/clientMiddleware'
import { routerMiddleware } from 'react-router-redux'
import { reactReduxFirebase } from 'react-redux-firebase'
import thunk from 'redux-thunk'
import Immutable from 'immutable'
import config from 'config'

export default function createStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history)

  const middleware = [createMiddleware(client), reduxRouterMiddleware, thunk]

  let finalCreateStore
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools')
    const DevTools = require('../containers/DevTools/DevTools')
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      reactReduxFirebase(config.firebase, config.firebasePaths),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore)
  } else {
    if (__CLIENT__) {
      finalCreateStore = compose(
        applyMiddleware(...middleware),
        reactReduxFirebase(config.firebase, config.firebasePaths)
      )(_createStore)
    } else {
      finalCreateStore = applyMiddleware(...middleware)(_createStore)
    }
  }

  const reducer = require('./modules/reducer')
  if (data) {
    data.pagination = Immutable.fromJS(data.pagination)
  }
  const store = finalCreateStore(reducer, data)


  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer'))
    })
  }

  return store
}
