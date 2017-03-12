import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { change, initialize, reduxForm } from 'redux-form'
import { firebaseConnect, helpers } from 'react-redux-firebase'
import autobind from 'autobind-decorator'
import { is } from 'ramda'
const { dataToJS } = helpers
import addQuestionValidation from './addQuestionValidation'
import ReactPlayer from 'react-player'
// Component
import { Button, Input } from 'react-bootstrap'
import RadioGroup from 'react-radio'
import Dropzone from 'react-dropzone'

const FILES_PATH = 'uploadedFiles'

@reduxForm({
  form: 'question',
  fields: ['answer', 'file', 'text', 'type', 'video'],
  validate: addQuestionValidation
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
class AddQuestionForm extends Component {
  static propTypes = {
    change: PropTypes.func,
    dispatch: PropTypes.func,
    fields: PropTypes.object.isRequired,
    firebase: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func,
    resetForm: PropTypes.func.isRequired,
    uploadedFiles: PropTypes.object
  }

  constructor() {
    super()
    this.state = {
      fileUrl: null
    }
  }

  componentDidMount() {
    this.props.initialize('question', {
      type: 'text'
    })
  }

  handleFilesDrop(files) {
    this.props.firebase.uploadFiles(FILES_PATH, files, FILES_PATH).then(res => {
      if (is(Array, res)) {
        const file = res[0].getKey()
        if (file) {
          this.props.dispatch(this.props.change('question', 'file', file))
          this.setState({
            fileUrl: this.props.uploadedFiles[file].downloadURL
          })
        }
      }
    })
  }

  render() {
    const styles = require('./AddQuestionForm.scss')
    const {
      fields: { answer, file, text, type, video },
      handleSubmit,
    } = this.props
    const { fileUrl } = this.state
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <RadioGroup name="type" {...type}>
              <label className={styles.label}><input type="radio" value="text"/> Text</label>
              <label className={styles.label}><input type="radio" value="sound"/> Sound</label>
              <label className={styles.label}><input type="radio" value="image"/> Image</label>
              <label className={styles.label}><input type="radio" value="video"/> Video</label>
            </RadioGroup>
          </div>
          {['sound', 'image'].includes(type.value) &&
          <div className={styles.row}>
            <Dropzone multiple={false}
                      onDrop={this.handleFilesDrop}
                      className={styles.dropzone}>
              <div>
                Drag and drop file here or click to select
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
            <Input type="text" placeholder="Video URL" {...video}/>
            {video.touched && video.error && <div className="text-danger">{video.error}</div>}
            {video.value &&
            <ReactPlayer url={video.value}
                         controls/>}
          </div>}
          <div className={styles.row}>
            <Input type="textarea" placeholder="Question" {...text}/>
            {text.touched && text.error && <div className="text-danger">{text.error}</div>}
          </div>
          <div className={styles.row}>
            <Input type="textarea" placeholder="Answer" {...answer}/>
            {answer.touched && answer.error && <div className="text-danger">{answer.error}</div>}
          </div>
          <Button bsStyle="primary" type="submit">Add question</Button>
        </form>
      </div>
    )
  }
}

export default AddQuestionForm
