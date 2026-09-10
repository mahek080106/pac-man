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