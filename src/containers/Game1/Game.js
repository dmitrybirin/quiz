import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactPlayer from 'react-player'
import Helmet from 'react-helmet'
import gameData from 'game/game-3'
import cx from 'classnames'
import { path } from 'ramda'
// Firebase
import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
const CATEGORIES_PATH = 'categories'
const GAMES_PATH = 'games'
const PLAYS_PATH = 'plays'
const QUESTION_PATH = 'questions'
const TOURS_PATH = 'tours'

@firebaseConnect(() => ([
  CATEGORIES_PATH,
  GAMES_PATH,
  PLAYS_PATH,
  QUESTION_PATH,
  TOURS_PATH,
]))
@connect(
  ({ firebase }) => ({
    categories: dataToJS(firebase, CATEGORIES_PATH),
    games: dataToJS(firebase, GAMES_PATH),
    plays: dataToJS(firebase, PLAYS_PATH),
    questions: dataToJS(firebase, QUESTION_PATH),
    tours: dataToJS(firebase, TOURS_PATH),
  })
)
export default class Game extends Component {

  static propTypes = {
    categories: PropTypes.object,
    games: PropTypes.object,
    params: PropTypes.object,
    plays: PropTypes.object,
    questions: PropTypes.object,
    tours: PropTypes.object,
    user: PropTypes.object,
  }

  state = {
    buzzPlaying: false,
    completedQuestions: [],
    currentTour: null,
    currentQuestion: null,
    questionImage: null,
    questionSong: null,
    questionCat: false,
    questionAuction: false,
    playing: false,
    player: null,
    players: []
  }

  componentDidMount() {
    if (socket) {
      socket.on('gameInit', this.onGameInit)
      socket.on('tourSelect', this.onTourSelect)
      socket.on('questionSelect', this.onQuestionSelect)
      socket.on('play', this.onPlay)
      socket.on('buzz', this.onBuzz)
      socket.on('completeQuestion', this.onCompleteQuestion)
      socket.on('cancelQuestion', this.onCancelQuestion)
      socket.on('updatePlayers', this.onUpdatePlayers)

      socket.emit('getGameInit')
    }
  }

  componentWillUnmount() {
    if (socket) {
      socket.removeListener('gameInit', this.onGameInit)
      socket.removeListener('tourSelect', this.onTourSelect)
      socket.removeListener('questionSelect', this.onQuestionSelect)
      socket.removeListener('play', this.onPlay)
      socket.removeListener('buzz', this.onBuzz)
      socket.removeListener('completeQuestion', this.onCompleteQuestion)
      socket.removeListener('cancelQuestion', this.onCancelQuestion)
      socket.removeListener('updatePlayers', this.onUpdatePlayers)
    }
  }

  onGameInit = (data) => {
    console.log(data)
    this.setState(data)
  }

  onTourSelect = (data) => {
    console.log(data)
    this.setState({
      currentTour: data.tour
    })
  }

  onQuestionSelect = (data) => {
    console.log(data)
    const { question } = data
    const quest = gameData.questions[question]
    if (!quest) {
      return
    }

    this.setState({
      currentQuestion: question
    })

    if (quest.cat) {
      this.setState({
        questionCat: true,
        buzzPlaying: true
      })
    }

    if (quest.auction) {
      this.setState({
        questionAuction: true,
        buzzPlaying: true
      })
    }

    if (quest.type === 'song') {
      this.setState({
        questionImage: null,
        questionSong: quest.file
      })
    } else if (quest.type === 'image') {
      this.setState({
        questionImage: quest.file,
        questionSong: null
      })
    }
  }

  onPlay = () => {
    const { currentQuestion } = this.state
    const quest = gameData.questions[currentQuestion]
    if (quest) {
      this.setState({
        questionCat: false,
        questionAuction: false,
        player: null,
        playing: true
      })
    }
  }

  onBuzz = (data) => {
    const { playing, player } = this.state
    if (data.name && playing && !player) {
      this.setState({
        buzzPlaying: true,
        player: data.name,
        playing: false
      })
    }
  }

  onCompleteQuestion = (data) => {
    this.setState({
      questionCat: false,
      questionAuction: false,
      completedQuestions: data.completedQuestions,
      currentQuestion: null,
      playing: false,
      player: null
    })
  }

  onCancelQuestion = () => {
    this.setState({
      questionCat: false,
      questionAuction: false,
      currentQuestion: null,
      player: null,
      playing: false
    })
  }

  // Players
  onUpdatePlayers = ({ players }) => {
    this.setState({
      players
    })
  }

  render() {
    const style = require('./Game.scss')
    const {
      buzzPlaying, questionImage, questionSong,
      questionCat, questionAuction,
      player, playing
    } = this.state
    const { categories, games, params: { key }, plays, tours } = this.props
    const play = path([key], plays)
    const gameKey = path(['game'], play)
    const game = path([gameKey], games)
    const currentTourKey = path(['currentTourKey'], play)
    const currentQuestionKey = path(['currentQuestionKey'], play)
    const completedQuestions = path(['completedQuestions'], play) || []

    return (
      <div className={style.container}>
        <Helmet title="Game"/>
        {game &&
        <div>
          <h1 className={style.title}>{tours[currentTourKey].name}</h1>
          <table className={style.table}>
            <tbody>
            {categories && tours && tours[currentTourKey].categories && Object.keys(tours[currentTourKey].categories).map(categoryKey => (
              <tr key={categoryKey}>
                <td className={style.tableCategory}>{categories[categoryKey].name}</td>
                {categories[categoryKey].questions && Object.keys(categories[categoryKey].questions).map((questionKey, questionIndex) => (
                  <td key={questionKey}
                      className={cx({
                        [style.tableCell]: true,
                        [style.active]: questionKey === currentQuestionKey,
                        [style.completed]: completedQuestions.includes(questionKey)
                      })}>
                    {(questionIndex + 1) * 100}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>}
        {questionSong &&
        <div>
          <ReactPlayer url={questionSong}
                       height={0}
                       playing={playing}
                       fileConfig={{ attributes: { preload: 'auto' } }}
                       onPlay={() => this.setState({ playing: true })}
                       onEnded={() => this.setState({ playing: false })}
                       volume={1}/>
        </div>}
        {questionImage &&
        <div className={cx({ [style.image]: true, [style.active]: playing })}>
          <img src={questionImage} alt=""/>
        </div>}
        {player &&
        <div className={style.player}>
          <span>{player}</span>
        </div>}
        {questionCat &&
        <div className={cx({ [style.cat]: true, [style.active]: questionCat })}>
          <img src="http://i.giphy.com/8mju7eCXDceU8.gif" alt=""/>
        </div>}
        {questionAuction &&
        <div className={cx({ [style.auction]: true, [style.active]: questionAuction })}>
          <img src="http://i.giphy.com/m0MfjLtKOgTPG.gif" alt=""/>
        </div>}
        <ReactPlayer url="/game/horn.mp3"
                     height={10}
                     playing={buzzPlaying}
                     fileConfig={{ attributes: { preload: 'auto' } }}
                     onPlay={() => this.setState({ buzzPlaying: true })}
                     onEnded={() => this.setState({ buzzPlaying: false })}
                     volume={0.7}/>
      </div>
    )
  }
}
