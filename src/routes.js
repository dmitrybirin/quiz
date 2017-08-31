import React from 'react'
import { IndexRoute, Route } from 'react-router'
import Admin from 'containers/Admin/Admin'
import AdminGame from 'containers/AdminGame/AdminGame'
import AdminGames from 'containers/AdminGames/AdminGames'
import AdminPlay from 'containers/AdminPlay/AdminPlay'
import App from 'containers/App/App'
import Game from 'containers/Game/Game'
import Main from 'containers/Main/Main'
import NotFound from 'containers/NotFound/NotFound'
import Play from 'containers/Play/Play'
import Player from 'containers/Player/Player'

export default () => {
  return (
    <Route path="/" component={App}>
      { /* Player (main) route */ }
      <IndexRoute component={Main}/>

      { /* Routes */ }
      <Route path="admin" component={Admin}/>
      <Route path="admin/games" component={AdminGames}/>
      <Route path="admin/games/:key" component={AdminGame}/>
      <Route path="admin/play/:key" component={AdminPlay}/>
      <Route path="games/:key" component={Game}/>
      <Route path="play" component={Play}/>
      <Route path="play/:key" component={Player}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404}/>
    </Route>
  )
}
