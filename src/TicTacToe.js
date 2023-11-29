import { INVALID_MOVE } from "boardgame.io/core";
export const CELLS = { x: 8, y: 6 };
export const TicTacToe = {
  setup: () => ({
    cells: Array(CELLS.x).fill(Array(CELLS.y).fill(null)),
    turn: {
      minMoves: 1,
      maxMoves: 1,
    },
  }),

  moves: {
    clickCell: ({ G, playerID }, x, y) => {
      if (G.cells[x][y] !== null) {
        return INVALID_MOVE;
      }
      G.cells[x][y] = playerID;
    },
  },
  endIf: ({ G, ctx }) => {
    // end the game
  },
};
