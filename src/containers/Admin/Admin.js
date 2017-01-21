import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Button } from 'react-bootstrap';
import cx from 'classnames';
import store from 'store';
import gameData from 'game/game-2';

@connect(
  state => ({ user: state.auth.user })
)
export default class Admin extends Component {

  static propTypes = {
    user: PropTypes.object
  };

  constructor() {
    super();
    this.defaultState = {
      currentTour: 'tour-1',
      currentQuestion: null,
      completedQuestions: [],
      players: []
    };
    this.state = Object.assign({}, this.defaultState);
    this.init();
  }

  componentDidMount() {
    if (socket) {
      socket.on('msg', this.onMessageReceived);
      socket.on('updatePlayers', this.onUpdatePlayers);
    }
  }

  componentDidUpdate() {
    store.set('game', this.state);
  }

  componentWillUnmount() {
    if (socket) {
      socket.removeListener('msg', this.onMessageReceived);
      socket.removeListener('updatePlayers', this.onUpdatePlayers);
    }
  }

  // Players
  onUpdatePlayers = ({ players }) => {
    this.setState({
      players
    });
  }

  init() {
    const game = store.get('game');
    this.state = Object.assign({}, this.defaultState, game || {});
    if (game) {
      socket.emit('setGameInit', game);
    }
  }

  handleTourChange = (tour) => {
    this.setState({
      currentTour: tour
    });
    socket.emit('tourSelect', {
      tour
    });
  }

  handleNewGameStart = () => {
    this.setState({
      completedQuestions: [],
      currentQuestion: null
    }, () => {
      this.init();
    });
  }

  handleQuestionClick = (question) => {
    const { completedQuestions, currentQuestion } = this.state;
    if (currentQuestion || completedQuestions.includes(question)) {
      return;
    }
    this.setState({
      currentQuestion: question
    });
    socket.emit('questionSelect', {
      question
    });
  }

  handlePlay = () => {
    socket.emit('play');
  }

  handleCompleteQuestion = () => {
    const { completedQuestions, currentQuestion } = this.state;
    if (!currentQuestion) {
      return;
    }
    completedQuestions.push(currentQuestion);
    this.setState({
      completedQuestions,
      currentQuestion: null
    });
    socket.emit('completeQuestion', { completedQuestions });
  }

  handleCancelQuestion = () => {
    this.setState({
      currentQuestion: null
    });
    socket.emit('cancelQuestion');
  }

  handleScoreChange(event, player) {
    console.log(event.target.value);
    console.log(player);
  }

  render() {
    const style = require('./Admin.scss');
    const { completedQuestions, currentTour, currentQuestion } = this.state;

    return (
      <div className="container">
        <Helmet title="Admin"/>
        {/** <table className={style.players}>
          <tbody>
          {players.map((plr, index) => (
            <tr key={index}>
              <td className={style.playersName}>{plr.name}</td>
              <td className={style.playersScore}>
                <Input bsSize="small" type="text" value={plr.score}
                onChange={event => this.handleScoreChange(event, plr)}/>
              </td>
              <td><Button bsSize="small" bsStyle="danger">x</Button></td>
            </tr>
          ))}
          </tbody>
        </table >**/}
        <div className={style.game}>
          <div className={style.tours}>
            {gameData.game.tours.map((tour, tourIndex) => (
              <span key={tourIndex}>
              <Button bsStyle={tour === currentTour ? 'primary' : 'default'}
                      bsSize="large"
                      onClick={() => {
                        this.handleTourChange(tour);
                      }}>
              {gameData.tours[tour].name}
              </Button>
                {' '}
            </span>
            ))}
          </div>
          <div className={style.newGame}>
            <Button onClick={this.handleNewGameStart}>Новая игра</Button>
          </div>
        </div>
        {currentQuestion &&
        <div>
          <p><strong>Ответ:</strong> {gameData.questions[currentQuestion].answer}</p>
          <div className={style.controls}>
            <Button bsStyle="primary" bsSize="large" onClick={this.handlePlay}>Играть</Button>
            {' '}
            <Button bsStyle="danger" bsSize="large" onClick={this.handleCancelQuestion}>Отмена</Button>
            {' '}
            <Button bsStyle="success" bsSize="large" onClick={this.handleCompleteQuestion}>Вопрос сыгран</Button>
          </div>
        </div>}

        <table className={style.table}>
          <tbody>
          {gameData.tours[currentTour].categories.map((category, categoryIndex) => (
            <tr key={categoryIndex}>
              <td className={style.tableCategory}>{gameData.categories[category].name}</td>
              {gameData.categories[category].questions.map((question, questionIndex) => (
                <td key={questionIndex}
                    className={cx({
                      [style.tableCell]: true,
                      [style.active]: question === currentQuestion,
                      [style.completed]: completedQuestions.includes(question)
                    })}
                    onClick={() => this.handleQuestionClick(question)}>
                  {(questionIndex + 1) * 100 * gameData.tours[currentTour].multiplier}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }
}
