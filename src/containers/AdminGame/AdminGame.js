import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { initialize } from 'redux-form'
import autobind from 'autobind-decorator'
import { path } from 'ramda'
import { push } from 'react-router-redux'
import moment from 'moment'
// Components
import { Button, Input } from 'react-bootstrap'
import { Link } from 'react-router'
import QuestionForm from 'components/QuestionForm/QuestionForm'
import AddCategoryForm from './components/AddCategoryForm/AddCategoryForm'
// Firebase
import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
const CATEGORIES_PATH = 'categories'
const GAMES_PATH = 'games'
const PLAYS_PATH = 'plays'
const PLAYERS_PATH = 'players'
const QUESTION_PATH = 'questions'
const TOURS_PATH = 'tours'

@firebaseConnect(({ params }) => ([
  CATEGORIES_PATH,
  `${GAMES_PATH}/${params.key}`,
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
  }), { initialize, push }
)
@autobind
export default class AdminGame extends Component {

  static propTypes = {
    categories: PropTypes.object,
    firebase: PropTypes.object,
    games: PropTypes.object,
    initialize: PropTypes.func,
    params: PropTypes.object,
    plays: PropTypes.object,
    players: PropTypes.object,
    push: PropTypes.func,
    questions: PropTypes.object,
    tours: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      gameName: '',
      addQuestionCategoryKey: null,
      editQuestionKey: null
    }
  }

  handleConinuePlayClick(playKey) {
    this.props.push(`/admin/play/${playKey}`)
  }

  handlePlayClick() {
    const { games, params: { key } } = this.props
    this.props.firebase.push(PLAYS_PATH, {
      game: key,
      currentTourKey: Object.keys(games[key].tours)[0],
      startedAt: new Date().getTime()
    }).then(res => {
      const playKey = res.getKey()
      this.props.push(`/admin/play/${playKey}`)
    })
  }

  handleGameNameChange(event) {
    this.setState({
      gameName: event.target.value
    })
  }

  handleEditNameClick() {
    const { params: { key } } = this.props
    const { gameName } = this.state
    this.props.firebase.update(`${GAMES_PATH}/${key}`, {
      name: gameName
    })
  }

  // Tour
  handleAddTourClick() {
    const { params: { key } } = this.props
    this.props.firebase.push(TOURS_PATH, {
      name: 'tour'
    }).then(res => {
      const tourKey = res.getKey()
      this.props.firebase.update(`${GAMES_PATH}/${key}/tours/${tourKey}`, {
        order: 0
      })
    })
  }

  // Category
  handleAddCategory({ name }, tourKey) {
    this.props.firebase.push(CATEGORIES_PATH, {
      name
    }).then(res => {
      const categoryKey = res.getKey()
      this.props.firebase.update(`${TOURS_PATH}/${tourKey}/categories/${categoryKey}`, {
        order: 0
      })
    })
  }

  // Add question
  handleAddQuestionClick(addQuestionCategoryKey) {
    this.setState({
      addQuestionCategoryKey
    })
  }

  handleAddQuestion(categoryKey, { answer, file = '', stream = '', text, type }) {
    this.props.firebase.push(QUESTION_PATH, {
      answer, file, stream, text, type
    }).then(res => {
      this.props.initialize('question', {
        answer: '',
        file: '',
        stream: '',
        text: '',
        type,
      })
      const questionKey = res.getKey()
      const categoryQuestions = path([categoryKey, 'questions'], this.props.categories)
      const price = categoryQuestions ? (Object.keys(categoryQuestions).length + 1) * 100 : 100
      this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`, {
        price
      })
      this.handleAddQuestionCancel()
    })
  }

  handleAddQuestionCancel() {
    this.setState({
      addQuestionCategoryKey: null,
    })
  }

  handleUpClick(categoryKey, questionKey) {
    const { categories } = this.props
    const questions = categories[categoryKey].questions
    const questionPrice = questions[questionKey].price
    const prevQuestionPrice = questionPrice - 100
    const prevQuestionKey = Object.keys(questions).find(key => questions[key].price === prevQuestionPrice)
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${prevQuestionKey}`, {
      price: questionPrice
    })
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`, {
      price: prevQuestionPrice
    })
  }

  handleDownClick(categoryKey, questionKey) {
    const { categories } = this.props
    const questions = categories[categoryKey].questions
    const questionPrice = questions[questionKey].price
    const nextQuestionPrice = questionPrice + 100
    const nextQuestionKey = Object.keys(questions).find(key => questions[key].price === nextQuestionPrice)
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${nextQuestionKey}`, {
      price: questionPrice
    })
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`, {
      price: nextQuestionPrice
    })
  }

  // Edit question
  handleEditQuestionClick(editQuestionKey) {
    this.setState({
      editQuestionKey
    })
  }

  handleEditQuestion(questionKey, { answer, file = '', stream = '', text, type, }) {
    this.props.firebase.update(`${QUESTION_PATH}/${questionKey}`, {
      answer, file, stream, text, type
    }).then(() => {
      this.props.initialize('question', {
        answer: '',
        file: '',
        stream: '',
        text: '',
        type,
      })
      this.handleEditQuestionCancel()
    })
  }

  handleEditQuestionCancel() {
    this.setState({
      editQuestionKey: null
    })
  }

  // Delete question
  handleDeleteQuestionClick(categoryKey, questionKey) {
    this.props.firebase.remove(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`)
    this.props.firebase.remove(`${QUESTION_PATH}/${questionKey}`)
  }

  renderQuestions(categoryKey, categoryQuestions) {
    const { questions } = this.props
    const { editQuestionKey } = this.state
    if (!categoryQuestions || !questions) {
      return null
    }
    const sortedCategoryQuestions = Object.keys(categoryQuestions).sort((key1, key2) => categoryQuestions[key1].price - categoryQuestions[key2].price)
    const filteredCategoryQuestions = sortedCategoryQuestions.filter(questionKey => questions[questionKey])
    return (
      <div>
        {categoryQuestions && questions &&
        <ul>
          {filteredCategoryQuestions.map((questionKey, index) => (
            <li key={questionKey}>
              {questions[questionKey].answer}
              <span> {categoryQuestions[questionKey].price}</span>
              {' '}
              {index !== 0 &&
              <Button bsSize="small" onClick={() => this.handleUpClick(categoryKey, questionKey)}>Up</Button>}
              {' '}
              {index !== filteredCategoryQuestions.length - 1 &&
              <Button bsSize="small" onClick={() => this.handleDownClick(categoryKey, questionKey)}>Down</Button>}
              {' '}
              <Button bsSize="small" onClick={() => this.handleEditQuestionClick(questionKey)}>Edit</Button>
              {' '}
              <Button bsSize="small"
                      onClick={() => this.handleDeleteQuestionClick(categoryKey, questionKey)}>Delete</Button>
              {editQuestionKey === questionKey &&
              <QuestionForm question={questions[questionKey]}
                            onSubmit={data => this.handleEditQuestion(questionKey, data)}
                            onCancel={this.handleEditQuestionCancel}/>}
            </li>
          ))}
        </ul>}
      </div>
    )
  }

  render() {
    const style = require('./AdminGame.scss')
    const { categories, games, params: { key }, plays, tours } = this.props
    const { addQuestionCategoryKey, gameName } = this.state
    const game = path([key], games)
    const gameTours = path(['tours'], game)
    const currentGamePlays = plays && Object.keys(plays).filter(playKey => plays[playKey].game === key)

    return (
      <div className="container">
        <Helmet title="Admin - Games"/>
        <div>
          <Link to="/admin/games/">All games</Link>
        </div>
        <div>
          {currentGamePlays && currentGamePlays.map(playKey => (
            <div>
              <Button bsStyle="primary" onClick={() => this.handleConinuePlayClick(playKey)}>
                Continue game started {moment(plays[playKey].startedAt).format('DD MM HH:mm')}
              </Button>
            </div>
          ))}
        </div>
        <div>
          <Button bsStyle="primary" onClick={this.handlePlayClick}>New Play</Button>
        </div>
        {game &&
        <div className={style.game}>
          <h1>Game {game.name || key}</h1>
          <div>
            <Input type="text"
                   value={gameName}
                   onChange={this.handleGameNameChange}
                   buttonAfter={<Button bsStyle="primary" onClick={this.handleEditNameClick}>Edit Name</Button>}/>
          </div>
          <div>
            {gameTours && Object.keys(gameTours).map((tourKey, index) => (
              <div key={tourKey}>
                <h2>Tour {index + 1}</h2>
                {tours && tours[tourKey] &&
                <div>
                  <div>
                    {categories &&
                    <div>
                      {tours[tourKey].categories && Object.keys(tours[tourKey].categories).map(categoryKey => (
                        <div key={categoryKey}>
                          <h4>{categories[categoryKey].name}</h4>
                          <div>
                            {this.renderQuestions(categoryKey, categories[categoryKey].questions)}
                            <Button bsStyle="primary"
                                    onClick={() => this.handleAddQuestionClick(categoryKey)}>
                              + Add question
                            </Button>
                            {categoryKey === addQuestionCategoryKey &&
                            <div className={style.addQuestionFrom}>
                              <QuestionForm onSubmit={data => this.handleAddQuestion(categoryKey, data)}
                                            onCancel={this.handleAddQuestionCancel}/>
                            </div>}
                          </div>
                        </div>
                      ))}
                    </div>}
                    <AddCategoryForm form={`tour-${tourKey}`}
                                     onSubmit={data => this.handleAddCategory(data, tourKey)}/>
                  </div>
                </div>}
              </div>
            ))}
          </div>
          <div>
            <Button bsStyle="primary" onClick={this.handleAddTourClick}>+ Add tour</Button>
          </div>
        </div>}
      </div>
    )
  }
}
