// =====================
// STATE.JS
// Shared mutable state, constants, and flags.
// Must be loaded first.
// =====================

// =====================
// CANVAS + CONTEXT
// =====================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// =====================
// UI ELEMENT REFS
// =====================
const ui = document.getElementById("ui");
const roomTitle = document.getElementById("room-title");
const objectiveText = document.getElementById("objective-text");
const helpText = document.getElementById("help-text");
const mapPanel = document.getElementById("map-panel");
const inventorySlots = Array.from(document.querySelectorAll("#inventory-grid .slot"));
const glyphPanel = document.getElementById("glyph-panel");

// =====================
// WORLD + CAMERA
// =====================
const world = {
  width: 800,
  height: 500
};

const camera = {
  x: 0,
  y: 0
};

const cameraState = {
  zoom: 1,
  targetZoom: 1
};

const inspectState = {
  active: false,
  focus: null,
  zoom: 12
};

// =====================
// PLAYER
// =====================
const player = {
  x: 400,
  y: 300,
  size: 20,
  speed: 3,
  walkFrame: 0,
  isMoving: false,
  heldItem: null,
  lampOn: false,
  inventoryIndex: 0
};

// =====================
// INVENTORY
// =====================
const inventory = [];
const inventoryCapacity = 6;

// =====================
// GLYPH SYSTEM
// =====================
const GLYPH_SOLUTION = {
  "𓂀": "L",
  "𓄿": "I",
  "𓈖": "G",
  "𓏏": "H",
  "𓊪": "T"
};

const REQUIRED_GLYPHS = ["𓂀", "𓄿", "𓈖", "𓏏", "𓊪"];

const glyphKnowledge = {};
const playerGlyphMap = {};

// =====================
// GAME STATE FLAGS
// =====================
const gameState = {
  completedObjectives: {}
};

let mapUnlocked = true;
let mapVisible = false;
let glyphDecoded = false;
let notebookOpen = false;
let glyphNotebookUnlocked = false;
let glyphPanelOpen = false;
let gameTime = 0;

// =====================
// INPUT
// =====================
const keys = {};

// =====================
// ROOM TRACKING
// =====================
// currentRoom is set in rooms.js after rooms array is defined
let currentRoom = null;
let nearObject = null;

// =====================
// MAP LAYOUT
// =====================
const MAP_LAYOUT = {
  "burial-chamber": { x: 0, y: 0 },
  "right-room":     { x: 1, y: 0 },
  "bottom-room":    { x: 0, y: 1 }
};
