import React, { PropTypes } from 'react'
import style from './ScoreBoard.scss'

function ScoreBoard({ onScoreChange, onRemovePlayer, players, playPlayers }) {
  const formattedNumber = value => Number.isInteger(value) && value.toLocaleString('ru-RU')
  return (
    <div>
      {players && playPlayers &&
      <table className={style.playersTable}>
        <tbody>
        {Object.keys(playPlayers).filter(playerKey => players[playerKey])
          .sort((key1, key2) => playPlayers[key2].score - playPlayers[key1].score).map(playerKey => (
            <tr key={playerKey}>
              <td>{players[playerKey].name}</td>
              {!onScoreChange &&
              <td>
                {formattedNumber(playPlayers[playerKey].score)}
              </td>}
              {onScoreChange &&
              <td>
                <input
                  type="text"
                  value={playPlayers[playerKey].score}
                  onChange={event => onScoreChange(playerKey, parseInt(event.target.value, 10))}/>
              </td>}
              {onRemovePlayer &&
              <td>
                {' '}
                <button className={style.remove} onClick={() => onRemovePlayer(playerKey)}>Удалить</button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  )
}

ScoreBoard.propTypes = {
  onRemovePlayer: PropTypes.func,
  onScoreChange: PropTypes.func,
  players: PropTypes.object,
  playPlayers: PropTypes.object,
}

export default ScoreBoard
