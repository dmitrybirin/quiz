import memoize from 'lru-memoize'
import { createValidator, required } from 'utils/validation'

const surveyValidation = createValidator({
  answer: [required],
  file: [(value, data) => {
    if (['sound', 'image'].includes(data.type) && !value) {
      return 'Required'
    }
  }],
  text: [(value, data) => {
    if (['text'].includes(data.type) && !value) {
      return 'Required'
    }
  }],
  type: [required],
  stream: [(value, data) => {
    if (data.type === 'stream' && !value) {
      return 'Required'
    }
  }]
})

export default memoize(10)(surveyValidation)
