import { CSSProperties, useState } from "react";
import { BoardProps } from "boardgame.io/react";
import { Markers, GameState, PlayerState } from "./Game";

const cellStyle: CSSProperties = {
  border: "1px solid #555",
  width: "50px",
  height: "50px",
  lineHeight: "50px",
  textAlign: "center",
};

const Board = ({ G, ctx, moves, playerID }: BoardProps<GameState>) => {
  if (!playerID) return <>No Player</>;
  const [selectedMarker, setSelectedMarker] = useState("SeekerDrone");
  const player = G.players[playerID];

  const handleCellClick = (x: number, y: number) => {
    if (!playerID) return;
    const cell = G.grid[x][y][playerID];
    const cellMarker = cell ? cell : null;
    if (cellMarker) {
      moves.removeMarker(x, y);
    } else {
      moves.placeMarker(x, y, selectedMarker);
    }
  };

  const rows = G.grid.map((row, x) => (
    <tr key={x}>
      {row.map((cell, y) => {
        const marker = cell[playerID];
        return (
          <td
            key={y}
            className="cell"
            style={cellStyle}
            onClick={() => handleCellClick(x, y)}
          >
            {marker && (
              <span
                style={{
                  color: marker === Markers.SEEKER_DRONE ? "red" : "green",
                }}
              >
                {marker === Markers.SEEKER_DRONE ? "D" : "B"}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  ));
  const Scoreboard = ({
    player,
    round,
  }: {
    player: PlayerState;
    round: number;
  }) => (
    <div
      className="score-board"
      style={{
        flex: 1,
      }}
    >
      <div>
        <span>Player {playerID}</span>
      </div>
      <div>
        <span>Round {round}</span>
      </div>
      Evader Bots: {player.evaderBotCount} | Seeker Drones:{" "}
      {player.seekerDroneCount}
    </div>
  );

  const Grid = () => (
    <table>
      <tbody>{rows}</tbody>
    </table>
  );
  const MarkerType = () => (
    <select
      id={`markerType-${playerID}`}
      onChange={(e) => setSelectedMarker(e.target.value)}
      value={selectedMarker}
    >
      <option value="SeekerDrone">Drone</option>
      <option value="EvaderBot">Bot</option>
    </select>
  );

  const Result = () => (
    <p className="winner">
      {ctx.gameover
        ? ctx.gameover.winner !== undefined
          ? "Winner: Player " + ctx.gameover.winner
          : "Draw!"
        : ""}
    </p>
  );
  const ReadyButton = ({ isReady }: { isReady: boolean }) => (
    <button
      style={{
        color: isReady ? "red" : "green",
      }}
      className="ready-button"
      onClick={() => moves.toggleReady()}
    >
      {isReady ? "Hold" : "Ready"}
    </button>
  );
  const isMarkerPlaced =
    player.evaderBots.length > 0 || player.seekerDrones.length > 0;
  return (
    <div>
      <Scoreboard player={player} round={G.round} />
      <Grid />
      <MarkerType />
      <br />
      <>{isMarkerPlaced && <ReadyButton isReady={player.isReady} />}</>
      <Result />
    </div>
  );
};

export default Board;
