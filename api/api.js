import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../src/config';
import * as actions from './actions/index';
import { mapUrl } from 'utils/url.js';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';

const pretty = new PrettyError();
const app = express();

const server = new http.Server(app);

const io = new SocketIo(server);
io.path('/ws');

app.use(session({
  secret: 'react and redux rule!!!!',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));
app.use(bodyParser.json());


app.use((req, res) => {
  const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);

  const { action, params } = mapUrl(actions, splittedUrlPath);

  if (action) {
    action(req, params)
      .then((result) => {
        if (result instanceof Function) {
          result(res);
        } else {
          res.json(result);
        }
      }, (reason) => {
        if (reason && reason.redirect) {
          res.redirect(reason.redirect);
        } else {
          console.error('API ERROR:', pretty.render(reason));
          res.status(reason.status || 500).json(reason);
        }
      });
  } else {
    res.status(404).end('NOT FOUND');
  }
});


if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });

  let game = {
    players: []
  };

  function addPlayer(name)
  {
    if (!game.players.some(player => player.name === name)) {
      game.players.push({
        name,
        score: 0
      });
      io.emit('updatePlayers', { players: game.players });
    }
  }

  io.on('connection', socket => {

    socket.on('gameInit', data => {
      console.log('gameInit');
      console.log(game)
      io.emit('gameInit', game);
    });

    socket.on('setGameInit', data => {
      console.log('setGameInit');
      game = Object.assign({}, data);
      io.emit('gameInit', data);
    });

    socket.on('getGameInit', () => {
      console.log('getGameInit');
      console.log(game)
      io.emit('gameInit', game);
    });

    socket.on('tourSelect', data => {
      console.log('tourSelect');
      io.emit('tourSelect', data);
      game.currentTour = data.tour;
      console.log(game)
    });

    socket.on('questionSelect', data => {
      console.log('questionSelect');
      io.emit('questionSelect', data);
    });

    socket.on('play', () => {
      console.log('play');
      io.emit('play');
    });

    socket.on('buzz', data => {
      console.log('buzz');
      addPlayer(data.name);
      io.emit('buzz', data);
    });

    socket.on('completeQuestion', data => {
      console.log('completeQuestion');
      io.emit('completeQuestion', data);
    });

    socket.on('cancelQuestion', data => {
      console.log('cancelQuestion');
      io.emit('cancelQuestion', data);
    });

  });

  io.listen(runnable);
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
