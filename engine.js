// =====================
// ENGINE.JS
// Game loop, input handling, physics, drawing,
// camera, collision, room transitions.
// Depends on: state.js, rooms.js, ui.js, inventory.js, objectives.js
// =====================

// =====================
// INPUT
// =====================
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  // NOTEBOOK TOGGLE
  if (k === "v") {
    if (!glyphNotebookUnlocked) {
      ui.textContent = "You don't yet understand how to read these symbols.";
      return;
    }
    toggleNotebook();
  }

  // INSPECT / CLOSE
  if (k === "e" || k === "escape") {
    if (inspectState.active) {
      inspectState.active = false;
      inspectState.focus = null;
      cameraState.targetZoom = 1;
      hideInspectUI();
      setHUDVisible(true);
    } else if (nearObject) {
      inspectState.active = true;
      inspectState.focus = nearObject;
      cameraState.targetZoom = inspectState.zoom;
      inspectObject(nearObject);
      setHUDVisible(false);
    }
  }

  // PICK UP / DROP
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

  // GLYPH DECODE
  if (k === "g") {
    if (
      (nearObject && nearObject.type === "glyph") ||
      (inspectState.active && inspectState.focus?.type === "glyph")
    ) {
      decodeGlyphs(nearObject || inspectState.focus);
    }
  }

  // INVENTORY CYCLE
  if (k === "q") {
    cycleInventory(1);
  }

  // MAP TOGGLE
  if (k === "m") {
    if (!mapUnlocked) return;
    toggleMap();
  }

  // TORCH TOGGLE
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

// =====================
// COLLISION
// =====================
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

// =====================
// PLAYER UPDATE
// =====================
function update() {
  if (notebookOpen) return;

  let nextX = player.x;
  let nextY = player.y;
  player.isMoving = false;

  if (keys["a"] || keys["arrowleft"])  { nextX -= player.speed; player.isMoving = true; }
  if (keys["d"] || keys["arrowright"]) { nextX += player.speed; player.isMoving = true; }
  if (keys["w"] || keys["arrowup"])    { nextY -= player.speed; player.isMoving = true; }
  if (keys["s"] || keys["arrowdown"])  { nextY += player.speed; player.isMoving = true; }

  nextX = Math.max(0, Math.min(world.width  - player.size, nextX));
  nextY = Math.max(0, Math.min(world.height - player.size, nextY));

  const moveX = nextX - player.x;
  const moveY = nextY - player.y;

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;
    if (obj.type === "torch") continue;
    if (obj.type === "door" && !obj.locked && obj.openProgress >= 1) continue;

    if (isColliding({ x: nextX, y: nextY }, obj)) return;
  }

  // push torch
  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp || obj.type !== "torch") continue;

    const dx   = obj.x + obj.w / 2 - nextX;
    const dy   = obj.y + obj.h / 2 - nextY;
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

// =====================
// DOOR ANIMATION
// =====================
function updateDoors() {
  for (const obj of getCurrentObjects()) {
    if (obj.type !== "door") continue;

    if (obj.opening) {
      obj.openProgress += 0.05;
      if (obj.openProgress >= 1) {
        obj.openProgress = 1;
        obj.opening = false;
        obj.opened  = true;
      }
    }
  }
}

// =====================
// DOOR TRANSITION
// =====================
function checkDoorTransition() {
  for (const obj of getCurrentObjects()) {
    if (obj.type !== "door" || obj.locked) continue;

    const dx   = player.x - (obj.x + obj.w / 2);
    const dy   = player.y - (obj.y + obj.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 25) {
      transitionRoom(obj);
      return;
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

  const matchingDoor = currentRoom.objects.find(
    obj => obj.type === "door" && obj.pairId === door.pairId
  );

  if (matchingDoor) {
    const cx = matchingDoor.x + matchingDoor.w / 2;
    const cy = matchingDoor.y + matchingDoor.h / 2;

    if (matchingDoor.direction === "left")  { player.x = matchingDoor.x + matchingDoor.w + 20; player.y = cy; }
    if (matchingDoor.direction === "right") { player.x = matchingDoor.x - 20;                  player.y = cy; }
    if (matchingDoor.direction === "up")    { player.x = cx; player.y = matchingDoor.y + matchingDoor.h + 20; }
    if (matchingDoor.direction === "down")  { player.x = cx; player.y = matchingDoor.y - 20; }
  }

  updateUI();
}

// =====================
// TORCH PHYSICS
// =====================
function updateTorchPhysics() {
  for (const obj of getCurrentObjects()) {
    if (!obj || obj.type !== "torch" || obj.pickedUp) continue;

    obj.x += obj.vx;
    obj.y += obj.vy;
    obj.vx *= obj.friction;
    obj.vy *= obj.friction;

    if (obj.x < 0)                  { obj.x = 0;                  obj.vx *= -0.5; }
    if (obj.x + obj.w > world.width) { obj.x = world.width - obj.w; obj.vx *= -0.5; }
    if (obj.y < 0)                  { obj.y = 0;                  obj.vy *= -0.5; }
    if (obj.y + obj.h > world.height){ obj.y = world.height - obj.h; obj.vy *= -0.5; }

    for (const other of getCurrentObjects()) {
      if (other === obj || other.type === "torch" || other.pickedUp) continue;

      if (
        obj.x < other.x + other.w &&
        obj.x + obj.w > other.x &&
        obj.y < other.y + other.h &&
        obj.y + obj.h > other.y
      ) {
        const dx  = (obj.x + obj.w / 2) - (other.x + other.w / 2);
        const dy  = (obj.y + obj.h / 2) - (other.y + other.h / 2);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        obj.vx += (dx / len) * 0.5;
        obj.vy += (dy / len) * 0.5;
      }
    }
  }
}

// =====================
// PROXIMITY CHECK
// =====================
function checkProximity() {
  nearObject = null;
  const range = 40;

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;

    const dx   = player.x - (obj.x + obj.w / 2);
    const dy   = player.y - (obj.y + obj.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < range) {
      nearObject = obj;
      break;
    }
  }
}

// =====================
// CAMERA
// =====================
function updateCamera() {
  const zoom = cameraState.zoom;
  let targetX, targetY;

  if (inspectState.active && inspectState.focus) {
    const focus = inspectState.focus;
    targetX = focus.x + focus.w / 2 - canvas.width  / (2 * zoom);
    targetY = focus.y + focus.h / 2 - canvas.height / (2 * zoom);
  } else {
    targetX = player.x + player.size / 2 - canvas.width  / (2 * zoom);
    targetY = player.y + player.size / 2 - canvas.height / (2 * zoom);
  }

  camera.x = targetX;
  camera.y = targetY;
}

function applyCameraTransform() {
  const zoom = cameraState.zoom;
  ctx.setTransform(zoom, 0, 0, zoom, -camera.x * zoom, -camera.y * zoom);
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// =====================
// DRAW — WORLD
// =====================
function drawTomb() {
  ctx.fillStyle = "#2b2a26";
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = "#23211e";
  ctx.fillRect(0, 0, world.width, 80);

  ctx.fillStyle = "#3a352d";
  ctx.fillRect(0, world.height * 0.6, world.width, world.height * 0.4);

  ctx.strokeStyle = "#1f1d1a";
  for (let x = 0; x < world.width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, world.height); ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(world.width, y); ctx.stroke();
  }
}

// =====================
// DRAW — OBJECTS
// =====================
function drawObjects() {
  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;
    ctx.save();

    const highlight = obj === nearObject ? "#f9d342" : obj.color;

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

      ctx.beginPath(); ctx.rect(obj.x + 18, obj.y + 8, 18, 16); ctx.stroke();
      ctx.beginPath(); ctx.rect(obj.x + 58, obj.y + 8, 18, 16); ctx.stroke();

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

      const glyphs   = obj.glyphText || [];
      const count    = glyphs.length || 1;
      const padding  = 6;
      const usableW  = obj.w - padding * 2;
      const spacing  = usableW / count;
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

    else if (obj.type === "door") {
      let offset = 0;
      if (!obj.locked && obj.openProgress > 0) {
        if (obj.direction === "right") offset =  obj.openProgress * obj.w;
        if (obj.direction === "left")  offset = -obj.openProgress * obj.w;
        if (obj.direction === "down")  offset =  obj.openProgress * obj.h;
        if (obj.direction === "up")    offset = -obj.openProgress * obj.h;
      }
      const x = obj.x + (["left","right"].includes(obj.direction) ? offset : 0);
      const y = obj.y + (["up","down"].includes(obj.direction)    ? offset : 0);

      ctx.fillStyle = obj.locked ? "#4f3925" : "#7a6a4f";
      ctx.fillRect(x, y, obj.w, obj.h);
    }

    else if (obj.type === "torch" && !obj.pickedUp) {
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

    else if (obj.type !== "door" && obj.type !== "torch") {
      ctx.fillStyle = highlight;
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    }

    ctx.restore();
  }
}

// =====================
// DRAW — PLAYER
// =====================
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

// =====================
// DRAW — LIGHTING
// =====================
function drawLighting() {
  const baseRadius = player.lampOn ? 200 : 60;
  const pulse  = 1 + Math.sin(gameTime * 2.5) * 0.12;
  const radius = baseRadius * pulse;
  const ambient = player.lampOn ? 0.55 : 0.65;

  ctx.save();

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(0, 0, 0, ${ambient})`;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.globalCompositeOperation = "lighter";
  const light = ctx.createRadialGradient(
    player.x, player.y, radius * 0.1,
    player.x, player.y, radius
  );
  light.addColorStop(0,   "rgba(255, 240, 200, 0.25)");
  light.addColorStop(0.5, "rgba(255, 210, 140, 0.10)");
  light.addColorStop(1,   "rgba(0, 0, 0, 0)");

  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// =====================
// GAME LOOP
// =====================
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

  if (mapVisible) renderMap();

  requestAnimationFrame(loop);
}

// =====================
// BOOT
// =====================
updateUI();
loop();
