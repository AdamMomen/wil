import Game from "./Game";
import Board from "./Board";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";

const App = Client({
  game: Game,
  board: Board,
  multiplayer: SocketIO({ server: "localhost:8000" }),
});

export default App;
