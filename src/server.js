const { Server, Origins } = require("boardgame.io/server");
const { TicTacToe } = require("./Game");

const server = Server({
  games: [TicTacToe],
  origins: [Origins.LOCALHOST, Origins.LOCALHOST_IN_DEVELOPMENT],
});

server.run(8000);
