// =====================
// CANVAS SETUP
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
// UI
// =====================
const ui = document.getElementById("ui");
const roomTitle = document.getElementById("room-title");
const objectiveText = document.getElementById("objective-text");
const helpText = document.getElementById("help-text");
const mapPanel = document.getElementById("map-panel");
const inventorySlots = Array.from(document.querySelectorAll("#inventory-grid .slot"));

let mapUnlocked = true;
let mapVisible = false;
let glyphDecoded = false;
let activeDoor = null;
let doorReadyToEnter = false;
let decodingView = false;
let notebookOpen = false;
let glyphNotebookUnlocked = false;
const glyphPanel = document.getElementById("glyph-panel");
const gameState = {
  completedObjectives: {}
};



function showInspectUI(obj) {
  ui.style.display = "block";
  const lines = [];

  if (obj.type === "sarcophagus") {
    lines.push("An ancient sarcophagus carved with prayers for the afterlife.");
    lines.push("It may open once the door is unlocked and the fire is lit.");
  } else if (obj.type === "ushabti") {
    lines.push(obj.text || "A small ushabti statue, its gaze fixed on you.");
  } else if (obj.type === "torch") {
    lines.push(obj.text || "A bronze torch. It will help you see deeper in the tomb.");
  } else if (obj.type === "rosetta") {
    lines.push(obj.text || "A fragment of the Rosetta stone.");
    lines.push(`Glyph: ${obj.glyph}`);
    lines.push(`Meaning: ${obj.letter}`);
    lines.push("This fragment helps decode the glyph stone.");
    lines.push("Press X to add it to your inventory.");
  } else if (obj.type === "glyph") {
    lines.push(obj.text || "A stone slab etched with hieroglyphs.");
    const glyphDisplay = Array.isArray(obj.glyphText)      ? obj.glyphText.join(" ")     : obj.glyphText;
    lines.push(`Inscription: ${obj.glyphText || "𓂀 𓄿 𓈖 𓍿 𓏏 𓊪"}`);
    lines.push("Known glyphs:");
    const known = Object.entries(glyphKnowledge);
    if (known.length === 0) {
      lines.push("None yet. Find Rosetta fragments to decipher.");
    } else {
      for (const [glyph, meaning] of known) {
        lines.push(`${glyph} = ${meaning}`);
      }
    }
    if (inventory.filter(item => item.type === "rosetta").length >= 3) {
      lines.push("Press G to decode the glyphs with your Rosetta fragments.");
    } else {
      lines.push("Collect the Rosetta fragments to unlock the full phrase.");
    }
  } else if (obj.type === "door") {
    lines.push(obj.text || "A heavy stone door sealed by magic.");
    lines.push(obj.locked ? "It remains sealed. The glyphs and the light should reveal the way." : "The door is open. Step through to continue.");
  } else {
    lines.push(obj.text || "You inspect the object and sense ancient purpose.");
  }

  if (obj.type === "torch") {
    lines.push("Press X to add it to your inventory.");
  }

  ui.innerHTML = lines.map(line => `<div>${line}</div>`).join("");
}

function removeItemFromInventory(type) {
  for (let i = inventory.length - 1; i >= 0; i--) {
    if (inventory[i].type === type) {
      inventory.splice(i, 1);
    }
  }

  if (player.heldItem?.type === type) {
    player.heldItem = null;
  }

  player.inventoryIndex = Math.max(0, player.inventoryIndex - 1);
  updateUI();
}

function hideInspectUI() {
  ui.style.display = "none";
}

function getItemIcon(item) {
  if (!item) return "";
  switch (item.type) {
    case "torch":
      return "🔥";
    case "sarcophagus":
      return "🪦";
    case "ushabti":
      return "🗿";
    case "glyph":
      return "𓂀";
    case "rosetta":
      return "🔹";
    case "tablet":
      return "📜";
    case "scroll":
      return "📜";
    case "amulet":
      return "💠";
    default:
      return "•";
  }
}

function renderGlyphPanel(obj) {
  const panel = document.getElementById("glyph-panel");

  panel.style.display = "block";

  const glyphs = obj.glyphText || [];

  panel.innerHTML = glyphs.map(g => `
    <div class="glyph-row">
      <span class="glyph">${g}</span>
      <input data-glyph="${g}" maxlength="1"
        value="${playerGlyphMap[g] || ""}">
    </div>
  `).join("");

  panel.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", e => {
      const g = e.target.dataset.glyph;
      playerGlyphMap[g] = e.target.value.toUpperCase();
      checkGlyphSolution(obj);
    });
  });
}

function checkGlyphSolution(obj) {
  for (const g of Object.keys(GLYPH_SOLUTION)) {
    if ((playerGlyphMap[g] || "") !== GLYPH_SOLUTION[g]) {
      return;
    }
  }

  glyphDecoded = true;
  markObjective("decode-glyphs");

  ui.textContent = "The glyphs resolve: LIGHT AND TRUTH OPEN THE EASTERN PASSAGE.";
}

const MAP_LAYOUT = {
  "burial-chamber": { x: 0, y: 0 },
  "right-room":     { x: 1, y: 0 },
  "bottom-room":    { x: 0, y: 1 }
};



function renderMap() {
  const padding = 40;
  const size = 120;

  const panel = mapPanel.getBoundingClientRect();
  const current = MAP_LAYOUT[currentRoom.id];

  const centerX = panel.width / 2;
  const centerY = panel.height / 2;

  const currentRoomX = current.x * size + padding + size / 2;
  const currentRoomY = current.y * size + padding + size / 2;

  const offsetX = centerX - currentRoomX;
  const offsetY = centerY - currentRoomY;

  let html = `<div class="map-canvas" style="position:relative;">`;

  // =====================
  // ROOMS
  // =====================
  for (const room of rooms) {
    const pos = MAP_LAYOUT[room.id];
    if (!pos) continue;

    const x = pos.x * size + padding + offsetX;
    const y = pos.y * size + padding + offsetY;

    const isCurrent = room.id === currentRoom.id;

    html += `
      <div class="map-room-node ${isCurrent ? "current" : ""}"
           style="
             position:absolute;
             left:${x}px;
             top:${y}px;
             width:${size}px;
             height:${size}px;
             background:${isCurrent ? "#c9a24a" : "#3a352d"};
             border:2px solid #222;
             box-sizing:border-box;
             display:flex;
             align-items:center;
             justify-content:center;
             color:#fff;
             font-size:12px;
             text-align:center;
           ">
        ${room.name}
      </div>
    `;
  }

  // =====================
  // PLAYER MARKER
  // =====================
  const p = MAP_LAYOUT[currentRoom.id];

  if (p) {
    html += `
      <div style="
        position:absolute;
        left:${p.x * size + padding + size / 2 + offsetX}px;
        top:${p.y * size + padding + size / 2 + offsetY}px;
        transform:translate(-50%, -50%);
        width:10px;
        height:10px;
        border-radius:50%;
        background:red;
        box-shadow:0 0 10px red;
      "></div>
    `;
  }

  html += `</div>`;
  mapPanel.innerHTML = html;
}

function updateHelpText() {
  let help = `Controls: W/A/S/D or arrows to move · E to inspect · X to pick up/drop · Q to cycle held item · L to light torch`;
  if (mapUnlocked) help += " · M to toggle map";
  if (nearObject?.type === "glyph" && hasFullTranslation()) {
    help += " · G to decode glyphs";
  }
  helpText.textContent = help;
}

function renderGlyphNotebook() {
  const entries = Object.entries(glyphKnowledge);

  glyphPanel.innerHTML = `
    <div class="notebook-title">Glyph Notebook</div>
    <div class="notebook-sub">Decoded fragments of the ancient script</div>

    <div class="notebook-grid">
      ${
        entries.length === 0
          ? `<div class="note-entry">No glyphs decoded yet.</div>`
          : entries.map(([glyph, meaning]) => `
              <div class="note-entry">
                <div class="glyph-big">${glyph}</div>
                <div class="glyph-line">${meaning}</div>
              </div>
            `).join("")
      }
    </div>

    <div style="margin-top:16px; opacity:0.6; font-size:12px;">
      Press V to close
    </div>
  `;
}

function toggleNotebook() {
  notebookOpen = !notebookOpen;

  if (notebookOpen) {
    glyphPanel.classList.remove("hidden");
    renderGlyphNotebook();

    // pause gameplay UI layers
    setHUDVisible(false);
    inspectState.active = false;
    hideInspectUI();
  } else {
    glyphPanel.classList.add("hidden");
    setHUDVisible(true);
  }
}

function toggleMap() {
  if (!mapUnlocked) return;

  mapVisible = !mapVisible;

  if (mapVisible) {
    mapPanel.classList.remove("hidden");
    renderMap();
  } else {
    mapPanel.classList.add("hidden");
  }
}

function updateUI() {
  roomTitle.textContent = currentRoom.name;

  objectiveText.innerHTML = currentRoom.objectives
  .map(o => {
    const done = gameState.completedObjectives[o.id] || o.done;
    return `<div class="${done ? "done" : ""}">${done ? "✓" : "○"} ${o.label}</div>`;
  })
  .join("");

  inventorySlots.forEach((slot, index) => {
    const item = inventory[index];
    slot.textContent = item ? `${getItemIcon(item)} ${item.name}` : "";
    slot.classList.toggle("active", index === player.inventoryIndex);
  });

  updateHelpText();
  if (mapVisible) {
    renderMap();
  }
}

// =====================
// INPUT
// =====================
const keys = {};
const glyphKnowledge = {}; 
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

let gameTime = 0;

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

const inventory = [];
const inventoryCapacity = 6;

const GLYPH_SOLUTION = {
  "𓂀": "L",
  "𓄿": "I",
  "𓈖": "G",
  "𓏏": "H",
  "𓊪": "T"
};

function learnGlyphs() {
  for (const g in GLYPH_SOLUTION) {
    glyphKnowledge[g] = GLYPH_SOLUTION[g];
  }
}
const REQUIRED_GLYPHS = ["𓂀","𓄿","𓈖","𓏏","𓊪"];

function hasFullTranslation() {
  return REQUIRED_GLYPHS.every(g => playerGlyphMap[g]);
}

const playerGlyphMap = {};
let glyphPanelOpen = false;

function createDoor(config) {
  return {
    type: "door",

    // required geometry
    x: 0,
    y: 0,
    w: 30,
    h: 120,

    // defaults
    locked: true,
    opened: false,
    opening: false,
    openProgress: 0,

    // optional overrides
    ...config
  };
}


const rooms = [
  {
    id: "burial-chamber",
    name: "Burial Chamber",
    description: "You awaken in a warm, dustless tomb. Stone statues and a sealed sarcophagus surround you.",
    objectives: [
      { id: "find-torch", label: "Find the torch and carry it.", done: false },
      { id: "collect-rosetta", label: "Collect all Rosetta stone pieces.", done: false },
      { id: "decode-glyphs", label: "Decode the glyphs with the Rosetta pieces.", done: false },
      { id: "speak-ushabti", label: "Touch the ushabti to learn its message.", done: false }
    ],
    objects: [
      {
        name: "Sarcophagus",
        type: "sarcophagus",
        x: 350,
        y: 180,
        w: 100,
        h: 40,
        color: "#8b6b3f",
        text: "A stone coffin etched with funerary spells. It wants fire and words from the book.",
        opened: false
      },
      {
        name: "Ushabti",
        type: "ushabti",
        x: 100,
        y: 250,
        w: 18,
        h: 30,
        color: "#5e5e5e",
        text: "The ushabti whispers: 'Only the light of truth can guide your passage.'",
        inspectDone: false
      },
      {
        name: "Ushabti",
        type: "ushabti",
        x: 540,
        y: 230,
        w: 18,
        h: 30,
        color: "#5e5e5e",
        text: "The scholar ushabti murmurs: 'Decode the glyphs, then the passage will open.'",
        inspectDone: false
      },
      {
        name: "Torch",
        type: "torch",
        x: 420,
        y: 260,
        w: 10,
        h: 20,
        color: "#c9a24a",
        pickedUp: false,
        vx: 0,
        vy: 0,
        friction: 0.85,
        text: "A bronze wick torch. It will burn brighter once lit.",
        inspectDone: false
      },
      {
        name: "Glyph Stone",
        type: "glyph",
        x: 260,
        y: 120,
        w: 44,
        h: 44,
        color: "#766551",
        text: "The glyphs are etched across the stone in ancient script.",
        glyphText: ["𓂀","𓄿","𓈖","𓏏","𓊪"],
        inspectDone: false
      },
      {
        ...createDoor({
          name: "Right Door",
          x: 760,
          y: 200,
          color: "#4f3925",
          direction: "right",
          leadsTo: "right-room",
          pairId: "burial-right",
          text: "A sealed east passage. The right door will open when this chamber is complete."
        }),
      },
      {
        ...createDoor({
          name: "Bottom Door",
          x: 360,
          y: 468,
          w : 80,
          h: 30,
          color: "#4f3925",
          locked: true,
          direction: "down",
          leadsTo: "bottom-room",
          pairId: "burial-bottom",
          text: "A south passage blocked by a second chamber's seal."
        }),
      },
      {
       name: "Rosetta Piece",
       type: "rosetta",
       x: 130,
       y: 110,
       w: 14,
       h: 14,
       color: "#b98d4f",
       pickedUp: false,
       glyph: "𓂀",
       letter: "L",
       text: "𓂀 → L (light begins with sight)"
     },
     {
       name: "Rosetta Piece",
       type: "rosetta",
       x: 520,
       y: 150,
       w: 14,
       h: 14,
       color: "#b98d4f",
       pickedUp: false,
       glyph: "𓄿",
       letter: "I",
       text: "𓄿 → I (reed sound / breath of meaning)"
     },
     {
       name: "Rosetta Piece",
       type: "rosetta",
        x: 240,
       y: 345,
       w: 14,
       h: 14,
       color: "#b98d4f",
       pickedUp: false,
       glyph: "𓈖",
       letter: "G",
       text: "𓈖 → G (flowing water / continuity)"
     },
     {
       name: "Rosetta Piece",
       type: "rosetta",
       x: 600,
       y: 300,
       w: 14,
       h: 14,
       color: "#b98d4f",
       pickedUp: false,
       glyph: "𓏏",
       letter: "H",
       text: "𓏏 → H (bread / completion of sound)"
     },
     {
       name: "Rosetta Piece",
       type: "rosetta",
       x: 350,
       y: 400,
       w: 14,
       h: 14,
       color: "#b98d4f",
       pickedUp: false,
       glyph: "𓊪",
       letter: "T",
       text: "𓊪 → T (stool / final grounding)"
      }
    ],
    exit: null
  },
  {
    id: "right-room",
    name: "Antechamber",
    description: "The eastern chamber is narrower and lined with faded carvings. A soft glow breathes from the walls.",
    objectives: [
      { id: "find-scroll", label: "Find the scroll.", done: false },
      { id: "read-tablet", label: "Read the tablet's translation.", done: false },
    ],
    objects: [
      {
        name: "Left Door",
        type: "door",
        x: -30,
        y: 200,
        w: 30,
        h: 120,
        color: "#4f3925",
        locked: false,
        direction: "left",
        pairId: "burial-right",
        leadsTo: "burial-chamber",
        text: "The opening back to the burial chamber."
      },
      {
        name: "Tablet",
        type: "tablet",
        x: 420,
        y: 130,
        w: 40,
        h: 52,
        color: "#6a5d44",
        text: "A carved tablet with a translation key. Inspect it.",
        inspectDone: false
      },
      {
        name: "Scroll",
        type: "scroll",
        x: 500,
        y: 330,
        w: 24,
        h: 12,
        color: "#e6d7b7",
        pickedUp: false,
        text: "An old scroll of instructions for the next path."
      }
    ],
    exit: null
  },
  {
    id: "bottom-room",
    name: "Sepulcher Depths",
    description: "A lower chamber hangs in silence. The air is heavy and the shadows are thicker here.",
    objectives: [
      { id: "find-amulet", label: "Find the amulet hidden in the shadows.", done: false },
      { id: "offer-amulet", label: "Place the amulet at the altar.", done: false }
    ],
    objects: [
      {
        name: "Top Door",
        type: "door",
        x: 360,
        y: -30,
        w: 80,
        h: 30,
        color: "#4f3925",
        locked: false,
        direction: "up",
        pairId: "burial-bottom",
        leadsTo: "burial-chamber",
        text: "The stair back up to the burial chamber."
      },
      {
        name: "Altar",
        type: "altar",
        x: 360,
        y: 220,
        w: 80,
        h: 24,
        color: "#5a5040",
        text: "A sacred altar for offerings."
      },
      {
        name: "Amulet",
        type: "amulet",
        x: 160,
        y: 150,
        w: 16,
        h: 16,
        color: "#d4b44f",
        pickedUp: false,
        text: "A golden amulet. Place it on the altar."
      }
    ],
    exit: null
  }
];


let currentRoom = rooms[0];
let nearObject = null;

function initRooms() {
  for (const room of rooms) {
    room.visited = false;
  }
}

initRooms();
currentRoom.visited = true;





function getCurrentObjects() {
  return currentRoom.objects;
}

function findObjectByType(type, filter) {
  return getCurrentObjects().find(item => item.type === type && (!filter || filter(item)));
}

function getCollidingDoor() {
  return getCurrentObjects().find(obj =>
    obj.type === "door" &&
    isColliding(player, obj)
  );
}

function findDoorByDirection(direction) {
  return findObjectByType("door", door => door.direction === direction);
}


function checkProximity() {
  nearObject = null;
  const range = 40;

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;

    const dx = player.x - (obj.x + obj.w / 2);
    const dy = player.y - (obj.y + obj.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range) {
      nearObject = obj;
      break;
    }
  }
}

function addToInventory(obj) {
  if (!obj.hasBeenInspected) {
    ui.textContent = "You need to inspect this first.";
    return false;
  }
  if (inventory.length >= inventoryCapacity) {
    ui.textContent = "Your inventory is full.";
    return false;
  }

  obj.pickedUp = true;
  inventory.push(obj);
  player.inventoryIndex = inventory.length - 1;
  player.heldItem = obj;
  if (obj.type === "torch") {
    player.lampOn = false;
    markObjective("find-torch");
  }

  if (obj.type === "rosetta") {
  Object.assign(playerGlyphMap, { [obj.glyph]: obj.letter });
  glyphKnowledge[obj.glyph] = obj.letter;

  ui.textContent = `Decoded fragment: ${obj.glyph} → ${obj.letter}`;

  // DO NOT open notebook here anymore
  // DO NOT render notebook here anymore

  if (hasFullTranslation()) {
    markObjective("collect-rosetta");
  }
}

  updateUI();
  return true;
}

function consumeRosettaPieces() {
  const objs = currentRoom.objects;

  for (let i = objs.length - 1; i >= 0; i--) {
    const obj = objs[i];

    if (obj.type === "rosetta" && obj.pickedUp) {
      objs.splice(i, 1);
    }
  }

  // also clear inventory entries
  for (let i = inventory.length - 1; i >= 0; i--) {
    if (inventory[i].type === "rosetta") {
      inventory.splice(i, 1);
    }
  }

  player.heldItem = inventory[player.inventoryIndex] || null;
  updateUI();
}

function dropActiveItem() {
  const item = inventory[player.inventoryIndex];
  if (!item) return;

  item.pickedUp = false;
  item.x = player.x + 20;
  item.y = player.y + 10;
  if (item.type === "torch") {
    player.lampOn = false;
    item.vx = 1.5;
    item.vy = -1.5;
  }

  inventory.splice(player.inventoryIndex, 1);
  if (inventory.length === 0) {
    player.heldItem = null;
    player.inventoryIndex = 0;
  } else {
    player.inventoryIndex = Math.min(player.inventoryIndex, inventory.length - 1);
    player.heldItem = inventory[player.inventoryIndex];
  }

  updateUI();
}

function cycleInventory(direction) {
  if (inventory.length === 0) return;
  player.inventoryIndex = (player.inventoryIndex + direction + inventory.length) % inventory.length;
  player.heldItem = inventory[player.inventoryIndex];
  updateUI();
}

function markObjective(id) {
  gameState.completedObjectives[id] = true;

  const objective = currentRoom.objectives.find(o => o.id === id);
  if (objective) objective.done = true;

  updateUI();
}

function syncObjectivesFromGameState() {
  for (const room of rooms) {
    for (const obj of room.objectives) {
      if (gameState.completedObjectives[obj.id]) {
        obj.done = true;
      }
    }
  }
}

function canOpenDoor() {
  const door = findObjectByType("door");
  return door && !door.locked;
}

function attemptDoorUnlock(door) {
  if (!door) return;

  if (door.direction === "right") {
    const allDone = currentRoom.objectives.every(
  o => gameState.completedObjectives[o.id]
);
    if (allDone) {
      door.locked = false;
      door.opening = true;
      mapUnlocked = true;
      ui.textContent = "The eastern passage swings open. A map toggle is now available.";
      updateUI();
      return;
    }
    ui.textContent = "The eastern passage remains sealed until the chamber's trials are complete.";
    return;
  }

  if (door.direction === "down") {
  const secondRoom = rooms.find(r => r.id === "right-room");

  const secondComplete = secondRoom.objectives.every(
    o => gameState.completedObjectives[o.id]
  );

  if (secondComplete) {
    door.locked = false;
    door.opening = true;
    ui.textContent = "The southern passage loosens its seal. You may return here when ready.";
    updateUI();
    return;
  }

  ui.textContent = "This passage remains sealed until the eastern chamber's tasks are finished.";
  return;
}

  ui.textContent = door.locked ? "The door is sealed." : "The door stands open.";
}
function inspectObject(obj) {
  if (!obj) return;
  obj.hasBeenInspected = true;

  showInspectUI(obj);

  if (obj.type === "ushabti" && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("speak-ushabti");
  }

  if (obj.type === "glyph") {
    const partial = obj.glyphText
      .map(g => playerGlyphMap[g] || "?")
      .join("");

    if (glyphDecoded) {
      ui.textContent = "The glyphs resolve clearly: LIGHT.";
    } else {
      ui.textContent = `Inscription: ${partial}`;

      if (hasFullTranslation()) {
        ui.textContent += " — You now understand the full word. Press G to finalize.";
      }
    }
  }

  if (obj.type === "scroll" && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("find-scroll");
    ui.textContent = "An old scroll. It explains how to interpret the tablet.";
  }

  if (obj.type === "tablet" && !obj.inspectDone) {
    const scroll = inventory.find(i => i.type === "scroll");

    if (!scroll) {
      ui.textContent = "You cannot understand the tablet without first finding the scroll.";
      return;
    }

    obj.inspectDone = true;
    const objState = currentRoom.objectives.find(o => o.id === "read-tablet");
    if (!objState.done) {
       markObjective("read-tablet");
    }

    removeItemFromInventory("scroll");

    ui.textContent =
      "With the scroll’s guidance, the tablet can now be deciphered. The scroll crumbles to dust.";

    // unlock glyph notebook AFTER learning system
     notebookOpen = false; // stays closed by default
     glyphPanel.classList.add("hidden");

// optional flag so player knows it's unlocked
     glyphNotebookUnlocked = true;

    ui.textContent = "You can now study the glyph notebook (V).";
  }

  if (obj.type === "door") {
    attemptDoorUnlock(obj);
  }

  if (obj.type === "amulet" && !obj.pickedUp) {
    markObjective("find-amulet");
  }

  if (obj.type === "altar" && currentRoom.id === "bottom-room") {
    const amulet = inventory.find(item => item.type === "amulet");

    if (amulet) {
      inventory.splice(inventory.indexOf(amulet), 1);
      player.heldItem = null;

      markObjective("offer-amulet");
      ui.textContent = "The amulet settles into the altar with a soft glow.";
      updateUI();
    } else {
      ui.textContent = "The altar demands an offering to open the next path.";
    }
  }
}


function decodeGlyphs(obj) {
  if (!hasFullTranslation()) {
    ui.textContent = "You have not fully deciphered the glyphs yet.";
    return;
  }

  if (glyphDecoded) {
    ui.textContent = "You already decoded the word: LIGHT.";
    return;
  }

  glyphDecoded = true;
  markObjective("decode-glyphs");
  learnGlyphs();
  consumeRosettaPieces();

  if (obj) {
    showInspectUI(obj);
    ui.innerHTML += `<div>The glyphs resolve: LIGHT.</div>`;
  } else {
    ui.textContent = "The glyphs resolve: LIGHT.";
  }
}

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === "v") {
  if (!glyphNotebookUnlocked) {
    ui.textContent = "You don't yet understand how to read these symbols.";
    return;
  }
  toggleNotebook();
}

  if (k === "e" || k === "escape") {

    // =====================
    // CLOSE INSPECT MODE
    // =====================
    if (inspectState.active) {
      inspectState.active = false;
      inspectState.focus = null;

      cameraState.targetZoom = 1;
      hideInspectUI();
      setHUDVisible(true);


    } 
    // =====================
    // OPEN INSPECT MODE
    // =====================
    else if (nearObject) {
      inspectState.active = true;
      inspectState.focus = nearObject;

      

      cameraState.targetZoom = inspectState.zoom;
      inspectObject(nearObject);
      setHUDVisible(false);
    }
  }

  // =====================
  // PICK UP / DROP
  // =====================
  if (k === "x") {
    if (
      nearObject &&
      ["torch", "rosetta", "scroll", "amulet"].includes(nearObject.type) &&
      !nearObject.pickedUp
    ) {
      addToInventory(nearObject);
    } else if (inventory.length > 0) {
      dropActiveItem();
    }
  }

  // =====================
  // GLYPH DECODE
  // =====================
  if (k === "g") {
    if (
      (nearObject && nearObject.type === "glyph") ||
      (inspectState.active && inspectState.focus?.type === "glyph")
    ) {
      decodeGlyphs(nearObject || inspectState.focus);
    }
  }

  // =====================
  // INVENTORY CYCLE
  // =====================
  if (k === "q") {
    cycleInventory(1);
  }

   if (k === "m") {
     if (!mapUnlocked) return;
     toggleMap();
   }

  // =====================
  // TORCH TOGGLE
  // =====================
  if (k === "l") {
    if (player.heldItem?.type === "torch") {
      player.lampOn = !player.lampOn;
      ui.textContent = player.lampOn
        ? "The torch flares to life."
        : "The torch dims.";
    }
  }
});


window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = false;
});

function isColliding(a, b) {
  const aW = a.w || player.size;
  const aH = a.h || player.size;
  return (
    a.x < b.x + b.w &&
    a.x + aW > b.x &&
    a.y < b.y + b.h &&
    a.y + aH > b.y
  );
}

function update() {
  if (notebookOpen) return;
  let nextX = player.x;
  let nextY = player.y;

  player.isMoving = false;

  if (keys["a"] || keys["arrowleft"]) {
    nextX -= player.speed;
    player.isMoving = true;
  }
  if (keys["d"] || keys["arrowright"]) {
    nextX += player.speed;
    player.isMoving = true;
  }
  if (keys["w"] || keys["arrowup"]) {
    nextY -= player.speed;
    player.isMoving = true;
  }
  if (keys["s"] || keys["arrowdown"]) {
    nextY += player.speed;
    player.isMoving = true;
  }

  if (
    nextX < 0 ||
    nextY < 0 ||
    nextX > world.width - player.size ||
    nextY > world.height - player.size
  ) {
    nextX = Math.max(0, Math.min(world.width - player.size, nextX));
    nextY = Math.max(0, Math.min(world.height - player.size, nextY));
  }

  const testPlayer = { x: nextX, y: nextY };
  const moveX = nextX - player.x;
  const moveY = nextY - player.y;

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;
    if (obj.type === "torch") continue;

    if (obj.type === "door") {
      if (!obj.locked && obj.openProgress >= 1) continue;
      }

    if (isColliding(testPlayer, obj)) {
      return;
    }
  }

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;
    if (obj.type !== "torch") continue;

    const dx = obj.x + obj.w / 2 - nextX;
    const dy = obj.y + obj.h / 2 - nextY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 14 && (moveX !== 0 || moveY !== 0)) {
      const speed = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
      obj.vx += (moveX / speed) * 1.2;
      obj.vy += (moveY / speed) * 1.2;
    }
  }

  player.x = nextX;
  player.y = nextY;



}

  function updateDoors() {
  for (const obj of getCurrentObjects()) {
    if (obj.type !== "door") continue;

    if (obj.opening) {
      obj.openProgress += 0.05;

      if (obj.openProgress >= 1) {
        obj.openProgress = 1;
        obj.opening = false;
        obj.opened = true;
      }
    }
  }
}

function checkDoorTransition() {
  for (const obj of getCurrentObjects()) {
    if (obj.type !== "door" || obj.locked) continue;

    const dx = (player.x - (obj.x + obj.w / 2));
    const dy = (player.y - (obj.y + obj.h / 2));
    const dist = Math.sqrt(dx * dx + dy * dy);

   if (dist < 25) {
     transitionRoom(obj);
     return;
  }
  }
}

function updateTorchPhysics() {
  for (const obj of getCurrentObjects()) {
    if (!obj || obj.type !== "torch" || obj.pickedUp) continue;

    obj.x += obj.vx;
    obj.y += obj.vy;
    obj.vx *= obj.friction;
    obj.vy *= obj.friction;

    if (obj.x < 0) {
      obj.x = 0;
      obj.vx *= -0.5;
    }
    if (obj.x + obj.w > world.width) {
      obj.x = world.width - obj.w;
      obj.vx *= -0.5;
    }
    if (obj.y < 0) {
      obj.y = 0;
      obj.vy *= -0.5;
    }
    if (obj.y + obj.h > world.height) {
      obj.y = world.height - obj.h;
      obj.vy *= -0.5;
    }

    for (const other of getCurrentObjects()) {
      if (other === obj) continue;
      if (other.type === "torch") continue;
      if (other.pickedUp) continue;

      if (
        obj.x < other.x + other.w &&
        obj.x + obj.w > other.x &&
        obj.y < other.y + other.h &&
        obj.y + obj.h > other.y
      ) {
        const dx = (obj.x + obj.w / 2) - (other.x + other.w / 2);
        const dy = (obj.y + obj.h / 2) - (other.y + other.h / 2);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        obj.vx += (dx / len) * 0.5;
        obj.vy += (dy / len) * 0.5;
      }
    }
  }
}

function transitionRoom(door) {
  if (!door || door.locked) return;

  const nextRoom = rooms.find(r => r.id === door.leadsTo);
  if (!nextRoom) return;

  currentRoom = nextRoom;
  currentRoom.visited = true;
  
  syncObjectivesFromGameState();

  // find matching door in target room
  const matchingDoor = currentRoom.objects.find(
    obj => obj.type === "door" && obj.pairId === door.pairId
  );

  if (matchingDoor) {
    const cx = matchingDoor.x + matchingDoor.w / 2;
    const cy = matchingDoor.y + matchingDoor.h / 2;

    if (matchingDoor.direction === "left") {
      player.x = matchingDoor.x + matchingDoor.w + 20;
      player.y = cy;
    }

    if (matchingDoor.direction === "right") {
      player.x = matchingDoor.x - 20;
      player.y = cy;
    }

    if (matchingDoor.direction === "up") {
      player.x = cx;
      player.y = matchingDoor.y + matchingDoor.h + 20;
    }

    if (matchingDoor.direction === "down") {
      player.x = cx;
      player.y = matchingDoor.y - 20;
    }
  }

  updateUI();
}

function updateCamera() {
  const zoom = cameraState.zoom;
  let targetX;
  let targetY;

  if (inspectState.active && inspectState.focus) {
    const focus = inspectState.focus;
    targetX = focus.x + focus.w / 2 - canvas.width / (2 * zoom);
    targetY = focus.y + focus.h / 2 - canvas.height / (2 * zoom);
  } else {
    targetX = player.x + player.size / 2 - canvas.width / (2 * zoom);
    targetY = player.y + player.size / 2 - canvas.height / (2 * zoom);
  }

  camera.x = targetX;
  camera.y = targetY;
}

function applyCameraTransform() {
  const zoom = cameraState.zoom;
  ctx.setTransform(
    zoom, 0,
    0, zoom,
    -camera.x * zoom,
    -camera.y * zoom
  );
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawTomb() {
  ctx.fillStyle = "#2b2a26";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = "#23211e";
  ctx.fillRect(0, 0, world.width, 80);

  ctx.fillStyle = "#3a352d";
  ctx.fillRect(0, world.height * 0.6, world.width, world.height * 0.4);

  ctx.strokeStyle = "#1f1d1a";
  for (let x = 0; x < world.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.height);
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.width, y);
    ctx.stroke();
  }
}


function drawObjects() {
  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;

    ctx.save(); // IMPORTANT: isolate every object

    // highlight proximity
    const highlight = obj === nearObject ? "#f9d342" : obj.color;

    // =====================
    // BASE OBJECT TYPES
    // =====================

    if (obj.type === "sarcophagus") {
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

      ctx.fillStyle = "#735b39";
      ctx.fillRect(obj.x, obj.y, obj.w, 10);

      ctx.strokeStyle = "#3f2d1f";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(obj.x + 10, obj.y + 20);
      ctx.lineTo(obj.x + obj.w - 10, obj.y + 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(obj.x + 18, obj.y + 8, 18, 16);
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(obj.x + 58, obj.y + 8, 18, 16);
      ctx.stroke();

      ctx.fillStyle = "#4d3b26";
      ctx.fillRect(obj.x + 36, obj.y + 12, 28, 8);
    }

    else if (obj.type === "ushabti") {
      ctx.fillStyle = highlight;

      ctx.fillRect(obj.x, obj.y + 6, obj.w, obj.h - 6);

      ctx.fillStyle = "#4a4845";
      ctx.fillRect(obj.x - 2, obj.y + 6, obj.w + 4, 4);

      ctx.fillStyle = "#807060";
      ctx.beginPath();
      ctx.ellipse(obj.x + obj.w / 2, obj.y + 5, obj.w / 1.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#3e3a31";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(obj.x + 3, obj.y + 18);
      ctx.lineTo(obj.x + obj.w - 3, obj.y + 18);
      ctx.stroke();
    }

    else if (obj.type === "rosetta") {
      ctx.fillStyle = highlight;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

      ctx.strokeStyle = "#3e2f1f";
      ctx.lineWidth = 1;
      ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

      ctx.fillStyle = "#2a1f11";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const fontSize = Math.min(obj.w, obj.h) * 0.9;
      ctx.font = `${fontSize}px serif`;

      ctx.fillText(obj.glyph || "𓂀", obj.x + obj.w / 2, obj.y + obj.h / 2);

      const letter = playerGlyphMap[obj.glyph];
      if (letter) {
        ctx.font = `${fontSize * 0.5}px monospace`;
        ctx.fillStyle = "#d6c48a";
        ctx.fillText(letter, obj.x + obj.w / 2, obj.y + obj.h + 8);
      }
    }

    else if (obj.type === "glyph") {
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

      ctx.strokeStyle = "#3e2f1f";
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

      const glyphs = obj.glyphText || [];
      const count = glyphs.length || 1;

      const padding = 6;
      const usableWidth = obj.w - padding * 2;
      const spacing = usableWidth / count;

      const fontSize = Math.min(obj.h * 0.6, spacing * 0.9);

      ctx.fillStyle = "#2a1f11";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontSize}px serif`;

      for (let i = 0; i < count; i++) {
        const g = glyphs[i];
        const x = obj.x + padding + spacing * (i + 0.5);
        const y = obj.y + obj.h / 2;

        ctx.fillText(g, x, y);

        const letter = playerGlyphMap[g];
        if (letter) {
          ctx.font = `${fontSize * 0.45}px monospace`;
          ctx.fillStyle = "#d6c48a";
          ctx.fillText(letter, x, y + fontSize * 0.65);
          ctx.font = `${fontSize}px serif`;
          ctx.fillStyle = "#2a1f11";
        }
      }
    }

    else if (obj.type !== "door" && obj.type !== "torch") {
      ctx.fillStyle = highlight;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    }

    // =====================
    // DOORS (separate layer logic)
    // =====================
    if (obj.type === "door") {
      let offset = 0;

      if (!obj.locked && obj.openProgress > 0) {
        const dir = obj.direction;

        if (dir === "right") offset = obj.openProgress * obj.w;
        if (dir === "left") offset = -obj.openProgress * obj.w;
        if (dir === "down") offset = obj.openProgress * obj.h;
        if (dir === "up") offset = -obj.openProgress * obj.h;
      }

      const x = obj.x + (obj.direction === "left" || obj.direction === "right" ? offset : 0);
      const y = obj.y + (obj.direction === "up" || obj.direction === "down" ? offset : 0);

      ctx.fillStyle = obj.locked ? "#4f3925" : "#7a6a4f";
      ctx.fillRect(x, y, obj.w, obj.h);
    }

    // =====================
    // TORCHES
    // =====================
    if (obj.type === "torch" && !obj.pickedUp) {
      ctx.fillStyle = "#c9a24a";
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);

      ctx.fillStyle = "#ffb84d";
      ctx.beginPath();
      ctx.moveTo(obj.x + obj.w / 2, obj.y - 6);
      ctx.lineTo(obj.x + obj.w + 2, obj.y + 4);
      ctx.lineTo(obj.x - 2, obj.y + 4);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore(); // IMPORTANT
  }
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;
  ctx.fillStyle = "#f4f0de";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();

  if (player.heldItem?.type === "torch") {
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(x + 10, y - 4, 6, 12);
    if (player.lampOn) {
      ctx.fillStyle = "#ffc76c";
      ctx.beginPath();
      ctx.arc(x + 13, y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
function setHUDVisible(visible) {
  document.getElementById("quest-panel").style.display = visible ? "block" : "none";
  document.getElementById("inventory-grid").style.display = visible ? "grid" : "none";

  if (!visible) {
    mapPanel.classList.add("hidden");
    mapVisible = false;
  }
}

function drawLighting() {
  const baseRadius = player.lampOn ? 200 : 60;
  const pulse = 1 + Math.sin(gameTime * 2.5) * 0.12;
  const radius = baseRadius * pulse;

  // MUCH lighter than before (this is the real fix)
  const ambient = player.lampOn ? 0.55 : 0.65;

  ctx.save();

  // simple dark overlay
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(0, 0, 0, ${ambient})`;
  ctx.fillRect(0, 0, world.width, world.height);

  // soft reveal (no destructive blending)
  ctx.globalCompositeOperation = "lighter";

  const light = ctx.createRadialGradient(
    player.x, player.y, radius * 0.1,
    player.x, player.y, radius
  );

  light.addColorStop(0, "rgba(255, 240, 200, 0.25)");
  light.addColorStop(0.5, "rgba(255, 210, 140, 0.10)");
  light.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function loop() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  updateDoors();
  updateCamera();
  checkProximity();

  updateTorchPhysics();
  gameTime += 0.03;
  cameraState.zoom += (cameraState.targetZoom - cameraState.zoom) * 0.1;

  applyCameraTransform();

  drawTomb();
  drawObjects();
  drawPlayer();
  drawLighting();
  checkDoorTransition();
  if (mapVisible) {
  renderMap();
}

  requestAnimationFrame(loop);
}

updateUI();
loop();