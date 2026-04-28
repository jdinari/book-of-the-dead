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

const cameraSettings = {
  smoothness: 0.08
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

  // 🔦 TORCH (physical object)
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
// COLLISION
// =====================
function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.size > b.x &&
    a.y < b.y + b.h &&
    a.y + a.size > b.y
  );
}

// =====================
// INPUT
// =====================
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  const k = e.key.toLowerCase();

  // E → interact
  if (k === "e" && nearObject) {
    if (nearObject.name !== "torch") {
      showInteraction(nearObject);
    }
  }

  // X → pick up / drop torch
  if (k === "x") {
    // pick up
    if (nearObject && nearObject.type === "torch" && !player.heldItem) {
      player.heldItem = nearObject;
      nearObject.pickedUp = true;
    }
    // drop
    else if (player.heldItem && player.heldItem.type === "torch") {
      const t = player.heldItem;

      t.x = player.x + 20;
      t.y = player.y + 10;

      t.pickedUp = false;
      player.heldItem = null;
      player.lampOn = false;
    }
  }

  // L → lamp toggle
  if (k === "l") {
    if (player.heldItem && player.heldItem.type === "torch") {
      player.lampOn = !player.lampOn;
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// =====================
// UPDATE
// =====================
function update() {
  let nextX = player.x;
  let nextY = player.y;

  player.isMoving = false;

  if (keys["arrowleft"] || keys["a"]) {
    nextX -= player.speed;
    player.isMoving = true;
  }
  if (keys["arrowright"] || keys["d"]) {
    nextX += player.speed;
    player.isMoving = true;
  }
  if (keys["arrowup"] || keys["w"]) {
    nextY -= player.speed;
    player.isMoving = true;
  }
  if (keys["arrowdown"] || keys["s"]) {
    nextY += player.speed;
    player.isMoving = true;
  }

  const testPlayer = { x: nextX, y: nextY, size: player.size };

  if (
    nextX < 0 ||
    nextY < 0 ||
    nextX > world.width - player.size ||
    nextY > world.height - player.size
  ) return;

  for (const obj of objects) {
    if (!obj || obj.pickedUp) continue;

    // solid objects block movement
    if (obj.type !== "torch") {
      if (isColliding(testPlayer, obj)) return;
      continue;
    }

    // 🔥 TORCH PUSH SYSTEM
    if (isColliding(testPlayer, obj)) {
      const dx = obj.x - player.x;
      const dy = obj.y - player.y;

      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      const push = 0.8;

      obj.vx += (dx / len) * push;
      obj.vy += (dy / len) * push;
    }
  }

  player.x = nextX;
  player.y = nextY;
}

// =====================
// CAMERA
// =====================
function updateCamera() {
  const targetX = player.x - canvas.width / 2 + player.size / 2;
  const targetY = player.y - canvas.height / 2 + player.size / 2;

  camera.x += (targetX - camera.x) * cameraSettings.smoothness;
  camera.y += (targetY - camera.y) * cameraSettings.smoothness;
}

// =====================
// TORCH PHYSICS
// =====================
function updateTorchPhysics() {
  for (const obj of objects) {
    if (!obj || obj.type !== "torch" || obj.pickedUp) continue;

    obj.x += obj.vx;
    obj.y += obj.vy;

    obj.vx *= obj.friction;
    obj.vy *= obj.friction;
  }
}

// =====================
// DRAW WORLD
// =====================
function drawTomb() {
  ctx.fillStyle = "#2b2a26";
  ctx.fillRect(-camera.x, -camera.y, world.width, world.height);

  ctx.fillStyle = "#3a352d";
  ctx.fillRect(
    -camera.x,
    -camera.y + world.height * 0.6,
    world.width,
    world.height * 0.4
  );
}

// =====================
// OBJECTS
// =====================
function drawObjects() {
  for (const obj of objects) {
    if (obj.pickedUp) continue;

    ctx.fillStyle = obj === nearObject ? "yellow" : obj.color;

    ctx.fillRect(
      obj.x - camera.x,
      obj.y - camera.y,
      obj.w,
      obj.h
    );
  }
}

// =====================
// PLAYER
// =====================
function drawPlayer() {
  const x = player.x - camera.x;
  const y = player.y - camera.y;

  const bob = Math.sin(player.walkFrame) * 2;

  const skin = "#f2c9a0";
  const outfit = "#4b5d67";

  const bx = x;
  const by = y + bob;

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(bx + 10, by - 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.fillRect(bx + 7, by - 9, 1, 1);
  ctx.fillRect(bx + 12, by - 9, 1, 1);

  ctx.fillStyle = outfit;
  ctx.fillRect(bx + 6, by - 2, 8, 10);

  const arm = Math.sin(player.walkFrame) * 2;
  ctx.fillRect(bx + 2, by, 3, 8 + arm);
  ctx.fillRect(bx + 15, by, 3, 8 - arm);

  const leg = Math.sin(player.walkFrame) * 3;
  ctx.fillRect(bx + 7, by + 8, 3, 8 + leg);
  ctx.fillRect(bx + 10, by + 8, 3, 8 - leg);

  // torch in hand
  if (player.heldItem && player.heldItem.type === "torch") {
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(bx + 14, by - 2, 6, 12);
  }
}

// =====================
// LIGHTING
// =====================
const lighting = {
  baseDarkness: 0.55,
  baseRadius: 20,
  pulseSpeed: 0.0015,
  pulseStrength: 3
};

function drawLighting() {
  const t = Date.now() * lighting.pulseSpeed;
  const pulse = Math.sin(t) * lighting.pulseStrength;

  let radius = lighting.baseRadius + pulse;
  let darkness = lighting.baseDarkness;

  const hasLamp =
    player.heldItem &&
    player.heldItem.type === "torch" &&
    player.lampOn;

  if (hasLamp) {
    radius *= 2.2;
    darkness = 0.35;
  }

  ctx.fillStyle = `rgba(0,0,0,${darkness})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const lx = player.x - camera.x + player.size / 2;
  const ly = player.y - camera.y + player.size / 2;

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";

  const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);

  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.4, "rgba(0,0,0,0.6)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(lx, ly, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// =====================
// UI
// =====================
function showInteraction(obj) {
  ui.style.display = "block";

  if (obj.name === "sarcophagus") {
    ui.textContent = "An ancient sarcophagus. It hums faintly...";
  } else if (obj.name === "ushabti") {
    ui.textContent = "A small ushabti statue. It feels watchful...";
  }

  setTimeout(() => {
    ui.style.display = "none";
  }, 2000);
}

// =====================
// LOOP
// =====================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  updateCamera();
  updateTorchPhysics();
  checkProximity();

  if (player.isMoving) player.walkFrame += 0.15;
  else player.walkFrame *= 0.85;

  drawTomb();
  drawObjects();
  drawPlayer();
  drawLighting();

  requestAnimationFrame(loop);
}

loop();