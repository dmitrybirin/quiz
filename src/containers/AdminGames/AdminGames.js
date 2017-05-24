import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { push } from 'react-router-redux'
import autobind from 'autobind-decorator'
import { path } from 'ramda'
// Components
import { Button, Col, Grid, Input, Row } from 'react-bootstrap'
import { Link } from 'react-router'

import { firebaseConnect, helpers, pathToJS } from 'react-redux-firebase'

const { dataToJS } = helpers

const GAMES_PATH = 'games'
const TOURS_PATH = 'tours'

@firebaseConnect([
  GAMES_PATH,
  TOURS_PATH,
])
@connect(
  ({ firebase }) => ({
    auth: pathToJS(firebase, 'auth'),
    games: dataToJS(firebase, GAMES_PATH),
    tours: dataToJS(firebase, TOURS_PATH),
  }), { push }
)
@autobind
export default class AdminGames extends Component {

  static propTypes = {
    auth: PropTypes.object,
    firebase: PropTypes.object,
    games: PropTypes.object,
    push: PropTypes.func,
    tours: PropTypes.object,
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

  handleAddGame(event) {
    const { auth } = this.props
    const { name } = this.state
    const tours = [1, 2, 3]

    const uid = path(['uid'], auth)

    this.props.firebase.push(GAMES_PATH, {
      name,
      owner: uid
    }).then(gameRes => {
      const gameKey = gameRes.getKey()
      tours.forEach(tour => {
        this.props.firebase.push(TOURS_PATH, {
          name: `Тур ${tour}`
        }).then(tourRes => {
          const tourKey = tourRes.getKey()
          this.props.firebase.update(`${GAMES_PATH}/${gameKey}/tours`, {
            [tourKey]: {
              multiplier: tour
            }
          })
        })
      })
      this.props.push(`/admin/games/${gameKey}`)
    })
    event.preventDefault()
  }

  render() {
    const style = require('./AdminGames.scss')
    const { auth, games } = this.props
    const { name } = this.state
    const uid = path(['uid'], auth)

    const userGames = games && Object.keys(games).filter(gameKey => games[gameKey].owner === uid)

    if (!uid) {
      return <div/>
    }

    return (
      <div className="container">
        <Helmet title="Admin - Games"/>
        <Grid>
          <div className={style.games}>
            <h3>Игры</h3>
            <Row>
              <Col xs={12} md={6}>
                <form onSubmit={this.handleAddGame}>
                  <Input type="text"
                         value={name}
                         onChange={this.handleGameNameChange}
                         buttonAfter={<Button type="submit" bsStyle="primary">
                           <i className="fa fa-plus"/> Добавить игру
                         </Button>}/>
                </form>
              </Col>
            </Row>
            <br/><br/>
            <ul>
              {userGames && userGames.map(key => (
                <li key={key}>
                  <Link to={`/admin/games/${key}`}>{games[key].name || key}</Link>
                </li>
              ))}
            </ul>
          </div>
        </Grid>
      </div>
    )
  }
}
