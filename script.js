window.focus;
const CANVAS = document.getElementById("myCanvas");
const CTX = CANVAS.getContext("2d");
CANVAS.height = innerHeight * 0.8;
CANVAS.width = CANVAS.height * 1.5;

const TILESIZE = CANVAS.width * 0.065;
let acceleration = 0.2;

let player = {
  pos: [2 * TILESIZE, 2 * TILESIZE],
  size: TILESIZE,
  vel: [0, 0], // velocity unit - millitiles per frame
  maxVel: 20,
  acc: [0, 0],
};

function generateMonster(room) {
  // monsterPos = room.tiles[Math.random() * room.tile.length]
  let pos = [100, 200];
  let size = TILESIZE * Math.random();
  let health = 10;
  let damage = 10;
  let vel = [0, 0];
  let maxVel = Math.random() * 20;
  let acc = [0, 0];

  let monster = {
    pos,
    size,
    health,
    damage,
    vel,
    maxVel,
    acc,
  };
  return monster;
}

function move(obj) {
  let targetVelX;
  let targetVelY;

  if (obj === player) {
    // find desired velocity (the velocity the player will reach with the current keys pressed)
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
    let angle = Math.atan(
      (player.pos[1] - obj.pos[1]) / (player.pos[0] - obj.pos[0])
    );
    if (player.pos[0] - obj.pos[0] < 0) {
      angle += Math.PI;
    }
    targetVelX = Math.cos(angle) * obj.maxVel;
    targetVelY = Math.sin(angle) * obj.maxVel;
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

document.addEventListener("keydown", (e) => {
  if (e.repeat) {
    return;
  }
  if (e.key === "w") {
    player.up = true;
  }
  if (e.key === "a") {
    player.left = true;
  }
  if (e.key === "s") {
    player.down = true;
  }
  if (e.key === "d") {
    player.right = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w") {
    player.up = false;
  }
  if (e.key === "a") {
    player.left = false;
  }
  if (e.key === "s") {
    player.down = false;
  }
  if (e.key === "d") {
    player.right = false;
  }
});

function animate() {
  move(player);

  for (let index = 0; index < monsters.length; index++) {
    move(monsters[index]);
  }

  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // draw player
  CTX.fillRect(
    player.pos[0] - player.size / 2,
    player.pos[1] - player.size / 2,
    player.size,
    player.size
  );

  for (let i = 0; i < monsters.length; i++) {
    CTX.fillRect(
      monsters[i].pos[0] - monsters[i].size / 2,
      monsters[i].pos[1] - monsters[i].size / 2,
      monsters[i].size,
      monsters[i].size
    );
  }

  requestAnimationFrame(animate);
}

let monster = generateMonster([]);

let monsters = [monster];
for (let i = 0; i < 1000; i++) {
  monsters.push(generateMonster([]));
}

animate();
