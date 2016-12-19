import React from 'react';
import { IndexRoute, Route } from 'react-router';
import {
  Admin,
  App,
  Game,
  Player,
  NotFound,
} from 'containers';

export default () => {
  return (
    <Route path="/" component={App}>
      { /* Player (main) route */ }
      <IndexRoute component={Player}/>

      { /* Routes */ }
      <Route path="admin" component={Admin}/>
      <Route path="game" component={Game}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404}/>
    </Route>
  );
};
