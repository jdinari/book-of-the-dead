// ===== Canvas Setup =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== Input System =====
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ===== World =====
const world = {
  width: 800,
  height: 500
};

// Center the tomb in screen space
const offset = {
  x: (canvas.width - world.width) / 2,
  y: (canvas.height - world.height) / 2
};

// ===== Player =====
const player = {
  x: 400,
  y: 300,
  size: 20,
  speed: 3,
  color: "gold"
};

// ===== Objects =====
const objects = [
  {
    name: "sarcophagus",
    x: 350,
    y: 200,
    w: 60,
    h: 30,
    color: "#8b6b3f"
  },
  {
    name: "ushabti",
    x: 100,
    y: 250,
    w: 15,
    h: 25,
    color: "#5e5e5e"
  },
  {
    name: "ushabti",
    x: 500,
    y: 220,
    w: 15,
    h: 25,
    color: "#5e5e5e"
  }
];

// ===== Update =====
function update() {
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;
  if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"] || keys["s"]) player.y += player.speed;
}

// ===== Draw Tomb Background =====
function drawTomb() {
  // walls
  ctx.fillStyle = "#2b2a26";
  ctx.fillRect(offset.x, offset.y, world.width, world.height);

  // floor
  ctx.fillStyle = "#3a352d";
  ctx.fillRect(offset.x, offset.y + world.height * 0.6, world.width, world.height * 0.4);
}

// ===== Draw Objects =====
function drawObjects() {
  for (const obj of objects) {

    if (obj === nearObject) {
      ctx.fillStyle = "yellow"; // highlight
    } else {
      ctx.fillStyle = obj.color;
    }

    ctx.fillRect(
      offset.x + obj.x,
      offset.y + obj.y,
      obj.w,
      obj.h
    );
  }
}

// ===== Draw Player =====
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(
    offset.x + player.x,
    offset.y + player.y,
    player.size,
    player.size
  );
}

// ===== Render Loop =====
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTomb();
  drawObjects();
  drawPlayer();

  update();

  requestAnimationFrame(loop);
}

loop();

function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.size > b.x &&
    a.y < b.y + b.h &&
    a.y + a.size > b.y
  );
}

function update() {
  let nextX = player.x;
  let nextY = player.y;

  if (keys["arrowleft"] || keys["a"]) nextX -= player.speed;
  if (keys["arrowright"] || keys["d"]) nextX += player.speed;
  if (keys["arrowup"] || keys["w"]) nextY -= player.speed;
  if (keys["arrowdown"] || keys["s"]) nextY += player.speed;

  const testPlayer = {
    x: nextX,
    y: nextY,
    size: player.size
  };

  // world bounds
  const withinBounds =
    nextX > 0 &&
    nextY > 0 &&
    nextX < world.width - player.size &&
    nextY < world.height - player.size;

  if (!withinBounds) return;

  // object collision check
  for (const obj of objects) {
    const objBox = { x: obj.x, y: obj.y, w: obj.w, h: obj.h };

    if (isColliding(testPlayer, objBox)) {
      return; // block movement
    }
  }

  // apply movement if no collision
  player.x = nextX;
  player.y = nextY;
}

let nearObject = null;

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === "e" && nearObject) {
    console.log("Interacting with:", nearObject.name);
  }
});

function checkProximity() {
  nearObject = null;

  const range = 40;

  for (const obj of objects) {
    const dx = (player.x + player.size / 2) - (obj.x + obj.w / 2);
    const dy = (player.y + player.size / 2) - (obj.y + obj.h / 2);

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range) {
      nearObject = obj;
      break;
    }
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTomb();
  drawObjects();
  drawPlayer();

  update();
  checkProximity();

  requestAnimationFrame(loop);
}