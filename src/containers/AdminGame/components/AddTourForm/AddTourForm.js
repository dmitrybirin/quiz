import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import validation from './validation'
// Component
import { Button, Input } from 'react-bootstrap'

@reduxForm({
  fields: ['name'],
  validate: validation
})
class AddTourForm extends Component {
  static propTypes = {
    fields: PropTypes.object,
    handleSubmit: PropTypes.func,
    initialize: PropTypes.func,
  }

  render() {
    const {
      fields: { name },
      handleSubmit
    } = this.props
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <Input type="text" {...name}
                 buttonAfter={<Button bsStyle="primary" type="submit">
                   <i className="fa fa-plus"/> Добавить тур
                 </Button>}/>
        </form>
      </div>
    )
  }
}

export default AddTourForm
