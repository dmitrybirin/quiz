import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import Helmet from 'react-helmet';
import gameData from 'game/data';
import cx from 'classnames';

@connect(
  state => ({ user: state.auth.user })
)
export default class Game extends Component {

  static propTypes = {
    user: PropTypes.object
  };

  state = {
    buzzPlaying: false,
    completedQuestions: [],
    currentTour: null,
    currentQuestion: null,
    questionImage: null,
    questionSong: null,
    playing: false,
    player: null
  };

  componentDidMount() {
    if (socket) {
      socket.on('gameInit', this.onGameInit);
      socket.on('tourSelect', this.onTourSelect);
      socket.on('questionSelect', this.onQuestionSelect);
      socket.on('play', this.onPlay);
      socket.on('buzz', this.onBuzz);
      socket.on('completeQuestion', this.onCompleteQuestion);
      socket.on('cancelQuestion', this.onCancelQuestion);

      socket.emit('getGameInit');
    }
  }

  componentWillUnmount() {
    if (socket) {
      socket.removeListener('gameInit', this.onGameInit);
      socket.removeListener('tourSelect', this.onTourSelect);
      socket.removeListener('questionSelect', this.onQuestionSelect);
      socket.removeListener('play', this.onPlay);
      socket.removeListener('buzz', this.onBuzz);
      socket.removeListener('completeQuestion', this.onCompleteQuestion);
      socket.removeListener('cancelQuestion', this.onCancelQuestion);
    }
  }

  onGameInit = (data) => {
    console.log(data);
    this.setState(data);
  }

  onTourSelect = (data) => {
    console.log(data);
    this.setState({
      currentTour: data.tour
    });
  }

  onQuestionSelect = (data) => {
    console.log(data);
    const { question } = data;
    const quest = gameData.questions[question];
    if (quest) {
      this.setState({
        currentQuestion: question,
        questionImage: quest.type === 'image' && quest.file,
        questionSong: quest.type === 'song' && quest.file,
      });
    }
  }

  onPlay = () => {
    const { currentQuestion } = this.state;
    const quest = gameData.questions[currentQuestion];
    if (quest) {
      this.setState({
        player: null,
        playing: true
      });
    }
  }

  onBuzz = (data) => {
    const { playing, player } = this.state;
    if (data.name && playing && !player) {
      this.setState({
        buzzPlaying: true,
        player: data.name,
        playing: false
      });
    }
  }

  onCompleteQuestion = (data) => {
    this.setState({
      completedQuestions: data.completedQuestions,
      player: null
    });
  }

  onCancelQuestion = () => {
    this.setState({
      currentQuestion: null,
      player: null,
      playing: false
    });
  }

  render() {
    const style = require('./Game.scss');
    const {
      buzzPlaying, completedQuestions, currentTour, currentQuestion, questionImage, questionSong,
      player, playing
    } = this.state;

    const quest = gameData.questions[currentQuestion] || {};

    return (
      <div className={'container'}>
        <Helmet title="Game"/>
        {currentTour &&
        <h1>{gameData.tours[currentTour].name}</h1>}
        {quest.type === 'song' &&
        <div>
          <ReactPlayer url={questionSong} controls
                       height={50}
                       playing={playing}
                       onPlay={() => this.setState({ playing: true })}
                       onEnded={() => this.setState({ playing: false })}/>
        </div>}
        <div className={style.game}>
          <h2>{player}</h2>
        </div>
        {currentTour &&
        <div>
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
                      })}>
                    {(questionIndex + 1) * 100}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>}
        {quest.type === 'image' && (playing || player) &&
        <div className={style.image}>
          <img src={questionImage} alt=""/>
        </div>}
        <ReactPlayer url="/game/horn.mp3"
                     height={10}
                     playing={buzzPlaying}
                     onPlay={() => this.setState({ buzzPlaying: true })}
                     onEnded={() => this.setState({ buzzPlaying: false })}/>
      </div>
    );
  }
}
