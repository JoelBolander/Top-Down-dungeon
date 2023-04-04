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
  maxVel: 9,
  acc: [0, 0],
};

function move(obj) {
  let targetVelX;
  let targetVelY;

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

  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // draw player
  CTX.fillRect(
    player.pos[0] - player.size / 2,
    player.pos[1] - player.size / 2,
    player.size,
    player.size
  );

  requestAnimationFrame(animate);
}

animate();
