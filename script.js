// canvas things
window.focus;
const CANVAS = document.getElementById("myCanvas");
const CTX = CANVAS.getContext("2d");
CANVAS.height = innerHeight * 0.8;
CANVAS.width = CANVAS.height * 1.5;

// loading images
const TEST_TILE = new Image();
const TEST_TILE_2 = new Image();
const TEST_TILE_3 = new Image();
TEST_TILE.src = "images/testtile.png";
TEST_TILE_2.src = "images/testtile2.png";
TEST_TILE_3.src = "images/testtile3.png";
CTX.imageSmoothingEnabled = false;
// disables antiailasing

// declaring variables
const TILESIZE = CANVAS.width * 0.055;
const CHUNK_WIDTH = 4;
const ROOMHEIGHT = 3
const ROOMWIDTH = 4
let acceleration = 0.2;
let mouseX = 0;
let mouseY = 0;
const MONSTER_SIZE = 0.75;
const MONSTER_SPEED = 2.5;
const MONSTER_X = 0;
const MONSTER_Y = 2 * TILESIZE;
const MONSTER_HEALTH = 10;
const MONSTER_DAMAGE = 10;

const PLAYER = {
  pos: [2 * TILESIZE, 2 * TILESIZE],
  size: TILESIZE * 0.75,
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
    currentChunk.push(chunk[row])
  }
  for (let rotateNum = 0; rotateNum < number; rotateNum++) {
    let newChunk = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
    for (let row = 0; row < CHUNK_WIDTH; row++) {
      for (let column = 0; column < CHUNK_WIDTH; column++) {
        newChunk[row][column] = currentChunk[column][row]
        newChunk[column][row] = currentChunk[row][column]
      }
    }
    for (let row = 0; row < CHUNK_WIDTH; row++) {
      newChunk[row].reverse();
    } 
    currentChunk = [];
    for (let row = 0; row < CHUNK_WIDTH; row++) {
      currentChunk.push(newChunk[row])
    }
  }
  return currentChunk
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
  ["w", "d", "s", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "d", "d"],
];

let echunks = [echunk, echunkvar1, echunkvar2]

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
  ["w", "s", "d", "s"],
  ["w", "s", "w", "s"],
];

let ctlchunks = [ctlchunk, ctlchunkvar1, ctlchunkvar2]

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
  ["w", "w", "s", "d"],
  ["s", "s", "s", "s"],
  ["s", "s", "s", "s"],
  ["s", "d", "s", "w"],
];

let midchunks = [midchunk, midchunk_var1, midchunk_var2, midchunk_var3]

function generateRoom(map, room_row, room_column) {
  // places chunks, old code
  let room = [];
  for (let row = 0; row < ROOMHEIGHT; row++) {
    room.push([]); // generate empty rows
    for (let column = 0; column < ROOMWIDTH; column++) {
      switch (true) {
        case (column == 0 && row == 0):
          room[row].push(ctlchunks[Math.floor(Math.random() * ctlchunks.length)]);
          break;
        case (column == 0 && row == ROOMHEIGHT - 1):
          room[row].push(rotateChunk(ctlchunks[Math.floor(Math.random() * ctlchunks.length)], 3));
          break;
        case (column == ROOMWIDTH - 1 && row == 0):
          room[row].push(rotateChunk(ctlchunks[Math.floor(Math.random() * ctlchunks.length)], 1));
          break;
        case (column == ROOMWIDTH - 1 && row == ROOMHEIGHT - 1):
          room[row].push(rotateChunk(ctlchunks[Math.floor(Math.random() * ctlchunks.length)], 2));
          break;
        case (column == 0):
          room[row].push(echunks[Math.floor(Math.random() * echunks.length)]);
          break;
        case (column == ROOMWIDTH - 1):
          room[row].push(rotateChunk(echunks[Math.floor(Math.random() * echunks.length)], 2));
          break;
        case (row == 0):
          room[row].push(rotateChunk(echunks[Math.floor(Math.random() * echunks.length)], 1));
          break;
        case (row == ROOMHEIGHT - 1):
          room[row].push(rotateChunk(echunks[Math.floor(Math.random() * echunks.length)], 3));
          break;
        default:
          room[row].push(midchunks[Math.floor(Math.random() * midchunks.length)]);
          break;
      }
    }
  }
  // work in progress
  // if (room_row == 0 && room_column == 0) {
  //   room[ROOMHEIGHT - 1][Math.floor(Math.random() * (ROOMWIDTH - 2)) + 1] = bechunkdoor
  // }
  // // Math.floor(Math.random() * (ROOMWIDTH - 2)) + 1
  // if (room_row !== 0) {
  // }


  let actualroom = []
  for (let i = 0; i < ROOMHEIGHT * 4; i++) {
    actualroom.push([])
  }
  for (let roomrow = 0; roomrow < ROOMHEIGHT; roomrow++) {
    for (let roomcolumn = 0; roomcolumn < ROOMWIDTH; roomcolumn++) {
      for (let chunkrow = 0; chunkrow < CHUNK_WIDTH; chunkrow++) {
        for (let chunkcolumn = 0; chunkcolumn < CHUNK_WIDTH; chunkcolumn++) {
          actualroom[roomrow * 4 + chunkrow].push(room[roomrow][roomcolumn][chunkrow][chunkcolumn])
        }
      }   
    }
  }

  return actualroom;
}

function generateMap() {
  let map = []
  for (let row = 0; row < 5; row++) {
    map.push([])
    for (let column = 0; column < 5; column++) {
      map[row].push(generateRoom(map, row, column))
    }
  }
  return map
}

let test_room = generateRoom()

console.log(generateMap())

// let chunk = generateGridChunk();

function drawTiles(room) {
  for (let row = 0; row < ROOMHEIGHT*4; row++) {
    for (let column = 0; column < ROOMWIDTH*4; column++) {
      if (room[row][column] === "w") {
        image = TEST_TILE;
      } else if (room[row][column] === "d") {
        image = TEST_TILE_3
      }else {
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

function animate() {
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
  
  // draw room  
  drawTiles(test_room)

  // rotate canvas in order to draw player
  CTX.save();
  CTX.translate(PLAYER.pos[0], PLAYER.pos[1]);
  CTX.rotate(angle);
  CTX.fillRect(-PLAYER.size / 2, -PLAYER.size / 2, PLAYER.size, PLAYER.size);
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
for (let i = 0; i < 10; i++) {
  monsters.push(generateMonster([]));
}

animate();
