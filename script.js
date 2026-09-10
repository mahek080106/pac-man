
"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const levelElement = document.getElementById("level");
const livesElement = document.getElementById("lives");
const statusElement = document.getElementById("status");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");
const soundButton = document.getElementById("soundButton");

const gameOverTitle = document.getElementById("gameOverTitle");
const gameOverText = document.getElementById("gameOverText");
const finalScoreElement = document.getElementById("finalScore");

const TILE = 28;
const ROWS = 22;
const COLS = 30;

const DIRECTIONS = {
  up: { x: 0, y: -1, angle: -Math.PI / 2 },
  down: { x: 0, y: 1, angle: Math.PI / 2 },
  left: { x: -1, y: 0, angle: Math.PI },
  right: { x: 1, y: 0, angle: 0 }
};

const KEY_DIRECTIONS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right"
};

const GHOST_COLORS = [
  "#ff4e91",
  "#58e8ff",
  "#ff9d4d",
  "#b982ff"
];

const BASE_MAP = [
  "##############################",
  "#............##............o.#",
  "#.####.#####.##.#####.####..#",
  "#o####.#####.##.#####.####o.#",
  "#............................#",
  "#.####.##.##########.##.####.#",
  "#......##....##....##........#",
  "######.#####.##.#####.######",
  "######.#####.##.#####.######",
  "######.##..........##.######",
  "######.##.###GG###.##.######",
  "######.##.#......#.##.######",
  "######.##.########.##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##................##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "##############################",
  "##############################"
];

const game = {
  map: [],
  pellets: new Set(),
  player: null,
  ghosts: [],
  score: 0,
  level: 1,
  lives: 3,
  combo: 0,
  powerTimer: 0,
  running: false,
  paused: false,
  ended: false,
  sound: true,
  lastTime: 0,
  movementTimer: 0,
  touchStartX: 0,
  touchStartY: 0
};

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
function resetGame() {
  game.score = 0;
  game.level = 1;
  game.lives = 3;
  game.combo = 0;
  game.powerTimer = 0;
  game.paused = false;
  game.ended = false;

  cloneMap();
  resetPositions();
  updateInterface();
  draw(0);
}

function startGame() {
  initializeAudio();
  game.running = true;
  game.paused = false;
  game.ended = false;
  game.lastTime = performance.now();

  startScreen.classList.remove("active");
  pauseScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");

  requestAnimationFrame(loop);
}

function restartGame() {
  resetGame();
  startGame();
}

function togglePause() {
  if (!game.running || game.ended) {
    return;
  }

  game.paused = !game.paused;
  pauseScreen.classList.toggle("active", game.paused);

  if (!game.paused) {
    game.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  updateInterface();
}

function loop(time) {
  if (!game.running || game.paused || game.ended) {
    return;
  }

  const delta = Math.min(time - game.lastTime, 100);
  game.lastTime = time;
  game.movementTimer += delta;
  game.player.mouth = (Math.sin(time / 90) + 1) / 2;

  const speed = Math.max(95 - game.level * 4, 55);

  if (game.movementTimer >= speed) {
    game.movementTimer = 0;
    update();
  }

  draw(time);
  requestAnimationFrame(loop);
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

function resetGame() {
  game.score = 0;
  game.level = 1;
  game.lives = 3;
  game.combo = 0;
  game.powerTimer = 0;
  game.paused = false;
  game.ended = false;

  cloneMap();
  resetPositions();
  updateInterface();
  draw(0);
}

function startGame() {
  initializeAudio();
  game.running = true;
  game.paused = false;
  game.ended = false;
  game.lastTime = performance.now();

  startScreen.classList.remove("active");
  pauseScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");

  requestAnimationFrame(loop);
}

function restartGame() {
  resetGame();
  startGame();
}

function togglePause() {
  if (!game.running || game.ended) {
    return;
  }

  game.paused = !game.paused;
  pauseScreen.classList.toggle("active", game.paused);

  if (!game.paused) {
    game.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  updateInterface();
}

function loop(time) {
  if (!game.running || game.paused || game.ended) {
    return;
  }

  const delta = Math.min(time - game.lastTime, 100);
  game.lastTime = time;
  game.movementTimer += delta;
  game.player.mouth = (Math.sin(time / 90) + 1) / 2;

  const speed = Math.max(95 - game.level * 4, 55);

  if (game.movementTimer >= speed) {
    game.movementTimer = 0;
    update();
  }

  draw(time);
  requestAnimationFrame(loop);
}
function update() {
  movePlayer();
  collectPellet();
  updatePowerMode();
  moveGhosts();
  checkCollisions();

  if (game.pellets.size === 0) {
    completeLevel();
  }

  updateInterface();
}

function setDirection(direction) {
  game.player.nextDirection = direction;
}

function movePlayer() {
  const nextDirection = DIRECTIONS[game.player.nextDirection];

  if (
    nextDirection &&
    canMove(
      game.player.x + nextDirection.x,
      game.player.y + nextDirection.y
    )
  ) {
    game.player.direction = game.player.nextDirection;
  }

  const direction = DIRECTIONS[game.player.direction];
  const nextX = wrapX(game.player.x + direction.x);
  const nextY = game.player.y + direction.y;

  if (canMove(nextX, nextY)) {
    game.player.x = nextX;
    game.player.y = nextY;
  }
}

function canMove(x, y) {
  if (y < 0 || y >= ROWS) {
    return false;
  }

  const wrappedX = wrapX(x);
  return game.map[y][wrappedX] !== "#";
}

function wrapX(x) {
  if (x < 0) {
    return COLS - 1;
  }

  if (x >= COLS) {
    return 0;
  }

  return x;
}
function collectPellet() {
  const key = `${game.player.x},${game.player.y}`;

  if (!game.pellets.has(key)) {
    return;
  }

  game.pellets.delete(key);

  const tile = game.map[game.player.y][game.player.x];

  if (tile === "o") {
    game.score += 50;
    game.powerTimer = 70;
    game.combo = 0;

    game.ghosts.forEach((ghost) => {
      ghost.frightened = true;
    });

    playTone(230, 0.13, "sawtooth");
  } else {
    game.score += 10;
    playTone(520, 0.035, "square");
  }

  game.map[game.player.y][game.player.x] = "_";
}

function updatePowerMode() {
  if (game.powerTimer <= 0) {
    return;
  }

  game.powerTimer -= 1;

  if (game.powerTimer <= 0) {
    game.ghosts.forEach((ghost) => {
      ghost.frightened = false;
    });
  }
}
function moveGhosts() {
  game.ghosts.forEach((ghost, index) => {
    const options = Object.keys(DIRECTIONS).filter((directionName) => {
      const direction = DIRECTIONS[directionName];

      return canMove(
        wrapX(ghost.x + direction.x),
        ghost.y + direction.y
      );
    });

    if (options.length === 0) {
      return;
    }

    const target = ghost.frightened
      ? {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS)
        }
      : getGhostTarget(ghost, index);

    options.sort((firstName, secondName) => {
      const first = DIRECTIONS[firstName];
      const second = DIRECTIONS[secondName];

      const firstDistance =
        Math.abs(ghost.x + first.x - target.x) +
        Math.abs(ghost.y + first.y - target.y);

      const secondDistance =
        Math.abs(ghost.x + second.x - target.x) +
        Math.abs(ghost.y + second.y - target.y);

      return firstDistance - secondDistance;
    });

    const chosenDirection =
      Math.random() < 0.15
        ? options[Math.floor(Math.random() * options.length)]
        : options[0];

    ghost.direction = chosenDirection;

    const direction = DIRECTIONS[chosenDirection];
    ghost.x = wrapX(ghost.x + direction.x);
    ghost.y += direction.y;
  });
}

function getGhostTarget(ghost, index) {
  if (index === 0) {
    return game.player;
  }

  if (index === 1) {
    const direction = DIRECTIONS[game.player.direction];

    return {
      x: game.player.x + direction.x * 4,
      y: game.player.y + direction.y * 4
    };
  }

  if (index === 2) {
    return {
      x: COLS - 1 - game.player.x,
      y: ROWS - 1 - game.player.y
    };
  }

  return {
    x: game.player.x + Math.sin(Date.now() / 400) * 5,
    y: game.player.y + Math.cos(Date.now() / 400) * 5
  };
}

function checkCollisions() {
  game.ghosts.forEach((ghost) => {
    if (ghost.eaten) {
      return;
    }

    if (ghost.x !== game.player.x || ghost.y !== game.player.y) {
      return;
    }

    if (ghost.frightened) {
      ghost.eaten = true;
      ghost.frightened = false;
      game.combo += 1;
      game.score += 200 * Math.pow(2, game.combo - 1);
      playTone(700, 0.1, "square");
    } else {
      loseLife();
    }
  });
}

function loseLife() {
  game.lives -= 1;
  playTone(160, 0.35, "sawtooth");

  if (game.lives <= 0) {
    endGame();
    return;
  }

  resetPositions();
  game.powerTimer = 0;

  game.ghosts.forEach((ghost) => {
    ghost.frightened = false;
  });
}

function completeLevel() {
  game.level += 1;
  game.score += 500;
  game.powerTimer = 0;

  cloneMap();
  resetPositions();

  [440, 550, 660, 880].forEach((frequency, index) => {
    setTimeout(() => playTone(frequency, 0.1), index * 90);
  });
}
function endGame() {
  game.running = false;
  game.ended = true;

  const previousBest = Number(
    localStorage.getItem("neonMazeBest") || "0"
  );

  const isNewBest = game.score > previousBest;

  if (isNewBest) {
    localStorage.setItem("neonMazeBest", String(game.score));
  }

  gameOverTitle.textContent = isNewBest ? "New high score" : "Game over";
  gameOverText.textContent = isNewBest
    ? "You own the maze."
    : "The ghosts got you.";
  finalScoreElement.textContent = formatNumber(game.score);
  gameOverScreen.classList.add("active");

  updateInterface();
}

function draw(time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#050711";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMaze();
  drawPellets(time);
  drawGhosts(time);
  drawPlayer();

  if (game.powerTimer > 0) {
    ctx.fillStyle = `rgba(88, 232, 255, ${
      0.015 + Math.sin(time / 130) * 0.01
    })`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawMaze() {
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (game.map[y][x] !== "#") {
        continue;
      }

      const px = x * TILE;
      const py = y * TILE;

      ctx.fillStyle = "#151c46";
      ctx.fillRect(px, py, TILE, TILE);

      ctx.strokeStyle = "#546cff";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(px + 4, py + 4, TILE - 8, TILE - 8);
    }
  }
}

function drawPellets(time) {
  game.pellets.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    const isPowerPellet = BASE_MAP[y][x] === "o";

    const radius = isPowerPellet
      ? 5 + Math.sin(time / 130) * 1.5
      : 2.3;

    ctx.fillStyle = isPowerPellet ? "#58e8ff" : "#f0f3ff";
    ctx.shadowColor = isPowerPellet ? "#58e8ff" : "transparent";
    ctx.shadowBlur = isPowerPellet ? 14 : 0;

    ctx.beginPath();
    ctx.arc(
      x * TILE + TILE / 2,
      y * TILE + TILE / 2,
      radius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;
  });
}

function drawPlayer() {
  const player = game.player;
  const direction = DIRECTIONS[player.direction];

  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;
  const mouth = 0.18 + player.mouth * 0.3;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(direction.angle);

  ctx.fillStyle = "#ffd83d";
  ctx.shadowColor = "#ffd83d";
  ctx.shadowBlur = 14;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, TILE * 0.4, mouth, Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawGhosts(time) {
  game.ghosts.forEach((ghost) => {
    const px = ghost.x * TILE + TILE / 2;
    const py = ghost.y * TILE + TILE / 2;
    const radius = TILE * 0.36;

    ctx.save();
    ctx.translate(px, py);

    if (ghost.eaten) {
      ctx.fillStyle = "#e7ecff";

      ctx.beginPath();
      ctx.arc(-6, -2, 4, 0, Math.PI * 2);
      ctx.arc(6, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    const frightenedColor =
      Math.floor(time / 180) % 2 === 0 ? "#4e78ff" : "#f5f7ff";

    const color = ghost.frightened ? frightenedColor : ghost.color;

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, -2, radius, Math.PI, 0);
    ctx.lineTo(radius, radius);
    ctx.lineTo(radius * 0.5, radius * 0.7);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius * 0.5, radius * 0.7);
    ctx.lineTo(-radius, radius);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.arc(-6, -5, 4, 0, Math.PI * 2);
    ctx.arc(6, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#11152c";

    ctx.beginPath();
    ctx.arc(-6, -5, 2, 0, Math.PI * 2);
    ctx.arc(6, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function updateInterface() {
  scoreElement.textContent = formatNumber(game.score);

  bestElement.textContent = formatNumber(
    Number(localStorage.getItem("neonMazeBest") || "0")
  );

  levelElement.textContent = String(game.level).padStart(2, "0");

  livesElement.innerHTML = "";

  for (let index = 0; index < game.lives; index += 1) {
    const life = document.createElement("span");
    life.className = "life";
    livesElement.appendChild(life);
  }

  if (game.paused) {
    statusElement.textContent = "PAUSED";
  } else if (game.powerTimer > 0) {
    statusElement.textContent = "POWER MODE";
  } else if (game.running) {
    statusElement.textContent = "HUNTING";
  } else {
    statusElement.textContent = "READY";
  }
}

function formatNumber(value) {
  return String(value).padStart(6, "0");
}