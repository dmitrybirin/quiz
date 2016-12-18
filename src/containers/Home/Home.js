import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

@connect(
  state => ({ user: state.auth.user })
)
export default class Home extends Component {

  static propTypes = {
    user: PropTypes.object
  };

  state = {
    message: '',
    messages: []
  };

  handleBuzz = () => {
    console.log('Buzz');
    const { user } = this.props;
    if (user) {
      socket.emit('buzz', {
        name: this.props.user.name
      });
    }
  }

  render() {
    const style = require('./Home.scss');
    const { user } = this.props;

    return (
      <div className="container">
        <Helmet title="Game"/>
        {user && <h1>{user.name}</h1>}

        <button className={style.buzz} onTouchStart={this.handleBuzz} onMouseDown={this.handleBuzz}>BUZZ</button>
      </div>
    );
  }
}
