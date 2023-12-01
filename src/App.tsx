import "./App.css";
import Game from "./Game";
import Board from "./Board";
import { Client } from "boardgame.io/react";

const App = Client({
  game: Game,
  board: Board,
});

export default App
