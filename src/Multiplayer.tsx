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
  <div className="flex flex-row justify-center items-center">
    <div>
      <h1 className="text-3xl text-bold">Multiplayer</h1>
      <div className="pt-5">
        <div className="">
          <App matchID="multi" playerID="0" />
        </div>
        <div className="mt-8">
          <App matchID="multi" playerID="1" />
        </div>
      </div>
    </div>
  </div>
);

export default Multiplayer;
