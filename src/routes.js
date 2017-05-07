import React from 'react'
import { IndexRoute, Route } from 'react-router'
import Admin from 'containers/Admin/Admin'
import AdminGame from 'containers/AdminGame/AdminGame'
import AdminGames from 'containers/AdminGames/AdminGames'
import AdminPlay from 'containers/AdminPlay/AdminPlay'
import AdminQuestions from 'containers/AdminQuestions/AdminQuestions'
import App from 'containers/App/App'
import Game from 'containers/Game/Game'
import Game1 from 'containers/Game1/Game'
import NotFound from 'containers/NotFound/NotFound'
import Player from 'containers/Player/Player'

export default () => {
  return (
    <Route path="/" component={App}>
      { /* Player (main) route */ }
      <IndexRoute component={Player}/>

      { /* Routes */ }
      <Route path="admin" component={Admin}/>
      <Route path="admin/games" component={AdminGames}/>
      <Route path="admin/games/:key" component={AdminGame}/>
      <Route path="admin/play/:key" component={AdminPlay}/>
      <Route path="admin/questions" component={AdminQuestions}/>
      <Route path="game" component={Game}/>
      <Route path="games/:key" component={Game1}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404}/>
    </Route>
  )
}
