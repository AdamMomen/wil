import React, { useEffect, useState } from "react";
import { Client } from "boardgame.io/react";
import { SocketIO, Local } from "boardgame.io/multiplayer";
import { WhoIsLast, config, Markers } from "./WhoIsLast";

const WhoIsLastClient = ({ playerID, matchID }) => {
  const [client, setClient] = useState(null);
  const [state, setState] = useState(null);

  useEffect(() => {
    const bgioClient = Client({
      game: WhoIsLast,
      multiplayer: Local(), //SocketIO({ server: "0.tcp.ap.ngrok.io:19538", }),
      matchID,
      playerID,
    });
    bgioClient.start();
    setClient(bgioClient);

    const unsubscribe = bgioClient.subscribe((state) => setState(state));
    return () => unsubscribe();
  }, [matchID, playerID]);

  const handleCellClick = (x, y) => {
    const markerType = document.getElementById(`markerType-${playerID}`).value;
    const cell = state.G.grid[x][y];
    const cellMarker = cell && cell[playerID] ? cell[playerID].marker : null;
    if (cellMarker) {
      client.moves.removeMarker(x, y);
    } else {
      client.moves.placeMarker(x, y, markerType);
    }
  };

  if (!state) {
    return <div>Loading...</div>;
  }

  const { G, ctx } = state;
  const player = G.players[playerID];
  const rows = G.grid.map((row, x) => (
    <tr key={x}>
      {row.map((cell, y) => {
        const marker = cell && cell[playerID] ? cell[playerID].marker : null;
        return (
          <td key={y} className="cell" onClick={() => handleCellClick(x, y)}>
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

  return (
    <div>
      <div className="score-board">
        Evader Bots: {player.evaderBotCount} | Seeker Drones:{" "}
        {player.seekerDroneCount}
      </div>
      <table>
        <tbody>{rows}</tbody>
      </table>
      <select id={`markerType-${playerID}`}>
        <option value="SeekerDrone">Drone</option>
        <option value="EvaderBot">Bot</option>
      </select>
      <p className="winner">
        {ctx.gameover
          ? ctx.gameover.winner !== undefined
            ? "Winner: Player " + ctx.gameover.winner
            : "Draw!"
          : ""}
      </p>
    </div>
  );
};

export default WhoIsLastClient;
