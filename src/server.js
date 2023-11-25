const { Server, Origins } = require("boardgame.io/server");
const { TicTacToe } = require("./Game");

const server = Server({
  games: [TicTacToe],
  origins: [
    Origins.LOCALHOST,
    Origins.LOCALHOST_IN_DEVELOPMENT,
    "https://grid-master.vercel.app",
  ],
});

server.run(8000);
