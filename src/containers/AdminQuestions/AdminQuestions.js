import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { initialize } from 'redux-form'
import Helmet from 'react-helmet'
import autobind from 'autobind-decorator'
import { firebaseConnect, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
// Components
import { Col, Grid, Row } from 'react-bootstrap'
import AddQuestionForm from './components/AddQuestionForm/AddQuestionForm'

const QUESTION_PATH = 'questions'

@firebaseConnect([
  QUESTION_PATH
])
@connect(
  ({ firebase }) => ({
    questions: dataToJS(firebase, QUESTION_PATH)
  }), { initialize }
)
@autobind
class AdminQuestions extends Component {
  static propTypes = {
    firebase: PropTypes.object.isRequired,
    initialize: PropTypes.func,
    questions: PropTypes.object,
    uploadedFiles: PropTypes.object
  }

  handleFormSubmit({ answer, file = '', text, type, video = '' }) {
    this.props.firebase.push(QUESTION_PATH, {
      answer, file, text, type, video
    }).then(() => {
      this.props.initialize('question', {
        answer: '',
        file: '',
        text: '',
        type,
        video: '',
      })
    })
  }

  render() {
    const styles = require('./AdminQuestions.scss')
    const { firebase, questions } = this.props

    return (
      <div className={styles.container}>
        <Helmet title="Admin - Questions"/>
        <Grid>
          <Row>
            <Col xs={12}>
              <h3>Questions</h3>
              <div>
                <h4>New question</h4>
                <Row>
                  <Col xs={12} md={6}>
                    <AddQuestionForm firebase={firebase} onSubmit={this.handleFormSubmit}/>
                  </Col>
                </Row>
              </div>
              <div>
                {questions && Object.keys(questions).map(key => (
                  <div key={key}>
                    <div>{questions[key].text}</div>
                    <div>{questions[key].answer}</div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

export default AdminQuestions
