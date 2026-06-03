// =====================
// ENGINE.JS
// Game loop, input handling, physics, drawing,
// camera, collision, and room transitions.
// Depends on: state.js, rooms.js, ui.js, inventory.js, objectives.js
// =====================

// =====================
// TITLE SCREEN
// =====================
let titleScreenActive = true;
let titleAlpha = 1;
let titleFadeOut = false;

function drawTitleScreen() {
  ctx.save();
  ctx.globalAlpha = titleAlpha;
  ctx.fillStyle = "#060502";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Decorative border
  ctx.strokeStyle = `rgba(194, 168, 107, ${titleAlpha * 0.6})`;
  ctx.lineWidth = 1;
  const bw = Math.min(600, canvas.width - 80);
  const bh = 320;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.strokeRect(bx + 8, by + 8, bw - 16, bh - 16);

  // Glyphs header
  ctx.fillStyle = `rgba(194, 168, 107, ${titleAlpha * 0.8})`;
  ctx.font = "28px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("𓂀  𓄿  𓈖  𓏏  𓊪", cx, by + 52);

  // Title
  ctx.fillStyle = `rgba(247, 231, 200, ${titleAlpha})`;
  ctx.font = `bold ${Math.min(52, bw / 10)}px Georgia, serif`;
  ctx.fillText("BOOK OF THE DEAD", cx, cy - 20);

  // Subtitle
  ctx.font = `${Math.min(18, bw / 28)}px Georgia, serif`;
  ctx.fillStyle = `rgba(200, 180, 140, ${titleAlpha * 0.85})`;
  ctx.fillText("A Tomb of Glyphs, Rituals, and Forgotten Names", cx, cy + 24);

  // Prompt
  const pulse = 0.6 + Math.sin(gameTime * 3) * 0.4;
  ctx.font = "15px Georgia, serif";
  ctx.fillStyle = `rgba(240, 220, 170, ${titleAlpha * pulse})`;
  ctx.fillText("Press  ENTER  or  SPACE  to begin", cx, by + bh - 44);

  ctx.restore();
}

function startGame() {
  titleFadeOut = true;
}

window.addEventListener("keydown", (e) => {
  if (titleScreenActive && (e.key === "Enter" || e.key === " ")) {
    startGame();
    return;
  }
  if (titleScreenActive) return; // block all other keys during title

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
      inspectState.focus  = null;
      cameraState.targetZoom = 1;
      hideInspectUI();
      setHUDVisible(true);
    } else if (nearObject) {
      inspectState.active = true;
      inspectState.focus  = nearObject;
      cameraState.targetZoom = inspectState.zoom;
      inspectObject(nearObject);
      setHUDVisible(false);
    }
  }

  // PICK UP / DROP
  if (k === "x") {
    if (
      nearObject &&
      ["torch", "rosetta", "scroll", "amulet", "offering-item", "key-fragment", "canopic-ring", "canopic-seal"].includes(nearObject.type) &&
      !nearObject.pickedUp
    ) {
      addToInventory(nearObject);
    } else if (inventory.length > 0) {
      dropActiveItem();
    }
  }

  // MOUNT TORCH IN BRACKET  (T key near bracket, holding lit torch)
  if (k === "t") {
    if (nearObject?.type === "bracket" && !nearObject.mounted) {
      mountTorchInBracket(nearObject);
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
  if (k === "q") cycleInventory(1);

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

  // solid-object collision — axis-separated so player slides along walls
  const isSolid = (obj) => {
    if (obj.pickedUp) return false;
    if (obj.type === "torch") return false;
    if (obj.type === "door" && !obj.locked) return false;
    if (obj.type === "decoration") return false;
    if (obj.type === "niche") return false;
    if (obj.type === "wall-painting") return false;
    return true;
  };

  let blockedX = false;
  let blockedY = false;
  const pBox = { w: player.size, h: player.size };

  for (const obj of getCurrentObjects()) {
    if (!isSolid(obj)) continue;
    if (isColliding({ x: nextX, y: player.y, ...pBox }, obj)) blockedX = true;
    if (isColliding({ x: player.x, y: nextY, ...pBox }, obj)) blockedY = true;
  }

  if (blockedX) nextX = player.x;
  if (blockedY) nextY = player.y;

  // if both blocked (corner), abort entirely
  if (blockedX && blockedY) return;

  // push torch with player movement
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
    if (obj.type !== "door" || !obj.opening) continue;

    obj.openProgress += 0.05;
    if (obj.openProgress >= 1) {
      obj.openProgress = 1;
      obj.opening = false;
      obj.opened  = true;
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
  if (mapVisible) renderMap();
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

    // world bounds bounce
    if (obj.x < 0)                   { obj.x = 0;                   obj.vx *= -0.5; }
    if (obj.x + obj.w > world.width)  { obj.x = world.width - obj.w;  obj.vx *= -0.5; }
    if (obj.y < 0)                   { obj.y = 0;                   obj.vy *= -0.5; }
    if (obj.y + obj.h > world.height) { obj.y = world.height - obj.h; obj.vy *= -0.5; }

    // bounce off other objects
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

  let bestObject = null;
  let bestDist = Infinity;

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;
    if (obj.hidden) continue;

    const dx = player.x - (obj.x + obj.w / 2);
    const dy = player.y - (obj.y + obj.h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= range) continue;

    // prioritize pickup items over scenery/niches
    const pickupPriority = [
      "key-fragment",
      "canopic-ring",
      "canopic-seal",
      "torch",
      "rosetta",
      "scroll",
      "amulet",
      "offering-item"
    ];

    const currentPriority =
      pickupPriority.indexOf(obj.type) !== -1
        ? pickupPriority.indexOf(obj.type)
        : 999;

    const bestPriority =
      bestObject && pickupPriority.indexOf(bestObject.type) !== -1
        ? pickupPriority.indexOf(bestObject.type)
        : 999;

    if (
      currentPriority < bestPriority ||
      (currentPriority === bestPriority && dist < bestDist)
    ) {
      bestObject = obj;
      bestDist = dist;
    }
  }

  nearObject = bestObject;
}

// =====================
// CAMERA
// =====================
function updateCamera() {
  const zoom = cameraState.zoom;
  let targetX, targetY;

  if (inspectState.active && inspectState.focus) {
    const f = inspectState.focus;
    targetX = f.x + f.w / 2 - canvas.width  / (2 * zoom);
    targetY = f.y + f.h / 2 - canvas.height / (2 * zoom);
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
  ctx.lineWidth = 1;
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

    switch (obj.type) {

      case "sarcophagus": {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.fillStyle = "#735b39";
        ctx.fillRect(obj.x, obj.y, obj.w, 10);
        ctx.strokeStyle = "#3f2d1f"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(obj.x + 10, obj.y + 20); ctx.lineTo(obj.x + obj.w - 10, obj.y + 20); ctx.stroke();
        ctx.beginPath(); ctx.rect(obj.x + 18, obj.y + 8, 18, 16); ctx.stroke();
        ctx.beginPath(); ctx.rect(obj.x + 58, obj.y + 8, 18, 16); ctx.stroke();
        ctx.fillStyle = "#4d3b26"; ctx.fillRect(obj.x + 36, obj.y + 12, 28, 8);
        break;
      }

      case "ushabti": {
        ctx.fillStyle = highlight;
        ctx.fillRect(obj.x, obj.y + 6, obj.w, obj.h - 6);
        ctx.fillStyle = "#4a4845";
        ctx.fillRect(obj.x - 2, obj.y + 6, obj.w + 4, 4);
        ctx.fillStyle = "#807060";
        ctx.beginPath(); ctx.ellipse(obj.x + obj.w / 2, obj.y + 5, obj.w / 1.5, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#3e3a31"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(obj.x + 3, obj.y + 18); ctx.lineTo(obj.x + obj.w - 3, obj.y + 18); ctx.stroke();
        break;
      }

      case "rosetta": {
        ctx.fillStyle = highlight;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = "#3e2f1f"; ctx.lineWidth = 1;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        const rFontSize = Math.min(obj.w, obj.h) * 0.9;
        ctx.fillStyle = "#2a1f11"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `${rFontSize}px serif`;
        ctx.fillText(obj.glyph || "𓂀", obj.x + obj.w / 2, obj.y + obj.h / 2);
        const letter = playerGlyphMap[obj.glyph];
        if (letter) {
          ctx.font = `${rFontSize * 0.5}px monospace`;
          ctx.fillStyle = "#d6c48a";
          ctx.fillText(letter, obj.x + obj.w / 2, obj.y + obj.h + 8);
        }
        break;
      }

      case "glyph": {
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = "#3e2f1f"; ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        const glyphs   = obj.glyphText || [];
        const count    = glyphs.length || 1;
        const gPadding = 6;
        const spacing  = (obj.w - gPadding * 2) / count;
        const gFont    = Math.min(obj.h * 0.6, spacing * 0.9);
        ctx.fillStyle = "#2a1f11"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `${gFont}px serif`;
        for (let i = 0; i < count; i++) {
          const g = glyphs[i];
          const gx = obj.x + gPadding + spacing * (i + 0.5);
          const gy = obj.y + obj.h / 2;
          ctx.fillText(g, gx, gy);
          const gl = playerGlyphMap[g];
          if (gl) {
            ctx.font = `${gFont * 0.45}px monospace`; ctx.fillStyle = "#d6c48a";
            ctx.fillText(gl, gx, gy + gFont * 0.65);
            ctx.font = `${gFont}px serif`;             ctx.fillStyle = "#2a1f11";
          }
        }
        break;
      }

      case "door": {
        let offset = 0;
        if (!obj.locked && obj.openProgress > 0) {
          if (obj.direction === "right") offset =  obj.openProgress * obj.w;
          if (obj.direction === "left")  offset = -obj.openProgress * obj.w;
          if (obj.direction === "down")  offset =  obj.openProgress * obj.h;
          if (obj.direction === "up")    offset = -obj.openProgress * obj.h;
        }
        const dx = ["left","right"].includes(obj.direction) ? offset : 0;
        const dy = ["up","down"].includes(obj.direction)    ? offset : 0;
        ctx.fillStyle = obj.locked ? "#4f3925" : "#7a6a4f";
        ctx.fillRect(obj.x + dx, obj.y + dy, obj.w, obj.h);
        break;
      }

      case "torch": {
        ctx.fillStyle = "#c9a24a";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.fillStyle = "#ffb84d";
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.w / 2, obj.y - 6);
        ctx.lineTo(obj.x + obj.w + 2, obj.y + 4);
        ctx.lineTo(obj.x - 2, obj.y + 4);
        ctx.closePath(); ctx.fill();
        break;
      }

      case "canopic": {
        // Jar body
        ctx.fillStyle = highlight;
        ctx.fillRect(obj.x, obj.y + 10, obj.w, obj.h - 10);
        // Stopper / head (oval)
        ctx.fillStyle = obj === nearObject ? "#f0d060" : "#9a8460";
        ctx.beginPath();
        ctx.ellipse(obj.x + obj.w / 2, obj.y + 10, obj.w / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ritual index label
        ctx.fillStyle = "#2a1a08";
        ctx.font = "9px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(obj.ritualIndex), obj.x + obj.w / 2, obj.y + obj.h * 0.6);
        const checkDone = canopicSequence.includes(obj.ritualIndex);
        if (checkDone) {
          ctx.fillStyle = "#80c860";
          ctx.font = "8px sans-serif";
          ctx.fillText("✓", obj.x + obj.w / 2, obj.y + obj.h - 4);
        }
        break;
      }

      case "offering-bowl": {
        ctx.fillStyle = obj.filled ? "#c09040" : highlight;
        ctx.fillRect(obj.x, obj.y + obj.h * 0.4, obj.w, obj.h * 0.6);
        // Rim
        ctx.fillStyle = obj.filled ? "#e0b860" : "#8a7050";
        ctx.fillRect(obj.x - 2, obj.y + obj.h * 0.35, obj.w + 4, 5);
        if (obj.filled) {
          // Glow
          ctx.fillStyle = "rgba(255,200,80,0.18)";
          ctx.beginPath();
          ctx.ellipse(obj.x + obj.w / 2, obj.y + obj.h * 0.4, obj.w * 0.6, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case "niche": {
        if (obj.hidden) break; // invisible
        ctx.fillStyle = "#3a2e20";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = "#c0a050";
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        // Glow hint
        ctx.fillStyle = "rgba(220,180,80,0.15)";
        ctx.fillRect(obj.x + 2, obj.y + 2, obj.w - 4, obj.h - 4);
        break;
      }

      case "bracket": {
        ctx.fillStyle = obj.mounted ? "#8a6a40" : highlight;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Bracket arm
        ctx.strokeStyle = obj.mounted ? "#c09050" : "#706050";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y + 4);
        ctx.lineTo(obj.x + obj.w + 8, obj.y + 4);
        ctx.stroke();
        break;
      }

      case "wall-painting": {
        if (obj.hidden) {
          // Draw as indistinct dark smudge
          ctx.fillStyle = "#201c18";
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        } else {
          // Revealed painting: warm pigment blocks
          ctx.fillStyle = "#6a5030";
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
          ctx.fillStyle = "#a07840";
          ctx.fillRect(obj.x + 4, obj.y + 4, obj.w - 8, obj.h * 0.55);
          ctx.fillStyle = "#4a3820";
          ctx.fillRect(obj.x + 4, obj.y + obj.h * 0.6, obj.w - 8, obj.h * 0.35);
          // Border
          ctx.strokeStyle = obj === nearObject ? "#f9d342" : "#c09050";
          ctx.lineWidth = 2;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        }
        break;
      }

      case "cartouche": {
        ctx.fillStyle = highlight;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Oval border (cartouche shape)
        ctx.strokeStyle = "#3e2f1f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(obj.x + obj.w / 2, obj.y + obj.h / 2, obj.w / 2, obj.h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (obj.inspectDone) {
          ctx.fillStyle = "#c0a050";
          ctx.font = "7px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(obj.nameFragment || "", obj.x + obj.w / 2, obj.y + obj.h / 2);
        }
        break;
      }

      case "cartouche-erased": {
        ctx.fillStyle = obj.restored ? "#9a8450" : (obj === nearObject ? "#7a6442" : highlight);
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = "#3e2f1f";
        ctx.lineWidth = 2;
        // Broken oval
        ctx.beginPath();
        ctx.ellipse(obj.x + obj.w / 2, obj.y + obj.h / 2, obj.w / 2, obj.h / 2, 0, 0, Math.PI * 2);
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        if (obj.restored) {
          ctx.fillStyle = "#f0d070";
          ctx.font = "7px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("ATEN", obj.x + obj.w / 2, obj.y + obj.h / 2);
        }
        break;
      }

      case "watcher-skull": {
        // Skull circle
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(obj.x + obj.w / 2, obj.y + obj.h / 2, obj.w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Painted arrow / star
        ctx.fillStyle = obj.inspectDone ? "#80c860" : "#c07030";
        ctx.font = `${obj.w * 0.7}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obj.facePainted, obj.x + obj.w / 2, obj.y + obj.h / 2 + 1);
        break;
      }

      case "offering-item":
      case "key-fragment":
      case "canopic-ring":
      case "canopic-seal": {
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(obj.x + obj.w / 2, obj.y + obj.h / 2, Math.min(obj.w, obj.h) / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c0a050";
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }

      default: {
        // altar, tablet, scroll, amulet, decoration, etc.
        ctx.fillStyle = highlight;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        break;
      }
    }

    ctx.restore();
  }
}

// =====================
// DRAW — PLAYER
// =====================
function drawPlayer() {
  ctx.fillStyle = "#f4f0de";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
  ctx.fill();

  if (player.heldItem?.type === "torch") {
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(player.x + 10, player.y - 4, 6, 12);
    if (player.lampOn) {
      ctx.fillStyle = "#ffc76c";
      ctx.beginPath();
      ctx.arc(player.x + 13, player.y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// =====================
// DRAW — LIGHTING
// =====================
function drawLighting() {
  // In the deep corridor, if the torch is mounted, use its position as the light source
  const inCorridor = currentRoom?.id === "deep-corridor";
  const useCorridorLight = inCorridor && corridorTorchMounted;

  const bracket = useCorridorLight
    ? currentRoom.objects.find(o => o.type === "bracket")
    : null;

  const lightX = bracket ? bracket.x + bracket.w / 2 : player.x;
  const lightY = bracket ? bracket.y + bracket.h / 2 : player.y;

  const baseRadius = (player.lampOn || useCorridorLight) ? 200 : 60;
  const pulse      = 1 + Math.sin(gameTime * 2.5) * 0.12;
  const radius     = baseRadius * pulse;
  const ambient    = (player.lampOn || useCorridorLight) ? 0.40 : 0.65;

  ctx.save();

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(0,0,0,${ambient})`;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.globalCompositeOperation = "lighter";

  // If corridor torch is mounted, draw both the bracket light and a smaller player light
  if (useCorridorLight) {
    const bracketLight = ctx.createRadialGradient(lightX, lightY, radius * 0.1, lightX, lightY, radius);
    bracketLight.addColorStop(0,   "rgba(255,230,170,0.30)");
    bracketLight.addColorStop(0.5, "rgba(255,200,120,0.12)");
    bracketLight.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = bracketLight;
    ctx.beginPath();
    ctx.arc(lightX, lightY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Small ambient halo around player so they aren't blind
    const playerHalo = ctx.createRadialGradient(player.x, player.y, 5, player.x, player.y, 60);
    playerHalo.addColorStop(0, "rgba(255,240,200,0.10)");
    playerHalo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = playerHalo;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 60, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const light = ctx.createRadialGradient(player.x, player.y, radius * 0.1, player.x, player.y, radius);
    light.addColorStop(0,   "rgba(255,240,200,0.25)");
    light.addColorStop(0.5, "rgba(255,210,140,0.10)");
    light.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// =====================
// GAME LOOP
// =====================
function loop() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Title screen takes over until dismissed
  if (titleScreenActive) {
    gameTime += 0.03;
    if (titleFadeOut) {
      titleAlpha = Math.max(0, titleAlpha - 0.03);
      if (titleAlpha <= 0) titleScreenActive = false;
    }
    drawTitleScreen();
    requestAnimationFrame(loop);
    return;
  }

  update();
  updateDoors();
  updateCamera();
  checkProximity();
  updateTorchPhysics();
  checkDoorTransition();   // before draw — room change applies this frame

  gameTime += 0.03;
  cameraState.zoom += (cameraState.targetZoom - cameraState.zoom) * 0.1;

  applyCameraTransform();

  drawTomb();
  drawObjects();
  drawPlayer();
  drawLighting();

  resetTransform();        // reset after world-space draw before HUD updates
  updateMapDot();

  requestAnimationFrame(loop);
}

// =====================
// BOOT
// =====================
updateUI();
loop();
