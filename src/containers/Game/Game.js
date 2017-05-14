import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ReactPlayer from 'react-player'
import Helmet from 'react-helmet'
import cx from 'classnames'
import { path } from 'ramda'
import autobind from 'autobind-decorator'
import { Textfit } from 'react-textfit'
// Firebase
import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
const CATEGORIES_PATH = 'categories'
const FILES_PATH = 'uploadedFiles'
const GAMES_PATH = 'games'
const PLAYS_PATH = 'plays'
const PLAYERS_PATH = 'players'
const QUESTION_PATH = 'questions'
const TOURS_PATH = 'tours'

@firebaseConnect(() => ([
  CATEGORIES_PATH,
  FILES_PATH,
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
    uploadedFiles: dataToJS(firebase, FILES_PATH)
  })
)
@autobind
export default class Game extends Component {

  static propTypes = {
    categories: PropTypes.object,
    games: PropTypes.object,
    params: PropTypes.object,
    plays: PropTypes.object,
    players: PropTypes.object,
    questions: PropTypes.object,
    tours: PropTypes.object,
    uploadedFiles: PropTypes.object,
    user: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      completedQuestions: [],
      currentTour: null,
      currentQuestion: null,
      questionCat: false,
      questionAuction: false,
      preload: false
    }
  }

  handlePlayerReady() {
    this.setState({
      preload: true
    }, () => {
      setTimeout(() => {
        this.setState({
          preload: false
        })
      }, 10)
    })
  }

  sortQuestions(questions) {
    if (!questions) {
      return []
    }
    return Object.keys(questions).sort((key1, key2) => questions[key1].price - questions[key2].price)
  }

  render() {
    const style = require('./Game.scss')
    const {
      questionCat, questionAuction, preload
    } = this.state
    const { categories, games, params: { key }, plays, players, questions, tours, uploadedFiles } = this.props
    const play = path([key], plays)
    const gameKey = path(['game'], play)
    const game = path([gameKey], games)
    const currentTourKey = path(['currentTourKey'], play)
    const currentQuestionKey = path(['currentQuestionKey'], play)
    const completedQuestions = path(['completedQuestions'], play) || []
    const isPlaying = path(['isPlaying'], play)
    // Question
    const question = path([currentQuestionKey], questions)
    const questionType = path(['type'], question)
    const questionStream = path(['stream'], question)
    const questionText = path(['text'], question)
    const questionFile = path([path(['file'], question), 'downloadURL'], uploadedFiles)
    // const questionAnswer = path(['answer'], question)
    // Player
    const player = path(['player'], play)
    const playerName = path([player, 'name'], players)

    return (
      <div className={style.container}>
        <Helmet title="Game"/>
        {game &&
        <div>
          <h1 className={style.title}>{tours && tours[currentTourKey].name}</h1>
          <table className={style.table}>
            <tbody>
            {categories && tours && tours[currentTourKey].categories && Object.keys(tours[currentTourKey].categories).map(categoryKey => (
              <tr key={categoryKey}>
                <td className={style.tableCategory}>
                  <Textfit mode={categories[categoryKey].name.includes(' ') ? 'multi' : 'single'}>
                    {categories[categoryKey].name}
                  </Textfit>
                </td>
                {this.sortQuestions(categories[categoryKey].questions).map(questionKey => (
                  <td key={questionKey}
                      className={cx({
                        [style.tableCell]: true,
                        [style.active]: questionKey === currentQuestionKey,
                        [style.completed]: completedQuestions[questionKey]
                      })}>
                    {categories[categoryKey].questions[questionKey].price}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>}
        {currentQuestionKey &&
        <div>
          {questionType === 'stream' &&
          <div>
            <ReactPlayer url={questionStream}
                         height={0}
                         playing={preload || isPlaying}
                         vimeoConfig={{ preload: true }}
                         youtubeConfig={{ preload: true }}
                         onReady={this.handlePlayerReady}
                         volume={1}/>
          </div>}
          {questionType === 'sound' &&
          <div>
            <ReactPlayer url={questionFile}
                         height={0}
                         playing={isPlaying}
                         fileConfig={{ attributes: { preload: 'auto' } }}
                         volume={1}/>
          </div>}
          {questionType === 'image' &&
          <div className={cx({ [style.image]: true, [style.active]: isPlaying })}>
            <i style={{ backgroundImage: `url(${questionFile})` }}/>
          </div>}
          {questionType === 'video' &&
          <div className={cx({ [style.video]: true, [style.active]: isPlaying })}>
            <ReactPlayer url={questionStream}
                         height={window.innerHeight - 100}
                         width={window.innerWidth - 100}
                         playing={preload || isPlaying}
                         vimeoConfig={{ preload: true }}
                         youtubeConfig={{ preload: true }}
                         onReady={this.handlePlayerReady}
                         volume={1}/>
          </div>}
          {questionType === 'text' && isPlaying &&
          <div className={style.text}>
            <div>{questionText}</div>
          </div>}
        </div>}
        {currentQuestionKey && player &&
        <div className={style.text}>
          <div>{playerName}</div>
        </div>}
        {questionCat &&
        <div className={cx({ [style.cat]: true, [style.active]: questionCat })}>
          <img src="http://i.giphy.com/8mju7eCXDceU8.gif" alt=""/>
        </div>}
        {questionAuction &&
        <div className={cx({ [style.auction]: true, [style.active]: questionAuction })}>
          <img src="http://i.giphy.com/m0MfjLtKOgTPG.gif" alt=""/>
        </div>}
        {player &&
        <div>
          <ReactPlayer url="/game/horn.mp3"
                       height={10}
                       playing={!!player}
                       fileConfig={{ attributes: { preload: 'auto' } }}
                       volume={0.7}/>
        </div>}
      </div>
    )
  }
}
