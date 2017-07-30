import React, { Component, PropTypes } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import * as authActions from 'redux/modules/auth'
import { path } from 'ramda'
import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
const PLAYS_PATH = 'plays'
const PLAYERS_PATH = 'players'

@firebaseConnect(({ params }) => ([
  `${PLAYS_PATH}/${params.key}`,
  PLAYERS_PATH,
]))
@connect(
  ({ auth, firebase }) => ({
    plays: dataToJS(firebase, PLAYS_PATH),
    players: dataToJS(firebase, PLAYERS_PATH),
    player: auth.player
  }), authActions)
@autobind
export default class Player extends Component {
  static propTypes = {
    firebase: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    params: PropTypes.object,
    plays: PropTypes.object,
    players: PropTypes.object,
    player: PropTypes.object
  }

  handleLoginSubmit(event) {
    const { params: { key } } = this.props
    const name = this.refs.name.value
    if (name) {
      this.props.firebase.push(PLAYERS_PATH, {
        name
      }).then(res => {
        const playerKey = res.getKey()
        this.props.firebase.update(`${PLAYS_PATH}/${key}/players/${playerKey}`, {
          score: 0
        })
        this.props.login(playerKey)
      })
    }
    event.preventDefault()
  }

  handleBuzz() {
    const { params: { key }, plays } = this.props
    const { player } = this.props
    const playerKey = path(['key'], player)
    const isPlaying = path([key, 'isPlaying'], plays)
    const currentPlayer = path([key, 'player'], plays)
    if (isPlaying && !currentPlayer) {
      this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
        isPlaying: false,
        player: playerKey
      })
    }
  }

  render() {
    const style = require('./Player.scss')
    const { params: { key }, plays, player, players } = this.props
    const playerKey = path(['key'], player)
    const name = path([playerKey, 'name'], players)
    const score = path([key, 'players', playerKey, 'score'], plays)

    return (
      <div className={style.container}>
        <Helmet title="Играть"/>
        {!player &&
        <div>
          <form onSubmit={this.handleLoginSubmit}>
            <div>
              <input ref="name"
                     className={style.loginInput}
                     type="text"
                     placeholder="Как тебя зовут?"/>
            </div>
            <div>
              <button type="submit" className={style.loginSubmit}>Играть!</button>
            </div>
          </form>
        </div>}
        {player &&
        <div>
          <div className={style.name}>{name}</div>
          <div className={style.score}>{Number.isInteger(score) && score.toLocaleString('ru-RU')}</div>
          <div className={style.buzz}>
            <button className={style.buzzButton} onTouchStart={this.handleBuzz} onMouseDown={this.handleBuzz}/>
          </div>
          <div className={style.logout} onClick={this.props.logout}>
            Сменить игрока
          </div>
        </div>}
      </div>
    )
  }
}
