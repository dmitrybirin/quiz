import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import Helmet from 'react-helmet';
import gameData from 'game/game-2';
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
    questionCat: false,
    questionAuction: false,
    playing: false,
    player: null,
    players: []
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
      socket.on('updatePlayers', this.onUpdatePlayers);

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
      socket.removeListener('updatePlayers', this.onUpdatePlayers);
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
    if (!quest) {
      return;
    }

    this.setState({
      currentQuestion: question
    });

    if (quest.cat) {
      this.setState({
        questionCat: true,
        buzzPlaying: true
      });
    }

    if (quest.auction) {
      this.setState({
        questionAuction: true,
        buzzPlaying: true
      });
    }

    if (quest.type === 'song') {
      this.setState({
        questionImage: null,
        questionSong: quest.file
      });
    } else if (quest.type === 'image') {
      this.setState({
        questionImage: quest.file,
        questionSong: null
      });
    }
  }

  onPlay = () => {
    const { currentQuestion } = this.state;
    const quest = gameData.questions[currentQuestion];
    if (quest) {
      this.setState({
        questionCat: false,
        questionAuction: false,
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
      questionCat: false,
      questionAuction: false,
      completedQuestions: data.completedQuestions,
      currentQuestion: null,
      playing: false,
      player: null
    });
  }

  onCancelQuestion = () => {
    this.setState({
      questionCat: false,
      questionAuction: false,
      currentQuestion: null,
      player: null,
      playing: false
    });
  }

  // Players
  onUpdatePlayers = ({ players }) => {
    this.setState({
      players
    });
  }

  render() {
    const style = require('./Game.scss');
    const {
      buzzPlaying, completedQuestions, currentTour, currentQuestion, questionImage, questionSong,
      questionCat, questionAuction,
      player, playing
    } = this.state;

    return (
      <div className={style.container}>
        <Helmet title="Game"/>
        {/** <div className={style.players}>
          <div className={style.playersWrap}>
            {players.map((plr, index) => (
              <div key={index} className={style.playersBlock}>
                <div>{plr.name}</div>
                <div>{plr.score}</div>
              </div>
            ))}
          </div>
        </div> **/}
        {currentTour &&
        <h1 className={style.title}>{gameData.tours[currentTour].name}</h1>}
        {questionSong &&
        <div>
          <ReactPlayer url={questionSong}
                       height={0}
                       playing={playing}
                       fileConfig={{ attributes: { preload: 'auto' } }}
                       onPlay={() => this.setState({ playing: true })}
                       onEnded={() => this.setState({ playing: false })}
                       volume={1}/>
        </div>}
        {questionImage &&
        <div className={cx({ [style.image]: true, [style.active]: playing })}>
          <img src={questionImage} alt=""/>
        </div>}
        {player &&
        <div className={style.player}>
          <span>{player}</span>
        </div>}
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
                    {(questionIndex + 1) * 100 * gameData.tours[currentTour].multiplier}
                  </td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>}
        {questionCat &&
        <div className={cx({ [style.cat]: true, [style.active]: questionCat })}>
          <img src="http://i.giphy.com/8mju7eCXDceU8.gif" alt=""/>
        </div>}
        {questionAuction &&
        <div className={cx({ [style.auction]: true, [style.active]: questionAuction })}>
          <img src="http://i.giphy.com/m0MfjLtKOgTPG.gif" alt=""/>
        </div>}
        <ReactPlayer url="/game/horn.mp3"
                     height={10}
                     playing={buzzPlaying}
                     fileConfig={{ attributes: { preload: 'auto' } }}
                     onPlay={() => this.setState({ buzzPlaying: true })}
                     onEnded={() => this.setState({ buzzPlaying: false })}
                     volume={0.7}/>
      </div>
    );
  }
}
