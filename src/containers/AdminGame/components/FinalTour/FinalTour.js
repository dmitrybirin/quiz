import React, {
  Component,
  PropTypes,
} from 'react'
import { Input, Button } from 'react-bootstrap'
import RadioGroup from 'react-radio'
import { path } from 'ramda'
import styles from './FinalTour.scss'

const FINAL_TOURS_PATH = 'finalTours'
const FINAL_TOUR_QUESTIONS_PATH = 'finalTourQuestions'

class FinalTour extends Component {
  static propTypes = {
    firebase: PropTypes.object,
    finalTours: PropTypes.object,
    finalTourKey: PropTypes.string,
    finalTourQuestions: PropTypes.object,
  }

  handleAddQuestion = () => {
    const { finalTourKey } = this.props
    this.props.firebase.push(`${FINAL_TOUR_QUESTIONS_PATH}`, {
      answers: {
        a: '',
        b: '',
      },
      questions: {
        0: {
          text: '',
          answer: 'a',
        },
        1: {
          text: '',
          answer: 'a',
        },
        2: {
          text: '',
          answer: 'a',
        },
        3: {
          text: '',
          answer: 'a',
        },
        4: {
          text: '',
          answer: 'a',
        },
      },
    }).then(res => {
      const questionKey = res.getKey()
      this.props.firebase.update(`${FINAL_TOURS_PATH}/${finalTourKey}/questions`, {
        [questionKey]: true,
      })
    })
  }

  handleAnswerChange = (event, questionKey, answerKey) => {
    this.props.firebase.update(`${FINAL_TOUR_QUESTIONS_PATH}/${questionKey}/answers`, {
      [answerKey]: event.target.value,
    })
  }

  handleQuestionTextChange = (event, key, questionKey) => {
    this.props.firebase.update(`${FINAL_TOUR_QUESTIONS_PATH}/${key}/questions/${questionKey}`, {
      text: event.target.value,
    })
  }

  handleQuestionAnswerChange = (value, key, questionKey) => {
    this.props.firebase.update(`${FINAL_TOUR_QUESTIONS_PATH}/${key}/questions/${questionKey}`, {
      answer: value,
    })
  }

  render() {
    const { finalTours, finalTourKey, finalTourQuestions } = this.props
    const finalTour = path([finalTourKey], finalTours)
    const questions = path(['questions', finalTour])
    const currentTourQuestions = questions && finalTourQuestions && Object.keys(finalTourQuestions) || []
    return (
      <div>
        <h4>Финальный раунд</h4>
        {currentTourQuestions.map(key => (
          <div key={key}>
            <div>
              <div className={styles.answers}>
                <div className={styles.answersItem}>
                  Вариант A
                  <Input
                    type="text"
                    value={finalTourQuestions[key].answers.a}
                    onChange={event => this.handleAnswerChange(event, key, 'a')}/>
                </div>
                <div className={styles.answersItem}>
                  Вариант B
                  <Input
                    type="text"
                    value={finalTourQuestions[key].answers.b}
                    onChange={event => this.handleAnswerChange(event, key, 'b')}/>
                </div>
              </div>
              <div className={styles.questions}>
                {Object.keys(finalTourQuestions[key].questions).map(questionKey => (
                  <div className={styles.questionsItem}>
                    Вопрос {parseInt(questionKey, 10) + 1}
                    <Input
                      type="textarea"
                      rows={5}
                      value={finalTourQuestions[key].questions[questionKey].text}
                      onChange={event => this.handleQuestionTextChange(event, key, questionKey)}/>
                    Ответ:
                    {' '}
                    <RadioGroup
                      name={key + questionKey}
                      value={finalTourQuestions[key].questions[questionKey].answer}
                      onChange={value => this.handleQuestionAnswerChange(value, key, questionKey)}>
                      <div>
                        <label><input type="radio" value="a"/> {finalTourQuestions[key].answers.a || 'A'}</label>
                      </div>
                      <div>
                        <label><input type="radio" value="b"/> {finalTourQuestions[key].answers.b || 'B'}</label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <Button bsStyle="primary" onClick={this.handleAddQuestion}>Добавить вопрос</Button>
      </div>
    )
  }
}

export default FinalTour
