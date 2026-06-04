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
          const mRise = mummySitProgress * sh * 1.8;
          const mummyImg = sprites.player_f0 || sprites.mummy;
          if (mummyImg && mummyImg.complete && mummyImg.naturalWidth > 0) {
            // Use sprite instead of canvas drawing
            const mw = sh * 0.55;
            const mh = mw * 1.2;
            ctx.save();
            ctx.globalAlpha = Math.min(1, mummySitProgress * 2);
            ctx.shadowColor = "rgba(255,220,100,0.5)";
            ctx.shadowBlur = 12;
            ctx.drawImage(mummyImg, cx2 - mw/2, cy2 - mRise - mh/2, mw, mh);
            ctx.shadowBlur = 0;
            ctx.restore();
            break; // skip canvas mummy drawing below
          }
          // Fallback canvas mummy below
          const mRise2 = mRise; // alias for original code
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
        // Seth/Anubis dark-robed ushabti figure — animated walk idle
        // 4 frames at 32x56 each. Gently cycles between frames 0-1 (idle sway).
        const frameIdx = Math.floor(gameTime * 1.2) % 2; // slow idle sway
        const ushKey = `ushabti_f${frameIdx}`;
        const ushImg = sprites[ushKey] || sprites.ushabti_f0 || sprites.ushabti;

        // Scale: display at obj.w wide, proportional height (native 32x56 → ~1.75 tall)
        const dispW = obj.w + 6;
        const dispH = Math.round(dispW * 1.75);
        const ux = obj.x + obj.w/2 - dispW/2;
        const uy = obj.y + obj.h - dispH + 4; // anchor to bottom

        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(obj.x + obj.w/2 + 1, obj.y + obj.h + 2, dispW*0.38, 3, 0, 0, Math.PI*2);
        ctx.fill();

        if (ushImg && ushImg.complete && ushImg.naturalWidth > 0) {
          ctx.save();
          if (isNear) { ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 16; }
          ctx.drawImage(ushImg, ux, uy, dispW, dispH);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          // Fallback silhouette
          ctx.fillStyle = "#3a3858";
          ctx.fillRect(ux, uy, dispW, dispH);
        }

        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 8;
          ctx.strokeRect(ux - 1, uy - 1, dispW + 2, dispH + 2);
          ctx.shadowBlur = 0;
        }
        break;
      }

      case "rosetta": {
        // Hieroglyph coin sprites — each piece is a golden oval coin
        const glyphList = ["𓂀","𓄿","𓈖","𓏏","𓊪"];
        const coinKeys  = ["rosetta_1","rosetta_2","rosetta_3","rosetta_4","rosetta_5"];
        const coinIdx   = glyphList.indexOf(obj.glyph);
        const coinKey   = coinKeys[Math.max(0, coinIdx)];
        const coinImg   = sprites[coinKey];

        // Gentle float bob
        const floatY = Math.sin(gameTime * 1.4 + obj.x * 0.1) * 1.5;

        // Glow aura
        const auraR = obj.w * 1.8;
        const aura = ctx.createRadialGradient(obj.x+obj.w/2, obj.y+obj.h/2+floatY, 0,
                                               obj.x+obj.w/2, obj.y+obj.h/2+floatY, auraR);
        aura.addColorStop(0, "rgba(220,170,50,0.22)");
        aura.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aura;
        ctx.beginPath(); ctx.arc(obj.x+obj.w/2, obj.y+obj.h/2+floatY, auraR, 0, Math.PI*2); ctx.fill();

        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath(); ctx.ellipse(obj.x+obj.w/2+1, obj.y+obj.h+2+floatY, obj.w*0.5, 3, 0, 0, Math.PI*2); ctx.fill();

        if (coinImg && coinImg.complete && coinImg.naturalWidth > 0) {
          ctx.save();
          if (isNear) { ctx.shadowColor = "#f0d060"; ctx.shadowBlur = 14; }
          ctx.drawImage(coinImg, obj.x, obj.y + floatY, obj.w, obj.h);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          // Fallback: gold oval
          const rg = ctx.createRadialGradient(obj.x+obj.w/2-2, obj.y+obj.h/2-2+floatY, 0,
                                               obj.x+obj.w/2, obj.y+obj.h/2+floatY, obj.w*0.6);
          rg.addColorStop(0, "#f8e080"); rg.addColorStop(0.5, "#d4a030"); rg.addColorStop(1, "#886010");
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.ellipse(obj.x+obj.w/2, obj.y+obj.h/2+floatY, obj.w/2, obj.h/2, 0, 0, Math.PI*2); ctx.fill();
        }
        // Letter hint if decoded
        if (playerGlyphMap[obj.glyph]) {
          ctx.fillStyle = "#f8e090";
          ctx.font = `bold ${Math.min(obj.w,obj.h)*0.6}px monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(playerGlyphMap[obj.glyph], obj.x+obj.w/2, obj.y+obj.h+8+floatY);
        }
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.strokeRect(obj.x-1, obj.y-1+floatY, obj.w+2, obj.h+2);
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
        // Sprite: green scarab beetle
        const scx = obj.x + obj.w/2, scy = obj.y + obj.h/2;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath(); ctx.ellipse(scx+2, scy+3, obj.w*0.55, 4, 0, 0, Math.PI*2); ctx.fill();

        const scarabImg = sprites.scarab;
        if (scarabImg && scarabImg.complete && scarabImg.naturalWidth > 0) {
          ctx.save();
          if (isNear) { ctx.shadowColor = "#50f090"; ctx.shadowBlur = 16; }
          ctx.drawImage(scarabImg, obj.x - 4, obj.y - 4, obj.w + 8, obj.h + 8);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          ctx.fillStyle = "#2a9850";
          ctx.beginPath(); ctx.ellipse(scx, scy, obj.w*0.5, obj.h*0.4, 0, 0, Math.PI*2); ctx.fill();
        }
        if (isNear) {
          ctx.strokeStyle = "#80f0a0"; ctx.lineWidth = 1.5;
          ctx.strokeRect(obj.x-2, obj.y-2, obj.w+4, obj.h+4);
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
        // Sprite: canopic jar
        const ccx = obj.x + obj.w/2;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.ellipse(ccx+2, obj.y+obj.h+3, obj.w*0.4, 4, 0, 0, Math.PI*2); ctx.fill();

        const canImg = sprites.canopic;
        if (canImg && canImg.complete && canImg.naturalWidth > 0) {
          ctx.save();
          if (isNear) { ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 10; }
          // Draw slightly larger than obj bounds for visual weight
          ctx.drawImage(canImg, obj.x - 4, obj.y - 2, obj.w + 8, obj.h + 6);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          ctx.fillStyle = isNear ? "#9a8460" : "#7a6a48";
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }
        // Ritual order indicator (small number badge)
        if (obj.ritualIndex) {
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.beginPath(); ctx.arc(obj.x + obj.w - 3, obj.y + 3, 5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#f0d070"; ctx.font = "bold 7px monospace";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(obj.ritualIndex, obj.x + obj.w - 3, obj.y + 4);
        }
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.strokeRect(obj.x-2, obj.y-2, obj.w+4, obj.h+4);
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
        const ix = obj.x + obj.w/2, iy = obj.y + obj.h/2;

        // Pick sprite by type
        const itemSpriteMap = {
          "canopic-seal": "gem_purple",
          "canopic-ring": "gem_red",
          "key-fragment": "gem_purple",
          // offering-items by offeringType color
        };
        let itemKey = itemSpriteMap[obj.type];
        if (obj.type === "offering-item") {
          itemKey = obj.offeringType === "bread" ? "gem_red"
                  : obj.offeringType === "oil"   ? "gem_blue"
                  : "gem_purple";
        }

        const iImg = itemKey ? sprites[itemKey] : null;

        // Idle ambient glow
        const idleGlow = ctx.createRadialGradient(ix, iy, 0, ix, iy, obj.w * 1.4);
        idleGlow.addColorStop(0, "rgba(194,168,107,0.18)"); idleGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = idleGlow;
        ctx.beginPath(); ctx.arc(ix, iy, obj.w*1.4, 0, Math.PI*2); ctx.fill();

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath(); ctx.ellipse(ix+1, iy+2, obj.w*0.5, 3, 0, 0, Math.PI*2); ctx.fill();

        if (iImg && iImg.complete && iImg.naturalWidth > 0) {
          ctx.save();
          if (isNear) { ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 12; }
          ctx.drawImage(iImg, obj.x, obj.y, obj.w, obj.h);
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          // Fallback gem circle
          const r = Math.min(obj.w, obj.h)/2;
          const baseCol = obj.type === "canopic-seal" ? "#c8b880"
                        : obj.type === "canopic-ring" ? "#c8a030" : obj.color || "#c0a050";
          const grad = ctx.createRadialGradient(ix-r*0.3, iy-r*0.3, 0, ix, iy, r);
          grad.addColorStop(0, "#fff8e0"); grad.addColorStop(0.3, baseCol); grad.addColorStop(1, "#7a6020");
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI*2); ctx.fill();
        }
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.strokeRect(obj.x-1, obj.y-1, obj.w+2, obj.h+2);
        }
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
  // Use mummy player sprite if loaded, else fall back to canvas drawing
  const moving = player.isMoving;
  const frameIdx = moving ? (Math.floor(gameTime * 8) % 2) : 0;
  const pImg = sprites[`player_f${frameIdx}`] || sprites.player_f0;

  const pw = player.size * 2.2;
  const ph = pw * 1.2;
  const px = player.x - pw / 2;
  const py = player.y - ph / 2;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + ph*0.38, pw*0.38, 4, 0, 0, Math.PI*2);
  ctx.fill();

  if (pImg && pImg.complete && pImg.naturalWidth > 0) {
    ctx.save();
    // Torch light tint when lamp on
    if (player.lampOn) {
      ctx.shadowColor = "rgba(255,200,80,0.6)";
      ctx.shadowBlur = 8;
    }
    ctx.drawImage(pImg, px, py, pw, ph);
    ctx.shadowBlur = 0;
    ctx.restore();
  } else {
    // Fallback: original canvas player
    ctx.save();
    ctx.fillStyle = "#d4a86a";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6030"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2); ctx.stroke();
    if (player.heldItem) {
      ctx.fillStyle = "#f9d342";
      ctx.beginPath(); ctx.arc(player.x + player.size * 0.7, player.y - player.size * 0.7, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // Held item indicator (small sprite/glow above player)
  if (player.heldItem) {
    ctx.fillStyle = "rgba(249,211,66,0.7)";
    ctx.beginPath();
    ctx.arc(player.x + pw*0.4, player.y - ph*0.55, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1;
    ctx.stroke();
  }
}

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
// SPRITE LOADER
// =====================
const sprites = {};
const SPRITE_FILES = {
  // Characters / figures
  ushabti_f0:  'sprites/ushabti_f0.png',   // Seth/ushabti standing frame 0
  ushabti_f1:  'sprites/ushabti_f1.png',   // Seth/ushabti standing frame 1
  ushabti_f2:  'sprites/ushabti_f2.png',   // Seth/ushabti standing frame 2
  ushabti_f3:  'sprites/ushabti_f3.png',   // Seth/ushabti standing frame 3
  player_f0:   'sprites/player_f0.png',    // Mummy player frame 0
  player_f1:   'sprites/player_f1.png',    // Mummy player frame 1
  mummy:       'sprites/mummy_standing.png', // Mummy for sarcophagus

  // Existing tomb items
  ushabti:     'sprites/ushabti_anubis.png', // fallback Anubis jar
  scarab:      'sprites/scarab.png',
  gem_red:     'sprites/gem_red.png',
  gem_blue:    'sprites/gem_blue.png',
  gem_purple:  'sprites/gem_purple.png',
  ankh:        'sprites/ankh.png',
  canopic:     'sprites/canopic_jar.png',
  eye_of_ra:   'sprites/eye_of_ra.png',
  brazier:     'sprites/brazier.png',

  // Rosetta coin pieces (hieroglyph coins from deben sheet)
  rosetta_1:   'sprites/rosetta_1.png',    // ankh coin
  rosetta_2:   'sprites/rosetta_2.png',    // heron coin
  rosetta_3:   'sprites/rosetta_3.png',    // lotus coin
  rosetta_4:   'sprites/rosetta_4.png',    // goose coin
  rosetta_5:   'sprites/rosetta_5.png',    // eye of horus coin

  // UI / backgrounds
  papyrus:     'sprites/papyrus_panel.png', // inspect panel background

  // Hieroglyph wall tiles (stone carved glyphs for room decoration)
  gtile_eye:   'sprites/gtile_all_02.png',  // eye of Ra tile
  gtile_ankh:  'sprites/gtile_all_03.png',  // ankh tile
  gtile_horus: 'sprites/gtile_all_04.png',  // horus bird tile
  gtile_lion:  'sprites/gtile_all_24.png',  // lion tile
  gtile_foot:  'sprites/gtile_all_10.png',  // foot glyph tile
};

let spritesLoaded = 0;
const spritesTotal = Object.keys(SPRITE_FILES).length;

function loadSprites(callback) {
  for (const [key, src] of Object.entries(SPRITE_FILES)) {
    const img = new Image();
    img.onload = () => {
      spritesLoaded++;
      if (spritesLoaded >= spritesTotal) callback();
    };
    img.onerror = () => {
      // Sprite failed to load - continue anyway, drawing code falls back to canvas
      spritesLoaded++;
      if (spritesLoaded >= spritesTotal) callback();
    };
    img.src = src;
    sprites[key] = img;
  }
}

// Helper: draw a sprite centred on obj, scaled to obj dimensions
// scaleH: multiplier on height (ushabti is 32x64 native so we scale proportionally)
function drawSprite(key, obj, padX=0, padY=0) {
  const img = sprites[key];
  if (!img || !img.complete || img.naturalWidth === 0) return false;
  ctx.drawImage(img,
    obj.x - padX,
    obj.y - padY,
    obj.w + padX*2,
    obj.h + padY*2
  );
  return true;
}

// =====================
// BOOT
// =====================
updateUI();
loadSprites(() => loop());

