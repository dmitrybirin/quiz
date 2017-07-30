import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { Button, Col, Grid, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import cx from 'classnames'
import store from 'store'
import { firebaseConnect, helpers } from 'react-redux-firebase'

const { dataToJS } = helpers
import { path } from 'ramda'
import autobind from 'autobind-decorator'

const CATEGORIES_PATH = 'categories'
const GAMES_PATH = 'games'
const PLAYS_PATH = 'plays'
const PLAYERS_PATH = 'players'
const QUESTION_PATH = 'questions'
const TOURS_PATH = 'tours'

@firebaseConnect(() => ([
  CATEGORIES_PATH,
  GAMES_PATH,
  PLAYS_PATH,
  PLAYERS_PATH,
  QUESTION_PATH,
  TOURS_PATH,
]))
@connect(
  ({ firebase }) => ({
    categories: dataToJS(firebase, CATEGORIES_PATH),
    games: dataToJS(firebase, GAMES_PATH),
    plays: dataToJS(firebase, PLAYS_PATH),
    players: dataToJS(firebase, PLAYERS_PATH),
    questions: dataToJS(firebase, QUESTION_PATH),
    tours: dataToJS(firebase, TOURS_PATH),
  }),
)
@autobind
export default class AdminPlay extends Component {

  static propTypes = {
    categories: PropTypes.object,
    firebase: PropTypes.object,
    games: PropTypes.object,
    params: PropTypes.object,
    plays: PropTypes.object,
    players: PropTypes.object,
    questions: PropTypes.object,
    tours: PropTypes.object,
    user: PropTypes.object,
  }

  constructor() {
    super()
    this.defaultState = {
      currentQuestion: null,
      completedQuestions: [],
      players: [],
    }
    this.state = Object.assign({}, this.defaultState)
  }

  componentDidMount() {
    this.init()
    if (socket) {
      socket.on('msg', this.onMessageReceived)
      socket.on('updatePlayers', this.onUpdatePlayers)
    }
  }

  componentDidUpdate() {
    store.set('game', this.state)
  }

  componentWillUnmount() {
    if (socket) {
      socket.removeListener('msg', this.onMessageReceived)
      socket.removeListener('updatePlayers', this.onUpdatePlayers)
    }
  }

  // Players
  onUpdatePlayers = ({ players }) => {
    this.setState({
      players,
    })
  }

  init() {
    const game = store.get('game')
    const state = Object.assign({}, this.defaultState, game || {})
    this.setState(state)
    if (game) {
      socket.emit('setGameInit', game)
    }
  }

  handleTourChange(currentTourKey) {
    const { params: { key } } = this.props
    this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
      currentTourKey,
    })
  }

  handleNewGameStart() {
    const { params: { key } } = this.props
    this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
      completedQuestions: null,
    })
  }

  handleQuestionClick(questionKey, categoryKey) {
    const { params: { key }, plays } = this.props
    const { currentQuestionKey } = plays[key]
    if (currentQuestionKey) {
      return
    }
    this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
      currentCategoryKey: categoryKey,
      currentQuestionKey: questionKey,
    })
  }

  handlePlay() {
    const { params: { key } } = this.props
    socket.emit('plays')
    this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
      isPlaying: true,
      player: null,
    })
  }

  handleCompleteQuestion() {
    const { params: { key }, plays } = this.props
    const { currentQuestionKey } = plays[key]
    this.props.firebase.update(`${PLAYS_PATH}/${key}/completedQuestions`, {
      [currentQuestionKey]: true,
    })
    this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
      currentQuestionKey: null,
      isPlaying: false,
      player: null,
    })
  }

  handleCancelQuestion() {
    const { params: { key } } = this.props
    this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
      currentQuestionKey: null,
      isPlaying: false,
    })
  }

  handleRightAnswer() {
    const { categories, games, params: { key }, plays } = this.props
    const play = plays[key]
    const player = path(['player'], play)
    const gameKey = path(['game'], play)
    const game = path([gameKey], games)
    const currentTourKey = path(['currentTourKey'], play)
    const currentCategoryKey = path(['currentCategoryKey'], play)
    const currentQuestionKey = path(['currentQuestionKey'], play)
    const price = path([currentCategoryKey, 'questions', currentQuestionKey, 'price'], categories) * game.tours[currentTourKey].multiplier
    const score = path(['players', player, 'score'], play)
    this.props.firebase.update(`${PLAYS_PATH}/${key}/players/${player}`, {
      score: score + price,
    })
    this.handleCompleteQuestion()
  }

  handleWrongAnswer() {
    const { categories, games, params: { key }, plays } = this.props
    const play = plays[key]
    const player = path(['player'], play)
    const gameKey = path(['game'], play)
    const game = path([gameKey], games)
    const currentTourKey = path(['currentTourKey'], play)
    const currentCategoryKey = path(['currentCategoryKey'], play)
    const currentQuestionKey = path(['currentQuestionKey'], play)
    const price = path([currentCategoryKey, 'questions', currentQuestionKey, 'price'], categories) * game.tours[currentTourKey].multiplier
    const score = path(['players', player, 'score'], play)
    this.props.firebase.update(`${PLAYS_PATH}/${key}/players/${player}`, {
      score: score - price,
    })
    this.props.firebase.update(`${PLAYS_PATH}/${key}`, {
      player: null,
    })
  }

  sortQuestions(questions) {
    if (!questions) {
      return []
    }
    return Object.keys(questions).sort((key1, key2) => questions[key1].price - questions[key2].price)
  }

  render() {
    const style = require('./AdminPlay.scss')
    const { categories, games, params: { key }, plays, players, questions, tours } = this.props
    const play = path([key], plays)
    const gameKey = path(['game'], play)
    const game = path([gameKey], games)
    const gameTours = path(['tours'], game)
    const currentTourKey = path(['currentTourKey'], play)
    const currentQuestionKey = path(['currentQuestionKey'], play)
    const completedQuestions = path(['completedQuestions'], play) || []
    // Player
    const player = path(['player'], play)
    const playerName = path([player, 'name'], players)
    const playPlayers = path(['players'], play)

    return (
      <div className={style.container}>
        <Helmet title="Управление игрой"/>
        <Grid>
          <Row>
            <Col xs={12}>
              <div className={style.game}>
                <div>
                  <a href={`/games/${key}`} target="_blank"><Button>Табло</Button></a>
                  {' '}
                  <a href={`/play/${key}`} target="_blank"><Button>Кнопка игрока</Button></a>
                  {' '}
                  <Link to={`/admin/games/${gameKey}`}><Button>Редактировать игру</Button></Link>
                </div>
                <br/><br/>
                <div className={style.tours}>
                  {tours && gameTours && Object.keys(gameTours).map(tourKey => (
                    <span key={tourKey}>
              <Button bsStyle={tourKey === currentTourKey ? 'primary' : 'default'}
                      bsSize="large"
                      onClick={() => {
                        this.handleTourChange(tourKey)
                      }}>
              {tours[tourKey].name}
              </Button>
                      {' '}
            </span>
                  ))}
                </div>
                <div className={style.newGame}>
                  <Button onClick={this.handleNewGameStart}>Начать игру сначала</Button>
                </div>
              </div>
              {currentQuestionKey && questions &&
              <div>
                <p><strong>Ответ:</strong> {questions[currentQuestionKey].answer}</p>
                <div className={style.controls}>
                  <Button bsStyle="primary" bsSize="large" onClick={this.handlePlay}>Играть</Button>
                  {' '}
                  <Button bsStyle="danger" bsSize="large" onClick={this.handleCancelQuestion}>Отмена</Button>
                  {' '}
                  <Button bsStyle="success" bsSize="large" onClick={this.handleCompleteQuestion}>Вопрос сыгран</Button>
                </div>
              </div>}
              {playerName &&
              <div className={style.controls}>
                Отвечает <strong>{playerName}</strong>
                <div>
                  <Button bsStyle="success" bsSize="large" onClick={this.handleRightAnswer}>Правильно</Button>
                  <Button bsStyle="danger" bsSize="large" onClick={this.handleWrongAnswer}>Неправильно</Button>
                </div>
              </div>}

              <table className={style.table}>
                <tbody>
                {categories && tours && tours[currentTourKey].categories && Object.keys(tours[currentTourKey].categories).map(categoryKey => (
                  <tr key={categoryKey}>
                    <td className={style.tableCategory}>{categories[categoryKey].name}</td>
                    {this.sortQuestions(categories[categoryKey].questions).map(questionKey => (
                      <td key={questionKey}
                          className={cx({
                            [style.tableCell]: true,
                            [style.active]: questionKey === currentQuestionKey,
                            [style.completed]: completedQuestions[questionKey],
                          })}
                          onClick={() => this.handleQuestionClick(questionKey, categoryKey)}>
                        {categories[categoryKey].questions[questionKey].price * game.tours[currentTourKey].multiplier}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
              <h4>Игроки:</h4>
              {players && playPlayers &&
              <table className={style.playersTable}>
                <tbody>
                {Object.keys(playPlayers).filter(playerKey => players[playerKey])
                  .sort((key1, key2) => playPlayers[key2].score - playPlayers[key1].score).map(playerKey => (
                    <tr key={playerKey}>
                      <td>{players[playerKey].name}</td>
                      <td>{playPlayers[playerKey].score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
            </Col>
          </Row>
        </Grid>
      </div>)
  }
}
