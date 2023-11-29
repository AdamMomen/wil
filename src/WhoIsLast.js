import { ActivePlayers, INVALID_MOVE, Stage } from "boardgame.io/core";
export const config = {
  grid: {
    rows: 10,
    cols: 10,
  },
  evaderBotRatio: 0.1,
  seekerDroneRatio: 0.03,
};

export const Markers = {
  EVADER_BOT: "EvaderBot",
  SEEKER_DRONE: "SeekerDrone",
  DESTROYED: "Destroyed",
};

function createGrid(rows, cols) {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));
}

const placeMarker = (
  { G: { grid, players }, playerID, ctx },
  x,
  y,
  markerType
) => {
  const currentPlayer = players[playerID];
  const markerCount =
    markerType === Markers.EVADER_BOT ? "evaderBotCount" : "seekerDroneCount";
  const markerArray =
    markerType === Markers.EVADER_BOT ? "evaderBots" : "seekerDrones";

  if (currentPlayer[markerCount] > 0) {
    currentPlayer[markerArray].push({ x, y });
    if (!grid[x][y]) {
      grid[x][y] = {};
    }
    grid[x][y][playerID] = {
      playerId: currentPlayer,
      marker: markerType,
    };
    currentPlayer[markerCount]--;
  }
};

const removeMarker = ({ G, playerID }, x, y) => {
  if (!G.grid[x][y]) return;

  const deletedMarker = G.grid[x][y][playerID].marker;
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
  if (Object.keys(G.grid[x][y]).length === 0) {
    G.grid[x][y] = null;
  }
};

export const WhoIsLast = {
  setup: ({ ctx }) => {
    const grid = createGrid(config.grid.rows, config.grid.cols);
    const players = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[i] = {
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
    readyPlayer({ G, playerID }, ctx) {
      G.players[playerID].isReady = true;
    },
  },
  turn: {
    activePlayers: ActivePlayers.ALL,
    onBegin({ G }, ctx) {
      console.log("on begin");
      Object.values(G.players).forEach((p) => (p.isReady = false));
    },
    onEnd({ G }, ctx) {
      // Check for Seeker Drone and Evader Bot interactions
      G.grid.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (cell) {
            const evaderBotKey = Object.keys(cell).find(
              (key) => cell[key].marker === Markers.EVADER_BOT
            );
            const seekerDroneKey = Object.keys(cell).find(
              (key) => cell[key].marker === Markers.SEEKER_DRONE
            );
            if (evaderBotKey && seekerDroneKey) {
              const evaderBotPlayerId = evaderBotKey.split("-")[0];
              const seekerDronePlayerId = seekerDroneKey.split("-")[0];
              cell[evaderBotKey] = {
                playerId: evaderBotPlayerId,
                marker: Markers.DESTROYED,
              };
              G.players[evaderBotPlayerId].evaderBots = G.players[
                evaderBotPlayerId
              ].evaderBots.filter((b) => b.x !== x || b.y !== y);
              G.players[seekerDronePlayerId].seekerDroneCount++;
            }
          }
        });
      });
      G.round++;
    },
  },
  endIf: ({ G }, ctx) => {
    if (G) return null;
    // Check if only one player has Evader Bots left
    const readyPlayers = Object.values(G.players).filter((p) => p.isReady);
    if (readyPlayers.length === 1) {
      return { winner: readyPlayers[0].id };
    }
    const lastPlayerWithBot = readyPlayers.filter((p) => p.evaderBotCount > 0);

    if (lastPlayerWithBot.length <= 1) {
      return {
        winner: lastPlayerWithBot.length === 1 ? lastPlayerWithBot[0].id : null,
      };
    }
    // Check if time is up and one player is not ready, then declare the ready player as winner
  },
};
