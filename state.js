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
  // Offscreen bg canvas will be recreated next frame (_ensureBgCanvas checks dimensions)
  if (typeof _invalidateBgCache === "function") _invalidateBgCache();
  if (typeof _lgCache !== "undefined") _lgCache.key = null;
});

// =====================
// UI ELEMENT REFS
// =====================
const ui             = document.getElementById("ui");
const roomTitle      = document.getElementById("room-title");
const objectiveText  = document.getElementById("objective-text");
const helpText       = document.getElementById("help-text");
const mapPanel       = document.getElementById("map-panel");
const inventorySlots = Array.from(document.querySelectorAll("#inventory-grid .slot"));
const glyphPanel     = document.getElementById("glyph-panel");

// =====================
// WORLD + CAMERA
// =====================
const world = { width: 800, height: 500 };

const camera = { x: 0, y: 0 };

const cameraState = { zoom: 1, targetZoom: 1 };

const inspectState = { active: false, focus: null, zoom: 12 };

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

let mapUnlocked           = true;
let mapVisible            = false;
let glyphDecoded          = false;
let notebookOpen          = false;
let glyphNotebookUnlocked = false;
let glyphPanelOpen        = false;
let gameTime              = 0;

// =====================
// PUZZLE STATE
// =====================

// West Hall — canopic ritual order tracking
const canopicSequence     = [];        // grows as player inspects jars in order
const CANOPIC_ORDER       = [1,2,3,4]; // Imsety → Hapy → Duamutef → Qebehsenuef

// North Vestibule — which offering bowls have been filled
const offeringsFilled     = { bread: false, oil: false, incense: false };

// East Gallery — name fragments collected from intact cartouches
const galleryNameFragments = [];       // up to 2 strings pushed as cartouches inspected

// Deep Corridor — whether the torch has been mounted in the bracket
let corridorTorchMounted  = false;

// Ossuary — how many watcher skulls have been inspected
let watcherSkullsRead     = 0;
const WATCHER_SKULL_COUNT = 4;

// =====================
// INPUT
// =====================
const keys = {};

// =====================
// ROOM TRACKING
// currentRoom is assigned in rooms.js after the rooms array is defined.
// =====================
let currentRoom = null;
let nearObject  = null;

// =====================
// MAP LAYOUT
// Grid coordinates: x = column (negative = west),
//                   y = row    (negative = north).
// =====================
const MAP_LAYOUT = {
  // original rooms
  "burial-chamber":  { x:  0, y:  0 },
  "right-room":      { x:  1, y:  0 },
  "bottom-room":     { x:  0, y:  1 },

  // new rooms
  "west-hall":       { x: -1, y:  0 },  // west  of burial-chamber
  "north-vestibule": { x:  0, y: -1 },  // north of burial-chamber
  "east-gallery":    { x:  1, y:  1 },  // east  of bottom-room
  "deep-corridor":   { x:  2, y:  0 },  // east  of right-room
  "ossuary":         { x:  0, y:  2 },  // south of bottom-room
};

