import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import autobind from 'autobind-decorator'
// Components
import { Button, Input } from 'react-bootstrap'
import { Link } from 'react-router'

import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers

const GAMES_PATH = 'games'

@firebaseConnect([
  GAMES_PATH
])
@connect(
  ({ firebase }) => ({
    games: dataToJS(firebase, GAMES_PATH),
  })
)
@autobind
export default class AdminGames extends Component {

  static propTypes = {
    firebase: PropTypes.object,
    games: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      name: ''
    }
  }

  handleGameNameChange(event) {
    this.setState({
      name: event.target.value
    })
  }

  handleAddGame() {
    const { name } = this.state
    this.props.firebase.push(GAMES_PATH, {
      name
    })
  }

  render() {
    const style = require('./AdminGames.scss')
    const { games } = this.props
    const { name } = this.state

    return (
      <div className="container">
        <Helmet title="Admin - Games"/>
        <div className={style.games}>
          <h3>Games</h3>
          <form onSubmit={this.handleAddGame}>
            <Input type="text" value={name} onChange={this.handleGameNameChange}
                   buttonAfter={<Button bsStyle="primary">+ Add game</Button>}/>
          </form>
          <br/><br/>
          <ul>
            {games && Object.keys(games).map(key => (
              <li key={key}>
                <Link to={`/admin/games/${key}`}>{games[key].name || key}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}
