
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
