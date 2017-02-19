import React, { Component, PropTypes } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import * as authActions from 'redux/modules/auth'

@connect(
  state => ({user: state.auth.user}),
  authActions)
export default class Player extends Component {

  static propTypes = {
    login: PropTypes.func,
    logout: PropTypes.func,
    user: PropTypes.object
  }

  state = {
    message: '',
    messages: []
  }

  handleLoginSubmit = (event) => {
    const name = this.refs.name.value
    if (name) {
      this.props.login(name)
    }
    event.preventDefault()
  }

  handleBuzz = () => {
    const { user } = this.props
    if (user) {
      socket.emit('buzz', {
        name: this.props.user.name
      })
    }
  }

  render() {
    const style = require('./Player.scss')
    const { user } = this.props

    return (
      <div className={style.container}>
        <Helmet title="Game"/>
        {!user &&
        <div>
          <form onSubmit={this.handleLoginSubmit}>
            <div>
              <input ref="name"
                     className={style.loginInput}
                     type="text"
                     placeholder="Enter your name"/>
            </div>
            <div>
              <button type="submit" className={style.loginSubmit}>Play!</button>
            </div>
          </form>
        </div>}
        {user &&
        <div>
          <h1 className={style.name}>{user.name}</h1>
          <div className={style.buzz}>
            <button className={style.buzzButton} onTouchStart={this.handleBuzz} onMouseDown={this.handleBuzz}/>
          </div>
          <div className={style.logout} onClick={this.props.logout}>
            Change name
          </div>
        </div>}
      </div>
    )
  }
}
