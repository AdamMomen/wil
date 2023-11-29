import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Client } from "boardgame.io/react";
import { SocketIO, Local } from "boardgame.io/multiplayer";
import { WhoIsLast, config, Markers } from "./WhoIsLast";

const cellStyle = {
  border: "1px solid #555",
  width: "50px",
  height: "50px",
  lineHeight: "50px",
  textAlign: "center",
};

const Board = ({ ctx, G, moves, playerID = "0" }) => {
  const [selectedMarker, setSelectedMarker] = useState("SeekerDrone");
  const onClick = (x, y, markerType) => moves.placeMarker(x, y, markerType);
  let winner = "";
  if (ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined
        ? "Winner: " + ctx.gameover.winner
        : "Draw!";
  }

  const handleCellClick = (x, y) => {
    const cell = G.grid[x][y];
    const cellMarker = cell && cell[playerID] ? cell[playerID].marker : null;
    if (cellMarker) {
      moves.removeMarker(x, y);
    } else {
      moves.placeMarker(x, y, selectedMarker);
    }
  };

  const player = G.players[playerID];
  const rows = G.grid.map((row, x) => (
    <tr key={x}>
      {row.map((cell, y) => {
        const marker = cell && cell[playerID] ? cell[playerID].marker : null;
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

  const Scoreboard = ({ player }) => (
    <div className="score-board">
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

  return (
    <div>
      <Scoreboard player={player} />
      <Grid />
      <MarkerType />
      <Result />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("app"));
const App = Client({
  game: WhoIsLast,
  board: Board,
  multiplayer: SocketIO({ server: "localhost:8000" }),
});
root.render(<App />);
