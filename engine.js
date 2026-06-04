// =====================
// ENGINE.JS — Enhanced Graphics
// =====================

// =====================
// ROOM FADE TRANSITION
// =====================
let roomFade = 0;
let roomFadingOut = false;
let roomFadingIn  = false;
let pendingDoor   = null;

// =====================
// SARCOPHAGUS ANIMATION
// =====================
let sarcophagusLidOffset = 0;
let mummySitProgress = 0;
let sarcOpenTriggered = false;

// =====================
// TITLE SCREEN
// =====================
let titleScreenActive = true;
let titleAlpha = 1;
let titleFadeOut = false;
let titleParticles = [];

function initTitleParticles() {
  titleParticles = [];
  for (let i = 0; i < 40; i++) {
    titleParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.5 + 0.1,
      drift: (Math.random() - 0.5) * 0.3
    });
  }
}
initTitleParticles();

function drawTitleScreen() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.save();
  ctx.globalAlpha = titleAlpha;

  // Deep background
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height) * 0.7);
  bgGrad.addColorStop(0,   "#0e0b07");
  bgGrad.addColorStop(0.5, "#080604");
  bgGrad.addColorStop(1,   "#040302");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Drifting dust particles
  for (const p of titleParticles) {
    p.x += p.drift;
    p.y -= p.speed;
    if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
    ctx.fillStyle = `rgba(194,168,107,${p.opacity * titleAlpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer glow behind the panel
  const panelW = Math.min(680, canvas.width - 60);
  const panelH = 400;
  const panelX = cx - panelW / 2;
  const panelY = cy - panelH / 2;

  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, panelW * 0.7);
  glowGrad.addColorStop(0,   `rgba(194,168,107,${0.06 * titleAlpha})`);
  glowGrad.addColorStop(0.5, `rgba(120,90,40,${0.04 * titleAlpha})`);
  glowGrad.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(panelX - 80, panelY - 80, panelW + 160, panelH + 160);

  // Panel background
  ctx.fillStyle = `rgba(12,9,5,${0.92 * titleAlpha})`;
  ctx.fillRect(panelX, panelY, panelW, panelH);

  // Outer border
  ctx.strokeStyle = `rgba(194,168,107,${0.7 * titleAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(panelX, panelY, panelW, panelH);
  // Inner border
  ctx.strokeStyle = `rgba(194,168,107,${0.25 * titleAlpha})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(panelX + 8, panelY + 8, panelW - 16, panelH - 16);

  // Corner ornaments
  const ornSize = 18;
  const corners = [
    [panelX + 4, panelY + 4], [panelX + panelW - 4, panelY + 4],
    [panelX + 4, panelY + panelH - 4], [panelX + panelW - 4, panelY + panelH - 4]
  ];
  ctx.fillStyle = `rgba(194,168,107,${0.6 * titleAlpha})`;
  ctx.font = `${ornSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [ox, oy] of corners) ctx.fillText("✦", ox, oy);

  // Top glyph bar
  const glyphBarY = panelY + 54;
  ctx.fillStyle = `rgba(194,168,107,${0.08 * titleAlpha})`;
  ctx.fillRect(panelX + 20, glyphBarY - 20, panelW - 40, 40);
  ctx.strokeStyle = `rgba(194,168,107,${0.2 * titleAlpha})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(panelX + 20, glyphBarY - 20, panelW - 40, 40);

  ctx.fillStyle = `rgba(240,208,112,${0.85 * titleAlpha})`;
  ctx.font = "26px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("𓂀   𓄿   𓈖   𓏏   𓊪", cx, glyphBarY);

  // Decorative line below glyph bar
  ctx.strokeStyle = `rgba(194,168,107,${0.3 * titleAlpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 120, panelY + 90); ctx.lineTo(cx + 120, panelY + 90);
  ctx.stroke();

  // Main title
  const titleSize = Math.min(58, panelW / 9);
  ctx.font = `700 ${titleSize}px 'Cinzel Decorative', 'Cinzel', Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Shadow
  ctx.fillStyle = `rgba(0,0,0,${0.5 * titleAlpha})`;
  ctx.fillText("BOOK OF THE DEAD", cx + 2, cy - 18 + 2);
  // Gold gradient text
  const titleGrad = ctx.createLinearGradient(cx - 200, cy - 38, cx + 200, cy + 2);
  titleGrad.addColorStop(0,   `rgba(240,215,140,${titleAlpha})`);
  titleGrad.addColorStop(0.4, `rgba(255,240,180,${titleAlpha})`);
  titleGrad.addColorStop(0.6, `rgba(220,185,100,${titleAlpha})`);
  titleGrad.addColorStop(1,   `rgba(194,158,80,${titleAlpha})`);
  ctx.fillStyle = titleGrad;
  ctx.fillText("BOOK OF THE DEAD", cx, cy - 18);

  // Subtitle
  ctx.font = `italic ${Math.min(16, panelW / 36)}px 'IM Fell English', Georgia, serif`;
  ctx.fillStyle = `rgba(200,180,140,${0.75 * titleAlpha})`;
  ctx.fillText("A Tomb of Glyphs, Rituals, and Forgotten Names", cx, cy + 26);

  // Decorative rule
  ctx.strokeStyle = `rgba(194,168,107,${0.35 * titleAlpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 100, cy + 50); ctx.lineTo(cx + 100, cy + 50);
  ctx.stroke();
  ctx.fillStyle = `rgba(194,168,107,${0.5 * titleAlpha})`;
  ctx.font = "14px serif";
  ctx.fillText("✦", cx, cy + 50);

  // Controls legend
  const legendY = panelY + panelH - 90;
  ctx.fillStyle = `rgba(120,100,60,${0.4 * titleAlpha})`;
  ctx.fillRect(panelX + 60, legendY - 12, panelW - 120, 52);
  ctx.font = `11px 'Cinzel', serif`;
  ctx.fillStyle = `rgba(194,168,107,${0.55 * titleAlpha})`;
  ctx.letterSpacing = "0.1em";
  ctx.fillText("WASD · Move      E · Inspect      X · Pick up      L · Light torch      M · Map", cx, legendY + 8);
  ctx.font = `10px 'Cinzel', serif`;
  ctx.fillText("E · Inspect ushabti for guidance      V · Glyph Codex      Q · Cycle items", cx, legendY + 30);

  // Pulse prompt
  const pulse = 0.55 + Math.sin(gameTime * 2.5) * 0.45;
  ctx.font = `14px 'Cinzel', serif`;
  ctx.fillStyle = `rgba(240,215,140,${titleAlpha * pulse})`;
  ctx.fillText("PRESS  ENTER  OR  SPACE  TO  BEGIN", cx, panelY + panelH - 22);

  ctx.restore();
}

function startGame() {
  titleFadeOut = true;
}

// =====================
// INPUT
// =====================
window.addEventListener("keydown", (e) => {
  if (titleScreenActive && (e.key === "Enter" || e.key === " ")) {
    startGame(); return;
  }
  if (titleScreenActive) return;

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
      ["torch","rosetta","scroll","amulet","offering-item","key-fragment","canopic-ring","canopic-seal"].includes(nearObject.type) &&
      !nearObject.pickedUp
    ) {
      addToInventory(nearObject);
    } else if (inventory.length > 0) {
      dropActiveItem();
    }
  }

  // MOUNT TORCH
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

  if (k === "q") cycleInventory(1);

  if (k === "m") {
    if (!mapUnlocked) return;
    toggleMap();
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

  if (player.isMoving) player.walkFrame += 0.18;

  nextX = Math.max(0, Math.min(world.width  - player.size, nextX));
  nextY = Math.max(0, Math.min(world.height - player.size, nextY));

  const moveX = nextX - player.x;
  const moveY = nextY - player.y;

  const isSolid = (obj) => {
    if (obj.pickedUp) return false;
    if (obj.type === "torch") return false;
    if (obj.type === "door" && !obj.locked) return false;
    if (obj.type === "decoration") return false;
    if (obj.type === "niche") return false;
    if (obj.type === "wall-painting") return false;
    return true;
  };

  let blockedX = false, blockedY = false;
  const pBox = { w: player.size, h: player.size };
  for (const obj of getCurrentObjects()) {
    if (!isSolid(obj)) continue;
    if (isColliding({ x: nextX, y: player.y, ...pBox }, obj)) blockedX = true;
    if (isColliding({ x: player.x, y: nextY, ...pBox }, obj)) blockedY = true;
  }
  if (blockedX) nextX = player.x;
  if (blockedY) nextY = player.y;
  if (blockedX && blockedY) return;

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp || obj.type !== "torch") continue;
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

// =====================
// DOOR ANIMATION
// =====================
function updateDoors() {
  for (const obj of getCurrentObjects()) {
    if (obj.type !== "door" || !obj.opening) continue;
    obj.openProgress += 0.05;
    if (obj.openProgress >= 1) { obj.openProgress = 1; obj.opening = false; obj.opened = true; }
  }
}

function checkDoorTransition() {
  for (const obj of getCurrentObjects()) {
    if (obj.type !== "door" || obj.locked) continue;
    const dx = player.x - (obj.x + obj.w / 2);
    const dy = player.y - (obj.y + obj.h / 2);
    if (Math.sqrt(dx * dx + dy * dy) < 25) { transitionRoom(obj); return; }
  }
}

// =====================
// SARCOPHAGUS OPEN ANIMATION
// =====================
function checkSarcophagusOpen() {
  if (sarcOpenTriggered) return;
  if (currentRoom?.id !== "burial-chamber") return;
  const objectives = currentRoom.objectives;
  if (!objectives || !objectives.every(o => o.done)) return;

  // All burial chamber objectives complete — open the sarcophagus
  sarcOpenTriggered = true;
  const sarc = currentRoom.objects.find(o => o.type === "sarcophagus");
  if (sarc) {
    sarc.opening = true;
    sarc.opened  = false;
  }
}

function updateSarcophagus() {
  const sarc = currentRoom?.objects?.find(o => o.type === "sarcophagus");
  if (!sarc || !sarc.opening) return;

  // Phase 1: lid slides off (0 → 60 over ~90 frames)
  if (sarcophagusLidOffset < 60) {
    sarcophagusLidOffset = Math.min(60, sarcophagusLidOffset + 0.67);
  } else if (!sarc.opened) {
    sarc.opened = true;
    sarc.opening = false;
    _invalidateBgCache();
  }

  // Phase 2: mummy sits up after lid is mostly gone
  if (sarcophagusLidOffset > 30 && mummySitProgress < 1) {
    mummySitProgress = Math.min(1, mummySitProgress + 0.008);
  }
}

function transitionRoom(door) {
  if (!door || door.locked) return;
  if (roomFadingOut || roomFadingIn) return; // already transitioning
  pendingDoor = door;
  roomFadingOut = true;
}

function _doRoomTransition(door) {
  const nextRoom = rooms.find(r => r.id === door.leadsTo);
  if (!nextRoom) return;
  currentRoom = nextRoom;
  _invalidateBgCache();
  currentRoom.visited = true;
  syncObjectivesFromGameState();
  // Reset sarcophagus animation state when leaving/entering burial chamber
  if (nextRoom.id === "burial-chamber") {
    const sarc = currentRoom.objects.find(o => o.type === "sarcophagus");
    if (sarc && !sarcOpenTriggered) { sarcophagusLidOffset = 0; mummySitProgress = 0; }
  }
  const matchingDoor = currentRoom.objects.find(obj => obj.type === "door" && obj.pairId === door.pairId);
  if (matchingDoor) {
    const cx = matchingDoor.x + matchingDoor.w / 2;
    const cy = matchingDoor.y + matchingDoor.h / 2;
    if (matchingDoor.direction === "left")  { player.x = matchingDoor.x + matchingDoor.w + 20; player.y = cy; }
    if (matchingDoor.direction === "right") { player.x = matchingDoor.x - 20; player.y = cy; }
    if (matchingDoor.direction === "up")    { player.x = cx; player.y = matchingDoor.y + matchingDoor.h + 20; }
    if (matchingDoor.direction === "down")  { player.x = cx; player.y = matchingDoor.y - 20; }
  }
  updateUI();
  if (mapVisible) renderMap();
}

function updateRoomFade() {
  if (roomFadingOut) {
    roomFade = Math.min(1, roomFade + 0.07);
    if (roomFade >= 1 && pendingDoor) {
      _doRoomTransition(pendingDoor);
      pendingDoor   = null;
      roomFadingOut = false;
      roomFadingIn  = true;
    }
  } else if (roomFadingIn) {
    roomFade = Math.max(0, roomFade - 0.055);
    if (roomFade <= 0) roomFadingIn = false;
  }
}

function drawRoomFade() {
  if (roomFade <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(0,0,0,${roomFade})`;
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.restore();
}
function updateTorchPhysics() {
  for (const obj of getCurrentObjects()) {
    if (!obj || obj.type !== "torch" || obj.pickedUp) continue;
    obj.x += obj.vx; obj.y += obj.vy;
    obj.vx *= obj.friction; obj.vy *= obj.friction;
    if (obj.x < 0) { obj.x = 0; obj.vx *= -0.5; }
    if (obj.x + obj.w > world.width)  { obj.x = world.width - obj.w; obj.vx *= -0.5; }
    if (obj.y < 0) { obj.y = 0; obj.vy *= -0.5; }
    if (obj.y + obj.h > world.height) { obj.y = world.height - obj.h; obj.vy *= -0.5; }
    for (const other of getCurrentObjects()) {
      if (other === obj || other.type === "torch" || other.pickedUp) continue;
      if (obj.x < other.x + other.w && obj.x + obj.w > other.x &&
          obj.y < other.y + other.h && obj.y + obj.h > other.y) {
        const dx = (obj.x + obj.w/2) - (other.x + other.w/2);
        const dy = (obj.y + obj.h/2) - (other.y + other.h/2);
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        obj.vx += (dx/len)*0.5; obj.vy += (dy/len)*0.5;
      }
    }
  }
}

function checkProximity() {
  nearObject = null;
  const range = 44;
  let bestObject = null, bestDist = Infinity;
  const pickupPriority = ["key-fragment","canopic-ring","canopic-seal","torch","rosetta","scroll","amulet","offering-item"];

  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp || obj.hidden) continue;
    const dx = player.x - (obj.x + obj.w / 2);
    const dy = player.y - (obj.y + obj.h / 2);
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist >= range) continue;
    const cp = pickupPriority.indexOf(obj.type) !== -1 ? pickupPriority.indexOf(obj.type) : 999;
    const bp = bestObject && pickupPriority.indexOf(bestObject.type) !== -1 ? pickupPriority.indexOf(bestObject.type) : 999;
    if (cp < bp || (cp === bp && dist < bestDist)) { bestObject = obj; bestDist = dist; }
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
    targetX = f.x + f.w/2 - canvas.width/(2*zoom);
    targetY = f.y + f.h/2 - canvas.height/(2*zoom);
  } else {
    targetX = player.x + player.size/2 - canvas.width/(2*zoom);
    targetY = player.y + player.size/2 - canvas.height/(2*zoom);
  }
  camera.x = targetX; camera.y = targetY;
}

function applyCameraTransform() {
  const zoom = cameraState.zoom;
  ctx.setTransform(zoom, 0, 0, zoom, -camera.x * zoom, -camera.y * zoom);
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// =====================
// DRAW — WORLD / ROOM ENVIRONMENT
// =====================
// =====================
// LIGHTING GRADIENT CACHE
// Rebuild radial gradients only when position changes >2px or lamp state changes.
// =====================
let _lgCache = {
  key: null,
  mainGrad: null,
  flickerGrad: null,
  bracketGrad: null,
  bracketFlicker: null,
  playerHalo: null,
};

function _lgKey(px, py, lampOn, corridorLight, lx, ly, radius) {
  return `${Math.round(px/2)*2},${Math.round(py/2)*2},${lampOn?1:0},${corridorLight?1:0},${Math.round(lx/2)*2},${Math.round(ly/2)*2},${Math.round(radius)}`;
}

// =====================
// OFFSCREEN BACKGROUND CACHE
// Pre-render the static room background once per room transition.
// Each frame just drawImage() instead of re-stroking ~200 primitives.
// =====================
let _bgCanvas = null;
let _bgCtx    = null;
let _bgRoomId = null; // which room is currently cached

function _invalidateBgCache() {
  _bgRoomId = null;
}

function _ensureBgCanvas() {
  if (!_bgCanvas || _bgCanvas.width !== world.width || _bgCanvas.height !== world.height) {
    _bgCanvas = document.createElement("canvas");
    _bgCanvas.width  = world.width;
    _bgCanvas.height = world.height;
    _bgCtx = _bgCanvas.getContext("2d");
    _bgRoomId = null; // force redraw after resize
  }
}

function _drawRoomBgToContext(c, roomId) {
  const roomThemes = {
    "burial-chamber":  { floor: "#2e2820", ceiling: "#1a1610", wall: "#252018", accent: "#3d3428" },
    "right-room":      { floor: "#28231c", ceiling: "#181410", wall: "#221d17", accent: "#38301f" },
    "bottom-room":     { floor: "#1e1c16", ceiling: "#141210", wall: "#1c1a14", accent: "#2a2820" },
    "west-hall":       { floor: "#2a2318", ceiling: "#181410", wall: "#241e16", accent: "#3a3020" },
    "north-vestibule": { floor: "#26201a", ceiling: "#16120e", wall: "#221c16", accent: "#382e20" },
    "east-gallery":    { floor: "#2c2518", ceiling: "#1a1610", wall: "#26201a", accent: "#3c3020" },
    "deep-corridor":   { floor: "#1c1812", ceiling: "#0e0c08", wall: "#18150e", accent: "#28220e" },
    "ossuary":         { floor: "#201c18", ceiling: "#100e0c", wall: "#1c1916", accent: "#2c2820" },
    "inner-sanctum":   { floor: "#1e1a14", ceiling: "#0c0a08", wall: "#1a1610", accent: "#3a2e18" },
  };
  const theme = roomThemes[roomId] || roomThemes["burial-chamber"];

  // Ceiling band
  c.fillStyle = theme.ceiling;
  c.fillRect(0, 0, world.width, 70);

  // Floor band
  c.fillStyle = theme.floor;
  c.fillRect(0, 0, world.width, world.height);

  // Mid wall band
  c.fillStyle = theme.wall;
  c.fillRect(0, 0, world.width, world.height * 0.55);

  // Stone block grid
  c.strokeStyle = "rgba(0,0,0,0.22)";
  c.lineWidth = 1;
  for (let y = 0; y < world.height; y += 50) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(world.width, y); c.stroke();
  }
  for (let row = 0; row < world.height / 50; row++) {
    const offset = (row % 2) * 40;
    for (let x = offset; x < world.width; x += 80) {
      c.beginPath();
      c.moveTo(x, row * 50);
      c.lineTo(x, row * 50 + 50);
      c.stroke();
    }
  }

  // Ceiling decorative band
  c.fillStyle = "rgba(194,168,107,0.06)";
  c.fillRect(0, 60, world.width, 10);
  c.strokeStyle = "rgba(194,168,107,0.14)";
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, 60); c.lineTo(world.width, 60); c.stroke();
  c.beginPath(); c.moveTo(0, 70); c.lineTo(world.width, 70); c.stroke();

  // Floor skirting line
  c.strokeStyle = "rgba(194,168,107,0.1)";
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(0, world.height - 40); c.lineTo(world.width, world.height - 40); c.stroke();

  // Room-specific environment
  drawRoomEnvironment(roomId, theme, c);
}

function drawTomb() {
  const roomId = currentRoom?.id || "burial-chamber";

  _ensureBgCanvas();

  // Only re-render to the offscreen canvas when the room changes
  if (_bgRoomId !== roomId) {
    _bgCtx.clearRect(0, 0, world.width, world.height);
    _drawRoomBgToContext(_bgCtx, roomId);
    _bgRoomId = roomId;
  }

  // Blit the cached background — one drawImage instead of ~200 primitives
  ctx.drawImage(_bgCanvas, 0, 0);
}

function drawRoomEnvironment(roomId, theme, c) {
  if (!c) c = ctx; // fallback to global ctx when called from drawTomb (offscreen path always passes c)
  // Ceiling hieroglyph border strip
  c.save();
  c.globalAlpha = 0.28;
  c.fillStyle = "#c2a86b";
  c.font = "11px serif";
  c.textBaseline = "middle";
  const glyphs = ["𓂀","𓄿","𓈖","𓏏","𓊪","𓇋","𓏌","𓎛","𓁹","𓋴","𓂧","𓏥"];
  for (let x = 14; x < world.width - 14; x += 22) {
    const g = glyphs[(Math.floor(x / 22) + (roomId.charCodeAt(0) || 0)) % glyphs.length];
    c.fillText(g, x, 34);
  }
  c.restore();

  if (roomId === "burial-chamber") {
    // Large decorative columns
    drawColumn(c, 80, 90, 24, 360);
    drawColumn(c, 695, 90, 24, 360);
    // Altar dais in center background
    c.fillStyle = "rgba(50,42,30,0.6)";
    c.fillRect(220, 88, 360, 8);
    // Wall frieze strips
    drawFriezeStrip(c, 0, 75, world.width, 14);
    drawFriezeStrip(c, 0, world.height - 52, world.width, 12);
    // Floor lotus pattern hint
    c.save();
    c.globalAlpha = 0.07;
    c.strokeStyle = "#c2a86b";
    c.lineWidth = 1;
    for (let x = 80; x < world.width - 80; x += 100) {
      c.beginPath();
      c.arc(x, world.height - 20, 18, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(x, world.height - 20, 10, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();

  } else if (roomId === "west-hall") {
    drawColumn(c, 60, 90, 20, 360);
    drawColumn(c, 720, 90, 20, 360);
    drawFriezeStrip(c, 0, 75, world.width, 14);
    // Ritual basin decoration on floor
    c.save();
    c.globalAlpha = 0.12;
    c.strokeStyle = "#8a7050";
    c.lineWidth = 2;
    c.strokeRect(220, 350, 360, 80);
    c.strokeRect(228, 358, 344, 64);
    c.restore();

  } else if (roomId === "north-vestibule") {
    drawColumn(c, 50, 90, 18, 360);
    drawColumn(c, 730, 90, 18, 360);
    drawFriezeStrip(c, 0, 75, world.width, 14);
    // Offering alcove niches on back wall
    for (const nx of [120, 340, 560]) {
      c.fillStyle = "rgba(20,14,8,0.5)";
      c.fillRect(nx, 80, 60, 50);
      c.strokeStyle = "rgba(194,168,107,0.15)";
      c.lineWidth = 1;
      c.strokeRect(nx, 80, 60, 50);
    }

  } else if (roomId === "right-room") {
    drawFriezeStrip(c, 0, 75, world.width, 10);
    drawFriezeStrip(c, 0, world.height - 50, world.width, 10);
    // Carved wall reliefs
    for (const rx of [60, 660]) {
      c.save();
      c.globalAlpha = 0.12;
      c.fillStyle = "#8a7050";
      c.fillRect(rx, 100, 50, 200);
      c.strokeStyle = "#c2a86b";
      c.lineWidth = 1;
      c.strokeRect(rx, 100, 50, 200);
      c.font = "10px serif";
      c.fillStyle = "#c2a86b";
      c.textAlign = "center";
      c.textBaseline = "top";
      for (let gy = 110; gy < 290; gy += 22) {
        c.fillText(glyphs[(Math.floor(gy/22) + 3) % glyphs.length], rx + 25, gy);
      }
      c.restore();
    }

  } else if (roomId === "bottom-room") {
    drawColumn(c, 70, 90, 20, 360);
    drawColumn(c, 710, 90, 20, 360);
    drawFriezeStrip(c, 0, 75, world.width, 12);
    // Thick darkness overlay at sides (deep sepulcher feel)
    c.save();
    const lg = c.createLinearGradient(0, 0, 100, 0);
    lg.addColorStop(0, "rgba(0,0,0,0.45)"); lg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = lg;
    c.fillRect(0, 0, 100, world.height);
    const rg = c.createLinearGradient(world.width - 100, 0, world.width, 0);
    rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.45)");
    c.fillStyle = rg;
    c.fillRect(world.width - 100, 0, 100, world.height);
    c.restore();

  } else if (roomId === "east-gallery") {
    drawFriezeStrip(c, 0, 75, world.width, 14);
    // Gallery pilasters
    for (const px of [40, 200, 400, 600, 755]) {
      c.fillStyle = "rgba(50,42,28,0.7)";
      c.fillRect(px, 70, 12, 360);
      c.strokeStyle = "rgba(194,168,107,0.18)";
      c.lineWidth = 1;
      c.strokeRect(px, 70, 12, 360);
    }
    // Floor mosaic center line
    c.save();
    c.globalAlpha = 0.12;
    c.strokeStyle = "#c2a86b";
    c.lineWidth = 1.5;
    c.setLineDash([8, 6]);
    c.beginPath();
    c.moveTo(60, world.height - 30);
    c.lineTo(world.width - 60, world.height - 30);
    c.stroke();
    c.setLineDash([]);
    c.restore();

  } else if (roomId === "deep-corridor") {
    // Low ceiling — heavier ceiling band
    c.fillStyle = "rgba(0,0,0,0.35)";
    c.fillRect(0, 0, world.width, 90);
    // Narrow corridor walls — darkness on sides
    c.save();
    const lg2 = c.createLinearGradient(0, 0, 140, 0);
    lg2.addColorStop(0, "rgba(0,0,0,0.65)"); lg2.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = lg2;
    c.fillRect(0, 0, 140, world.height);
    const rg2 = c.createLinearGradient(world.width - 140, 0, world.width, 0);
    rg2.addColorStop(0, "rgba(0,0,0,0)"); rg2.addColorStop(1, "rgba(0,0,0,0.65)");
    c.fillStyle = rg2;
    c.fillRect(world.width - 140, 0, 140, world.height);
    c.restore();
    // Soot streaks
    c.save();
    c.globalAlpha = 0.15;
    c.fillStyle = "#000";
    for (let x = 100; x < 650; x += 80) {
      c.fillRect(x, 70, 20, 30 + Math.sin(x) * 10);
    }
    c.restore();
    drawFriezeStrip(c, 0, 75, world.width, 8);

  } else if (roomId === "inner-sanctum") {
    // Tiny sealed chamber — ornate walls, perfectly preserved paint
    c.save();
    // Rich painted panels on each wall
    c.globalAlpha = 0.18;
    c.fillStyle = "#c2a86b";
    c.fillRect(10, 65, world.width - 20, 16);  // top frieze
    c.fillRect(10, world.height - 65, world.width - 20, 16);  // bottom frieze
    c.fillRect(10, 65, 16, world.height - 130);  // left pillar
    c.fillRect(world.width - 26, 65, 16, world.height - 130);  // right pillar
    c.restore();
    drawFriezeStrip(c, 0, 62, world.width, 18);
    drawFriezeStrip(c, 0, world.height - 80, world.width, 18);
    // Votive candles — small warm glows along the walls
    c.save();
    c.globalAlpha = 0.08;
    for (const cx2 of [60, 160, 260, 540, 640, 740]) {
      const cg2 = c.createRadialGradient(cx2, world.height - 50, 0, cx2, world.height - 50, 30);
      cg2.addColorStop(0, "#f0c860"); cg2.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = cg2; c.fillRect(cx2 - 30, world.height - 80, 60, 60);
    }
    c.restore();
    // Offering petals scatter
    c.save();
    c.globalAlpha = 0.1;
    c.fillStyle = "#c8303a";
    for (let i = 0; i < 12; i++) {
      const px = 200 + (i * 37) % 400;
      const py = 320 + (i * 19) % 80;
      c.beginPath(); c.ellipse(px, py, 3, 5, i * 0.5, 0, Math.PI*2); c.fill();
    }
    c.restore();

  } else if (roomId === "ossuary") {
    // Skull alcove walls on sides
    drawFriezeStrip(c, 0, 75, world.width, 10);
    // Stack of skulls background texture on walls
    c.save();
    c.globalAlpha = 0.1;
    c.font = "14px serif";
    c.fillStyle = "#a09080";
    c.textAlign = "center";
    for (let x = 30; x < 120; x += 20) {
      for (let y = 80; y < 380; y += 20) {
        c.fillText("☽", x, y);
      }
    }
    for (let x = 680; x < 770; x += 20) {
      for (let y = 80; y < 380; y += 20) {
        c.fillText("☽", x, y);
      }
    }
    c.restore();
    // Vaulted ceiling arc
    c.save();
    c.globalAlpha = 0.12;
    c.strokeStyle = "#c2a86b";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(world.width / 2, -120, world.width * 0.6, 0, Math.PI);
    c.stroke();
    c.restore();
  }
}

function drawColumn(c, x, y, radius, height) {
  // Shadow
  c.fillStyle = "rgba(0,0,0,0.35)";
  c.fillRect(x - radius + 3, y, radius * 2, height);
  // Shaft
  const cg = c.createLinearGradient(x - radius, 0, x + radius, 0);
  cg.addColorStop(0, "#28221a");
  cg.addColorStop(0.3, "#3e3428");
  cg.addColorStop(0.7, "#4a3e30");
  cg.addColorStop(1, "#282218");
  c.fillStyle = cg;
  c.fillRect(x - radius, y, radius * 2, height);
  // Capital top
  c.fillStyle = "#3a3025";
  c.fillRect(x - radius - 4, y, radius * 2 + 8, 14);
  c.fillStyle = "#2a221a";
  c.fillRect(x - radius - 2, y + 14, radius * 2 + 4, 6);
  // Base
  c.fillStyle = "#3a3025";
  c.fillRect(x - radius - 4, y + height - 14, radius * 2 + 8, 14);
  // Highlight line
  c.strokeStyle = "rgba(194,168,107,0.12)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x - radius + 3, y + 14);
  c.lineTo(x - radius + 3, y + height - 14);
  c.stroke();
}

function drawFriezeStrip(c, x, y, w, h) {
  c.fillStyle = "rgba(194,168,107,0.07)";
  c.fillRect(x, y, w, h);
  c.strokeStyle = "rgba(194,168,107,0.18)";
  c.lineWidth = 1;
  c.strokeRect(x, y, w, h);
  // Mini glyph pattern inside
  c.save();
  c.globalAlpha = 0.25;
  c.fillStyle = "#c2a86b";
  c.font = `${h - 3}px serif`;
  c.textBaseline = "middle";
  const symbols = ["𓂀","𓄿","𓈖","𓏏","𓊪","𓇋","𓎛","𓁹"];
  for (let px = x + 8; px < x + w - 8; px += h + 6) {
    const sym = symbols[Math.floor(px / (h + 6)) % symbols.length];
    c.fillText(sym, px, y + h / 2);
  }
  c.restore();
}

// =====================
// DRAW — OBJECTS (enhanced)
// =====================
function drawObjects() {
  for (const obj of getCurrentObjects()) {
    if (obj.pickedUp) continue;
    ctx.save();

    const isNear = obj === nearObject;
    const pulse  = isNear ? (0.88 + Math.sin(gameTime * 1.2) * 0.12) : 1;

    switch (obj.type) {

      case "sarcophagus": {
        // Top-down view of sarcophagus lid, based on real Egyptian coffins.
        // Lid is elongated oval/rectangular — head end at obj.x, feet at obj.x+obj.w
        // We orient it horizontally (the game's world is top-down)
        const sw = obj.w, sh = obj.h;
        const lx = obj.x, ly = obj.y;
        const cx2 = lx + sw / 2, cy2 = ly + sh / 2;

        // ── drop shadow ────────────────────────────────────────────
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.ellipse(cx2 + 4, cy2 + 4, sw*0.5, sh*0.52, 0, 0, Math.PI*2);
        ctx.fill();

        // ── body box (under lid) ───────────────────────────────────
        ctx.fillStyle = "#3a2e18";
        ctx.beginPath();
        ctx.ellipse(cx2, cy2, sw*0.49, sh*0.5, 0, 0, Math.PI*2);
        ctx.fill();

        // ── LID — slides left (head end) as sarcophagusLidOffset increases
        ctx.save();
        ctx.translate(-sarcophagusLidOffset * 0.8, -sarcophagusLidOffset * 0.2);

        // Lid base color — aged cream/linen with gold tones (like image 3)
        // or rich gold/blue for royal style (image 4)
        const lidBase = ctx.createLinearGradient(lx, ly, lx+sw, ly+sh);
        lidBase.addColorStop(0,    "#c8b878");
        lidBase.addColorStop(0.15, "#e8d898");
        lidBase.addColorStop(0.4,  "#f5edb8");
        lidBase.addColorStop(0.65, "#e0d090");
        lidBase.addColorStop(0.85, "#c8b870");
        lidBase.addColorStop(1,    "#a89050");
        ctx.fillStyle = lidBase;
        ctx.beginPath();
        ctx.ellipse(cx2, cy2, sw*0.48, sh*0.48, 0, 0, Math.PI*2);
        ctx.fill();

        // ── FACE MASK — head end (left side, obj.x area) ──────────
        // Face occupies ~top 28% of the lid length
        const faceEndX = lx + sw * 0.28;
        const faceCX   = lx + sw * 0.16;
        const faceCY   = cy2;
        const faceRX   = sh * 0.41; // half-width of face oval
        const faceRY   = sw * 0.12; // half-height of face oval (portrait in top-down)

        // Skin tone — terracotta/sandstone (image 3) or gold (image 4)
        const faceG = ctx.createLinearGradient(faceCX - faceRX, faceCY, faceCX + faceRX, faceCY);
        faceG.addColorStop(0, "#c09858");
        faceG.addColorStop(0.3, "#e0b870");
        faceG.addColorStop(0.6, "#f0ca80");
        faceG.addColorStop(1, "#c09858");
        ctx.fillStyle = faceG;
        ctx.beginPath();
        ctx.ellipse(faceCX + faceRY, faceCY, faceRX * 0.82, faceRX, Math.PI/2, 0, Math.PI*2);
        ctx.fill();

        // Kohl eye lines — the defining feature, highly stylized
        ctx.strokeStyle = "#1a0e06"; ctx.lineWidth = sh * 0.055;
        ctx.lineCap = "round";
        // Left eye (top in top-down)
        const eyeY1 = cy2 - sh * 0.16;
        ctx.beginPath();
        ctx.moveTo(lx + sw*0.08, eyeY1);
        ctx.lineTo(lx + sw*0.22, eyeY1);
        ctx.stroke();
        // Right eye
        const eyeY2 = cy2 + sh * 0.16;
        ctx.beginPath();
        ctx.moveTo(lx + sw*0.08, eyeY2);
        ctx.lineTo(lx + sw*0.22, eyeY2);
        ctx.stroke();
        ctx.lineCap = "butt";
        // Eye whites
        ctx.fillStyle = "#e8dfc0";
        ctx.beginPath(); ctx.ellipse(lx+sw*0.15, eyeY1, sh*0.075, sh*0.048, Math.PI/2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(lx+sw*0.15, eyeY2, sh*0.075, sh*0.048, Math.PI/2, 0, Math.PI*2); ctx.fill();
        // Pupils
        ctx.fillStyle = "#1a0e06";
        ctx.beginPath(); ctx.arc(lx+sw*0.15, eyeY1, sh*0.028, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(lx+sw*0.15, eyeY2, sh*0.028, 0, Math.PI*2); ctx.fill();

        // ── NEMES HEADDRESS — striped bands flanking face ──────────
        // In top-down view: stripes run perpendicular to the lid axis
        // Blue and gold alternating bands (images 3 & 4)
        const nemesStartX = lx + sw * 0.02;
        const nemesEndX   = lx + sw * 0.30;
        const stripeColors = ["#2848a0","#c8a030","#2848a0","#c8a030","#2848a0","#c8a030","#2848a0","#c8a030","#d8c878"];
        const stripeW = (nemesEndX - nemesStartX) / stripeColors.length;
        for (let si = 0; si < stripeColors.length; si++) {
          const sx = nemesStartX + si * stripeW;
          // Clip to lid ellipse region
          ctx.fillStyle = stripeColors[si];
          ctx.globalAlpha = 0.65;
          // Top half stripe
          ctx.fillRect(sx, ly + sh*0.02, stripeW + 0.5, sh * 0.35);
          // Bottom half stripe
          ctx.fillRect(sx, ly + sh * 0.63, stripeW + 0.5, sh * 0.35);
          ctx.globalAlpha = 1;
        }
        // Gold border on nemes
        ctx.strokeStyle = "rgba(194,168,107,0.5)"; ctx.lineWidth = 0.5;
        for (let si = 0; si < stripeColors.length; si++) {
          const sx = nemesStartX + si * stripeW;
          ctx.beginPath(); ctx.moveTo(sx, ly + sh*0.02); ctx.lineTo(sx, ly + sh*0.37); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx, ly + sh*0.63); ctx.lineTo(sx, ly + sh*0.98); ctx.stroke();
        }

        // ── USEKH COLLAR below face ────────────────────────────────
        const collarX = lx + sw * 0.25;
        const collarW = sw * 0.16;
        // Concentric arc bands
        const colColors = ["#2848a0","#c8a030","#c03020","#2848a0","#c8a030"];
        for (let ci = 0; ci < colColors.length; ci++) {
          ctx.strokeStyle = colColors[ci];
          ctx.lineWidth = sh * 0.042;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(collarX, cy2, sh*(0.18 + ci*0.055), -Math.PI*0.55, Math.PI*0.55);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // ── WINGED VULTURE / SCARAB PECTORAL in upper body section ──
        const pectX = lx + sw * 0.42;
        const pectY = cy2;
        const pw    = sh * 0.38;
        // Wings spread horizontally across the lid
        ctx.fillStyle = "rgba(194,168,107,0.5)";
        ctx.beginPath();
        ctx.moveTo(pectX - pw*0.05, pectY);
        ctx.quadraticCurveTo(pectX - pw*0.4, pectY - sh*0.22, pectX - pw*0.5, pectY);
        ctx.quadraticCurveTo(pectX - pw*0.4, pectY + sh*0.22, pectX - pw*0.05, pectY);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(pectX + pw*0.05, pectY);
        ctx.quadraticCurveTo(pectX + pw*0.4, pectY - sh*0.22, pectX + pw*0.5, pectY);
        ctx.quadraticCurveTo(pectX + pw*0.4, pectY + sh*0.22, pectX + pw*0.05, pectY);
        ctx.fill();
        // Wing feather lines
        ctx.strokeStyle = "rgba(140,110,40,0.45)"; ctx.lineWidth = 0.6;
        for (let f = 1; f < 5; f++) {
          ctx.beginPath(); ctx.moveTo(pectX - pw*0.05, pectY - sh*0.03*f); ctx.lineTo(pectX - pw*(0.1+f*0.1), pectY - sh*0.04*f); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pectX + pw*0.05, pectY - sh*0.03*f); ctx.lineTo(pectX + pw*(0.1+f*0.1), pectY - sh*0.04*f); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pectX - pw*0.05, pectY + sh*0.03*f); ctx.lineTo(pectX - pw*(0.1+f*0.1), pectY + sh*0.04*f); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pectX + pw*0.05, pectY + sh*0.03*f); ctx.lineTo(pectX + pw*(0.1+f*0.1), pectY + sh*0.04*f); ctx.stroke();
        }

        // ── DECORATIVE BANDS in lower body section ─────────────────
        // Horizontal bands of color running across the lower 55% of lid
        const bandStartX = lx + sw * 0.53;
        const bandW      = sw * 0.42;
        const bodyBands  = [
          { col: "rgba(40,72,160,0.45)", h: 0.09 },
          { col: "rgba(194,168,107,0.30)", h: 0.05 },
          { col: "rgba(192,48,32,0.38)", h: 0.08 },
          { col: "rgba(194,168,107,0.28)", h: 0.04 },
          { col: "rgba(40,72,160,0.38)", h: 0.08 },
          { col: "rgba(194,168,107,0.28)", h: 0.04 },
          { col: "rgba(70,120,60,0.35)", h: 0.08 },
        ];
        let bandY = ly + sh * 0.12;
        for (const band of bodyBands) {
          ctx.fillStyle = band.col;
          ctx.fillRect(bandStartX, bandY, bandW * 0.88, sh * band.h);
          bandY += sh * band.h + sh * 0.005;
        }
        // Hieroglyph column in center of lower body
        ctx.fillStyle = "rgba(194,168,107,0.4)";
        ctx.font = `${sh * 0.1}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const bodyGlyphs = ["𓂀","𓄿","𓈖","𓊪","𓇋","𓁹","𓏏","𓂧"];
        for (let gi = 0; gi < bodyGlyphs.length; gi++) {
          ctx.fillText(bodyGlyphs[gi], lx + sw*0.72, ly + sh*(0.15 + gi*0.1));
        }

        // ── FEET end detail ────────────────────────────────────────
        ctx.fillStyle = "rgba(194,168,107,0.3)";
        ctx.fillRect(lx + sw*0.88, cy2 - sh*0.18, sw*0.08, sh*0.36);
        ctx.strokeStyle = "rgba(194,168,107,0.4)"; ctx.lineWidth = 0.8;
        ctx.strokeRect(lx + sw*0.88, cy2 - sh*0.18, sw*0.08, sh*0.36);

        // ── lid outline / border ───────────────────────────────────
        ctx.strokeStyle = isNear ? "#f9d342" : "rgba(194,168,107,0.6)";
        ctx.lineWidth = isNear ? 2 : 1.2;
        if (isNear) { ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 14; }
        ctx.beginPath();
        ctx.ellipse(cx2, cy2, sw*0.48, sh*0.48, 0, 0, Math.PI*2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore(); // end lid translate

        // ── MUMMY sits up if opened ────────────────────────────────
        if (obj.opened && mummySitProgress > 0) {
          const mRise = mummySitProgress * sh * 1.8; // rises above the sarcophagus
          const mCX   = cx2;
          const mCY   = cy2 - mRise;
          const mW    = sh * 0.55; // mummy width
          const mH    = sh * 1.4;  // mummy height visible

          ctx.save();
          ctx.globalAlpha = Math.min(1, mummySitProgress * 2);

          // Mummy body — cream linen wrapping
          const mG = ctx.createLinearGradient(mCX - mW*0.5, 0, mCX + mW*0.5, 0);
          mG.addColorStop(0, "#8a7850");
          mG.addColorStop(0.3, "#c8b080");
          mG.addColorStop(0.6, "#e0c898");
          mG.addColorStop(1, "#a09060");
          ctx.fillStyle = mG;
          ctx.beginPath();
          ctx.moveTo(mCX - mW*0.45, mCY + mH*0.5);
          ctx.lineTo(mCX - mW*0.32, mCY - mH*0.38);
          ctx.lineTo(mCX - mW*0.18, mCY - mH*0.5);
          ctx.lineTo(mCX + mW*0.18, mCY - mH*0.5);
          ctx.lineTo(mCX + mW*0.32, mCY - mH*0.38);
          ctx.lineTo(mCX + mW*0.45, mCY + mH*0.5);
          ctx.closePath();
          ctx.fill();

          // Horizontal wrap bands
          ctx.strokeStyle = "rgba(100,80,40,0.45)"; ctx.lineWidth = 1.2;
          for (let b = 1; b < 9; b++) {
            const by2 = mCY - mH*0.5 + b * mH*0.12;
            const bww = mW * (0.45 - b * 0.012);
            ctx.beginPath(); ctx.moveTo(mCX - bww, by2); ctx.lineTo(mCX + bww, by2); ctx.stroke();
          }
          // Diagonal cross-wrapping
          ctx.strokeStyle = "rgba(100,80,40,0.25)"; ctx.lineWidth = 0.7;
          for (let d = 0; d < 4; d++) {
            ctx.beginPath(); ctx.moveTo(mCX - mW*0.4 + d*mW*0.22, mCY-mH*0.5); ctx.lineTo(mCX - mW*0.15 + d*mW*0.22, mCY+mH*0.5); ctx.stroke();
          }

          // Gold death mask — the face
          const maskCY = mCY - mH*0.4;
          const maskR  = mW * 0.28;
          const maskG2 = ctx.createRadialGradient(mCX - maskR*0.2, maskCY - maskR*0.2, 0, mCX, maskCY, maskR*1.3);
          maskG2.addColorStop(0, "#f0d060");
          maskG2.addColorStop(0.5, "#d0a830");
          maskG2.addColorStop(1, "#906010");
          ctx.fillStyle = maskG2;
          ctx.beginPath(); ctx.ellipse(mCX, maskCY, maskR*0.72, maskR, 0, 0, Math.PI*2); ctx.fill();

          // Nemes stripes on mask
          const nStripeW = maskR * 0.22;
          const stripeC2 = ["#2848a0","#c8a030","#2848a0","#c8a030"];
          for (let ns2 = 0; ns2 < 4; ns2++) {
            ctx.fillStyle = stripeC2[ns2]; ctx.globalAlpha = 0.65;
            ctx.fillRect(mCX - maskR*0.72 + ns2*nStripeW, maskCY - maskR, nStripeW, maskR*0.5);
            ctx.fillRect(mCX - maskR*0.72 + ns2*nStripeW, maskCY + maskR*0.5, nStripeW, maskR*0.5);
          }
          ctx.globalAlpha = Math.min(1, mummySitProgress * 2);

          // Kohl eyes on mask
          ctx.fillStyle = "#1a0e06";
          ctx.fillRect(mCX - maskR*0.55, maskCY - maskR*0.12, maskR*0.42, maskR*0.12);
          ctx.fillRect(mCX + maskR*0.13, maskCY - maskR*0.12, maskR*0.42, maskR*0.12);
          // Eye shine
          ctx.fillStyle = "#e8d090";
          ctx.beginPath(); ctx.arc(mCX - maskR*0.32, maskCY - maskR*0.06, maskR*0.06, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(mCX + maskR*0.32, maskCY - maskR*0.06, maskR*0.06, 0, Math.PI*2); ctx.fill();

          ctx.restore();
        }
        break;
      }

      case "ushabti": {
        // Mummiform body with god head — based on real faience ushabtis
        // Body is a tapered cone: wide shoulders, narrow at flat base
        const god = obj.god || "generic";
        const bx  = obj.x + obj.w / 2;       // center x
        const by  = obj.y + obj.h;            // bottom y
        const bw  = obj.w;                    // shoulder width
        const bh  = obj.h;                    // full height (body only, head is extra)
        const headR = bw * 0.52;              // head radius

        // ── colour palette per god (worn faience / stone tones) ──────
        const palette = {
          anubis:   { body: "#3a3028", hi: "#5a4a3a", shadow: "#1e180e", head: "#1a1208", headHi: "#2e2418" },
          thoth:    { body: "#2a4038", hi: "#406050", shadow: "#182820", head: "#d8c8a0", headHi: "#f0e0b8" },
          horus:    { body: "#2a2820", hi: "#4a4030", shadow: "#181408", head: "#1a1410", headHi: "#302818" },
          osiris:   { body: "#3a6048", hi: "#508860", shadow: "#1e3828", head: "#3a6048", headHi: "#5a8868" },
          sekhmet:  { body: "#4a6070", hi: "#688898", shadow: "#283848", head: "#c89870", headHi: "#e0b888" },
          hathor:   { body: "#4a6070", hi: "#688898", shadow: "#283848", head: "#d8a870", headHi: "#f0c888" },
          ra:       { body: "#4a5838", hi: "#687850", shadow: "#283018", head: "#c89830", headHi: "#e0b840" },
          sobek:    { body: "#3a5030", hi: "#507048", shadow: "#202e18", head: "#508840", headHi: "#70a858" },
          nephthys: { body: "#38405a", hi: "#505878", shadow: "#202838", head: "#c8a0d0", headHi: "#e0c0e8" },
          ptah:     { body: "#283858", hi: "#384878", shadow: "#101828", head: "#283858", headHi: "#486898" },
          generic:  { body: "#4a6870", hi: "#688898", shadow: "#283848", head: "#4a6870", headHi: "#6888a0" },
        };
        const pal = palette[god] || palette.generic;

        // ── drop shadow ───────────────────────────────────────────────
        ctx.fillStyle = "rgba(0,0,0,0.38)";
        ctx.beginPath();
        ctx.ellipse(bx + 2, by + 2, bw * 0.55, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── mummiform body ────────────────────────────────────────────
        // Shape: shoulders at top ~bw wide, tapers to ~bw*0.55 at base
        // Top of body starts at obj.y + bh*0.28 (head sits above)
        const bodyTop = obj.y + bh * 0.28;
        const bodyBot = by - 4; // just above base plinth

        ctx.save();
        // Body fill — linear gradient left→right for slight roundness
        const bodyG = ctx.createLinearGradient(bx - bw*0.5, 0, bx + bw*0.5, 0);
        bodyG.addColorStop(0,    pal.shadow);
        bodyG.addColorStop(0.25, pal.body);
        bodyG.addColorStop(0.55, pal.hi);
        bodyG.addColorStop(0.8,  pal.body);
        bodyG.addColorStop(1,    pal.shadow);
        ctx.fillStyle = bodyG;

        ctx.beginPath();
        // Shoulder line at top of body
        ctx.moveTo(bx - bw*0.5,  bodyTop);
        // Left side tapers inward to base
        ctx.lineTo(bx - bw*0.28, bodyBot);
        // Base corners
        ctx.lineTo(bx + bw*0.28, bodyBot);
        // Right side
        ctx.lineTo(bx + bw*0.5,  bodyTop);
        ctx.closePath();
        ctx.fill();

        // ── crossed arms / fists at chest level ───────────────────────
        const chestY = bodyTop + bh * 0.18;
        // Left fist
        ctx.fillStyle = pal.hi;
        ctx.beginPath(); ctx.ellipse(bx - bw*0.22, chestY, bw*0.13, bw*0.1, -0.3, 0, Math.PI*2); ctx.fill();
        // Right fist
        ctx.beginPath(); ctx.ellipse(bx + bw*0.18, chestY, bw*0.13, bw*0.1, 0.3, 0, Math.PI*2); ctx.fill();
        // Crossed arm lines
        ctx.strokeStyle = pal.shadow; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(bx - bw*0.32, chestY - bw*0.05); ctx.lineTo(bx + bw*0.28, chestY + bw*0.05); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw*0.32, chestY - bw*0.05); ctx.lineTo(bx - bw*0.28, chestY + bw*0.05); ctx.stroke();

        // ── usekh collar ─────────────────────────────────────────────
        const collarY = bodyTop + bh * 0.06;
        ctx.strokeStyle = "rgba(194,168,107,0.55)"; ctx.lineWidth = 1;
        for (let c = 0; c < 3; c++) {
          const cr = bw * (0.28 + c * 0.06);
          ctx.beginPath();
          ctx.arc(bx, collarY, cr, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        }

        // ── hieroglyph column down the front ─────────────────────────
        const colX = bx - bw * 0.08;
        const colW = bw * 0.18;
        const colTop2 = chestY + bh * 0.08;
        const colBot2 = bodyBot - bh * 0.04;
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(colX, colTop2, colW, colBot2 - colTop2);
        ctx.strokeStyle = "rgba(194,168,107,0.2)"; ctx.lineWidth = 0.5;
        ctx.strokeRect(colX, colTop2, colW, colBot2 - colTop2);
        // Mini glyphs
        ctx.fillStyle = "rgba(194,168,107,0.45)";
        ctx.font = `${bw * 0.14}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        const glyphCol = ["𓄿","𓈖","𓊪","𓇋","𓁹","𓏏","𓂧"];
        const glyphStep = (colBot2 - colTop2) / 7;
        for (let gi = 0; gi < 7; gi++) {
          ctx.fillText(glyphCol[gi], bx, colTop2 + gi * glyphStep);
        }

        // ── base plinth ───────────────────────────────────────────────
        ctx.fillStyle = pal.shadow;
        ctx.fillRect(bx - bw*0.38, bodyBot, bw*0.76, 5);
        ctx.fillStyle = pal.body;
        ctx.fillRect(bx - bw*0.34, bodyBot, bw*0.68, 3);
        ctx.restore();

        // ── GOD HEAD ─────────────────────────────────────────────────
        // Sits centered at top of body, with nemes headdress falling
        // down the sides like the real objects in the reference photos
        const headCX = bx;
        const headCY = obj.y + bh * 0.18; // center of head

        ctx.save();

        // Nemes headdress — two hanging panels either side of the face
        // (falls from top of head down past the shoulders)
        const nemesCol = isNear ? "rgba(249,211,66,0.5)" : "rgba(194,168,107,0.35)";
        // Left panel
        ctx.fillStyle = nemesCol;
        ctx.beginPath();
        ctx.moveTo(headCX - headR * 0.5, headCY - headR * 0.6);
        ctx.lineTo(headCX - headR * 0.85, headCY + headR * 0.2);
        ctx.lineTo(headCX - bw*0.45, bodyTop + bh*0.06);
        ctx.lineTo(headCX - bw*0.4, bodyTop);
        ctx.lineTo(headCX - headR * 0.3, headCY + headR * 0.1);
        ctx.closePath(); ctx.fill();
        // Right panel
        ctx.beginPath();
        ctx.moveTo(headCX + headR * 0.5, headCY - headR * 0.6);
        ctx.lineTo(headCX + headR * 0.85, headCY + headR * 0.2);
        ctx.lineTo(headCX + bw*0.45, bodyTop + bh*0.06);
        ctx.lineTo(headCX + bw*0.4, bodyTop);
        ctx.lineTo(headCX + headR * 0.3, headCY + headR * 0.1);
        ctx.closePath(); ctx.fill();
        // Nemes stripes
        ctx.strokeStyle = "rgba(140,110,50,0.4)"; ctx.lineWidth = 0.7;
        for (let ns = 0; ns < 4; ns++) {
          const ny = headCY - headR*0.55 + ns * headR * 0.28;
          ctx.beginPath(); ctx.moveTo(headCX - headR*0.85, ny); ctx.lineTo(headCX - headR*0.3, ny + headR*0.1); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(headCX + headR*0.85, ny); ctx.lineTo(headCX + headR*0.3, ny + headR*0.1); ctx.stroke();
        }

        if (god === "anubis") {
          // Sleek black jackal head — smooth elongated snout, tall ears
          ctx.fillStyle = pal.head;
          // Cranium
          ctx.beginPath(); ctx.ellipse(headCX, headCY - headR*0.1, headR*0.55, headR*0.52, 0, 0, Math.PI*2); ctx.fill();
          // Pointed muzzle — angled downward
          ctx.beginPath();
          ctx.moveTo(headCX - headR*0.38, headCY + headR*0.1);
          ctx.lineTo(headCX - headR*0.55, headCY + headR*0.65);
          ctx.lineTo(headCX,             headCY + headR*0.72);
          ctx.lineTo(headCX + headR*0.55, headCY + headR*0.65);
          ctx.lineTo(headCX + headR*0.38, headCY + headR*0.1);
          ctx.fill();
          // Tall pointed ears
          ctx.beginPath(); ctx.moveTo(headCX-headR*0.35, headCY-headR*0.45); ctx.lineTo(headCX-headR*0.52, headCY-headR*1.25); ctx.lineTo(headCX-headR*0.12, headCY-headR*0.55); ctx.fill();
          ctx.beginPath(); ctx.moveTo(headCX+headR*0.35, headCY-headR*0.45); ctx.lineTo(headCX+headR*0.52, headCY-headR*1.25); ctx.lineTo(headCX+headR*0.12, headCY-headR*0.55); ctx.fill();
          // Highlight ridge on snout
          ctx.fillStyle = pal.headHi;
          ctx.beginPath(); ctx.ellipse(headCX - headR*0.08, headCY + headR*0.35, headR*0.12, headR*0.28, -0.2, 0, Math.PI*2); ctx.fill();
          // Gold eye
          ctx.fillStyle = "#c8a030";
          ctx.beginPath(); ctx.ellipse(headCX-headR*0.28, headCY+headR*0.05, headR*0.11, headR*0.08, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(headCX+headR*0.28, headCY+headR*0.05, headR*0.11, headR*0.08, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#0a0806";
          ctx.beginPath(); ctx.arc(headCX-headR*0.28, headCY+headR*0.05, headR*0.055, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(headCX+headR*0.28, headCY+headR*0.05, headR*0.055, 0, Math.PI*2); ctx.fill();

        } else if (god === "horus" || god === "ra") {
          // Falcon head — compact, rounded cranium, curved hooked beak facing left
          const hc = god === "ra" ? "#1a1410" : pal.head;
          ctx.fillStyle = hc;
          // Round head
          ctx.beginPath(); ctx.ellipse(headCX, headCY, headR*0.6, headR*0.58, 0, 0, Math.PI*2); ctx.fill();
          // Hooked beak — curves down-left
          ctx.beginPath();
          ctx.moveTo(headCX - headR*0.18, headCY + headR*0.2);
          ctx.quadraticCurveTo(headCX - headR*0.7, headCY + headR*0.3, headCX - headR*0.75, headCY + headR*0.65);
          ctx.quadraticCurveTo(headCX - headR*0.55, headCY + headR*0.7, headCX - headR*0.15, headCY + headR*0.35);
          ctx.fill();
          // Feather markings (subtle stripes on head)
          ctx.strokeStyle = "rgba(80,60,20,0.3)"; ctx.lineWidth = 0.6;
          for (let f = 0; f < 4; f++) {
            ctx.beginPath(); ctx.moveTo(headCX-headR*0.4+f*headR*0.22, headCY-headR*0.45); ctx.lineTo(headCX-headR*0.3+f*headR*0.22, headCY+headR*0.1); ctx.stroke();
          }
          // Eye stripe — kohl mark
          ctx.fillStyle = pal.headHi;
          ctx.fillRect(headCX-headR*0.55, headCY-headR*0.15, headR*0.45, headR*0.12);
          // Eye
          ctx.fillStyle = "#c8a030";
          ctx.beginPath(); ctx.ellipse(headCX-headR*0.32, headCY-headR*0.08, headR*0.12, headR*0.09, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#080604";
          ctx.beginPath(); ctx.arc(headCX-headR*0.32, headCY-headR*0.08, headR*0.058, 0, Math.PI*2); ctx.fill();

        } else if (god === "thoth") {
          // Ibis head — white/cream, very long curved beak downward
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX, headCY - headR*0.1, headR*0.55, headR*0.5, 0, 0, Math.PI*2); ctx.fill();
          // Long down-curved beak
          ctx.beginPath();
          ctx.moveTo(headCX - headR*0.2, headCY + headR*0.25);
          ctx.quadraticCurveTo(headCX - headR*0.6, headCY + headR*0.55, headCX - headR*0.5, headCY + headR*1.05);
          ctx.quadraticCurveTo(headCX - headR*0.35, headCY + headR*1.08, headCX - headR*0.0, headCY + headR*0.42);
          ctx.fill();
          // Highlight on beak
          ctx.fillStyle = pal.headHi;
          ctx.beginPath(); ctx.ellipse(headCX + headR*0.05, headCY - headR*0.08, headR*0.38, headR*0.36, 0, 0, Math.PI*2); ctx.fill();
          // Eye
          ctx.fillStyle = "#1a1208";
          ctx.beginPath(); ctx.arc(headCX+headR*0.15, headCY-headR*0.1, headR*0.1, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#e8d090";
          ctx.beginPath(); ctx.arc(headCX+headR*0.15, headCY-headR*0.1, headR*0.05, 0, Math.PI*2); ctx.fill();

        } else if (god === "osiris") {
          // Human face, green, with atef crown (white tall hat + side feathers)
          // Human head
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX, headCY + headR*0.05, headR*0.52, headR*0.5, 0, 0, Math.PI*2); ctx.fill();
          // Atef crown — tall white cylindrical crown
          ctx.fillStyle = "#d8d0c0";
          ctx.beginPath();
          ctx.moveTo(headCX - headR*0.28, headCY - headR*0.42);
          ctx.lineTo(headCX - headR*0.22, headCY - headR*1.35);
          ctx.lineTo(headCX + headR*0.22, headCY - headR*1.35);
          ctx.lineTo(headCX + headR*0.28, headCY - headR*0.42);
          ctx.fill();
          ctx.beginPath(); ctx.ellipse(headCX, headCY-headR*1.35, headR*0.22, headR*0.1, 0, 0, Math.PI*2); ctx.fill();
          // Side ostrich plumes
          ctx.fillStyle = "#c8b040";
          ctx.beginPath(); ctx.moveTo(headCX-headR*0.28, headCY-headR*0.5); ctx.quadraticCurveTo(headCX-headR*0.65, headCY-headR*1.1, headCX-headR*0.28, headCY-headR*1.3); ctx.quadraticCurveTo(headCX-headR*0.1, headCY-headR*1.1, headCX-headR*0.28, headCY-headR*0.5); ctx.fill();
          ctx.beginPath(); ctx.moveTo(headCX+headR*0.28, headCY-headR*0.5); ctx.quadraticCurveTo(headCX+headR*0.65, headCY-headR*1.1, headCX+headR*0.28, headCY-headR*1.3); ctx.quadraticCurveTo(headCX+headR*0.1, headCY-headR*1.1, headCX+headR*0.28, headCY-headR*0.5); ctx.fill();
          // Ceremonial beard
          ctx.fillStyle = "#c8a030";
          ctx.fillRect(headCX-headR*0.1, headCY+headR*0.45, headR*0.2, headR*0.48);
          ctx.beginPath(); ctx.moveTo(headCX-headR*0.1, headCY+headR*0.93); ctx.lineTo(headCX, headCY+headR*1.08); ctx.lineTo(headCX+headR*0.1, headCY+headR*0.93); ctx.fill();
          // Eyes + kohl
          ctx.fillStyle = "#1a1208"; ctx.fillRect(headCX-headR*0.38, headCY+headR*0.02, headR*0.28, headR*0.1);
          ctx.fillRect(headCX+headR*0.1, headCY+headR*0.02, headR*0.28, headR*0.1);

        } else if (god === "sekhmet") {
          // Lioness — round face, small round ears on top, flat muzzle
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX, headCY, headR*0.62, headR*0.58, 0, 0, Math.PI*2); ctx.fill();
          // Round ears sitting on top
          ctx.beginPath(); ctx.arc(headCX-headR*0.44, headCY-headR*0.5, headR*0.2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(headCX+headR*0.44, headCY-headR*0.5, headR*0.2, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = pal.headHi;
          ctx.beginPath(); ctx.arc(headCX-headR*0.44, headCY-headR*0.5, headR*0.11, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(headCX+headR*0.44, headCY-headR*0.5, headR*0.11, 0, Math.PI*2); ctx.fill();
          // Flat wide muzzle
          ctx.fillStyle = pal.headHi;
          ctx.beginPath(); ctx.ellipse(headCX, headCY+headR*0.25, headR*0.38, headR*0.22, 0, 0, Math.PI*2); ctx.fill();
          // Nostrils
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX-headR*0.12, headCY+headR*0.2, headR*0.06, headR*0.04, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(headCX+headR*0.12, headCY+headR*0.2, headR*0.06, headR*0.04, 0, 0, Math.PI*2); ctx.fill();
          // Eyes — fierce amber
          ctx.fillStyle = "#c88020";
          ctx.beginPath(); ctx.ellipse(headCX-headR*0.25, headCY-headR*0.08, headR*0.13, headR*0.09, 0, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(headCX+headR*0.25, headCY-headR*0.08, headR*0.13, headR*0.09, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#0a0604";
          ctx.beginPath(); ctx.arc(headCX-headR*0.25, headCY-headR*0.08, headR*0.06, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(headCX+headR*0.25, headCY-headR*0.08, headR*0.06, 0, Math.PI*2); ctx.fill();
          // Sun disk on top
          ctx.fillStyle = "#e8a020";
          ctx.beginPath(); ctx.arc(headCX, headCY-headR*0.75, headR*0.22, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = "#c87010"; ctx.lineWidth = headR*0.07;
          ctx.beginPath(); ctx.arc(headCX, headCY-headR*0.75, headR*0.3, 0, Math.PI*2); ctx.stroke();

        } else if (god === "hathor") {
          // Human face with cow horns curving up + sun disk between
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX, headCY+headR*0.05, headR*0.55, headR*0.52, 0, 0, Math.PI*2); ctx.fill();
          // Cow horns — thick, sweep up and outward
          ctx.strokeStyle = pal.headHi; ctx.lineWidth = headR*0.2; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(headCX-headR*0.45, headCY-headR*0.2); ctx.quadraticCurveTo(headCX-headR*1.0, headCY-headR*0.9, headCX-headR*0.5, headCY-headR*1.25); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(headCX+headR*0.45, headCY-headR*0.2); ctx.quadraticCurveTo(headCX+headR*1.0, headCY-headR*0.9, headCX+headR*0.5, headCY-headR*1.25); ctx.stroke();
          ctx.lineCap = "butt";
          // Sun disk between horns
          ctx.fillStyle = "#d82010";
          ctx.beginPath(); ctx.arc(headCX, headCY-headR*1.0, headR*0.24, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = "#e8a020"; ctx.lineWidth = headR*0.08;
          ctx.beginPath(); ctx.arc(headCX, headCY-headR*1.0, headR*0.33, 0, Math.PI*2); ctx.stroke();
          // Eyes + slight smile
          ctx.fillStyle = "#1a1208"; ctx.fillRect(headCX-headR*0.38, headCY+headR*0.02, headR*0.25, headR*0.1);
          ctx.fillRect(headCX+headR*0.13, headCY+headR*0.02, headR*0.25, headR*0.1);

        } else if (god === "sobek") {
          // Crocodile — long flattened snout protruding left, bumpy head
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX+headR*0.1, headCY-headR*0.05, headR*0.58, headR*0.48, 0, 0, Math.PI*2); ctx.fill();
          // Long flat snout to the left
          ctx.beginPath();
          ctx.moveTo(headCX-headR*0.35, headCY-headR*0.15);
          ctx.lineTo(headCX-headR*1.15, headCY + headR*0.05);
          ctx.lineTo(headCX-headR*1.15, headCY + headR*0.28);
          ctx.lineTo(headCX-headR*0.35, headCY + headR*0.2);
          ctx.fill();
          // Teeth along snout
          ctx.fillStyle = "#e8e0c8";
          for (let t = 0; t < 5; t++) {
            const tx = headCX - headR*0.42 - t*headR*0.14;
            ctx.beginPath(); ctx.moveTo(tx, headCY-headR*0.12); ctx.lineTo(tx-headR*0.04, headCY+headR*0.02); ctx.lineTo(tx-headR*0.08, headCY-headR*0.12); ctx.fill();
          }
          // Eyes perched on top of head
          ctx.fillStyle = "#d09010";
          ctx.beginPath(); ctx.ellipse(headCX+headR*0.25, headCY-headR*0.4, headR*0.14, headR*0.1, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#0a0804";
          ctx.beginPath(); ctx.ellipse(headCX+headR*0.25, headCY-headR*0.4, headR*0.07, headR*0.06, 0, 0, Math.PI*2); ctx.fill();

        } else if (god === "nephthys") {
          // Human face with hieroglyphic headdress (house + basket glyph)
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX, headCY+headR*0.05, headR*0.52, headR*0.5, 0, 0, Math.PI*2); ctx.fill();
          // Headdress — rectangular basket on top
          ctx.fillStyle = "rgba(180,150,210,0.8)";
          ctx.fillRect(headCX-headR*0.28, headCY-headR*0.88, headR*0.56, headR*0.48);
          // House symbol inside headdress
          ctx.strokeStyle = "rgba(120,90,150,0.8)"; ctx.lineWidth = 0.8;
          ctx.strokeRect(headCX-headR*0.18, headCY-headR*0.8, headR*0.36, headR*0.28);
          ctx.beginPath(); ctx.moveTo(headCX-headR*0.18, headCY-headR*0.8); ctx.lineTo(headCX, headCY-headR*1.0); ctx.lineTo(headCX+headR*0.18, headCY-headR*0.8); ctx.stroke();
          // Eyes
          ctx.fillStyle = "#1a1208"; ctx.fillRect(headCX-headR*0.38, headCY+headR*0.02, headR*0.25, headR*0.1);
          ctx.fillRect(headCX+headR*0.13, headCY+headR*0.02, headR*0.25, headR*0.1);

        } else if (god === "ptah") {
          // Human face in tight cap (no nemes — Ptah has skullcap)
          // Override the nemes with solid cap
          ctx.fillStyle = "#1a2a50";
          ctx.beginPath(); ctx.arc(headCX, headCY-headR*0.05, headR*0.58, Math.PI, 0); ctx.fill();
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX, headCY+headR*0.05, headR*0.52, headR*0.52, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#1a2a50";
          ctx.beginPath(); ctx.arc(headCX, headCY-headR*0.05, headR*0.58, 0, Math.PI); ctx.fill();
          // Was-sceptre beside
          ctx.strokeStyle = "#c8a030"; ctx.lineWidth = headR*0.1;
          ctx.beginPath(); ctx.moveTo(headCX+headR*0.8, headCY-headR*0.5); ctx.lineTo(headCX+headR*0.8, headCY+headR*0.7); ctx.stroke();
          // Forked top of was
          ctx.beginPath(); ctx.moveTo(headCX+headR*0.72, headCY-headR*0.5); ctx.lineTo(headCX+headR*0.8, headCY-headR*0.65); ctx.lineTo(headCX+headR*0.88, headCY-headR*0.5); ctx.stroke();
          // Eyes
          ctx.fillStyle = "#e8e0d0"; ctx.fillRect(headCX-headR*0.35, headCY+headR*0.02, headR*0.23, headR*0.1);
          ctx.fillRect(headCX+headR*0.12, headCY+headR*0.02, headR*0.23, headR*0.1);

        } else {
          // Generic — plain human-ish head, nemes headdress
          ctx.fillStyle = pal.head;
          ctx.beginPath(); ctx.ellipse(headCX, headCY, headR*0.55, headR*0.52, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = pal.headHi;
          ctx.beginPath(); ctx.ellipse(headCX+headR*0.08, headCY-headR*0.05, headR*0.28, headR*0.3, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#1a1208"; ctx.fillRect(headCX-headR*0.35, headCY+headR*0.02, headR*0.25, headR*0.1);
          ctx.fillRect(headCX+headR*0.1, headCY+headR*0.02, headR*0.25, headR*0.1);
        }

        ctx.restore();

        // ── glow outline when near ─────────────────────────────────────
        if (isNear) {
          ctx.save();
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 12;
          // Outline the body silhouette
          ctx.beginPath();
          ctx.moveTo(bx - bw*0.5,  bodyTop);
          ctx.lineTo(bx - bw*0.28, bodyBot);
          ctx.lineTo(bx + bw*0.28, bodyBot);
          ctx.lineTo(bx + bw*0.5,  bodyTop);
          ctx.closePath();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
        break;
      }

      case "rosetta": {
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(obj.x + 2, obj.y + 2, obj.w, obj.h);
        // Stone fragment
        const rg = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.w, obj.y + obj.h);
        rg.addColorStop(0, "#c09858"); rg.addColorStop(0.5, isNear ? "#e0b878" : "#b08848"); rg.addColorStop(1, "#907038");
        ctx.fillStyle = rg;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Chipped corners
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.moveTo(obj.x, obj.y); ctx.lineTo(obj.x + 3, obj.y); ctx.lineTo(obj.x, obj.y + 3); ctx.fill();
        ctx.beginPath(); ctx.moveTo(obj.x + obj.w, obj.y + obj.h); ctx.lineTo(obj.x + obj.w - 3, obj.y + obj.h); ctx.lineTo(obj.x + obj.w, obj.y + obj.h - 3); ctx.fill();
        // Glyph
        ctx.fillStyle = "#2a1808";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = `${Math.min(obj.w, obj.h) * 0.85}px serif`;
        ctx.fillText(obj.glyph || "𓂀", obj.x + obj.w / 2, obj.y + obj.h / 2);
        // Letter hint if decoded
        if (playerGlyphMap[obj.glyph]) {
          ctx.fillStyle = "#d6c48a";
          ctx.font = `${Math.min(obj.w, obj.h) * 0.45}px monospace`;
          ctx.fillText(playerGlyphMap[obj.glyph], obj.x + obj.w / 2, obj.y + obj.h + 7);
        }
        // Highlight pulse
        if (isNear) {
          ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 10;
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = "#7a5a28"; ctx.lineWidth = 1;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        }
        break;
      }

      case "glyph": {
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(obj.x + 3, obj.y + 3, obj.w, obj.h);
        // Stone slab
        const gg = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.h);
        gg.addColorStop(0, "#8a7560"); gg.addColorStop(0.4, "#766551"); gg.addColorStop(1, "#5a4a38");
        ctx.fillStyle = gg;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Inner recess
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(obj.x + 3, obj.y + 3, obj.w - 6, obj.h - 6);
        // Border
        ctx.strokeStyle = isNear ? "#f9d342" : "#4a3828"; ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        // Glyphs
        const glyphs2 = obj.glyphText || [];
        const count = glyphs2.length || 1;
        const gPad = 5;
        const spacing = (obj.w - gPad * 2) / count;
        const gFont = Math.min(obj.h * 0.58, spacing * 0.88);
        ctx.font = `${gFont}px serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        for (let i = 0; i < count; i++) {
          const g = glyphs2[i];
          const gx = obj.x + gPad + spacing * (i + 0.5);
          const gy = obj.y + obj.h / 2;
          // Carved glyph look
          ctx.fillStyle = "#1a1208";
          ctx.fillText(g, gx + 1, gy + 1);
          ctx.fillStyle = "#e0c88a";
          ctx.fillText(g, gx, gy);
          const gl = playerGlyphMap[g];
          if (gl) {
            ctx.font = `${gFont * 0.42}px monospace`;
            ctx.fillStyle = "#d6c48a";
            ctx.fillText(gl, gx, gy + gFont * 0.68);
            ctx.font = `${gFont}px serif`;
          }
        }
        break;
      }

      case "door": {
        let offX = 0, offY = 0;
        if (!obj.locked && obj.openProgress > 0) {
          if (obj.direction === "right") offX =  obj.openProgress * obj.w;
          if (obj.direction === "left")  offX = -obj.openProgress * obj.w;
          if (obj.direction === "down")  offY =  obj.openProgress * obj.h;
          if (obj.direction === "up")    offY = -obj.openProgress * obj.h;
        }
        const dx = obj.x + offX, dy = obj.y + offY;
        // Door frame
        if (obj.locked) {
          ctx.fillStyle = "#2a1a0a";
          ctx.fillRect(dx - 3, dy - 3, obj.w + 6, obj.h + 6);
        }
        // Door panel gradient
        const dg = ctx.createLinearGradient(dx, dy, dx + obj.w, dy);
        if (obj.locked) {
          dg.addColorStop(0, "#3a2812"); dg.addColorStop(0.5, "#4f3925"); dg.addColorStop(1, "#3a2812");
        } else {
          dg.addColorStop(0, "#5a4a30"); dg.addColorStop(0.5, "#7a6a4f"); dg.addColorStop(1, "#5a4a30");
        }
        ctx.fillStyle = dg;
        ctx.fillRect(dx, dy, obj.w, obj.h);
        // Door planks / panels
        ctx.strokeStyle = obj.locked ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1;
        const isVert = obj.direction === "left" || obj.direction === "right";
        if (isVert) {
          for (let py = dy + 20; py < dy + obj.h - 10; py += 30) {
            ctx.beginPath(); ctx.moveTo(dx + 4, py); ctx.lineTo(dx + obj.w - 4, py); ctx.stroke();
          }
        } else {
          for (let px = dx + 20; px < dx + obj.w - 10; px += 30) {
            ctx.beginPath(); ctx.moveTo(px, dy + 4); ctx.lineTo(px, dy + obj.h - 4); ctx.stroke();
          }
        }
        // Lock symbol if sealed
        if (obj.locked) {
          ctx.fillStyle = "rgba(194,168,107,0.35)";
          ctx.font = "14px serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          const midX = dx + obj.w / 2, midY = dy + obj.h / 2;
          ctx.fillText("𓂧", midX, midY);
        }
        // Glow if near
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 2;
          ctx.strokeRect(dx, dy, obj.w, obj.h);
        }
        break;
      }

      case "heart-scarab": {
        // Green jasper scarab beetle
        const scx = obj.x + obj.w / 2;
        const scy = obj.y + obj.h / 2;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath(); ctx.ellipse(scx + 1, scy + 2, obj.w * 0.6, obj.h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        // Body
        const sbg = ctx.createRadialGradient(scx - obj.w*0.1, scy - obj.h*0.1, 0, scx, scy, obj.w * 0.7);
        sbg.addColorStop(0, "#5ad880");
        sbg.addColorStop(0.4, "#2a9850");
        sbg.addColorStop(1, "#156030");
        ctx.fillStyle = sbg;
        ctx.beginPath(); ctx.ellipse(scx, scy, obj.w * 0.5, obj.h * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        // Wings spread wide
        ctx.fillStyle = "rgba(50,180,90,0.7)";
        ctx.beginPath();
        ctx.moveTo(scx - obj.w*0.5, scy);
        ctx.quadraticCurveTo(scx - obj.w*1.1, scy - obj.h*0.5, scx - obj.w*0.9, scy - obj.h*0.8);
        ctx.quadraticCurveTo(scx - obj.w*0.4, scy - obj.h*0.5, scx, scy);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(scx + obj.w*0.5, scy);
        ctx.quadraticCurveTo(scx + obj.w*1.1, scy - obj.h*0.5, scx + obj.w*0.9, scy - obj.h*0.8);
        ctx.quadraticCurveTo(scx + obj.w*0.4, scy - obj.h*0.5, scx, scy);
        ctx.fill();
        // Wing veins
        ctx.strokeStyle = "rgba(20,100,40,0.5)"; ctx.lineWidth = 0.7;
        for (let v = 1; v < 4; v++) {
          ctx.beginPath();
          ctx.moveTo(scx - obj.w*0.5, scy);
          ctx.quadraticCurveTo(scx - obj.w*(0.5+v*0.1), scy - obj.h*(0.2+v*0.12), scx - obj.w*(0.3+v*0.18), scy - obj.h*0.7);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(scx + obj.w*0.5, scy);
          ctx.quadraticCurveTo(scx + obj.w*(0.5+v*0.1), scy - obj.h*(0.2+v*0.12), scx + obj.w*(0.3+v*0.18), scy - obj.h*0.7);
          ctx.stroke();
        }
        // Head with antennae
        ctx.fillStyle = "#1a7038";
        ctx.beginPath(); ctx.arc(scx, scy - obj.h*0.42, obj.w * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#1a7038"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(scx - obj.w*0.15, scy - obj.h*0.55); ctx.lineTo(scx - obj.w*0.3, scy - obj.h*0.9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(scx + obj.w*0.15, scy - obj.h*0.55); ctx.lineTo(scx + obj.w*0.3, scy - obj.h*0.9); ctx.stroke();
        // Glow
        if (isNear) {
          ctx.shadowColor = "#50f090"; ctx.shadowBlur = 16;
          ctx.strokeStyle = "#80f0a0"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.ellipse(scx, scy, obj.w * 0.5, obj.h * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.shadowBlur = 0;
        }
        break;
      }

      case "torch": {
        const tx = obj.x + obj.w / 2, ty = obj.y;
        // Shaft
        ctx.fillStyle = "#8a6830";
        ctx.fillRect(obj.x + 2, obj.y + 4, obj.w - 4, obj.h - 4);
        ctx.fillStyle = "#c9a24a";
        ctx.fillRect(obj.x + 3, obj.y + 4, obj.w - 6, obj.h - 6);
        // Wrap bands
        ctx.fillStyle = "#6a4820";
        for (let i = 1; i < 3; i++) {
          ctx.fillRect(obj.x + 1, obj.y + 4 + i * (obj.h / 4), obj.w - 2, 2);
        }
        // Flame
        const fPulse = 0.8 + Math.sin(gameTime * 8 + obj.x) * 0.2;
        const fH = 14 * fPulse;
        const flameGrad = ctx.createRadialGradient(tx, ty - fH * 0.5, 0, tx, ty - fH * 0.3, fH);
        flameGrad.addColorStop(0, "rgba(255,250,180,0.95)");
        flameGrad.addColorStop(0.3, "rgba(255,180,50,0.85)");
        flameGrad.addColorStop(0.7, "rgba(255,100,20,0.5)");
        flameGrad.addColorStop(1, "rgba(255,50,0,0)");
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(tx, ty - fH);
        ctx.quadraticCurveTo(tx + 5 * fPulse, ty - fH * 0.5, tx + 4, ty);
        ctx.quadraticCurveTo(tx + 1, ty - 3, tx, ty - fH * 0.15);
        ctx.quadraticCurveTo(tx - 1, ty - 3, tx - 4, ty);
        ctx.quadraticCurveTo(tx - 5 * fPulse, ty - fH * 0.5, tx, ty - fH);
        ctx.fill();
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        }
        break;
      }

      case "canopic": {
        const cx2 = obj.x + obj.w / 2;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.ellipse(cx2 + 2, obj.y + obj.h + 3, obj.w / 1.8, 4, 0, 0, Math.PI * 2); ctx.fill();
        // Jar body
        const jg = ctx.createLinearGradient(obj.x, 0, obj.x + obj.w, 0);
        jg.addColorStop(0, "#5a4830"); jg.addColorStop(0.4, isNear ? "#9a8460" : "#7a6a48"); jg.addColorStop(1, "#4a3828");
        ctx.fillStyle = jg;
        ctx.beginPath();
        ctx.moveTo(cx2 - obj.w * 0.3, obj.y + 12);
        ctx.quadraticCurveTo(cx2 - obj.w * 0.55, obj.y + obj.h * 0.5, cx2 - obj.w * 0.45, obj.y + obj.h);
        ctx.lineTo(cx2 + obj.w * 0.45, obj.y + obj.h);
        ctx.quadraticCurveTo(cx2 + obj.w * 0.55, obj.y + obj.h * 0.5, cx2 + obj.w * 0.3, obj.y + 12);
        ctx.closePath();
        ctx.fill();
        // Lid / head stopper
        const hdColors = { 1: "#c09058", 2: "#4a8048", 3: "#803028", 4: "#5840a0" };
        ctx.fillStyle = isNear ? "#f0d060" : (hdColors[obj.ritualIndex] || "#9a8460");
        ctx.beginPath();
        ctx.ellipse(cx2, obj.y + 12, obj.w * 0.42, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Mini head detail
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.font = "8px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(obj.head === "human" ? "𓁹" : obj.head === "baboon" ? "𓁺" : obj.head === "jackal" ? "𓁛" : "𓁜", cx2, obj.y + 11);
        // Ritual index
        ctx.fillStyle = "rgba(240,208,112,0.7)";
        ctx.font = "8px serif";
        ctx.fillText(String(obj.ritualIndex), cx2, obj.y + obj.h * 0.65);
        if (canopicSequence.includes(obj.ritualIndex)) {
          ctx.fillStyle = "#80c860";
          ctx.font = "9px sans-serif";
          ctx.fillText("✓", cx2, obj.y + obj.h - 5);
        }
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx2 - obj.w * 0.3, obj.y + 12);
          ctx.quadraticCurveTo(cx2 - obj.w * 0.55, obj.y + obj.h * 0.5, cx2 - obj.w * 0.45, obj.y + obj.h);
          ctx.lineTo(cx2 + obj.w * 0.45, obj.y + obj.h);
          ctx.quadraticCurveTo(cx2 + obj.w * 0.55, obj.y + obj.h * 0.5, cx2 + obj.w * 0.3, obj.y + 12);
          ctx.closePath(); ctx.stroke();
        }
        break;
      }

      case "offering-bowl": {
        const bx = obj.x + obj.w / 2;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(bx + 2, obj.y + obj.h + 3, obj.w * 0.5, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Base
        ctx.fillStyle = obj.filled ? "#8a6828" : "#5a4828";
        ctx.fillRect(obj.x + 2, obj.y + obj.h * 0.7, obj.w - 4, obj.h * 0.3);
        // Bowl body
        ctx.fillStyle = obj.filled ? "#c09040" : (isNear ? "#7a6042" : "#6a5035");
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y + obj.h * 0.4);
        ctx.quadraticCurveTo(obj.x - 2, obj.y + obj.h * 0.7, obj.x + 2, obj.y + obj.h * 0.7);
        ctx.lineTo(obj.x + obj.w - 2, obj.y + obj.h * 0.7);
        ctx.quadraticCurveTo(obj.x + obj.w + 2, obj.y + obj.h * 0.7, obj.x + obj.w, obj.y + obj.h * 0.4);
        ctx.closePath(); ctx.fill();
        // Rim
        ctx.fillStyle = obj.filled ? "#e0b860" : (isNear ? "#a08060" : "#7a6048");
        ctx.fillRect(obj.x - 2, obj.y + obj.h * 0.35, obj.w + 4, 5);
        if (obj.filled) {
          // Offering glow
          const offerGrad = ctx.createRadialGradient(bx, obj.y + obj.h * 0.4, 0, bx, obj.y + obj.h * 0.4, obj.w * 0.7);
          offerGrad.addColorStop(0, "rgba(255,220,80,0.4)"); offerGrad.addColorStop(1, "rgba(255,180,0,0)");
          ctx.fillStyle = offerGrad;
          ctx.beginPath(); ctx.ellipse(bx, obj.y + obj.h * 0.4, obj.w * 0.7, 8, 0, 0, Math.PI * 2); ctx.fill();
          // Content symbol
          const symbols = { bread: "𓇋", oil: "𓏌", incense: "𓆑" };
          ctx.fillStyle = "rgba(255,220,120,0.7)";
          ctx.font = "10px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(symbols[obj.offeringType] || "•", bx, obj.y + obj.h * 0.5);
        }
        break;
      }

      case "niche": {
        if (obj.hidden) break;
        // Recessed niche
        ctx.fillStyle = "#1a1410";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = isNear ? "#f9d342" : "#c0a050";
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        // Inner glow
        const ng = ctx.createRadialGradient(obj.x + obj.w/2, obj.y + obj.h/2, 0, obj.x + obj.w/2, obj.y + obj.h/2, obj.w * 0.7);
        ng.addColorStop(0, "rgba(220,180,80,0.25)"); ng.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ng;
        ctx.fillRect(obj.x + 2, obj.y + 2, obj.w - 4, obj.h - 4);
        break;
      }

      case "bracket": {
        // Wall mount
        ctx.fillStyle = obj.mounted ? "#9a7050" : "#5a4a38";
        ctx.fillRect(obj.x, obj.y + 6, obj.w, obj.h - 6);
        // Arm
        ctx.strokeStyle = obj.mounted ? "#c09050" : (isNear ? "#f9d342" : "#706050");
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y + 8);
        ctx.lineTo(obj.x + obj.w + 10, obj.y + 8);
        ctx.stroke();
        // If mounted, show flame
        if (obj.mounted) {
          const bpulse = 0.85 + Math.sin(gameTime * 1.5) * 0.15;
          ctx.fillStyle = `rgba(255,180,50,${0.7 * bpulse})`;
          ctx.beginPath();
          ctx.arc(obj.x + obj.w + 10, obj.y + 3, 6 * bpulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,240,180,0.6)";
          ctx.beginPath();
          ctx.arc(obj.x + obj.w + 10, obj.y + 3, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case "wall-painting": {
        if (obj.hidden) {
          ctx.fillStyle = "#181410";
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
          ctx.strokeStyle = "rgba(80,70,60,0.3)"; ctx.lineWidth = 1;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        } else {
          // Frame
          ctx.fillStyle = "#3a2e1e";
          ctx.fillRect(obj.x - 3, obj.y - 3, obj.w + 6, obj.h + 6);
          // Background pigment
          const wpg = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.h);
          wpg.addColorStop(0, "#6a5030"); wpg.addColorStop(1, "#4a3820");
          ctx.fillStyle = wpg;
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
          // Painted scene blocks (simplified pictographs)
          // Sky area
          ctx.fillStyle = "rgba(60,80,120,0.4)";
          ctx.fillRect(obj.x + 4, obj.y + 4, obj.w - 8, obj.h * 0.35);
          // Ground area
          ctx.fillStyle = "rgba(100,70,30,0.5)";
          ctx.fillRect(obj.x + 4, obj.y + obj.h * 0.65, obj.w - 8, obj.h * 0.3);
          // Figure silhouette
          ctx.fillStyle = "rgba(200,140,60,0.6)";
          ctx.fillRect(obj.x + obj.w * 0.35, obj.y + obj.h * 0.3, 8, obj.h * 0.4);
          ctx.beginPath();
          ctx.arc(obj.x + obj.w * 0.39, obj.y + obj.h * 0.25, 6, 0, Math.PI * 2);
          ctx.fill();
          // Sun disk
          ctx.fillStyle = "rgba(255,200,50,0.5)";
          ctx.beginPath(); ctx.arc(obj.x + obj.w * 0.6, obj.y + obj.h * 0.2, 8, 0, Math.PI * 2); ctx.fill();
          // Gold border
          ctx.strokeStyle = isNear ? "#f9d342" : "#c09050"; ctx.lineWidth = 2;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        }
        break;
      }

      case "cartouche": {
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(obj.x + 3, obj.y + 3, obj.w, obj.h);
        // Stone base
        const cg2 = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.w, obj.y + obj.h);
        cg2.addColorStop(0, "#8a7548"); cg2.addColorStop(0.5, isNear ? "#b09060" : "#9a8558"); cg2.addColorStop(1, "#6a5838");
        ctx.fillStyle = cg2;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Oval border (cartouche)
        ctx.strokeStyle = isNear ? "#f9d342" : "#c0a050"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(obj.x + obj.w/2, obj.y + obj.h/2, obj.w/2 - 2, obj.h/2 - 2, 0, 0, Math.PI * 2); ctx.stroke();
        // Bottom bar of cartouche
        ctx.beginPath(); ctx.moveTo(obj.x + 2, obj.y + obj.h - 4); ctx.lineTo(obj.x + obj.w - 2, obj.y + obj.h - 4); ctx.stroke();
        if (obj.inspectDone) {
          ctx.fillStyle = "#e0c070";
          ctx.font = "6px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(obj.nameFragment || "", obj.x + obj.w/2, obj.y + obj.h/2);
        }
        break;
      }

      case "cartouche-erased": {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(obj.x + 3, obj.y + 3, obj.w, obj.h);
        ctx.fillStyle = obj.restored ? "#9a8450" : (isNear ? "#7a6442" : "#524535");
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = isNear ? "#f9d342" : "#5a4a30"; ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.ellipse(obj.x + obj.w/2, obj.y + obj.h/2, obj.w/2 - 2, obj.h/2 - 2, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        // Chisel marks
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const mx = obj.x + 4 + Math.random() * (obj.w - 8);
          const my = obj.y + 4 + Math.random() * (obj.h - 8);
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 4, my + 4); ctx.stroke();
        }
        if (obj.restored) {
          ctx.fillStyle = "#f0d070";
          ctx.font = "6px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("ATEN", obj.x + obj.w/2, obj.y + obj.h/2);
        }
        break;
      }

      case "watcher-skull": {
        const wx = obj.x + obj.w / 2, wy = obj.y + obj.h / 2;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(wx + 2, wy + obj.h/2 + 3, obj.w * 0.45, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Skull gradient
        const skg = ctx.createRadialGradient(wx - 3, wy - 3, 0, wx, wy, obj.w / 1.8);
        skg.addColorStop(0, isNear ? "#ccc8b8" : "#aaa898");
        skg.addColorStop(0.7, "#7a7868");
        skg.addColorStop(1, "#505048");
        ctx.fillStyle = skg;
        ctx.beginPath(); ctx.arc(wx, wy, obj.w / 2, 0, Math.PI * 2); ctx.fill();
        // Eye sockets
        ctx.fillStyle = "#1a1810";
        ctx.beginPath(); ctx.ellipse(wx - 5, wy - 2, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(wx + 5, wy - 2, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Nasal cavity
        ctx.beginPath(); ctx.arc(wx, wy + 3, 2, 0, Math.PI * 2); ctx.fill();
        // Teeth
        ctx.fillStyle = "#e0d8c0";
        for (let t = -2; t <= 2; t++) {
          ctx.fillRect(wx + t * 4 - 1, wy + 8, 3, 5);
        }
        // Painted direction
        ctx.fillStyle = obj.inspectDone ? "#80c860" : "#c07030";
        ctx.font = `${obj.w * 0.65}px serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(obj.facePainted, wx, wy - 1);
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(wx, wy, obj.w / 2 + 2, 0, Math.PI * 2); ctx.stroke();
        }
        break;
      }

      case "offering-item":
      case "key-fragment":
      case "canopic-ring":
      case "canopic-seal": {
        const ix = obj.x + obj.w / 2, iy = obj.y + obj.h / 2;
        const r = Math.min(obj.w, obj.h) / 2;
        // Glow
        if (isNear) {
          const glow = ctx.createRadialGradient(ix, iy, 0, ix, iy, r * 2.5);
          glow.addColorStop(0, "rgba(255,215,80,0.25)"); glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(ix, iy, r * 2.5, 0, Math.PI * 2); ctx.fill();
        }
        // Idle float glow
        const idleGlow = ctx.createRadialGradient(ix, iy, 0, ix, iy, r * 1.8);
        idleGlow.addColorStop(0, "rgba(194,168,107,0.2)"); idleGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = idleGlow;
        ctx.beginPath(); ctx.arc(ix, iy, r * 1.8, 0, Math.PI * 2); ctx.fill();
        // Main gem
        const itemGrad = ctx.createRadialGradient(ix - r * 0.3, iy - r * 0.3, 0, ix, iy, r);
        const baseCol = obj.type === "canopic-seal" ? "#c8b880" : obj.type === "canopic-ring" ? "#c8a030" : obj.color || "#c0a050";
        itemGrad.addColorStop(0, "#fff8e0"); itemGrad.addColorStop(0.3, baseCol); itemGrad.addColorStop(1, "#7a6020");
        ctx.fillStyle = itemGrad;
        ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI * 2); ctx.fill();
        // Shine
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.arc(ix - r * 0.3, iy - r * 0.3, r * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = isNear ? "#f9d342" : "#c0a050"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI * 2); ctx.stroke();
        break;
      }

      default: {
        // decoration, altar, tablet, scroll, amulet, cedar-chest etc.
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(obj.x + 3, obj.y + 3, obj.w, obj.h);
        const defG = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.w, obj.y + obj.h);
        const c = obj.color || "#6a5535";
        defG.addColorStop(0, c);
        defG.addColorStop(1, shadeColor(c, -30));
        ctx.fillStyle = defG;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Top highlight
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(obj.x, obj.y, obj.w, 3);
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        }
        break;
      }
    }

    // Proximity interaction prompt
    if (isNear && !inspectState.active) {
      ctx.fillStyle = "rgba(249,211,66,0.85)";
      ctx.font = "bold 10px 'Cinzel', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("[ E ]", obj.x + obj.w / 2, obj.y - 6);
    }

    ctx.restore();
  }
}

// =====================
// COLOR UTILITY
// =====================
function shadeColor(hex, pct) {
  const num = parseInt(hex.replace("#",""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + pct));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + pct));
  const b = Math.max(0, Math.min(255, (num & 0xff) + pct));
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2,"0")).join("");
}

// =====================
// DRAW — PLAYER
// =====================
function drawPlayer() {
  const px = player.x, py = player.y;
  const walk = player.walkFrame;
  const isMoving = player.isMoving;

  ctx.save();

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath(); ctx.ellipse(px + 2, py + 14, 8, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Legs (walking animation)
  if (isMoving) {
    const legSwing = Math.sin(walk) * 5;
    ctx.fillStyle = "#c8a870";
    ctx.fillRect(px - 4, py + 6, 4, 10 + legSwing);
    ctx.fillRect(px + 2, py + 6, 4, 10 - legSwing);
  } else {
    ctx.fillStyle = "#c8a870";
    ctx.fillRect(px - 4, py + 6, 4, 10);
    ctx.fillRect(px + 2, py + 6, 4, 10);
  }

  // Robe / tunic body
  const robeGrad = ctx.createLinearGradient(px - 8, py, px + 8, py);
  robeGrad.addColorStop(0, "#d8c898");
  robeGrad.addColorStop(0.5, "#f0e8d0");
  robeGrad.addColorStop(1, "#c8b880");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(px - 7, py + 4);
  ctx.lineTo(px - 8, py + 8);
  ctx.lineTo(px + 8, py + 8);
  ctx.lineTo(px + 7, py + 4);
  ctx.closePath();
  ctx.fill();

  // Arms
  if (isMoving) {
    const armSwing = Math.sin(walk) * 4;
    ctx.fillStyle = "#d8c898";
    ctx.fillRect(px - 10, py - 2 + armSwing, 4, 8);
    ctx.fillRect(px + 6, py - 2 - armSwing, 4, 8);
  } else {
    ctx.fillStyle = "#d8c898";
    ctx.fillRect(px - 10, py - 2, 4, 8);
    ctx.fillRect(px + 6, py - 2, 4, 8);
  }

  // Head
  const headGrad = ctx.createRadialGradient(px - 2, py - 8, 0, px, py - 7, 9);
  headGrad.addColorStop(0, "#f0e0c0");
  headGrad.addColorStop(0.6, "#d4b880");
  headGrad.addColorStop(1, "#a88040");
  ctx.fillStyle = headGrad;
  ctx.beginPath(); ctx.arc(px, py - 7, 9, 0, Math.PI * 2); ctx.fill();

  // Nemes headcloth
  ctx.fillStyle = "#4040c0";
  ctx.beginPath();
  ctx.arc(px, py - 10, 8.5, Math.PI, 2 * Math.PI);
  ctx.fill();
  // Headdress stripe
  ctx.fillStyle = "#f0d060";
  ctx.fillRect(px - 8.5, py - 13, 17, 3);
  // Side lappets
  ctx.fillStyle = "#3838a8";
  ctx.fillRect(px - 10, py - 11, 4, 8);
  ctx.fillRect(px + 6, py - 11, 4, 8);
  // Stripe on lappets
  ctx.fillStyle = "#f0d060";
  ctx.fillRect(px - 9, py - 9, 2, 1);
  ctx.fillRect(px + 7, py - 9, 2, 1);

  // Eyes
  ctx.fillStyle = "#1a0e06";
  ctx.beginPath(); ctx.arc(px - 3, py - 8, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 3, py - 8, 1.5, 0, Math.PI * 2); ctx.fill();
  // Kohl lines
  ctx.strokeStyle = "#1a0e06"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(px - 5, py - 8); ctx.lineTo(px - 3, py - 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px + 3, py - 8); ctx.lineTo(px + 5, py - 8); ctx.stroke();

  // Held torch
  if (player.heldItem?.type === "torch") {
    ctx.fillStyle = "#a07830";
    ctx.fillRect(px + 9, py - 5, 4, 14);
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(px + 10, py - 5, 2, 12);
    if (player.lampOn) {
      const tp = 0.8 + Math.sin(gameTime * 8) * 0.2;
      const tFlame = ctx.createRadialGradient(px + 11, py - 10, 0, px + 11, py - 8, 10 * tp);
      tFlame.addColorStop(0, "rgba(255,250,180,0.9)");
      tFlame.addColorStop(0.4, "rgba(255,160,30,0.7)");
      tFlame.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = tFlame;
      ctx.beginPath(); ctx.arc(px + 11, py - 9, 10 * tp, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.restore();
}

// =====================
// DRAW — LIGHTING
// =====================
function drawLighting() {
  const inCorridor = currentRoom?.id === "deep-corridor";
  const useCorridorLight = inCorridor && corridorTorchMounted;
  const bracket = useCorridorLight ? currentRoom.objects.find(o => o.type === "bracket") : null;
  const lightX = bracket ? bracket.x + bracket.w / 2 : player.x;
  const lightY = bracket ? bracket.y + bracket.h / 2 : player.y;
  const baseRadius = (player.lampOn || useCorridorLight) ? 220 : 65;
  const pulse = 1 + Math.sin(gameTime * 0.7) * 0.06; // slow gentle breathe
  const radius = baseRadius * pulse;
  const ambient = (player.lampOn || useCorridorLight) ? 0.38 : 0.62;

  // Rebuild gradients only when position / state changes meaningfully
  const key = _lgKey(player.x, player.y, player.lampOn, useCorridorLight, lightX, lightY, baseRadius);
  if (_lgCache.key !== key) {
    _lgCache.key = key;
    if (useCorridorLight) {
      const bg = ctx.createRadialGradient(lightX, lightY, baseRadius * 0.08, lightX, lightY, baseRadius);
      bg.addColorStop(0, "rgba(255,225,160,0.32)");
      bg.addColorStop(0.4, "rgba(255,195,110,0.14)");
      bg.addColorStop(0.7, "rgba(200,130,50,0.05)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      _lgCache.bracketGrad = bg;
      const bf = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 20);
      bf.addColorStop(0, "rgba(255,250,200,0.4)");
      bf.addColorStop(1, "rgba(0,0,0,0)");
      _lgCache.bracketFlicker = bf;
      const ph = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, 55);
      ph.addColorStop(0, "rgba(255,240,200,0.08)");
      ph.addColorStop(1, "rgba(0,0,0,0)");
      _lgCache.playerHalo = ph;
    } else {
      const lg = ctx.createRadialGradient(player.x, player.y, baseRadius * 0.08, player.x, player.y, baseRadius);
      if (player.lampOn) {
        lg.addColorStop(0, "rgba(255,235,180,0.28)");
        lg.addColorStop(0.3, "rgba(255,200,120,0.14)");
        lg.addColorStop(0.6, "rgba(200,140,60,0.06)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        lg.addColorStop(0, "rgba(200,190,170,0.10)");
        lg.addColorStop(0.5, "rgba(160,150,130,0.04)");
        lg.addColorStop(1, "rgba(0,0,0,0)");
      }
      _lgCache.mainGrad = lg;
      if (player.lampOn) {
        const fl = ctx.createRadialGradient(player.x + 11, player.y - 10, 0, player.x + 11, player.y - 10, 18);
        fl.addColorStop(0, "rgba(255,250,180,0.35)");
        fl.addColorStop(1, "rgba(0,0,0,0)");
        _lgCache.flickerGrad = fl;
      }
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(0,0,0,${ambient})`;
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.globalCompositeOperation = "lighter";

  if (useCorridorLight) {
    ctx.fillStyle = _lgCache.bracketGrad;
    ctx.beginPath(); ctx.arc(lightX, lightY, radius, 0, Math.PI * 2); ctx.fill();
    // Torch flicker intensity modulated per-frame by pulse (cheap — just alpha)
    ctx.globalAlpha = pulse;
    ctx.fillStyle = _lgCache.bracketFlicker;
    ctx.beginPath(); ctx.arc(lightX, lightY, 20, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = _lgCache.playerHalo;
    ctx.beginPath(); ctx.arc(player.x, player.y, 55, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = _lgCache.mainGrad;
    ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill();
    if (player.lampOn) {
      ctx.globalAlpha = pulse;
      ctx.fillStyle = _lgCache.flickerGrad;
      ctx.beginPath(); ctx.arc(player.x + 11, player.y - 10, 18, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();
}

// =====================
// GAME LOOP
// =====================
function loop() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (titleScreenActive) {
    gameTime += 0.03;
    if (titleFadeOut) {
      titleAlpha = Math.max(0, titleAlpha - 0.025);
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
  if (!roomFadingOut && !roomFadingIn) checkDoorTransition();
  checkSarcophagusOpen();
  updateSarcophagus();
  updateRoomFade();

  gameTime += 0.016;
  cameraState.zoom += (cameraState.targetZoom - cameraState.zoom) * 0.1;

  applyCameraTransform();
  drawTomb();
  drawObjects();
  drawPlayer();
  drawLighting();
  drawRoomFade();

  resetTransform();
  updateMapDot();

  requestAnimationFrame(loop);
}

// =====================
// BOOT
// =====================
updateUI();
loop();

