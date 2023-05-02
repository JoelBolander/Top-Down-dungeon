// canvas things
window.focus;
const CANVAS = document.getElementById("myCanvas");
const CTX = CANVAS.getContext("2d");
CANVAS.height = innerHeight * 0.8;
CANVAS.width = CANVAS.height * 1.5;

// loading images
const DOOR = new Image();
const TEST_TILE_2 = new Image();
const TEST_TILE_3 = new Image();
DOOR.src = "images/tiles/testtile3.png";
TEST_TILE_2.src = "images/tiles/dirt.png";
TEST_TILE_3.src = "images/tiles/smooth-tile-1.png";
CTX.imageSmoothingEnabled = false;
// disables antiailasing

// declaring variables
const TILESIZE = CANVAS.width / 24; // denominator is equal to number of tiles that fit in the canvas's width
const CHUNK_WIDTH = 4;
const ROOMHEIGHT = 4;
const ROOMWIDTH = 6;
let acceleration = 0.2;
let mouseX = 0;
let mouseY = 0;
const MONSTER_SIZE = 0.75;
const MONSTER_SPEED = 2.5;
const MONSTER_X = 0;
const MONSTER_Y = 2 * TILESIZE;
const MONSTER_HEALTH = 10;
const MONSTER_DAMAGE = 10;
let currentRoomRow = 2;
let currentRoomColumn = 1;

const PLAYER = {
  pos: [2 * TILESIZE, 2 * TILESIZE],
  radius: (TILESIZE * 0.75) / 2,
  vel: [0, 0], // velocity unit - millitiles per frame
  maxVel: 10.5,
  acc: [0, 0],
};

function generateMonster() {
  // monsterPos = room.tiles[Math.random() * room.chunk.length]
  let pos = [MONSTER_X, MONSTER_Y];
  let size = TILESIZE * MONSTER_SIZE;
  let health = MONSTER_HEALTH;
  let damage = MONSTER_DAMAGE;
  let vel = [0, 0];
  let maxVel = Math.random() * MONSTER_SPEED + 5;
  let acc = [0, 0];
  let angle = 0;

  let monster = {
    pos,
    size,
    health,
    damage,
    vel,
    maxVel,
    acc,
    angle,
  };
  return monster;
}

function move(obj) {
  let targetVelX;
  let targetVelY;

  if (obj === PLAYER) {
    // find desired velocity (the velocity the PLAYER will reach with the current keys pressed)

    // 1. if no direction pressed
    if (!(obj.up ^ obj.down || obj.left ^ obj.right)) {
      targetVelX = targetVelY = 0;
    }
    // 2. if one direction pressed
    else if (obj.up ^ obj.down ^ (obj.left ^ obj.right)) {
      if (obj.up && !obj.down) {
        targetVelX = 0;
        targetVelY = -obj.maxVel;
      }
      if (obj.left && !obj.right) {
        targetVelX = -obj.maxVel;
        targetVelY = 0;
      }
      if (obj.down && !obj.up) {
        targetVelX = 0;
        targetVelY = obj.maxVel;
      }
      if (obj.right && !obj.left) {
        targetVelX = obj.maxVel;
        targetVelY = 0;
      }
    }
    // 3. if two directions pressed (diagonal)
    else {
      if (obj.up && !obj.down) {
        targetVelY = -obj.maxVel / Math.sqrt(2);
      }
      if (obj.left && !obj.right) {
        targetVelX = -obj.maxVel / Math.sqrt(2);
      }
      if (obj.down && !obj.up) {
        targetVelY = obj.maxVel / Math.sqrt(2);
      }
      if (obj.right && !obj.left) {
        targetVelX = obj.maxVel / Math.sqrt(2);
      }
    }
  } else {
    // finding angle between player and monster
    let angle = Math.atan2(
      PLAYER.pos[1] - obj.pos[1],
      PLAYER.pos[0] - obj.pos[0]
    );
    // calculatig distance to player
    let distance =
      Math.sqrt(
        (PLAYER.pos[1] - obj.pos[1]) ** 2 + (PLAYER.pos[0] - obj.pos[0]) ** 2
      ) / TILESIZE;
    // finding desired velocity
    targetVelX = Math.cos(angle) * obj.maxVel;
    targetVelY = Math.sin(angle) * obj.maxVel;
    // slow down if close to player
    if (distance < 1) {
      targetVelX *= distance - 0.75;
      targetVelY *= distance - 0.75;
    }
  }

  // calculate acceleration based on distance to desired velocity
  obj.acc[0] = (targetVelX - obj.vel[0]) * acceleration;
  obj.acc[1] = (targetVelY - obj.vel[1]) * acceleration;

  // apply acceleration and velocity
  obj.vel[0] += obj.acc[0];
  obj.vel[1] += obj.acc[1];
  obj.pos[0] += obj.vel[0] * TILESIZE * 0.01;
  obj.pos[1] += obj.vel[1] * TILESIZE * 0.01;
}

function rotateChunk(chunk, number) {
  let currentChunk = [];
  for (let row = 0; row < CHUNK_WIDTH; row++) {
    currentChunk.push(chunk[row]);
  }
  for (let rotateNum = 0; rotateNum < number; rotateNum++) {
    let newChunk = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let row = 0; row < CHUNK_WIDTH; row++) {
      for (let column = 0; column < CHUNK_WIDTH; column++) {
        newChunk[row][column] = currentChunk[column][row];
        newChunk[column][row] = currentChunk[row][column];
      }
    }
    for (let row = 0; row < CHUNK_WIDTH; row++) {
      newChunk[row].reverse();
    }
    currentChunk = [];
    for (let row = 0; row < CHUNK_WIDTH; row++) {
      currentChunk.push(newChunk[row]);
    }
  }
  return currentChunk;
}

let echunk = [
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
];

let echunkvar1 = [
  ["w", "s", "s", "s"],
  ["w", "s", "w", "s"],
  ["w", "s", "s", "w"],
  ["w", "s", "s", "w"],
];

let echunkvar2 = [
  ["w", "w", "s", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "w", "w"],
];

let echunks = [echunk, echunkvar1, echunkvar2];

let echunkd = [
  ["w", "s", "s", "s"],
  ["d", "s", "s", "s"],
  ["d", "s", "s", "s"],
  ["w", "s", "s", "s"],
];

let echunkds = [echunkd];

let ctlchunk = [
  ["w", "w", "w", "w"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
];

let ctlchunkvar1 = [
  ["w", "w", "w", "w"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "w"],
  ["w", "s", "w", "s"],
];

let ctlchunkvar2 = [
  ["w", "w", "w", "w"],
  ["w", "s", "s", "s"],
  ["w", "s", "w", "s"],
  ["w", "s", "w", "s"],
];

let ctlchunks = [ctlchunk, ctlchunkvar1, ctlchunkvar2];

let midchunk = [
  ["s", "s", "s", "s"],
  ["s", "s", "s", "s"],
  ["s", "s", "s", "s"],
  ["s", "s", "s", "s"],
];

let midchunk_var1 = [
  ["w", "s", "s", "w"],
  ["s", "w", "s", "s"],
  ["s", "s", "s", "s"],
  ["s", "w", "s", "s"],
];

let midchunk_var2 = [
  ["w", "s", "s", "w"],
  ["s", "s", "w", "s"],
  ["s", "s", "s", "s"],
  ["s", "w", "s", "w"],
];

let midchunk_var3 = [
  ["w", "w", "s", "w"],
  ["s", "s", "s", "s"],
  ["s", "s", "s", "s"],
  ["s", "w", "s", "w"],
];

let midchunks = [midchunk, midchunk_var1, midchunk_var2, midchunk_var3];

function generateMap() {
  let map = [];
  for (let row = 0; row < 5; row++) {
    map.push([]);
    for (let column = 0; column < 5; column++) {
      map[row].push(generateRoom(map, row, column));
    }
  }
  return map;
}

function generateRoom(map, roomRow, roomColumn) {
  while (true) {
    let room = [];
    for (let row = 0; row < ROOMHEIGHT; row++) {
      room.push([]); // generate empty rows
      for (let column = 0; column < ROOMWIDTH; column++) {
        switch (true) {
          case column == 0 && row == 0:
            room[row].push(
              ctlchunks[Math.floor(Math.random() * ctlchunks.length)]
            );
            break;
          case column == 0 && row == ROOMHEIGHT - 1:
            room[row].push(
              rotateChunk(
                ctlchunks[Math.floor(Math.random() * ctlchunks.length)],
                3
              )
            );
            break;
          case column == ROOMWIDTH - 1 && row == 0:
            room[row].push(
              rotateChunk(
                ctlchunks[Math.floor(Math.random() * ctlchunks.length)],
                1
              )
            );
            break;
          case column == ROOMWIDTH - 1 && row == ROOMHEIGHT - 1:
            room[row].push(
              rotateChunk(
                ctlchunks[Math.floor(Math.random() * ctlchunks.length)],
                2
              )
            );
            break;
          case column == 0:
            room[row].push(echunks[Math.floor(Math.random() * echunks.length)]);
            break;
          case column == ROOMWIDTH - 1:
            room[row].push(
              rotateChunk(
                echunks[Math.floor(Math.random() * echunks.length)],
                2
              )
            );
            break;
          case row == 0:
            room[row].push(
              rotateChunk(
                echunks[Math.floor(Math.random() * echunks.length)],
                1
              )
            );
            break;
          case row == ROOMHEIGHT - 1:
            room[row].push(
              rotateChunk(
                echunks[Math.floor(Math.random() * echunks.length)],
                3
              )
            );
            break;
          default:
            room[row].push(
              rotateChunk(
                midchunks[Math.floor(Math.random() * midchunks.length)],
                Math.floor(Math.random() * 4) + 1
              )
            );
            break;
        }
      }
    }

    // generate doors
    if (roomRow !== 0) {
      let doorChunkCol;
      for (let searchIndex = 0; searchIndex < ROOMWIDTH * 4; searchIndex++) {
        if (
          map[roomRow - 1][roomColumn][ROOMHEIGHT * 4 - 1][searchIndex] == "d"
        ) {
          doorChunkCol = Math.floor(searchIndex / 4);
        }
      }
      room[0][doorChunkCol] = rotateChunk(
        echunkds[Math.floor(Math.random() * echunkds.length)],
        1
      );
    }
    if (roomRow !== 4) {
      room[ROOMHEIGHT - 1][Math.floor(Math.random() * (ROOMWIDTH - 2)) + 1] =
        rotateChunk(echunkds[Math.floor(Math.random() * echunkds.length)], 3);
    }
    if (roomColumn !== 0) {
      let doorChunkRow;
      for (let searchIndex = 0; searchIndex < ROOMHEIGHT * 4; searchIndex++) {
        if (
          map[roomRow][roomColumn - 1][searchIndex][ROOMWIDTH * 4 - 1] == "d"
        ) {
          doorChunkRow = Math.floor(searchIndex / 4);
        }
      }
      room[doorChunkRow][0] = rotateChunk(
        echunkds[Math.floor(Math.random() * echunkds.length)],
        0
      );
    }
    if (roomColumn !== 4) {
      room[Math.floor(Math.random() * (ROOMHEIGHT - 2)) + 1][ROOMWIDTH - 1] =
        rotateChunk(echunkds[Math.floor(Math.random() * echunkds.length)], 2);
    }

    let actualroom = [];
    for (let i = 0; i < ROOMHEIGHT * 4; i++) {
      actualroom.push([]);
    }
    for (let roomrow = 0; roomrow < ROOMHEIGHT; roomrow++) {
      for (let roomcolumn = 0; roomcolumn < ROOMWIDTH; roomcolumn++) {
        for (let chunkrow = 0; chunkrow < CHUNK_WIDTH; chunkrow++) {
          for (let chunkcolumn = 0; chunkcolumn < CHUNK_WIDTH; chunkcolumn++) {
            actualroom[roomrow * 4 + chunkrow].push(
              room[roomrow][roomcolumn][chunkrow][chunkcolumn]
            );
          }
        }
      }
    }
    let BDoorCoords;
    let TDoorCoords;
    let RDoorCoords;
    let LDoorCoords;
    for (let searchIndex = 0; searchIndex < ROOMWIDTH * 4; searchIndex++) {
      if (actualroom[ROOMHEIGHT * 4 - 1][searchIndex] == "d") {
        BDoorCoords = [ROOMHEIGHT * 4 - 1, searchIndex];
      }
      if (actualroom[0][searchIndex] == "d") {
        TDoorCoords = [0, searchIndex];
      }
    }
    for (let searchIndex = 0; searchIndex < ROOMHEIGHT * 4; searchIndex++) {
      if (actualroom[searchIndex][ROOMWIDTH * 4 - 1] == "d") {
        RDoorCoords = [searchIndex, ROOMWIDTH * 4 - 1];
      }
      if (actualroom[searchIndex][0] == "d") {
        LDoorCoords = [searchIndex, 0];
      }
    }

    const ROOMCOMBINATIONS = [
      [BDoorCoords, TDoorCoords, LDoorCoords, RDoorCoords],
      [BDoorCoords, TDoorCoords, LDoorCoords],
      [BDoorCoords, TDoorCoords, RDoorCoords],
      [BDoorCoords, RDoorCoords, LDoorCoords],
      [TDoorCoords, RDoorCoords, LDoorCoords],
      [BDoorCoords, LDoorCoords],
      [BDoorCoords, RDoorCoords],
      [TDoorCoords, RDoorCoords],
      [TDoorCoords, LDoorCoords],
    ];

    for (const roomCombination of ROOMCOMBINATIONS) {
      const [door1, door2, door3, door4] = roomCombination;
      if (door1 && door2 && door3 && door4) {
        if (
          findPath(actualroom, door3[0], door3[1], door2[0], door2[1]) &&
          findPath(actualroom, door2[0], door2[1], door4[0], door4[1]) &&
          findPath(actualroom, door4[0], door4[1], door1[0], door1[1])
        ) {
          return actualroom;
        }
      } else if (door1 && door2 && door3) {
        if (
          findPath(actualroom, door3[0], door3[1], door2[0], door2[1]) &&
          findPath(actualroom, door3[0], door3[1], door1[0], door1[1])
        ) {
          return actualroom;
        }
      } else if (door1 && door2 && door4) {
        if (
          findPath(actualroom, door4[0], door4[1], door2[0], door2[1]) &&
          findPath(actualroom, door4[0], door4[1], door1[0], door1[1])
        ) {
          return actualroom;
        }
      } else if (door1 && door4 && door3) {
        if (
          findPath(actualroom, door3[0], door3[1], door1[0], door1[1]) &&
          findPath(actualroom, door1[0], door1[1], door4[0], door4[1])
        ) {
          return actualroom;
        }
      } else if (door2 && door4 && door3) {
        if (
          findPath(actualroom, door3[0], door3[1], door2[0], door2[1]) &&
          findPath(actualroom, door2[0], door2[1], door4[0], door4[1])
        ) {
          return actualroom;
        }
      } else if (door1 && door3) {
        if (findPath(actualroom, door1[0], door1[1], door3[0], door3[1])) {
          return actualroom;
        }
      } else if (door1 && door4) {
        if (findPath(actualroom, door1[0], door1[1], door4[0], door4[1])) {
          return actualroom;
        }
      } else if (door2 && door4) {
        if (findPath(actualroom, door2[0], door2[1], door4[0], door4[1])) {
          return actualroom;
        }
      } else if (door2 && door3) {
        if (findPath(actualroom, door2[0], door2[1], door3[0], door3[1])) {
          return actualroom;
        }
      }
    }
  }
}

let map = generateMap();

function drawTiles(room) {
  for (let row = 0; row < ROOMHEIGHT * 4; row++) {
    for (let column = 0; column < ROOMWIDTH * 4; column++) {
      if (room[row][column] === "w") {
        image = TEST_TILE_3;
      } else if (room[row][column] === "d") {
        image = DOOR;
      } else {
        image = TEST_TILE_2;
      }
      CTX.drawImage(
        image,
        column * TILESIZE,
        row * TILESIZE,
        TILESIZE,
        TILESIZE
      );
    }
  }
}

function findPath(room, startRow, startCol, endRow, endCol) {
  const ROWS = room.length;
  const COLS = room[0].length;
  const visited = new Array(ROWS).fill().map(() => new Array(COLS).fill(false));

  function explore(row, col) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) {
      // out of bounds
      return false;
    }

    if (row == endRow && col == endCol) {
      return true;
    }

    if (
      visited[row][col] ||
      (room[row][col] !== "s" && room[row][col] !== "d")
    ) {
      // already visited or not a floor tile
      return false;
    }

    visited[row][col] = true;

    // explore adjacent tiles
    const directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];
    for (const [dr, dc] of directions) {
      if (explore(row + dr, col + dc)) {
        return true;
      }
    }

    return false;
  }

  return explore(startRow, startCol);
}

// let testingRoom = [
//   ["w", "w", "w", "w", "w", "w"],
//   ["w", "w", "w", "w", "w", "w"],
//   ["d", "s", "s", "w", "s", "w"],
//   ["w", "w", "s", "w", "w", "d"],
//   ["w", "w", "s", "w", "s", "w"],
//   ["w", "w", "s", "s", "s", "w"],
// ];

// console.log(findPath(testingRoom, 2, 0, 3, 5));

document.addEventListener("keydown", (e) => {
  if (e.repeat) {
    return;
  }
  if (e.key === "w") {
    PLAYER.up = true;
  }
  if (e.key === "a") {
    PLAYER.left = true;
  }
  if (e.key === "s") {
    PLAYER.down = true;
  }
  if (e.key === "d") {
    PLAYER.right = true;
  }
  if (e.key === "i") {
    if (currentRoomRow !== 0) {
      currentRoomRow -= 1;
    }
  }
  if (e.key === "j") {
    if (currentRoomColumn !== 0) {
      currentRoomColumn -= 1;
    }
  }
  if (e.key === "k") {
    if (currentRoomRow !== 4) {
      currentRoomRow += 1;
    }
  }
  if (e.key === "l") {
    if (currentRoomColumn !== 4) {
      currentRoomColumn += 1;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w") {
    PLAYER.up = false;
  }
  if (e.key === "a") {
    PLAYER.left = false;
  }
  if (e.key === "s") {
    PLAYER.down = false;
  }
  if (e.key === "d") {
    PLAYER.right = false;
  }
});

document.addEventListener("mousemove", (e) => {
  const CANVASRECT = CANVAS.getBoundingClientRect();
  mouseX = e.clientX - CANVASRECT.left;
  mouseY = e.clientY - CANVASRECT.top;
});

function collision(object, room) {
  const TILE_POSITIONS = [];
  const OBJECT_POSITION = [object.pos[0] / TILESIZE, object.pos[1] / TILESIZE];
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      const TILE_X = Math.floor(object.pos[0] / TILESIZE - 1 + column);
      const TILE_Y = Math.floor(object.pos[1] / TILESIZE - 1 + row);
      if (
        TILE_X >= 0 &&
        TILE_X < ROOMWIDTH * CHUNK_WIDTH &&
        TILE_Y >= 0 &&
        TILE_Y < ROOMHEIGHT * CHUNK_WIDTH
      )
        TILE_POSITIONS.push([TILE_X, TILE_Y]);
    }
  }
  for (let i = 0; i < TILE_POSITIONS.length; i++) {
    const TILE = room[TILE_POSITIONS[i][1]][TILE_POSITIONS[i][0]];
    const TILE_X = TILE_POSITIONS[i][0] * TILESIZE;
    const TILE_Y = TILE_POSITIONS[i][1] * TILESIZE;
    if (TILE === "w") {
      if (
        TILE_X + TILESIZE < object.pos[0] &&
        object.pos[0] < TILE_X + TILESIZE + object.radius &&
        TILE_Y < object.pos[1] &&
        object.pos[1] < TILE_Y + TILESIZE
      ) {
        object.pos[0] = TILE_X + TILESIZE + object.radius;
      }
      if (
        TILE_X - object.radius < object.pos[0] &&
        object.pos[0] < TILE_X &&
        TILE_Y < object.pos[1] &&
        object.pos[1] < TILE_Y + TILESIZE
      ) {
        object.pos[0] = TILE_X - object.radius;
      }
      if (
        TILE_Y + TILESIZE < object.pos[1] &&
        object.pos[1] < TILE_Y + TILESIZE + object.radius &&
        TILE_X < object.pos[0] &&
        object.pos[0] < TILE_X + TILESIZE
      ) {
        object.pos[1] = TILE_Y + TILESIZE + object.radius;
      }
      if (
        TILE_Y - object.radius < object.pos[1] &&
        object.pos[1] < TILE_Y &&
        TILE_X < object.pos[0] &&
        object.pos[0] < TILE_X + TILESIZE
      ) {
        object.pos[1] = TILE_Y - object.radius;
      }
    }
  }
}

function animate() {
  const ROOM = map[currentRoomRow][currentRoomColumn];

  // clear canvas
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // calculate player
  move(PLAYER);
  // angle
  const DELTA_X = PLAYER.pos[0] - mouseX;
  const DELTA_Y = PLAYER.pos[1] - mouseY;
  let angle = Math.atan2(DELTA_Y, DELTA_X) - Math.PI / 2;

  // calculate monster
  for (let i = 0; i < monsters.length; i++) {
    move(monsters[i]);
    const deltaXMonster = monsters[i].pos[0] - PLAYER.pos[0];
    const deltaYMonster = monsters[i].pos[1] - PLAYER.pos[1];
    monsters[i].angle = Math.atan2(deltaYMonster, deltaXMonster);
  }

  // collision position offset
  collision(PLAYER, ROOM);

  // draw room
  drawTiles(ROOM);

  // rotate canvas in order to draw player
  CTX.save();
  CTX.translate(PLAYER.pos[0], PLAYER.pos[1]);
  CTX.rotate(angle);
  CTX.fillRect(
    -PLAYER.radius,
    -PLAYER.radius,
    PLAYER.radius * 2,
    PLAYER.radius * 2
  );
  CTX.restore();

  for (let i = 0; i < monsters.length; i++) {
    CTX.save();
    CTX.translate(monsters[i].pos[0], monsters[i].pos[1]);
    CTX.rotate(monsters[i].angle);
    CTX.fillRect(
      -monsters[i].size / 2,
      -monsters[i].size / 2,
      monsters[i].size,
      monsters[i].size
    );
    CTX.restore();
  }

  requestAnimationFrame(animate);
}

let monster = generateMonster([]);

let monsters = [monster];
// for (let i = 0; i < 10; i++) {
//   monsters.push(generateMonster([]));
// }

animate();
