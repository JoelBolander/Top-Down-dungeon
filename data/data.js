// debugger;

// canvas things
window.focus;
const RESOLUTION = 1;
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
const MAPSIZE = 3;
let acceleration = 0.2;
let mouseX = 0;
let mouseY = 0;
let completedRoom = false;
const MONSTER_SIZE = 0.8;
const MONSTER_SPEED = 5;
// const MONSTER_SPEED = 1;
const MONSTER_HEALTH = 2;
const MONSTER_DAMAGE = 10;
const MONSTER_AMOUNT = 4;
// const MONSTER_AMOUNT = 10000;
const HIT_RANGE = 0.8;
const PLAYER_COOLDOWN = 15;
const MONSTER_COOLDOWN = 150;
const PLAYER_SPEED = 10;
let isDead = false;
let isFinished = false;
// const PLAYER_SPEED = 70;
let currentRoomRow = 0;
let currentRoomColumn = 0;
const FPS = 60;
const PLAYER_RANGE = 1.8 * TILESIZE;
const MONSTER_RANGE = 1 * TILESIZE;

let monsters = [];

const DOOR = new Image();
const TEST_TILE_2 = new Image();
const TEST_TILE_3 = new Image();
const MONKEY = new Image();
const PLAYER_DAMAGED = new Image();
const MONKEY_DAMAGED = new Image();
const CHARACTER_IMAGE = new Image();
const GAME_OVER = new Image();
const WIN_SCREEN = new Image();
DOOR.src = "images/tiles/door.png";
TEST_TILE_2.src = "images/tiles/dirt.png";
TEST_TILE_3.src = "images/tiles/smooth-tile-1.png";
MONKEY.src = "images/characters/monkey2.png";
PLAYER_DAMAGED.src = "images/characters/main-character-damage.png";
MONKEY_DAMAGED.src = "images/characters/damage-monkey.png";
CHARACTER_IMAGE.src = "images/characters/main-character.png";
GAME_OVER.src = "images/characters/game_over.png";
WIN_SCREEN.src = "images/characters/win_screen.png";

let images = {
  Door: [TEST_TILE_2, DOOR],
  Wall: [TEST_TILE_3],
  Ground: [TEST_TILE_2],
};

let edgeChunk1 = [
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
];

let edgeChunk2 = [
  ["w", "g", "g", "g"],
  ["w", "w", "w", "w"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
];

let edgeChunk3 = [
  ["w", "g", "g", "g"],
  ["w", "g", "g", "w"],
  ["w", "g", "g", "w"],
  ["w", "g", "g", "w"],
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
  ["w", "g", "w", "w"],
];

let cornerChunk3 = [
  ["w", "w", "w", "w"],
  ["w", "g", "g", "g"],
  ["w", "w", "w", "g"],
  ["w", "g", "g", "g"],
];

let midChunk = [
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
];

let midChunk2 = [
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "g", "g", "g"],
  ["w", "w", "g", "g"],
];

let midChunk3 = [
  ["w", "w", "g", "g"],
  ["g", "g", "w", "g"],
  ["g", "g", "w", "g"],
  ["g", "g", "g", "g"],
];

let midChunk4 = [
  ["w", "w", "w", "w"],
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "w", "w", "w"],
];

let midChunk5 = [
  ["g", "g", "g", "g"],
  ["g", "g", "g", "g"],
  ["g", "w", "w", "g"],
  ["g", "w", "w", "g"],
];

let edgeChunks = [edgeChunk1, edgeChunk2, edgeChunk3];

let doorChunks = [doorChunk1];

let cornerChunks = [cornerChunk, cornerChunk2, cornerChunk3];

let midChunks = [midChunk, midChunk2, midChunk3, midChunk4, midChunk5];

let allChunks = [edgeChunks, doorChunks, cornerChunks, midChunks];

const FIRST_ROOM = [
  [
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "d",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "d",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "g",
    "w",
  ],
  [
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "d",
    "d",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
    "w",
  ],
];
