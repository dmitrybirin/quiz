import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { change, initialize, reduxForm } from 'redux-form'
import { firebaseConnect, helpers } from 'react-redux-firebase'
import autobind from 'autobind-decorator'
import { is } from 'ramda'
const { dataToJS } = helpers
import questionFormValidation from './questionFormValidation'
import ReactPlayer from 'react-player'
import { path } from 'ramda'
// Component
import { Button, Input } from 'react-bootstrap'
import RadioGroup from 'react-radio'
import Dropzone from 'react-dropzone'

const FILES_PATH = 'uploadedFiles'

@reduxForm({
  form: 'question',
  fields: ['answer', 'file', 'stream', 'text', 'type'],
  validate: questionFormValidation
})
@firebaseConnect([
  FILES_PATH
])
@connect(
  ({ firebase }) => ({
    uploadedFiles: dataToJS(firebase, FILES_PATH)
  }), { change, initialize }
)
@autobind
class QuestionForm extends Component {
  static propTypes = {
    change: PropTypes.func,
    dispatch: PropTypes.func,
    fields: PropTypes.object,
    firebase: PropTypes.object,
    handleSubmit: PropTypes.func,
    initialize: PropTypes.func,
    onCancel: PropTypes.func,
    onTypeChange: PropTypes.func,
    type: PropTypes.string,
    question: PropTypes.object,
    resetForm: PropTypes.func,
    uploadedFiles: PropTypes.object
  }

  componentDidMount() {
    const { question, type } = this.props
    if (question) {
      this.props.initialize('question', {
        answer: question.answer,
        file: question.file,
        stream: question.stream,
        text: question.text,
        type: question.type,
      })
    } else {
      this.props.initialize('question', {
        type: type || 'stream',
        answer: '',
        file: '',
        stream: '',
        text: '',
      })
    }
  }

  handleFilesDrop(files) {
    this.props.firebase.uploadFiles(FILES_PATH, files, FILES_PATH).then(res => {
      if (is(Array, res)) {
        const file = res[0].key
        if (file) {
          this.props.dispatch(this.props.change('question', 'file', file))
        }
      }
    })
  }

  handleTypeChange(value) {
    this.props.fields.type.onChange(value)
    if (this.props.onTypeChange) {
      this.props.onTypeChange(value)
    }
  }

  render() {
    const styles = require('./QuestionForm.scss')
    const {
      fields: { answer, file, stream, text, type },
      handleSubmit, uploadedFiles
    } = this.props
    const fileUrl = path([file.value, 'downloadURL'], uploadedFiles)
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <RadioGroup name="type" {...type} onChange={this.handleTypeChange}>
              <label className={styles.label}><input type="radio" value="stream"/> Аудио</label>
              <label className={styles.label}><input type="radio" value="video"/> Видео</label>
              <label className={styles.label}><input type="radio" value="sound"/> Файл</label>
              <label className={styles.label}><input type="radio" value="image"/> Картинка</label>
              <label className={styles.label}><input type="radio" value="text"/> Текст</label>
            </RadioGroup>
          </div>
          {['sound', 'image'].includes(type.value) &&
          <div className={styles.row}>
            <Dropzone multiple={false}
                      onDrop={this.handleFilesDrop}
                      className={styles.dropzone}>
              <div>
                Перетащи сюда файл или просто кликни
              </div>
            </Dropzone>
            {file.touched && file.error && <div className="text-danger">{file.error}</div>}
            {file.value && fileUrl &&
            <div>
              {type.value === 'sound' &&
              <ReactPlayer url={fileUrl}
                           controls/>}
              {type.value === 'image' &&
              <img className={styles.image} src={fileUrl}/>}
            </div>}
          </div>}
          {type.value === 'video' &&
          <div className={styles.row}>
            <Input type="text" placeholder="Ссылка на YouTube или Vimeo" {...stream}/>
            {stream.touched && stream.error && <div className="text-danger">{stream.error}</div>}
            {stream.value &&
            <ReactPlayer url={stream.value}
                         controls/>}
          </div>}
          {type.value === 'stream' &&
          <div className={styles.row}>
            <Input type="text" placeholder="Ссылка на YouTube или SoundCloud" {...stream}/>
            {stream.touched && stream.error && <div className="text-danger">{stream.error}</div>}
            {stream.value &&
            <ReactPlayer url={stream.value}
                         height={200}
                         controls/>}
          </div>}
          <div className={styles.row}>
            <Input type="textarea" placeholder="Вопрос" {...text}/>
            {text.touched && text.error && <div className="text-danger">{text.error}</div>}
          </div>
          <div className={styles.row}>
            <Input type="textarea" placeholder="Ответ" {...answer}/>
            {answer.touched && answer.error && <div className="text-danger">{answer.error}</div>}
          </div>
          <Button bsStyle="primary" type="submit">Сохранить</Button>
          {' '}
          <Button onClick={this.props.onCancel}>Отмена</Button>
        </form>
      </div>
    )
  }
}

export default QuestionForm
