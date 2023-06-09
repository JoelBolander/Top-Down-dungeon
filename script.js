// debugger;

const PLAYER = {
  pos: [1.5 * TILESIZE, 1.5 * TILESIZE],
  radius: (TILESIZE * MONSTER_SIZE) / 2,
  vel: [0, 0], // velocity unit - millitiles per frame
  maxVel: PLAYER_SPEED,
  acc: [0, 0],
  rotation: 0,
  images: [CHARACTER_IMAGE],
  cooldown: 0,
  target: 0,
  hp: 10,
};

function generateMonster(roomRow, roomCol) {
  // monsterPos = room.tiles[Math.random() * room.chunk.length]
  let pos = [
    Math.random() * ROOMWIDTH * TILESIZE * CHUNK_WIDTH,
    Math.random() * ROOMHEIGHT * TILESIZE * CHUNK_WIDTH,
  ];
  let radius = (TILESIZE * MONSTER_SIZE) / 2;
  let damage = MONSTER_DAMAGE;
  let vel = [0, 0];
  let maxVel = Math.random() * MONSTER_SPEED + MONSTER_SPEED / 2;
  let acc = [0, 0];
  let images = [MONKEY];
  let distance = 0;
  let rotation = 0;
  let hp = Math.random() * MONSTER_HEALTH;
  let room = [roomRow, roomCol];
  let timer = 0;
  let cooldown = 0;

  let monster = {
    pos,
    radius,
    damage,
    vel,
    maxVel,
    acc,
    images,
    distance,
    rotation,
    hp,
    room,
    timer,
    cooldown,
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

function generateMap() {
  let map = [];
  for (let row = 0; row < MAPSIZE; row++) {
    map.push([]);
    for (let column = 0; column < MAPSIZE; column++) {
      if (row == 0 && column == 0) {
        map[row].push(FIRST_ROOM);
      } else {
        map[row].push(generateRoom(map, row, column));
      }
    }
  }
  // assign positions to each tile relative to their room
  for (let i = 0; i < map.length; i++) {
    // for every roomRow
    for (let j = 0; j < map[i].length; j++) {
      // for every room
      for (let k = 0; k < map[i][j].length; k++) {
        // for every tileRow
        for (let l = 0; l < map[i][j][k].length; l++) {
          let name = map[i][j][k][l];

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

          map[i][j][k][l] = {
            name,
            images: images[name],
            pos: [(l + 0.5) * TILESIZE, (k + 0.5) * TILESIZE],
            rotation: 0,
            radius: TILESIZE / 2,
          };
        }
      }
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
          case column === 0 && row === 0:
            room[row].push(
              structuredClone(
                cornerChunks[Math.floor(Math.random() * cornerChunks.length)]
              )
            );
            break;
          case column === 0 && row === ROOMHEIGHT - 1:
            room[row].push(
              rotateChunk(
                structuredClone(
                  cornerChunks[Math.floor(Math.random() * cornerChunks.length)]
                ),
                3
              )
            );
            break;
          case column === ROOMWIDTH - 1 && row === 0:
            room[row].push(
              rotateChunk(
                structuredClone(
                  cornerChunks[Math.floor(Math.random() * cornerChunks.length)]
                ),

                1
              )
            );
            break;
          case column === ROOMWIDTH - 1 && row === ROOMHEIGHT - 1:
            room[row].push(
              rotateChunk(
                structuredClone(
                  cornerChunks[Math.floor(Math.random() * cornerChunks.length)]
                ),
                2
              )
            );
            break;
          case column === 0:
            room[row].push([
              ...edgeChunks[Math.floor(Math.random() * edgeChunks.length)],
            ]);
            break;
          case column === ROOMWIDTH - 1:
            room[row].push(
              rotateChunk(
                structuredClone(
                  edgeChunks[Math.floor(Math.random() * edgeChunks.length)]
                ),
                2
              )
            );
            break;
          case row === 0:
            room[row].push(
              rotateChunk(
                structuredClone(
                  edgeChunks[Math.floor(Math.random() * edgeChunks.length)]
                ),
                1
              )
            );
            break;
          case row === ROOMHEIGHT - 1:
            room[row].push(
              rotateChunk(
                structuredClone(
                  edgeChunks[Math.floor(Math.random() * edgeChunks.length)]
                ),
                3
              )
            );
            break;
          default:
            room[row].push(
              rotateChunk(
                structuredClone(
                  midChunks[Math.floor(Math.random() * midChunks.length)]
                ),
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
        structuredClone(
          doorChunks[Math.floor(Math.random() * doorChunks.length)]
        ),
        1
      );
    }
    if (roomRow !== MAPSIZE - 1) {
      room[ROOMHEIGHT - 1][Math.floor(Math.random() * (ROOMWIDTH - 2)) + 1] =
        rotateChunk(
          structuredClone(
            doorChunks[Math.floor(Math.random() * doorChunks.length)]
          ),
          3
        );
    }
    if (roomColumn !== 0) {
      let doorChunkRow;
      for (let searchIndex = 0; searchIndex < ROOMHEIGHT * 4; searchIndex++) {
        if (
          map[roomRow][roomColumn - 1][searchIndex][ROOMWIDTH * 4 - 1] === "d"
        ) {
          doorChunkRow = Math.floor(searchIndex / 4);
        }
      }
      room[doorChunkRow][0] = rotateChunk(
        structuredClone(
          doorChunks[Math.floor(Math.random() * doorChunks.length)]
        ),
        0
      );
    }
    if (roomColumn !== MAPSIZE - 1) {
      room[Math.floor(Math.random() * (ROOMHEIGHT - 2)) + 1][ROOMWIDTH - 1] =
        rotateChunk(
          structuredClone(
            doorChunks[Math.floor(Math.random() * doorChunks.length)]
          ),
          2
        );
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
      if (actualroom[ROOMHEIGHT * 4 - 1][searchIndex] === "d") {
        BDoorCoords = [ROOMHEIGHT * 4 - 1, searchIndex];
      }
      if (actualroom[0][searchIndex] === "d") {
        TDoorCoords = [0, searchIndex];
      }
    }
    for (let searchIndex = 0; searchIndex < ROOMHEIGHT * 4; searchIndex++) {
      if (actualroom[searchIndex][ROOMWIDTH * 4 - 1] === "d") {
        RDoorCoords = [searchIndex, ROOMWIDTH * 4 - 1];
      }
      if (actualroom[searchIndex][0] === "d") {
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
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door1 && door2 && door3) {
        if (
          findPath(actualroom, door3[0], door3[1], door2[0], door2[1]) &&
          findPath(actualroom, door3[0], door3[1], door1[0], door1[1])
        ) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door1 && door2 && door4) {
        if (
          findPath(actualroom, door4[0], door4[1], door2[0], door2[1]) &&
          findPath(actualroom, door4[0], door4[1], door1[0], door1[1])
        ) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door1 && door4 && door3) {
        if (
          findPath(actualroom, door3[0], door3[1], door1[0], door1[1]) &&
          findPath(actualroom, door1[0], door1[1], door4[0], door4[1])
        ) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door2 && door4 && door3) {
        if (
          findPath(actualroom, door3[0], door3[1], door2[0], door2[1]) &&
          findPath(actualroom, door2[0], door2[1], door4[0], door4[1])
        ) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door1 && door3) {
        if (findPath(actualroom, door1[0], door1[1], door3[0], door3[1])) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door1 && door4) {
        if (findPath(actualroom, door1[0], door1[1], door4[0], door4[1])) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door2 && door4) {
        if (findPath(actualroom, door2[0], door2[1], door4[0], door4[1])) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      } else if (door2 && door3) {
        if (findPath(actualroom, door2[0], door2[1], door3[0], door3[1])) {
          placeMonsters(actualroom, roomRow, roomColumn);
          return actualroom;
        }
      }
    }
  }
}

function placeMonsters(actualroom, roomRow, roomColumn) {
  // generate monsters in rooms

  if (roomRow != 0 || roomColumn != 0) {
    for (let searchIndex = 0; searchIndex < ROOMWIDTH * 4; searchIndex++) {
      if (actualroom[ROOMHEIGHT * 4 - 1][searchIndex] === "d") {
        BDoorCoords = [ROOMHEIGHT * 4 - 1, searchIndex];
      }
      if (actualroom[0][searchIndex] === "d") {
        TDoorCoords = [0, searchIndex];
      }
    }
    for (let searchIndex = 0; searchIndex < ROOMHEIGHT * 4; searchIndex++) {
      if (actualroom[searchIndex][ROOMWIDTH * 4 - 1] === "d") {
        RDoorCoords = [searchIndex, ROOMWIDTH * 4 - 1];
      }
      if (actualroom[searchIndex][0] === "d") {
        LDoorCoords = [searchIndex, 0];
      }
    }

    for (let monsterIndex = 0; monsterIndex < MONSTER_AMOUNT; monsterIndex++) {
      let doorCheck;
      let tempMonster;
      if (roomRow == 0) {
        doorCheck = BDoorCoords;
      } else if (roomColumn == 0) {
        doorCheck = RDoorCoords;
      } else if (roomRow == ROOMWIDTH - 1) {
        doorCheck = TDoorCoords;
      } else if (roomRow == ROOMHEIGHT - 1) {
        doorCheck = LDoorCoords;
      } else {
        doorCheck = LDoorCoords;
      }

      while (true) {
        tempMonster = generateMonster(roomRow, roomColumn);
        if (
          actualroom[Math.floor(tempMonster.pos[1] / TILESIZE)][
            Math.floor(tempMonster.pos[0] / TILESIZE)
          ] == "g" &&
          findPath(
            actualroom,
            doorCheck[0],
            doorCheck[1],
            Math.floor(tempMonster.pos[1] / TILESIZE),
            Math.floor(tempMonster.pos[0] / TILESIZE)
          )
        ) {
          monsters.push(tempMonster);
          break;
        }
      }
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
    if (row === endRow && col === endCol) {
      return true;
    }
    if (
      visited[row][col] ||
      (room[row][col] !== "g" && room[row][col] !== "d")
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
        // stacks function until true or otherwise
        return true;
      }
    }
    return false;
  }
  return explore(startRow, startCol);
}

function checkDoor(player, room) {
  const PLAYER_POSITION = [
    Math.floor(player.pos[0] / TILESIZE),
    Math.floor(player.pos[1] / TILESIZE),
  ];
  if (
    room[PLAYER_POSITION[1]][PLAYER_POSITION[0]].name === "Door" &&
    completedRoom
  ) {
    completedRoom = false;
    if (PLAYER_POSITION[1] === 0) {
      currentRoomRow -= 1;
      player.pos[1] = (ROOMHEIGHT * 4 - 1) * TILESIZE;
    } else if (PLAYER_POSITION[1] === ROOMHEIGHT * 4 - 1) {
      currentRoomRow += 1;
      player.pos[1] = TILESIZE;
    } else if (PLAYER_POSITION[0] === 0) {
      currentRoomColumn -= 1;
      player.pos[0] = (ROOMWIDTH * 4 - 1) * TILESIZE;
    } else if (PLAYER_POSITION[0] === ROOMWIDTH * 4 - 1) {
      currentRoomColumn += 1;
      player.pos[0] = TILESIZE;
    }
  }
}

function collision(object, room) {
  const TILE_POSITIONS = [];

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
    if (
      TILE.name === "Wall" ||
      (TILE.name === "Door" && completedRoom == false)
    ) {
      // doing collisions for sides
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
      // doing collision for corners
      if (
        TILE_X + TILESIZE < object.pos[0] &&
        object.pos[0] < TILE_X + TILESIZE + object.radius &&
        TILE_Y + TILESIZE < object.pos[1] &&
        object.pos[1] < TILE_Y + TILESIZE + object.radius
      ) {
        if (
          Math.sqrt(
            (TILE_X + TILESIZE - object.pos[0]) ** 2 +
              (TILE_Y + TILESIZE - object.pos[1]) ** 2
          ) < object.radius
        ) {
          let angle = Math.atan2(
            TILE_Y + TILESIZE - object.pos[1],
            TILE_X + TILESIZE - object.pos[0]
          );
          object.pos[0] = TILE_X + TILESIZE - object.radius * Math.cos(angle);
          object.pos[1] = TILE_Y + TILESIZE - object.radius * Math.sin(angle);
        }
      }
      if (
        TILE_X > object.pos[0] &&
        object.pos[0] > TILE_X - object.radius &&
        TILE_Y + TILESIZE < object.pos[1] &&
        object.pos[1] < TILE_Y + TILESIZE + object.radius
      ) {
        if (
          Math.sqrt(
            (TILE_X - object.pos[0]) ** 2 +
              (TILE_Y + TILESIZE - object.pos[1]) ** 2
          ) < object.radius
        ) {
          let angle = Math.atan2(
            TILE_Y + TILESIZE - object.pos[1],
            TILE_X - object.pos[0]
          );
          object.pos[0] = TILE_X - object.radius * Math.cos(angle);
          object.pos[1] = TILE_Y + TILESIZE - object.radius * Math.sin(angle);
        }
      }
      if (
        TILE_X + TILESIZE < object.pos[0] &&
        object.pos[0] < TILE_X + TILESIZE + object.radius &&
        TILE_Y > object.pos[1] &&
        object.pos[1] > TILE_Y - object.radius
      ) {
        if (
          Math.sqrt(
            (TILE_X + TILESIZE - object.pos[0]) ** 2 +
              (TILE_Y - object.pos[1]) ** 2
          ) < object.radius
        ) {
          let angle = Math.atan2(
            TILE_Y - object.pos[1],
            TILE_X + TILESIZE - object.pos[0]
          );
          object.pos[0] = TILE_X + TILESIZE - object.radius * Math.cos(angle);
          object.pos[1] = TILE_Y - object.radius * Math.sin(angle);
        }
      }
      if (
        TILE_X > object.pos[0] &&
        object.pos[0] > TILE_X - object.radius &&
        TILE_Y > object.pos[1] &&
        object.pos[1] > TILE_Y - object.radius
      ) {
        if (
          Math.sqrt(
            (TILE_X - object.pos[0]) ** 2 + (TILE_Y - object.pos[1]) ** 2
          ) < object.radius
        ) {
          let angle = Math.atan2(
            TILE_Y - object.pos[1],
            TILE_X - object.pos[0]
          );
          object.pos[0] = TILE_X - object.radius * Math.cos(angle);
          object.pos[1] = TILE_Y - object.radius * Math.sin(angle);
        }
      }
    }
  }
}

function draw(object) {
  CTX.save();
  CTX.translate(object.pos[0], object.pos[1]);
  CTX.rotate(object.rotation); // rotate canvas in order to draw player
  object.images.forEach(function (image) {
    CTX.drawImage(
      image,
      -object.radius,
      -object.radius,
      object.radius * 2 + 0.7 / RESOLUTION + RESOLUTION * 0.1,
      object.radius * 2 + 0.7 / RESOLUTION + RESOLUTION * 0.1
    );
  });

  CTX.restore(); // restore original canvas rotation
}

document.addEventListener("keydown", (e) => {
  if (isDead || isFinished) {
    location.reload();
  }
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
    if (currentRoomRow !== MAPSIZE - 1) {
      currentRoomRow += 1;
    }
  }
  if (e.key === "l") {
    if (currentRoomColumn !== MAPSIZE - 1) {
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
  mouseX = (e.clientX - CANVASRECT.left) * RESOLUTION;
  mouseY = (e.clientY - CANVASRECT.top) * RESOLUTION;
});

document.addEventListener("mousedown", (e) => {
  if (PLAYER.cooldown === 0) {
    let monsterTarget;
    let mouseAngle = Math.atan2(PLAYER.pos[0] - mouseX, PLAYER.pos[1] - mouseY);
    monsters.forEach((monster) => {
      if (
        monster.room[0] == currentRoomRow &&
        monster.room[1] == currentRoomColumn
      ) {
        let combinedAngle;
        let direction = -monster.rotation - Math.PI * 0.5;
        if (direction < -Math.PI) {
          direction += 2 * Math.PI;
        }
        combinedAngle = Math.abs(direction - mouseAngle);

        if (combinedAngle > Math.PI) {
          combinedAngle = Math.PI * 2 - combinedAngle;
        }

        if (
          monster.distance < PLAYER_RANGE &&
          combinedAngle - monster.distance / TILESIZE < 1
        ) {
          monsterTarget = monster;
        }
      }
    });
    if (monsterTarget) {
      monsterTarget.hp -= 1;
      if (monsterTarget.hp <= 0) {
        monsters.splice(
          monsters.findIndex(function (monster) {
            return monster === monsterTarget;
          }),
          1
        );
        PLAYER.images = [CHARACTER_IMAGE];
      }
      PLAYER.cooldown = 1;
      monsterTarget.images = [MONKEY_DAMAGED];
      PLAYER.target = monsterTarget;
    }
  }
});

// WARNING - SHOULD BE SET TO FALSE UNDER ALL CIRCUMSTANCES
let secret = false; // DO NOT TOUCH
let timer = 0;
// WARNING - SHOULD BE SET TO FALSE UNDER ALL CIRCUMSTANCES

function topSecret() {
  if (timer > 700) {
    CTX.translate(CANVAS.width / 2, CANVAS.height / 2);
    CTX.rotate(0.04);
    CTX.translate(-CANVAS.width / 2, -CANVAS.height / 2);
  }
}

let map = generateMap();

function animate() {
  if (PLAYER.hp <= 0) {
    isDead = true;
  }
  if (monsters.length <= 0) {
    isFinished = true;
  }
  if (!isDead && !isFinished) {
    const ROOM = map[currentRoomRow][currentRoomColumn];
    topSecret();
    if (secret) {
      timer++;
    }

    if (PLAYER.cooldown >= PLAYER_COOLDOWN) {
      PLAYER.cooldown = 0;
      PLAYER.target.images = [MONKEY];
      PLAYER.target = 0;
    }

    if (PLAYER.cooldown > 0) {
      PLAYER.cooldown++;
    }

    // clear canvas
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

    // draw room
    for (const ROW of ROOM) {
      for (const TILE of ROW) {
        draw(TILE);
      }
    }

    // update player
    PLAYER.rotation =
      Math.atan2(PLAYER.pos[1] - mouseY, PLAYER.pos[0] - mouseX) - Math.PI / 2;
    move(PLAYER);
    collision(PLAYER, ROOM);
    checkDoor(PLAYER, ROOM);
    draw(PLAYER);

    for (let monsterIndex = 0; monsterIndex < monsters.length; monsterIndex++) {
      if (
        monsters[monsterIndex].room[0] == currentRoomRow &&
        monsters[monsterIndex].room[1] == currentRoomColumn
      ) {
        completedRoom = false;
        break;
      } else {
        completedRoom = true;
      }
    }

    // update monsters
    monsters.forEach((monster) => {
      if (
        monster.room[0] == currentRoomRow &&
        monster.room[1] == currentRoomColumn
      ) {
        monster.rotation = Math.atan2(
          monster.pos[1] - PLAYER.pos[1],
          monster.pos[0] - PLAYER.pos[0]
        );
        monster.distance = Math.sqrt(
          (PLAYER.pos[0] - monster.pos[0]) ** 2 +
            (PLAYER.pos[1] - monster.pos[1]) ** 2
        );

        if (monster.cooldown === 0) {
          if (monster.distance < MONSTER_RANGE) {
            monster.cooldown = 1;
            PLAYER.hp -= 1;
            PLAYER.images = [PLAYER_DAMAGED];
          }
        } else if (monster.cooldown > MONSTER_COOLDOWN) {
          monster.cooldown = 0;
          PLAYER.images = [CHARACTER_IMAGE];
        } else {
          monster.cooldown++;
        }
        move(monster);
        collision(monster, ROOM);
        draw(monster);
      }
    });
  } else if (!isDead) {
    CTX.drawImage(
      WIN_SCREEN,
      100,
      100,
      CANVAS.width - 200,
      CANVAS.height - 200
    );
  } else {
    CTX.drawImage(GAME_OVER, 100, 100, CANVAS.width - 200, CANVAS.height - 200);
  }
  // next frame
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / FPS);
}

animate();
