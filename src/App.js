import { Client } from "boardgame.io/client";
import { SocketIO, Local } from "boardgame.io/multiplayer";
import { CELLS, TicTacToe } from "./TicTacToe";
import { WhoIsLast, config, Markers } from "./WhoIsLast";

class WhoIsLastClient {
  constructor(rootElement, { playerID, matchID } = {}) {
    this.client = Client({
      game: WhoIsLast,
      multiplayer: SocketIO({ server: "localhost:8000" }),
      matchID,
      playerID,
    });
    this.client.start();
    this.rootElement = rootElement;

    const initialState = this.client.getInitialState();
    // get the rows and cols size from the grid in the initial state
    const rows = initialState.G.grid.length;
    const cols = initialState.G.grid[0].length;

    this.createBoard(initialState.G.players[playerID], rows, cols, playerID);
    this.attachListeners(playerID);
    this.client.subscribe((state) => this.update(state, playerID));
  }

  createBoard(player, rowsCount, colsCount, playerID) {
    console.log("player", playerID);
    const rows = [];
    for (let i = 0; i < rowsCount; i++) {
      const cells = [];
      for (let j = 0; j < colsCount; j++) {
        const id = `${i},${j}`;
        cells.push(`<td class="cell" data-id="${id}"></td>`);
      }
      rows.push(`<tr>${cells.join("")}</tr>`);
    }
    this.rootElement.innerHTML = `
      <div class="score-board">Evader Bots: ${
        player.evaderBotCount
      } | Seeker Drones: ${player.seekerDroneCount}</div>
      <div><table>${rows.join("")}</table>
      <select id="markerType-${playerID}">
        <option value="SeekerDrone">Drone</option>
        <option value="EvaderBot">Bot</option>
      </select>
      </div>
      <p class="winner"></p>
    `;
  }

  attachListeners(playerID) {
    const handleCellClick = (event) => {
      const [x, y] = event.target.dataset.id.split(",").map((i) => parseInt(i));
      const markerType = document.getElementById(
        `markerType-${playerID}`
      ).value;
      console.log("markerType client", markerType);
      this.client.moves.placeMarker(x, y, markerType);
    };
    const cells = this.rootElement.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.onclick = handleCellClick;
    });
  }
  update(state, playerID) {
    if (state === null) return;
    const currentPlayerID = state.log.at(-1)?.action.payload.playerID;
    if (currentPlayerID !== playerID) return;
    const scoreboard = this.rootElement.querySelector(".score-board");
    const player = state.G.players[playerID];
    scoreboard.innerHTML = `<span>Bots: ${player.evaderBotCount} -  Drones: ${player.seekerDroneCount}</span>`;

    const cells = this.rootElement.querySelectorAll(".cell");
    cells.forEach((cell) => {
      const [x, y] = cell.dataset.id.split(",").map((i) => parseInt(i));
      if (!state.G.grid[x][y]) return;
      const marker = state.G.grid[x][y][playerID]?.marker;
      cell.innerHTML =
        marker !== null
          ? marker == Markers.SEEKER_DRONE
            ? "<span style='color: red'>D</span>"
            : "<span style='color: green'>B</span>"
          : "";
    });
    const messageEl = this.rootElement.querySelector(".winner");
    if (state.ctx.gameover) {
      messageEl.textContent =
        state.ctx.gameover.winner !== undefined
          ? "Winner: Player " + state.ctx.gameover.winner
          : "Draw!";
    } else {
      messageEl.textContent = "";
    }
  }
}
const appElement = document.getElementById("app");
const client = new WhoIsLastClient(appElement, { playerID: "0" });

// ["0", "1"].map((playerID) => {
//   const rootElement = document.createElement("div");
//   appElement.append(rootElement);
//   return new WhoIsLastClient(rootElement, { playerID });
// });
