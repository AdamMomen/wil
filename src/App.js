import { Client } from "boardgame.io/client";
import { SocketIO, Local } from "boardgame.io/multiplayer";
import { TicTacToe } from "./Game";

class TicTacToeClient {
  constructor(rootElement, { playerID } = {}) {
    this.client = Client({
      game: TicTacToe,
      multiplayer: SocketIO({
        server: "0.tcp.ap.ngrok.io:19889",
      }),
      matchID: "adam-and-rob",
      playerID,
    });
    this.client.start();
    this.rootElement = rootElement;
    this.createBoard();
    this.attachListeners();
    this.client.subscribe((state) => this.update(state));
  }
  createBoard() {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(`<td class="cell" data-id="${id}"></td>`);
      }
      rows.push(`<tr>${cells.join("")}</tr>`);
    }
    this.rootElement.innerHTML = `
      <table>${rows.join("")}</table>
      <p class="winner"></p>
    `;
  }

  attachListeners() {
    const handleCellClick = (event) => {
      const id = parseInt(event.target.dataset.id);
      this.client.moves.clickCell(id);
      this.client.events.endTurn();
    };
    const cells = this.rootElement.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.onclick = handleCellClick;
    });
  }
  update(state) {
    if (state === null) return;
    const cells = this.rootElement.querySelectorAll(".cell");
    cells.forEach((cell) => {
      const cellId = parseInt(cell.dataset.id);
      const cellValue = state.G.cells[cellId];
      console.log(cellValue);
      const marker = cellValue !== null ? (cellValue === "0" ? "O" : "X") : "";
      cell.textContent = marker !== null ? marker : "";
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
let playerName = prompt("Please enter your player name:");
if (!playerName) {
  alert("Please enter a player name");
} else {
  const client = new TicTacToeClient(appElement, { playerID: playerName });
}

/*
const playerIDs = ["0", "1"];

const clients = playerIDs.map((playerID) => {
  const rootElement = document.createElement("div");
  appElement.append(rootElement);
  return new TicTacToeClient(rootElement, { playerID });
});
*/
