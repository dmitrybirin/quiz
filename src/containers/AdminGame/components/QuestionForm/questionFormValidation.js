import memoize from 'lru-memoize'
import { createValidator, required } from 'utils/validation'

const surveyValidation = createValidator({
  answer: [required],
  type: [required],
})

export default memoize(10)(surveyValidation)
