import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import autobind from 'autobind-decorator'
import { path } from 'ramda'
import { push } from 'react-router-redux'
import moment from 'moment'
// Components
import { Button, Col, Grid, Input, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { AddCategoryForm, /* AddTourForm, */ QuestionForm } from 'components'
// Firebase
import { firebaseConnect, helpers } from 'react-redux-firebase'
import styles from './AdminGame.scss'

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
  }), { push },
)
@autobind
export default class AdminGame extends Component {

  static propTypes = {
    categories: PropTypes.object,
    firebase: PropTypes.object,
    games: PropTypes.object,
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
      addQuestionCategoryKey: null,
      editQuestionKey: null,
      editQuestionCategoryKey: null,
      questionType: 'audio',
    }
  }

  // Plays
  handleConinuePlayClick(playKey) {
    this.props.push(`/admin/play/${playKey}`)
  }

  handlePlayClick() {
    const { games, params: { key } } = this.props
    this.props.firebase.push(PLAYS_PATH, {
      game: key,
      currentTourKey: Object.keys(games[key].tours)[0],
      startedAt: new Date().getTime(),
    }).then(res => {
      const playKey = res.getKey()
      this.props.push(`/admin/play/${playKey}`)
    })
  }

  // Games
  handleEditGameName(event) {
    const { params: { key } } = this.props
    this.props.firebase.update(`${GAMES_PATH}/${key}`, {
      name: event.target.value,
    })
  }

  // Tour
  handleAddTour({ name }) {
    const { params: { key } } = this.props
    this.props.firebase.push(TOURS_PATH, {
      name,
    }).then(res => {
      const tourKey = res.getKey()
      this.props.firebase.update(`${GAMES_PATH}/${key}/tours/${tourKey}`, {
        order: 0,
      })
    })
  }

  handleEditTourName(event, key) {
    this.props.firebase.update(`${TOURS_PATH}/${key}`, {
      name: event.target.value,
    })
  }

  // Categories
  handleAddCategory({ name }, tourKey) {
    this.props.firebase.push(CATEGORIES_PATH, {
      name,
    }).then(res => {
      const categoryKey = res.getKey()
      const tourCategories = path([tourKey, 'categories'], this.props.tours)
      const order = tourCategories ? (Object.keys(tourCategories).length) : 0
      this.props.firebase.update(`${TOURS_PATH}/${tourKey}/categories/${categoryKey}`, {
        order,
      })
    })
  }

  handleEditCategoryName(event, key) {
    this.props.firebase.update(`${CATEGORIES_PATH}/${key}`, {
      name: event.target.value,
    })
  }

  handleCategoryUp(tourKey, categoryKey) {
    const { tours } = this.props
    const categories = tours[tourKey].categories
    const categoryOrder = categories[categoryKey].order
    const prevCategoryOrder = categoryOrder - 1
    const prevCategoryKey = Object.keys(categories).find(key => categories[key].order === prevCategoryOrder)
    this.props.firebase.update(`${TOURS_PATH}/${tourKey}/categories/${prevCategoryKey}`, {
      order: categoryOrder,
    })
    this.props.firebase.update(`${TOURS_PATH}/${tourKey}/categories/${categoryKey}`, {
      order: prevCategoryOrder,
    })
  }

  handleCategoryDown(tourKey, categoryKey) {
    const { tours } = this.props
    const categories = tours[tourKey].categories
    const categoryOrder = categories[categoryKey].order
    const nextCategoryOrder = categoryOrder + 1
    const nextCategoryKey = Object.keys(categories).find(key => categories[key].order === nextCategoryOrder)
    this.props.firebase.update(`${TOURS_PATH}/${tourKey}/categories/${nextCategoryKey}`, {
      order: categoryOrder,
    })
    this.props.firebase.update(`${TOURS_PATH}/${tourKey}/categories/${categoryKey}`, {
      order: nextCategoryOrder,
    })
  }

  handleDeleteCategory(tourKey, categoryKey) {
    const { categories, tours } = this.props
    const confirm = window.confirm('Точно удаляем?')
    if (!confirm) {
      return
    }
    const categoryQuestions = path([categoryKey, 'questions'], categories)
    if (categoryQuestions) {
      Object.keys(categoryQuestions).forEach(questionKey => {
        this.props.firebase.remove(`${QUESTION_PATH}/${questionKey}`)
      })
    }
    this.props.firebase.remove(`${CATEGORIES_PATH}/${categoryKey}`)
    this.props.firebase.remove(`${TOURS_PATH}/${tourKey}/categories/${categoryKey}`)
    // Reorder categories
    const tourCategories = path([tourKey, 'categories'], tours)
    if (tourCategories) {
      let order = 0
      Object.keys(tourCategories)
        .sort((key1, key2) => tourCategories[key1].order - tourCategories[key2].order)
        .forEach(tourCategoryKey => {
          if (tourCategoryKey !== categoryKey) {
            this.props.firebase.update(`${TOURS_PATH}/${tourKey}/categories/${tourCategoryKey}`, {
              order,
            })
            order++
          }
        })
    }
  }

  // Questions
  handleAddQuestionClick(addQuestionCategoryKey) {
    this.setState({
      addQuestionCategoryKey,
      editQuestionCategoryKey: null,
    })
  }

  handleAddQuestion(categoryKey, { answer, file = '', text, type, url = '' }) {
    this.props.firebase.push(QUESTION_PATH, {
      answer, file, text, type, url,
    }).then(res => {
      const questionKey = res.getKey()
      const categoryQuestions = path([categoryKey, 'questions'], this.props.categories)
      const price = categoryQuestions ? (Object.keys(categoryQuestions).length + 1) * 100 : 100
      this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`, {
        price,
      })
      this.handleAddQuestionCancel()
    })
  }

  handleAddQuestionCancel() {
    this.setState({
      addQuestionCategoryKey: null,
    })
  }

  handleQuestionUp(event, categoryKey, questionKey) {
    const { categories } = this.props
    const questions = categories[categoryKey].questions
    const questionPrice = questions[questionKey].price
    const prevQuestionPrice = questionPrice - 100
    const prevQuestionKey = Object.keys(questions).find(key => questions[key].price === prevQuestionPrice)
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${prevQuestionKey}`, {
      price: questionPrice,
    })
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`, {
      price: prevQuestionPrice,
    })
    event.stopPropagation()
  }

  handleQuestionDown(event, categoryKey, questionKey) {
    const { categories } = this.props
    const questions = categories[categoryKey].questions
    const questionPrice = questions[questionKey].price
    const nextQuestionPrice = questionPrice + 100
    const nextQuestionKey = Object.keys(questions).find(key => questions[key].price === nextQuestionPrice)
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${nextQuestionKey}`, {
      price: questionPrice,
    })
    this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`, {
      price: nextQuestionPrice,
    })
    event.stopPropagation()
  }

  // Edit question
  handleEditQuestionClick(editQuestionCategoryKey, editQuestionKey) {
    this.setState({
      editQuestionKey,
      editQuestionCategoryKey,
      addQuestionCategoryKey: null,
    })
  }

  handleEditQuestion(questionKey, { answer, file = '', text, type, url = '' }) {
    this.props.firebase.update(`${QUESTION_PATH}/${questionKey}`, {
      answer, file, text, type, url,
    }).then(() => {
      this.handleEditQuestionCancel()
    })
  }

  handleEditQuestionCancel() {
    this.setState({
      editQuestionKey: null,
      editQuestionCategoryKey: null,
    })
  }

  // Delete question
  handleDeleteQuestionClick(categoryKey, questionKey) {
    const { categories } = this.props
    const confirm = window.confirm('Точно удаляем?')
    if (!confirm) {
      return
    }
    this.props.firebase.remove(`${CATEGORIES_PATH}/${categoryKey}/questions/${questionKey}`)
    this.props.firebase.remove(`${QUESTION_PATH}/${questionKey}`)
    // Reorder questions
    const categoryQuestions = path([categoryKey, 'questions'], categories)
    if (categoryQuestions) {
      let price = 100
      Object.keys(categoryQuestions)
        .sort((key1, key2) => categoryQuestions[key1].price - categoryQuestions[key2].price)
        .forEach(categoryQuestionKey => {
          if (categoryQuestionKey !== questionKey) {
            this.props.firebase.update(`${CATEGORIES_PATH}/${categoryKey}/questions/${categoryQuestionKey}`, {
              price,
            })
            price = price + 100
          }
        })
    }
  }

  renderCategories(tourKey) {
    const { categories, questions, tours } = this.props
    const { addQuestionCategoryKey, editQuestionCategoryKey, editQuestionKey, questionType } = this.state
    const tourCategories = tours[tourKey].categories
    if (!tourCategories || !categories) {
      return null
    }

    const sortedTourCategories = Object.keys(tourCategories).sort((key1, key2) => tourCategories[key1].order - tourCategories[key2].order)
    const filteredTourCategories = sortedTourCategories.filter(categoryKey => categories[categoryKey])

    return (
      <div>
        {filteredTourCategories.map((categoryKey, index) => (
          <div key={categoryKey} className={styles.category}>
            <div className={styles.row}>
              <Row>
                <Col xs={8} md={4}>
                  <Input type="text"
                         value={categories[categoryKey].name}
                         onChange={event => this.handleEditCategoryName(event, categoryKey)}
                         addonBefore={<span>Категория</span>}/>
                </Col>
                {index !== 0 &&
                <Button bsSize="small"
                        onClick={() => this.handleCategoryUp(tourKey, categoryKey)}>
                  <i className="fa fa-arrow-up"/>
                </Button>}
                {' '}
                {index !== filteredTourCategories.length - 1 &&
                <Button bsSize="small"
                        onClick={() => this.handleCategoryDown(tourKey, categoryKey)}>
                  <i className="fa fa-arrow-down"/>
                </Button>}
                {' '}
                <Button bsSize="small"
                        onClick={() => this.handleDeleteCategory(tourKey, categoryKey)}>
                  <i className="fa fa-trash"/>
                </Button>
              </Row>
            </div>
            <div>
              {this.renderQuestions(categoryKey)}
              {categoryKey === editQuestionCategoryKey &&
              <div className={styles.addQuestionFrom}>
                <QuestionForm
                  question={questions[editQuestionKey]}
                  onSubmit={data => this.handleEditQuestion(editQuestionKey, data)}
                  onCancel={this.handleEditQuestionCancel}/>
              </div>}
              <Button bsStyle="primary"
                      onClick={() => this.handleAddQuestionClick(categoryKey)}>
                <i className="fa fa-plus"/> Добавить вопрос
              </Button>
              {categoryKey === addQuestionCategoryKey &&
              <div className={styles.addQuestionFrom}>
                <QuestionForm
                  type={questionType}
                  onTypeChange={type => {
                    this.setState({ questionType: type })
                  }}
                  onSubmit={data => this.handleAddQuestion(categoryKey, data)}
                  onCancel={this.handleAddQuestionCancel}/>
              </div>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderQuestions(categoryKey) {
    const { categories, questions } = this.props
    const categoryQuestions = categories[categoryKey].questions
    if (!categoryQuestions || !questions) {
      return null
    }

    const sortedCategoryQuestions = Object.keys(categoryQuestions).sort((key1, key2) => categoryQuestions[key1].price - categoryQuestions[key2].price)
    const filteredCategoryQuestions = sortedCategoryQuestions.filter(questionKey => questions[questionKey])

    return (
      <div>
        {categoryQuestions && questions &&
        <ul className={styles.questions}>
          {filteredCategoryQuestions.map((questionKey, index) => (
            <li key={questionKey} className={styles.questionsItem}
                onClick={() => this.handleEditQuestionClick(categoryKey, questionKey)}>
              <div>
                <div><strong>{categoryQuestions[questionKey].price}</strong></div>
                {questions[questionKey].answer}
              </div>
              <div key={questionKey} className={styles.questionsItemActions}>
                <Button bsSize="small"
                        onClick={() => this.handleEditQuestionClick(categoryKey, questionKey)}>
                  <i className="fa fa-pencil"/>
                </Button>
                {' '}
                {index !== 0 &&
                <Button bsSize="small"
                        onClick={event => this.handleQuestionUp(event, categoryKey, questionKey)}>
                  <i className="fa fa-arrow-left"/>
                </Button>}
                {' '}
                {index !== filteredCategoryQuestions.length - 1 &&
                <Button bsSize="small"
                        onClick={event => this.handleQuestionDown(event, categoryKey, questionKey)}>
                  <i className="fa fa-arrow-right"/>
                </Button>}
                {' '}
                <Button bsSize="small"
                        onClick={() => this.handleDeleteQuestionClick(categoryKey, questionKey)}>
                  <i className="fa fa-trash"/>
                </Button>
              </div>
            </li>
          ))}
        </ul>}
      </div>
    )
  }

  render() {
    const { games, params: { key }, plays, tours } = this.props
    const game = path([key], games)
    const gameName = path(['name'], game)
    const gameTours = path(['tours'], game)
    const currentGamePlays = plays && Object.keys(plays).filter(playKey => plays[playKey] && plays[playKey].game === key)
      .sort((playKey1, playKey2) => plays[playKey1].startedAt - plays[playKey2].startedAt)

    return (
      <div className={styles.container}>
        <Helmet title="Редактор игры"/>
        <Grid>
          <Row>
            <Col xs={12}>
              <div className={styles.row}>
                <Link to="/admin/games/">Все игры</Link>
              </div>
              <div className={styles.row}>
                {currentGamePlays && currentGamePlays.map(playKey => (
                  <div key={playKey} className={styles.row}>
                    <Button bsStyle="primary" onClick={() => this.handleConinuePlayClick(playKey)}>
                      Продолжить игру от {moment(plays[playKey].startedAt).format('DD.MM HH:mm')}
                    </Button>
                  </div>
                ))}
              </div>
              <div className={styles.row}>
                <Button bsStyle="primary" onClick={this.handlePlayClick}>Начать новую игру</Button>
              </div>
              {game &&
              <div className={styles.game}>
                <div className={styles.row}>
                  <Row>
                    <Col xs={12} md={6}>
                      <Input type="text"
                             bsSize="large"
                             value={gameName}
                             onChange={this.handleEditGameName}
                             addonBefore={<span>Игра</span>}/>
                    </Col>
                  </Row>
                </div>
                <div>
                  {tours && gameTours && Object.keys(gameTours).map(tourKey => (
                    <div key={tourKey}>
                      <div className={styles.row}>
                        <Row>
                          <Col xs={8} md={6}>
                            <Input type="text"
                                   value={tours[tourKey].name}
                                   onChange={event => this.handleEditTourName(event, tourKey)}
                                   addonBefore={<span>Тур</span>}/>
                          </Col>
                          {/* <Button bsSize="small"
                     onClick={() => this.handleTourUp(tourKey)}>
                     <i className="fa fa-arrow-up"/>
                     </Button>
                     {' '}
                     <Button bsSize="small"
                     onClick={() => this.handleTourDown(tourKey)}>
                     <i className="fa fa-arrow-down"/>
                     </Button>
                     {' '}
                     <Button bsSize="small"
                     onClick={() => this.handleTourDelete(tourKey)}>
                     <i className="fa fa-trash"/>
                     </Button> */}
                        </Row>
                      </div>
                      {tours && tours[tourKey] &&
                      <div className={styles.tour}>
                        {this.renderCategories(tourKey)}
                        <Row>
                          <Col xs={12} md={6}>
                            <AddCategoryForm form={`tour-${tourKey}`}
                                             onSubmit={data => this.handleAddCategory(data, tourKey)}/>
                          </Col>
                        </Row>
                      </div>}
                      <hr/>
                    </div>
                  ))}
                </div>
                {/* <Row>
               <Col xs={12} md={6}>
               <AddTourForm onSubmit={this.handleAddTour}/>
               </Col>
               </Row >*/}
              </div>}
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
