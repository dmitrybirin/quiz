import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { initialize } from 'redux-form'
import autobind from 'autobind-decorator'
import { path } from 'ramda'
// Components
import { Button, Input } from 'react-bootstrap'
import { Link } from 'react-router'
import AddQuestionFrom from 'components/AddQuestionForm/AddQuestionForm'
// Firebase
import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
const CATEGORIES_PATH = 'categories'
const GAMES_PATH = 'games'
const QUESTION_PATH = 'questions'

@firebaseConnect([
  CATEGORIES_PATH,
  GAMES_PATH,
  QUESTION_PATH,
])
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
      addQuestionCategoryKey: null
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

  handleAddQuestionClick(addQuestionCategoryKey) {
    this.setState({
      addQuestionCategoryKey
    })
  }

  handleAddQuestion({ answer, file = '', text, type, video = '' }) {
    const { addQuestionCategoryKey } = this.state
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
      this.props.firebase.update(`${CATEGORIES_PATH}/${addQuestionCategoryKey}/questions/${questionKey}`, {
        order: 0
      })
    })
  }

  render() {
    const style = require('./AdminGame.scss')
    const { categories, games, params: { key }, questions } = this.props
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
              {Object.keys(gameCategories).map(categoryKey => (
                <div key={categoryKey}>
                  <h4>{categories[categoryKey].name}</h4>
                  <div>
                    Questions
                    {categories[categoryKey].questions &&
                    <ul>
                      {Object.keys(categories[categoryKey].questions).map(questionKey => (
                        <li key={questionKey}>{questions[questionKey].answer}</li>
                      ))}
                    </ul>}
                    <Button bsStyle="primary"
                            onClick={() => this.handleAddQuestionClick(categoryKey)}>
                      + Add question
                    </Button>
                    {categoryKey === addQuestionCategoryKey &&
                    <div className={style.addQuestionFrom}>
                      <AddQuestionFrom onSubmit={this.handleAddQuestion}/>
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
