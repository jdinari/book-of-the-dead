// =====================
// CANVAS SETUP
// =====================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// =====================
// UI
// =====================
const ui = document.getElementById("ui");
function showInspectUI(obj) {
  ui.style.display = "block";

  if (obj.name === "sarcophagus") {
    ui.textContent = "An ancient sarcophagus. The stone feels warm...";
  } else if (obj.name === "ushabti") {
    ui.textContent = "A small ushabti statue. It feels like it’s watching.";
  } else {
    ui.textContent = "Unknown artifact.";
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
  lampOn: false
};

// =====================
// OBJECTS
// =====================
const objects = [
  { name: "sarcophagus", x: 350, y: 200, w: 60, h: 30, color: "#8b6b3f" },
  { name: "ushabti", x: 100, y: 250, w: 15, h: 25, color: "#5e5e5e" },
  { name: "ushabti", x: 500, y: 220, w: 15, h: 25, color: "#5e5e5e" },
  {
    name: "torch",
    type: "torch",
    x: 420,
    y: 260,
    w: 10,
    h: 20,
    color: "#c9a24a",
    pickedUp: false,
    vx: 0,
    vy: 0,
    friction: 0.85
  }
];



// =====================
// PROXIMITY
// =====================
let nearObject = null;

function checkProximity() {
  nearObject = null;
  const range = 40;

  for (const obj of objects) {
    if (obj.pickedUp) continue;

    const dx = (player.x + player.size / 2) - (obj.x + obj.w / 2);
    const dy = (player.y + player.size / 2) - (obj.y + obj.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range) {
      nearObject = obj;
      break;
    }
  }
}

// =====================
// INPUT
// =====================
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === "e" && nearObject && nearObject.name !== "torch") {
    const alreadyInspecting =
      inspectState.active &&
      inspectState.focus === nearObject;

    if (alreadyInspecting) {
      inspectState.active = false;
      inspectState.focus = null;
      cameraState.targetZoom = 1;
      ui.style.display = "none";
    } else {
      inspectState.active = true;
      inspectState.focus = nearObject;
      cameraState.targetZoom = inspectState.zoom;

      showInspectUI(nearObject);
    }
  }

  if (k === "x") {
    if (nearObject && nearObject.type === "torch" && !player.heldItem) {
      player.heldItem = nearObject;
      nearObject.pickedUp = true;
    } else if (player.heldItem) {
      const t = player.heldItem;
      t.x = player.x + 20;
      t.y = player.y + 10;
      t.pickedUp = false;
      player.heldItem = null;
      player.lampOn = false;
    }
  }

  if (k === "l") {
    if (player.heldItem?.type === "torch") {
      player.lampOn = !player.lampOn;
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});


function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + player.size > b.x &&
    a.y < b.y + b.h &&
    a.y + player.size > b.y
  );
}
// =====================
// UPDATE
// =====================
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

  // boundary check
  if (
    nextX < 0 ||
    nextY < 0 ||
    nextX > world.width - player.size ||
    nextY > world.height - player.size
  ) return;

  // collision test
  const testPlayer = { x: nextX, y: nextY };

  for (const obj of objects) {
    if (obj.pickedUp) continue;
    if (obj.type === "torch") continue;

    if (isColliding(testPlayer, obj)) {
      return; // block movement
    }
  }

  for (const obj of objects) {
  if (obj.type !== "torch" || obj.pickedUp) continue;

  const dx = obj.x - player.x;
  const dy = obj.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 15) {
    obj.vx += dx * 0.05;
    obj.vy += dy * 0.05;
  }
}

  player.x = nextX;
  player.y = nextY;
}

function updateTorchPhysics() {
  for (const obj of objects) {
    if (!obj || obj.type !== "torch" || obj.pickedUp) continue;

    // apply velocity
    obj.x += obj.vx;
    obj.y += obj.vy;

    // friction (slowly stops)
    obj.vx *= obj.friction;
    obj.vy *= obj.friction;

    // world bounds collision
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

    // simple push away from solid objects
    for (const other of objects) {
      if (other === obj) continue;
      if (other.type === "torch") continue;
      if (other.pickedUp) continue;

      if (
        obj.x < other.x + other.w &&
        obj.x + obj.w > other.x &&
        obj.y < other.y + other.h &&
        obj.y + obj.h > other.y
      ) {
        // push torch out
        const dx = (obj.x + obj.w / 2) - (other.x + other.w / 2);
        const dy = (obj.y + obj.h / 2) - (other.y + other.h / 2);

        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        obj.vx += (dx / len) * 0.5;
        obj.vy += (dy / len) * 0.5;
      }
    }
  }
}
// =====================
// CAMERA (FIXED)
// =====================
function updateCamera() {
  const zoom = cameraState.zoom;

  let targetX, targetY;

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

// =====================
// TRANSFORM
// =====================
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

// =====================
// DRAW WORLD (FIXED)
// =====================
function drawTomb() {
  // FLOOR
  ctx.fillStyle = "#2b2a26";
  ctx.fillRect(0, 0, world.width, world.height);

  // BACK WALL STRIP
  ctx.fillStyle = "#23211e";
  ctx.fillRect(0, 0, world.width, 80);

  // BURIAL PLATFORM
  ctx.fillStyle = "#3a352d";
  ctx.fillRect(0, world.height * 0.6, world.width, world.height * 0.4);

  // STONE TILES (simple grid)
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



// =====================
// OBJECTS (FIXED)
// =====================
function drawObjects() {
  for (const obj of objects) {
    if (obj.pickedUp) continue;

    ctx.fillStyle = obj === nearObject ? "yellow" : obj.color;

    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
  }
}

// =====================
// PLAYER (FIXED)
// =====================
function drawPlayer() {
  const x = player.x;
  const y = player.y;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
}

// =====================
// LOOP
// =====================
function loop() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  updateCamera();
  checkProximity();

  updateTorchPhysics();
  cameraState.zoom += (cameraState.targetZoom - cameraState.zoom) * 0.1;

  applyCameraTransform();

  drawTomb();
  drawObjects();
  drawPlayer();

  requestAnimationFrame(loop);
}

loop();