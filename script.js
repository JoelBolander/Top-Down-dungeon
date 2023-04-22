// canvas things
window.focus;
const CANVAS = document.getElementById("myCanvas");
const CTX = CANVAS.getContext("2d");
CANVAS.height = innerHeight * 0.8;
CANVAS.width = CANVAS.height * 1.5;

// loading images
const TEST_TILE = new Image();
const TEST_TILE_2 = new Image();
TEST_TILE.src = "images/testtile.png";
TEST_TILE_2.src = "images/testtile2.png";
CTX.imageSmoothingEnabled = false;
// disables antiailasing

// declaring variables
const TILESIZE = CANVAS.width * 0.055;
const CHUNK_WIDTH = 4;
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

function generateMonster(room) {
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
      targetVelX *= distance - 1;
      targetVelY *= distance - 1;
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

function generateRoom() {
  // places chunks, old code
  let chunk = [];
  for (let row = 0; row < CHUNK_WIDTH; row++) {
    chunk.push([]); // generate empty rows
    for (let column = 0; column < CHUNK_WIDTH; column++) {
      chunk[row].push("w"); // generate one tile per column in current row
    }
  }
  return chunk;
}

// let chunk = generateGridChunk();
let chunk = [
  ["w", "w", "w", "w"],
  ["w", "s", "w", "s"],
  ["w", "s", "s", "s"],
  ["w", "s", "s", "s"],
];
console.log(chunk);

function drawTiles(chunk) {
  for (let row = 0; row < CHUNK_WIDTH; row++) {
    for (let column = 0; column < CHUNK_WIDTH; column++) {
      let color;
      if (chunk[row][column] === "w") {
        image = TEST_TILE;
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

  drawTiles(chunk);

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
