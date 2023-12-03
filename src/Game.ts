import { ActivePlayers, INVALID_MOVE, Stage } from "boardgame.io/core";
import { Ctx, Game } from "boardgame.io";

export const config = {
  grid: {
    rows: 3,
    cols: 3,
  },
  maxRounds: 10,
  evaderBotRatio: 0.1,
  seekerDroneRatio: 0.03,
};

export type Grid = Record<string, Markers>[][];

function createGrid(rows: number, cols: number): Grid {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill({}));
}

export enum Markers {
  EVADER_BOT = "EvaderBot",
  SEEKER_DRONE = "SeekerDrone",
  DESTROYED = "Destroyed",
}

type Coord = {
  x: number;
  y: number;
};

export type PlayerState = {
  id: string;
  isReady: boolean;
  evaderBots: Coord[];
  seekerDrones: Coord[];
  evaderBotCount: number;
  seekerDroneCount: number;
};

export type Players = {
  [key: string]: PlayerState;
};

export type GameState = {
  grid: Grid;
  round: number;
  players: Players;
};

type GameContext = {
  G: GameState;
  playerID: string;
  ctx: Ctx;
};
const placeMarker = (
  { G: { grid, players }, playerID }: GameContext,
  x: number,
  y: number,
  markerType: Markers
) => {
  if (grid[x][y][playerID]) {
    return INVALID_MOVE;
  }

  const currentPlayer = players[playerID];
  const markerCount =
    markerType === Markers.EVADER_BOT ? "evaderBotCount" : "seekerDroneCount";
  const markerArray =
    markerType === Markers.EVADER_BOT ? "evaderBots" : "seekerDrones";

  if (currentPlayer[markerCount] > 0) {
    currentPlayer[markerArray].push({ x, y });
    grid[x][y][playerID] = markerType;
    currentPlayer[markerCount]--;
  }
};

const removeMarker = ({ G, playerID }: GameContext, x: number, y: number) => {
  if (Object.keys(G.grid[x][y][playerID]).length == 0) return { INVALID_MOVE };

  const deletedMarker = G.grid[x][y][playerID];
  if (deletedMarker === Markers.EVADER_BOT) {
    G.players[playerID].evaderBotCount++;
    G.players[playerID].evaderBots = G.players[playerID].evaderBots.filter(
      ({ x: x1, y: y1 }) => x1 !== x || y1 !== y
    );
  } else if (deletedMarker === Markers.SEEKER_DRONE) {
    G.players[playerID].seekerDroneCount++;

    G.players[playerID].evaderBots = G.players[playerID].seekerDrones.filter(
      ({ x: x1, y: y1 }) => x1 !== x || y1 !== y
    );
  }
  delete G.grid[x][y][playerID];
};

const WhoIsLast = {
  setup: ({ ctx }: { ctx: Ctx }): GameState => {
    const grid = createGrid(config.grid.rows, config.grid.cols);
    const players: Players = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[i] = {
        id: "" + i,
        evaderBots: [], // Array to store positions of Evader Bots
        seekerDrones: [], // Array to store positions of Seeker Drones
        isReady: false, // Flag to check if the player is ready
        evaderBotCount: Math.ceil(
          config.grid.rows * config.grid.cols * config.evaderBotRatio
        ), // Count of remaining Evader Bots
        seekerDroneCount: Math.ceil(
          config.grid.rows * config.grid.cols * config.seekerDroneRatio
        ),
      };
    }

    return {
      players,
      grid,
      round: 1,
    };
  },
  moves: {
    removeMarker,
    placeMarker,
    toggleReady({ G, playerID }: GameContext) {
      G.players[playerID].isReady = !G.players[playerID].isReady;
    },
  },
  turn: {
    activePlayers: ActivePlayers.ALL,
    onBegin({ G }: GameContext) {
      console.log("on begin");
      Object.values(G.players).forEach((p) => (p.isReady = false));
    },
    onEnd({ G }: GameContext) {
      console.log("on End here");
      G.grid.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (cell) {
            const evaderBotPlayerID = Object.keys(cell).find(
              (key) => cell[key] === Markers.EVADER_BOT
            );
            const seekerDronePlayerID = Object.keys(cell).find(
              (key) => cell[key] === Markers.SEEKER_DRONE
            );
            if (evaderBotPlayerID && seekerDronePlayerID) {
              cell[evaderBotPlayerID] = Markers.DESTROYED;
              G.players[evaderBotPlayerID].evaderBots = G.players[
                evaderBotPlayerID
              ].evaderBots.filter((b) => b.x !== x || b.y !== y);
              G.players[seekerDronePlayerID].seekerDroneCount++;
            }
          }
        });
      });
      G.round++;
    },
  },
  endIf: ({ G: { players, round }, ctx }: GameContext) => {
    // Check if only one player has Evader Bots left
    const readyPlayers = Object.values(players).filter((p) => p.isReady);
    if (readyPlayers.length < ctx.numPlayers) {
      return;
    }

    console.log("Evaluating game round result");

    // check time is up situation and one of the players are not ready
    const lastPlayerWithBot = readyPlayers.filter((p) => p.evaderBotCount > 0);

    if (lastPlayerWithBot.length <= 1) {
      return {
        winner: lastPlayerWithBot.length === 1 ? lastPlayerWithBot[0].id : null,
      };
    }
    round++;
    // start a new patch
    if (round >= config.maxRounds) {
      const playersWithBots = Object.values(players).filter(
        (p) => p.evaderBotCount > 0
      );
      if (playersWithBots.length === 1) {
        return { winner: playersWithBots[0].id };
      }
    }
  },
};

export default WhoIsLast;
