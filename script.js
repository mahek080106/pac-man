function cloneMap() {
  game.map = BASE_MAP.map((row) => row.split(""));
  game.pellets.clear();

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const tile = game.map[y][x];

      if (tile === "." || tile === "o") {
        game.pellets.add(`${x},${y}`);
      }

      if (tile === "G") {
        game.map[y][x] = "_";
      }
    }
  }
}

function createPlayer() {
  return {
    x: 14,
    y: 15,
    spawnX: 14,
    spawnY: 15,
    direction: "left",
    nextDirection: "left",
    mouth: 0
  };
}

function createGhost(x, y, index) {
  return {
    x,
    y,
    spawnX: x,
    spawnY: y,
    direction: index % 2 === 0 ? "left" : "right",
    color: GHOST_COLORS[index],
    frightened: false,
    eaten: false
  };
}

function resetPositions() {
  game.player = createPlayer();

  game.ghosts = [
    createGhost(13, 10, 0),
    createGhost(14, 10, 1),
    createGhost(15, 10, 2),
    createGhost(14, 11, 3)
  ];
}