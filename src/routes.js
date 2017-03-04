import React from 'react'
import { IndexRoute, Route } from 'react-router'
import Admin from 'containers/Admin/Admin'
import AdminQuestions from 'containers/AdminQuestions/AdminQuestions'
import App from 'containers/App/App'
import Game from 'containers/Game/Game'
import NotFound from 'containers/NotFound/NotFound'
import Player from 'containers/Player/Player'

export default () => {
  return (
    <Route path="/" component={App}>
      { /* Player (main) route */ }
      <IndexRoute component={Player}/>

      { /* Routes */ }
      <Route path="admin" component={Admin}/>
      <Route path="admin/questions" component={AdminQuestions}/>
      <Route path="game" component={Game}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404}/>
    </Route>
  )
}
