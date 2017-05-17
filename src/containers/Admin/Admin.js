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
    player: auth.player
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
    profile: PropTypes.object
  }

  handleFacebook() {
    this.props.firebase.login({
      provider: 'facebook',
      type: 'popup',
    })
  }

  render() {
    const style = require('./Admin.scss')
    const { auth, profile } = this.props
    const isLoggedIn = path(['uid'], auth)
    const displayName = path(['displayName'], profile)

    return (
      <div className={style.container}>
        <Helmet title="Йоу"/>
        <Grid>
          <Row>
            <Col xs={12}>
              {isLoggedIn &&
              <div>
                <p>{displayName}</p>
                <Link to="/admin/games/"><Button>Управление играми</Button></Link>
              </div>}
              {!isLoggedIn &&
              <div>
                <Button onClick={this.handleFacebook}>Войти через Facebook</Button>
              </div>}
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
