import React, { PropTypes } from 'react'
import style from './ScoreBoard.scss'

function ScoreBoard({ players, playPlayers }) {
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
              <td>
                {formattedNumber(playPlayers[playerKey].score)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  )
}

ScoreBoard.propTypes = {
  players: PropTypes.object,
  playPlayers: PropTypes.object,
}

export default ScoreBoard
