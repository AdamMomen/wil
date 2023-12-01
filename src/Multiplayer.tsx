import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import Game from "./Game";
import Board from "./Board";

const App = Client({
  game: Game,
  board: Board,
  multiplayer: Local(),
});

const Multiplayer = () => (
  <div className="flex h-screen w-screen justify-center items-center">
    <div>
      <h1>Multiplayer</h1>
      <div
        className="runner"
        style={{ justifyContent: "center", maxWidth: "1024px" }}
      >
        <div className="run">
          <App matchID="multi" playerID="0" />
        </div>
        <div className="run">
          <App matchID="multi" playerID="1" />
        </div>
      </div>
    </div>
  </div>
);

export default Multiplayer;
