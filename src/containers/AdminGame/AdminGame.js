import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { initialize } from 'redux-form'
import autobind from 'autobind-decorator'
import { path } from 'ramda'

// Components
import { Button, Input } from 'react-bootstrap'
import { Link } from 'react-router'
import QuestionForm from 'components/QuestionForm/QuestionForm'
// Firebase
import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
const CATEGORIES_PATH = 'categories'
const GAMES_PATH = 'games'
const QUESTION_PATH = 'questions'

@firebaseConnect(({ params }) => ([
  CATEGORIES_PATH,
  `${GAMES_PATH}/${params.key}`,
  QUESTION_PATH,
]))
@connect(
  ({ firebase }) => ({
    categories: dataToJS(firebase, CATEGORIES_PATH),
    games: dataToJS(firebase, GAMES_PATH),
    questions: dataToJS(firebase, QUESTION_PATH),
  }), { initialize }
)
@autobind
export default class AdminGame extends Component {

  static propTypes = {
    categories: PropTypes.object,
    firebase: PropTypes.object,
    games: PropTypes.object,
    initialize: PropTypes.func,
    params: PropTypes.object,
    questions: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      gameName: '',
      addQuestionCategoryKey: null,
      editQuestionKey: null
    }
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

  handleCategoryNameChange(event) {
    this.setState({
      categoryName: event.target.value
    })
  }

  handleAddCategoryClick() {
    const { params: { key } } = this.props
    const { categoryName } = this.state
    this.props.firebase.push(CATEGORIES_PATH, {
      name: categoryName
    }).then(res => {
      const categoryKey = res.getKey()
      this.props.firebase.update(`${GAMES_PATH}/${key}/categories/${categoryKey}`, {
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

  handleAddQuestion(categoryKey, { answer, file = '', text, type, video = '' }) {
    this.props.firebase.push(QUESTION_PATH, {
      answer, file, text, type, video
    }).then(res => {
      this.props.initialize('question', {
        answer: '',
        file: '',
        text: '',
        type,
        video: '',
      })
      const questionKey = res.getKey()
      const categoryQuestions = path([categoryKey, 'questions'], this.props.categories)
      const order = categoryQuestions ? (Object.keys(categoryQuestions).length + 1) * 100 : 100
      this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`, {
        order
      })
      this.handleAddQuestionCancel()
    })
  }

  handleAddQuestionCancel() {
    this.setState({
      addQuestionCategoryKey: null,
    })
  }

  // Edit question
  handleEditQuestionClick(editQuestionKey) {
    this.setState({
      editQuestionKey
    })
  }

  handleEditQuestion(questionKey, { answer, file = '', text, type, video = '' }) {
    this.props.firebase.update(`${QUESTION_PATH}/${questionKey}`, {
      answer, file, text, type, video
    }).then(() => {
      this.props.initialize('question', {
        answer: '',
        file: '',
        text: '',
        type,
        video: '',
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
    const sortedCategoryQuestions = Object.keys(categoryQuestions).sort((key1, key2) => categoryQuestions[key1].order - categoryQuestions[key2].order)
    return (
      <div>
        {categoryQuestions && questions &&
        <ul>
          {sortedCategoryQuestions.filter(questionKey => questions[questionKey]).map(questionKey => (
            <li key={questionKey}>
              {questions[questionKey].answer}
              <span> {categoryQuestions[questionKey].order}</span>
              {' '} <Button bsSize="small">Up</Button>
              {' '} <Button bsSize="small">Down</Button>
              {' '} <Button bsSize="small" onClick={() => this.handleEditQuestionClick(questionKey)}>Edit</Button>
              {' '} <Button bsSize="small" onClick={() => this.handleDeleteQuestionClick(categoryKey, questionKey)}>Delete</Button>
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
    const { categories, games, params: { key } } = this.props
    const { addQuestionCategoryKey, categoryName, gameName } = this.state
    const game = path([key], games)
    const gameCategories = path([key, 'categories'], games)

    return (
      <div className="container">
        <Helmet title="Admin - Games"/>
        <div>
          <Link to="/admin/games/">All games</Link>
        </div>
        {game &&
        <div className={style.game}>
          <h3>Game {game.name || key}</h3>
          <div>
            <Input type="text" value={gameName} onChange={this.handleGameNameChange}/>
            <Button bsStyle="primary" onClick={this.handleEditNameClick}>Edit Name</Button>
          </div>
          <div>
            <h3>Categories</h3>
            {gameCategories &&
            <div>
              {Object.keys(gameCategories).filter(categoryKey => categories[categoryKey]).map(categoryKey => (
                <div key={categoryKey}>
                  <h4>{categories[categoryKey].name}</h4>
                  <div>
                    Questions
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
            <Input type="text" value={categoryName} onChange={this.handleCategoryNameChange}/>
            <Button bsStyle="primary" onClick={this.handleAddCategoryClick}>+ Add category</Button>
          </div>
        </div>}
      </div>
    )
  }
}
