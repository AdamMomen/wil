const { Server, Origins } = require("boardgame.io/server");
const { TicTacToe } = require("./TicTacToe");
const { WhoIsLast } = require("./WhoIsLast");

const server = Server({
  games: [WhoIsLast],
  origins: [Origins.LOCALHOST, Origins.LOCALHOST_IN_DEVELOPMENT],
});

server.run(8000);
