import memoize from 'lru-memoize'
import { createValidator, required } from 'utils/validation'

const surveyValidation = createValidator({
  answer: [required],
  file: [(value, data) => {
    if (['sound', 'image'].includes(data.type) && !value) {
      return 'Required'
    }
  }],
  text: [required],
  type: [required],
  video: [(value, data) => {
    if (data.type === 'video' && !value) {
      return 'Required'
    }
  }]
})

export default memoize(10)(surveyValidation)
