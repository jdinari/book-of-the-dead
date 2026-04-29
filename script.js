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

let mapUnlocked = false;
let mapVisible = false;
let glyphDecoded = false;

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
    lines.push(obj.text || "A Rosetta fragment inscribed with matching glyphs.");
    lines.push(`Glyphs: ${obj.glyphs || "𓂀𓄿"}`);
    lines.push(`Sound: ${obj.sound || "a / ꜣ"}`);
    lines.push("Use it to decode the larger glyph stone.");
    lines.push("Press X to add it to your inventory.");
  } else if (obj.type === "glyph") {
    lines.push(obj.text || "A stone slab etched with hieroglyphs.");
    lines.push(`Inscription: ${obj.glyphText || "𓂀 𓄿 𓈖 𓍿 𓏏 𓊪"}`);
    lines.push("Transliteration guide:");
    lines.push("𓂀 = a, 𓄿 = ꜣ, 𓈖 = n, 𓍿 = t, 𓏏 = t, 𓊪 = p");
    if (inventory.filter(item => item.type === "rosetta").length >= 3) {
      lines.push("Press D to decode the glyphs with your Rosetta fragments.");
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

function renderMap() {
  const mapRooms = [
    { id: "burial-chamber", label: "Burial",
      desc: "Tomb",
    },
    { id: "right-room", label: "Antechamber",
      desc: "East",
    },
    { id: "bottom-room", label: "Depths",
      desc: "South",
    }
  ];

  mapPanel.innerHTML = `
    <div class="map-title">Maze Map (M to toggle)</div>
    ${mapRooms.map(room => `
      <div class="map-room ${room.id === currentRoom.id ? "current" : ""}">
        <span>${room.label}</span>
        <span>${room.id === currentRoom.id ? "●" : "○"}</span>
      </div>
    `).join("")}
  `;
}

function updateHelpText() {
  let help = `Controls: W/A/S/D or arrows to move · E to inspect · X to pick up/drop · Q to cycle held item · L to light torch`;
  if (mapUnlocked) help += " · M to toggle map";
  if (nearObject?.type === "glyph" && inventory.filter(item => item.type === "rosetta").length >= 3) {
    help += " · D to decode glyphs";
  }
  helpText.textContent = help;
}

function updateUI() {
  roomTitle.textContent = currentRoom.name;

  objectiveText.innerHTML = currentRoom.objectives
    .map(o => `<div class="${o.done ? "done" : ""}">${o.done ? "✓" : "○"} ${o.label}</div>`)
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
  zoom: 15
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

const rooms = [
  {
    id: "burial-chamber",
    name: "Burial Chamber",
    description: "You awaken in a warm, dustless tomb. Stone statues and a sealed sarcophagus surround you.",
    objectives: [
      { id: "find-torch", label: "Find the torch and carry it.", done: false },
      { id: "collect-rosetta", label: "Collect 3 Rosetta stone pieces.", done: false },
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
        glyphText: "𓂀 𓄿 𓈖 𓍿 𓏏 𓊪",
        inspectDone: false
      },
      {
        name: "Right Door",
        type: "door",
        x: 760,
        y: 200,
        w: 30,
        h: 120,
        color: "#4f3925",
        locked: true,
        direction: "right",
        leadsTo: "right-room",
        text: "A sealed east passage. The right door will open when this chamber is complete."
      },
      {
        name: "Bottom Door",
        type: "door",
        x: 360,
        y: 468,
        w: 80,
        h: 30,
        color: "#4f3925",
        locked: true,
        direction: "down",
        leadsTo: "bottom-room",
        text: "A south passage blocked by a second chamber's seal.",
        inspectDone: false
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
        glyphs: "𓂀𓄿",
        sound: "a / ꜣ",
        text: "A fragment of Rosetta stone carved with matching script."
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
        glyphs: "𓈖𓍿",
        sound: "n / t",
        text: "A fragment of Rosetta stone carved with matching script."
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
        glyphs: "𓏏𓊪",
        sound: "t / p",
        text: "A fragment of Rosetta stone carved with matching script."
      }
    ],
    exit: null
  },
  {
    id: "right-room",
    name: "Antechamber",
    description: "The eastern chamber is narrower and lined with faded carvings. A soft glow breathes from the walls.",
    objectives: [
      { id: "find-tablet", label: "Find the stone tablet.", done: false },
      { id: "read-tablet", label: "Read the tablet's translation.", done: false },
      { id: "unlock-south-passage", label: "Unlock the southern passage from the burial chamber.", done: false }
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

function getCurrentObjects() {
  return currentRoom.objects;
}

function findObjectByType(type, filter) {
  return getCurrentObjects().find(item => item.type === type && (!filter || filter(item)));
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
    const pieces = inventory.filter(item => item.type === "rosetta").length;
    if (pieces >= 3) {
      markObjective("collect-rosetta");
    }
  }

  updateUI();
  return true;
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
  const objective = currentRoom.objectives.find(o => o.id === id);
  if (objective) {
    objective.done = true;
    updateUI();
  }
}

function canOpenDoor() {
  const door = findObjectByType("door");
  return door && !door.locked;
}

function attemptDoorUnlock(door) {
  if (!door) return;

  if (door.direction === "right") {
    const allDone = currentRoom.objectives.every(o => o.done);
    if (allDone) {
      door.locked = false;
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
    const secondComplete = secondRoom.objectives.every(o => o.done);
    if (secondComplete) {
      door.locked = false;
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
  showInspectUI(obj);

  if (obj.type === "ushabti" && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("speak-ushabti");
  }

  if (obj.type === "glyph") {
    if (!obj.inspectDone) {
      obj.inspectDone = true;
    }
    const pieces = inventory.filter(item => item.type === "rosetta").length;
    if (glyphDecoded) {
      ui.textContent = "The glyphs resolve clearly: LIGHT AND TRUTH OPEN THE EASTERN PASSAGE.";
    } else if (pieces >= 3) {
      ui.textContent = "You can now press D to decode the stone with the Rosetta fragments.";
    } else {
      ui.textContent = `The glyphs remain mysterious. You need ${3 - pieces} more Rosetta piece(s).`;
    }
  }

  if (obj.type === "tablet" && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("find-tablet");
    markObjective("read-tablet");
    markObjective("unlock-south-passage");
    ui.textContent = "You decipher the translation tablet and can now unlock the southern passage.";
  }

  if (obj.type === "door") {
    attemptDoorUnlock(obj);
  }

  if (obj.type === "amulet" && !obj.pickedUp) {
    addToInventory(obj);
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
  const pieces = inventory.filter(item => item.type === "rosetta").length;
  if (pieces < 3) {
    ui.textContent = "You need three Rosetta fragments before the glyphs can be fully decoded.";
    return;
  }

  if (glyphDecoded) {
    ui.textContent = "You already decoded the stone: LIGHT AND TRUTH OPEN THE EASTERN PASSAGE.";
    return;
  }

  glyphDecoded = true;
  markObjective("decode-glyphs");
  if (obj) {
    showInspectUI(obj);
    ui.innerHTML += `<div>The glyphs resolve as you align the fragments: LIGHT AND TRUTH OPEN THE EASTERN PASSAGE.</div>`;
  } else {
    ui.textContent = "The glyphs resolve as you align the fragments: LIGHT AND TRUTH OPEN THE EASTERN PASSAGE.";
  }
}

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === "e" || k === "escape") {
    if (inspectState.active) {
      inspectState.active = false;
      inspectState.focus = null;
      cameraState.targetZoom = 1;
      hideInspectUI();
    } else if (nearObject) {
      inspectState.active = true;
      inspectState.focus = nearObject;
      cameraState.targetZoom = inspectState.zoom;
      inspectObject(nearObject);
    }
  }

  if (k === "x") {
    if (nearObject && ["torch", "rosetta", "scroll", "amulet"].includes(nearObject.type) && !nearObject.pickedUp) {
      addToInventory(nearObject);
    } else if (inventory.length > 0) {
      dropActiveItem();
    }
  }

  if (k === "d") {
    if ((nearObject && nearObject.type === "glyph") || (inspectState.active && inspectState.focus?.type === "glyph")) {
      decodeGlyphs(nearObject || inspectState.focus);
    }
  }

  if (k === "q") {
    cycleInventory(1);
  }

  if (k === "l") {
    if (player.heldItem?.type === "torch") {
      player.lampOn = !player.lampOn;
      ui.textContent = player.lampOn ? "The torch flares to life." : "The torch dims.";
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
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
    return;
  }

  const testPlayer = { x: nextX, y: nextY };
  const moveX = nextX - player.x;
  const moveY = nextY - player.y;

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;
    if (obj.type === "torch") continue;

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

  const door = getCurrentObjects().find(obj => obj.type === "door" && !obj.locked && isColliding(player, obj));
  if (door) {
    transitionRoom(door);
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

  const nextRoom = rooms.find(room => room.id === door.leadsTo);
  if (!nextRoom) return;

  currentRoom = nextRoom;
  player.x = nextRoom.id === "right-room" ? 100 : 360;
  player.y = nextRoom.id === "bottom-room" ? 350 : 250;
  player.heldItem = null;
  player.lampOn = false;
  ui.textContent = nextRoom.id === "right-room"
    ? "You step through the opening and enter the antechamber beyond."
    : "You descend into the sepulcher depths, where the air thickens with ancient power.";
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
    } else if (obj.type === "ushabti") {
      ctx.fillStyle = obj === nearObject ? "#f9d342" : obj.color;
      const bodyX = obj.x;
      const bodyY = obj.y;
      const bodyW = obj.w;
      const bodyH = obj.h;
      ctx.fillRect(bodyX, bodyY + 6, bodyW, bodyH - 6);
      ctx.fillStyle = "#4a4845";
      ctx.fillRect(bodyX - 2, bodyY + 6, bodyW + 4, 4);
      ctx.fillStyle = "#807060";
      ctx.beginPath();
      ctx.ellipse(bodyX + bodyW / 2, bodyY + 5, bodyW / 1.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3e3a31";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bodyX + 3, bodyY + 18);
      ctx.lineTo(bodyX + bodyW - 3, bodyY + 18);
      ctx.stroke();
    } else if (obj.type === "rosetta") {
      ctx.fillStyle = obj === nearObject ? "#f9d342" : obj.color;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
      ctx.fillStyle = "#3e2f1f";
      ctx.font = "12px serif";
      ctx.textBaseline = "middle";
      ctx.fillText(obj.glyphs || "𓂀𓄿", obj.x + 2, obj.y + obj.h / 2);
    } else if (obj.type === "glyph") {
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
      ctx.fillStyle = "#2a1f11";
      ctx.font = "16px serif";
      ctx.textBaseline = "middle";
      ctx.fillText(obj.glyphText || "𓂀𓄿𓈖", obj.x + 6, obj.y + obj.h / 2);
    } else {
      ctx.fillStyle = obj === nearObject ? "#f9d342" : obj.color;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    }

    if (obj.type === "door" && obj.locked) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(obj.x + 6, obj.y + 30, obj.w - 12, obj.h - 60);
    }

    if (obj.type === "torch" && obj.pickedUp === false) {
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

function drawLighting() {
  const baseRadius = player.lampOn ? 200 : 40;
  const pulse = 1 + Math.sin(gameTime * 2.5) * 0.15;
  const radius = baseRadius * pulse;
  const ambient = player.lampOn ? 0.62 : 0.68;

  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${ambient})`;
  ctx.fillRect(0, 0, world.width, world.height);

  const gradient = ctx.createRadialGradient(player.x, player.y, radius * 0.12, player.x, player.y, radius);
  const inner = player.lampOn ? "rgba(255, 230, 150, 0.98)" : "rgba(255, 245, 190, 0.98)";
  const middle = player.lampOn ? "rgba(255, 195, 90, 0.32)" : "rgba(255, 235, 160, 0.28)";
  const outer = player.lampOn ? "rgba(255, 155, 40, 0)" : "rgba(255, 235, 160, 0)";

  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.35, middle);
  gradient.addColorStop(1, outer);

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  const haloGradient = ctx.createRadialGradient(player.x, player.y, radius * 0.25, player.x, player.y, radius * 1.05);
  haloGradient.addColorStop(0, player.lampOn ? "rgba(255, 240, 180, 0.18)" : "rgba(255, 245, 190, 0.14)");
  haloGradient.addColorStop(1, "rgba(255, 190, 80, 0)");
  ctx.fillStyle = haloGradient;
  ctx.beginPath();
  ctx.arc(player.x, player.y, radius * 1.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function loop() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
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

  requestAnimationFrame(loop);
}

updateUI();
loop();