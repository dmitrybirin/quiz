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
  fields: ['answer', 'file', 'url', 'text', 'type'],
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
        text: question.text,
        type: question.type,
        url: question.url,
      })
    } else {
      this.props.initialize('question', {
        type: type || 'audio',
        answer: '',
        file: '',
        text: '',
        url: '',
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
      fields: { answer, file, text, type, url },
      handleSubmit, uploadedFiles
    } = this.props
    const fileUrl = path([file.value, 'downloadURL'], uploadedFiles)

    const urlPlaceholders = {
      audio: 'Ссылка на YouTube, SoundCloud или файл',
      video: 'Ссылка на YouTube, Vimeo или файл',
      image: 'Ссылка на картинку',
    }
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <RadioGroup name="type" {...type} onChange={this.handleTypeChange}>
              <label className={styles.label}><input type="radio" value="audio"/> Аудио</label>
              <label className={styles.label}><input type="radio" value="video"/> Видео</label>
              <label className={styles.label}><input type="radio" value="image"/> Картинка</label>
              <label className={styles.label}><input type="radio" value="text"/> Текст</label>
            </RadioGroup>
          </div>

          {['audio', 'video', 'image'].includes(type.value) &&
          <div className={styles.row}>
            <Input type="text" placeholder={urlPlaceholders[type.value]} {...url}/>
            {url.touched && url.error && <div className="text-danger">{url.error}</div>}
            {url.value &&
            <div>
              {['audio', 'video'].includes(type.value) &&
              <ReactPlayer url={url.value}
                           height={200}
                           controls/>}
              {type.value === 'image' && <img className={styles.image} src={url.value}/>}
            </div>}
          </div>}
          {['audio', 'image'].includes(type.value) &&
          <div className={styles.row}>
            <Dropzone multiple={false}
                      onDrop={this.handleFilesDrop}
                      className={styles.dropzone}>
              <div>
                Или перетащи сюда файл
              </div>
            </Dropzone>
            {fileUrl &&
            <div>
              {type.value === 'audio' &&
              <ReactPlayer url={fileUrl}
                           height={200}
                           controls/>}
              {type.value === 'image' &&
              <img className={styles.image} src={fileUrl}/>}
            </div>}
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
