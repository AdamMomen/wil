import kaboom, { LevelConf, Comp } from "../dist/kaboom";
import "./styles/style.css";

const k = kaboom({
  // background: [20, 20, 20],
  // @ts-ignore
  letterbox: true,
  width: 1280,
  height: 720,
});
type Marker = "drone" | "bot";
let selectedMarker: Marker = "bot";

const {
  scene,
  add,
  text,
  color,
  pos,
  start,
  rect,
  area,
  origin,
  vec2,
  width,
  height,
  sprite,
  scale,
} = k;

scene("game", () => {
  createGrid();
  createButton("Drone", "drone", width() - 210, height() / 2 - 150);
  createButton("Bot", "bot", width() - 210, height() / 2 - 50);
});

// create a button to switch between drone and bot
const createButton = (_text: string, marker: Marker, x: number, y: number) => {
  const button = add([
    rect(60, 40), // Adjusted button size to be more appropriate
    pos(x, y),
    // color(0, 0, 0),
    origin("center"),
    sprite(marker),
    scale(marker == "bot" ? 0.125 : 0.05),
    // area(), // Define the clickable area for the button
    "button", // Tag the entity as a button for easy access later
    {
      marker,
    },
  ]);
  button.clicks(() => {
    selectedMarker = marker;
    // Update the color of all buttons based on the selected marker
    k.every("button", (b) => {
      console.log(b);
      //   b.color = color(b.marker == selectedMarker ? 255 : 0, 0, 0);
    });
    console.log(`Selected marker: ${selectedMarker}`);
  });
};

const gridSize = 8;
const cellSize = (Math.min(k.width(), k.height()) * 0.5) / gridSize;
const gridOffsetX = (k.width() - cellSize * gridSize) / 2;
const gridOffsetY = (k.height() - cellSize * gridSize) / 2;

const createGrid = () => {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Draw light green lines between cells to create the grid effect
      if (i < gridSize - 1) {
        add([
          rect(4, cellSize),
          pos(gridOffsetX + (i + 1) * cellSize - 1, gridOffsetY + j * cellSize),
          color(0, 255, 0),
        ]);
      }
      if (j < gridSize - 1) {
        add([
          rect(cellSize, 4),
          pos(gridOffsetX + i * cellSize, gridOffsetY + (j + 1) * cellSize - 1),
          color(0, 255, 0),
        ]);
      }
      // Create an interactive cell
      const cell = add([
        rect(cellSize, cellSize),
        pos(gridOffsetX + i * cellSize, gridOffsetY + j * cellSize),
        area(vec2(0, 0), vec2(cellSize, cellSize)),
        color(0, 0, 0, 0), // transparent color
        "cell", // tag for the cell
      ]);
      // Add mouse click event for each cell
      cell.clicks(() => {
        add([
          sprite(selectedMarker),
          pos(
            gridOffsetX + i * cellSize + cellSize / 5,
            gridOffsetY + j * cellSize + cellSize / 5
          ),

          scale(selectedMarker == "bot" ? 0.125 : 0.05),
          selectedMarker, // tag for the drone
          color(255, 255, 0), // Change sprite color to yellow
        ]);
        console.log(`Cell clicked at grid (${i}, ${j})`);
      });
    }
  }
};

const scenes = {
  menu: () => {
    // Menu scene logic here
    add([text("test"), pos(width() / 2, height() / 2)]);
  },
  gameover: () => {
    // Gameover scene logic here
  },
  game: () => {
    // Game scene logic here
  },
};

for (const [name, scene] of Object.entries(scenes)) {
  k.scene(name, scene);
}

k.go("game");
