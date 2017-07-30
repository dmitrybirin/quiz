import React, { Component, PropTypes } from 'react'
import Helmet from 'react-helmet'
import { Grid, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import * as authActions from 'redux/modules/auth'
import { firebaseConnect, helpers, pathToJS } from 'react-redux-firebase'

const { dataToJS } = helpers
const PLAYS_PATH = 'plays'
const PLAYERS_PATH = 'players'

@firebaseConnect(({ params }) => ([
  `${PLAYS_PATH}/${params.key}`,
  PLAYERS_PATH,
]))
@connect(
  ({ auth, firebase }) => ({
    auth: pathToJS(firebase, 'auth'),
    profile: pathToJS(firebase, 'profile'),
    plays: dataToJS(firebase, PLAYS_PATH),
    players: dataToJS(firebase, PLAYERS_PATH),
    player: auth.player,
  }), authActions)
@autobind
export default class Main extends Component {
  static propTypes = {
    auth: PropTypes.object,
    firebase: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    params: PropTypes.object,
    plays: PropTypes.object,
    players: PropTypes.object,
    player: PropTypes.object,
    profile: PropTypes.object,
  }


  render() {
    const style = require('./Main.scss')
    const gameImage = require('./images/game.png')

    return (
      <div className={style.container}>
        <Helmet title="Квиз для хорошей компании"/>
        <Grid>
          <Row>
            <Col xs={12}>
              <header className={style.header}>
                <h1>Le Quiz</h1>
                <h2>Квиз для хорошей компании</h2>
                <div>
                  <Link to="/admin/" className={style.button}>
                    Создать свою игру
                  </Link>
                </div>
                <div>
                  <img className={style.img} src={gameImage} alt=""/>
                </div>
              </header>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
