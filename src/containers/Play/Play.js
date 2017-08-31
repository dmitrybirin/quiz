import React, { Component, PropTypes } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import { path } from 'ramda'
// Сomponents
import { Button, Col, Grid, Row } from 'react-bootstrap'
import { Link } from 'react-router'
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
export default class Play extends Component {
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

  handleLogout() {
    this.props.firebase.logout()
  }

  handleFacebook() {
    this.props.firebase.login({
      provider: 'facebook',
      type: 'popup',
    }).then(() => {
      console.log('DONE')
    })
  }

  render() {
    const style = require('./Play.scss')
    const { auth, profile } = this.props
    const isLoggedIn = path(['uid'], auth)
    const displayName = path(['displayName'], profile)

    return (
      <div className={style.container}>
        <Helmet title="Добро пожаловать"/>
        <Grid>
          <Row>
            <Col xs={12}>
              {isLoggedIn &&
              <div>
                <p>{displayName} <Button bsSize="xs" onClick={this.handleLogout}>Выйти</Button></p>
                <Link to="/admin/games/"><Button bsStyle="primary">Играть</Button></Link>
              </div>}
              {!isLoggedIn &&
              <div>
                <Button bsStyle="primary" onClick={this.handleFacebook}>Войти через Facebook</Button>
              </div>}
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
