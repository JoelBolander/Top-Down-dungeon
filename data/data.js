// canvas things
window.focus;
const RESOLUTION = 4;
const CANVAS = document.getElementById("myCanvas");
const CTX = CANVAS.getContext("2d");
CANVAS.height = innerHeight * 0.8 * RESOLUTION;
CANVAS.width = CANVAS.height * 1.5;
CTX.imageSmoothingEnabled = false; // disables antiailasing

// declaring variables
const TILESIZE = CANVAS.width / 24; // denominator is equal to number of tiles that fit in the canvas's width
const CHUNK_WIDTH = 4;
const ROOMHEIGHT = 4;
const ROOMWIDTH = 6;
let acceleration = 0.2;
let mouseX = 0;
let mouseY = 0;
const MONSTER_SIZE = 0.5;
const MONSTER_SPEED = 2.5;
const MONSTER_X = 0;
const MONSTER_Y = 2 * TILESIZE;
const MONSTER_HEALTH = 10;
const MONSTER_DAMAGE = 10;
let currentRoomRow = 2;
let currentRoomColumn = 1;
const FPS = 90;

const DOOR = new Image();
const TEST_TILE_2 = new Image();
const TEST_TILE_3 = new Image();
DOOR.src = "images/tiles/door.png";
TEST_TILE_2.src = "images/tiles/dirt.png";
TEST_TILE_3.src = "images/tiles/smooth-tile-1.png";

let images = { Door: DOOR, Wall: TEST_TILE_3, Ground: TEST_TILE_2 };

let edgeChunk1 = [
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
];

let edgeChunk2 = [
  ["w", "g", "g", "g"],
  ["w", "g", "w", "g"],
  ["w", "g", "g", "w"],
  ["w", "g", "g", "w"],
];

let edgeChunk3 = [
  ["w", "w", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "w", "w"],
];

let doorChunk1 = [
  ["w", "g", "g", "g"],
  ["d", "g", "g", "g"],
  ["d", "g", "g", "g"],
  ["w", "g", "g", "g"],
];

let cornerChunk = [
  ["w", "w", "w", "w"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
];

let cornerChunk2 = [
  ["w", "w", "w", "w"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "w"],
  ["w", "g", "w", "g"],
];

let cornerChunk3 = [
  ["w", "w", "w", "w"],
  ["w", "g", "g", "g"],
  ["w", "g", "w", "g"],
  ["w", "g", "w", "g"],
];

let midChunk = [
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
];

let midChunk2 = [
  ["w", "g", "g", "w"],
  ["g", "w", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "w", "g", "g"],
];

let midChunk3 = [
  ["w", "g", "g", "w"],
  ["g", "g", "w", "g"],
  ["g", "g", "g", "g"],
  ["g", "w", "g", "w"],
];

let midChunk4 = [
  ["w", "w", "g", "w"],
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "w", "g", "w"],
];

let edgeChunks = [edgeChunk1, edgeChunk2, edgeChunk3];

let doorChunks = [doorChunk1];

let cornerChunks = [cornerChunk, cornerChunk2, cornerChunk3];

let midChunks = [midChunk, midChunk2, midChunk3, midChunk4];

let allChunks = [edgeChunks, doorChunks, cornerChunks, midChunks];

for (let i = 0; i < allChunks.length; i++) {
  // for every chunkgroup
  for (let j = 0; j < allChunks[i].length; j++) {
    // for every chunk
    for (let k = 0; k < allChunks[i][j].length; k++) {
      // for every row
      for (let l = 0; l < allChunks[i][j][k].length; l++) {
        // for every tile

        let name = allChunks[i][j][k][l];

        switch (name) {
          case "w":
            name = "Wall";
            break;
          case "d":
            name = "Door";
            break;
          case "g":
            name = "Ground";
            break;
          default:
            name = "Placeholder";
            break;
        }

        allChunks[i][j][k][l] = {
          name,
          images: [images[name]],
          pos: [100, 200],
          rotation: 0,
          radius: TILESIZE / 2,
        };
      }
    }
  }
}
/*
tiles get converted from letters to objects

exampleTile = {
    name: "Door",
    images: [currentGround, door],
    pos: [6,0],
    rotation: Math.PI / 2,
}

*/
