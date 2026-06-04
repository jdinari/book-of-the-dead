// =====================
// ENGINE.JS — Enhanced Graphics
// =====================

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
  ctx.fillText("H · Ask Ushabti for hints      V · Glyph Codex      Q · Cycle items", cx, legendY + 30);

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

  // HINT — H key also triggers ushabti hint
  if (k === "h") {
    const hint = getUshabtiHint();
    showUshabtiSpeech(hint);
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

function transitionRoom(door) {
  if (!door || door.locked) return;
  const nextRoom = rooms.find(r => r.id === door.leadsTo);
  if (!nextRoom) return;
  currentRoom = nextRoom;
  _invalidateBgCache(); // force background re-render for new room
  currentRoom.visited = true;
  syncObjectivesFromGameState();
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

// =====================
// TORCH PHYSICS
// =====================
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
    const pulse  = isNear ? (0.85 + Math.sin(gameTime * 4) * 0.15) : 1;

    switch (obj.type) {

      case "sarcophagus": {
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(obj.x + 4, obj.y + 4, obj.w, obj.h);
        // Main body gradient
        const sg = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.h);
        sg.addColorStop(0, "#a07848");
        sg.addColorStop(0.3, "#8b6b3f");
        sg.addColorStop(1, "#5a4025");
        ctx.fillStyle = sg;
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        // Head mask area
        const hg = ctx.createLinearGradient(obj.x + 18, obj.y, obj.x + 54, obj.y);
        hg.addColorStop(0, "#c09050"); hg.addColorStop(0.5, "#e0b870"); hg.addColorStop(1, "#c09050");
        ctx.fillStyle = hg;
        ctx.fillRect(obj.x + 18, obj.y + 4, 36, 22);
        // Face oval
        ctx.fillStyle = "#d4a86a";
        ctx.beginPath();
        ctx.ellipse(obj.x + obj.w / 2, obj.y + 13, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#2a1a08";
        ctx.fillRect(obj.x + obj.w/2 - 7, obj.y + 10, 4, 3);
        ctx.fillRect(obj.x + obj.w/2 + 3, obj.y + 10, 4, 3);
        // Cross-band lines
        ctx.strokeStyle = "#4d3b26"; ctx.lineWidth = 1.5;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(obj.x + 12, obj.y + 8 + i * 8);
          ctx.lineTo(obj.x + obj.w - 12, obj.y + 8 + i * 8);
          ctx.stroke();
        }
        // Gold border
        ctx.strokeStyle = isNear ? "#f9d342" : "#c09050"; ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        // Glow if near
        if (isNear) {
          ctx.shadowColor = "#f9d342"; ctx.shadowBlur = 12;
          ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
          ctx.shadowBlur = 0;
        }
        break;
      }

      case "ushabti": {
        const ux = obj.x + obj.w / 2;
        const uy = obj.y + obj.h;
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(ux + 1, uy + 2, obj.w / 1.6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Body mummy wrap gradient
        const ubg = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.w, obj.y);
        ubg.addColorStop(0, "#505055"); ubg.addColorStop(0.5, isNear ? "#8888aa" : "#686870"); ubg.addColorStop(1, "#505055");
        ctx.fillStyle = ubg;
        // Tapered mummy form
        ctx.beginPath();
        ctx.moveTo(ux - obj.w/2, uy);
        ctx.lineTo(ux - obj.w/3, obj.y + 8);
        ctx.lineTo(ux - obj.w/4, obj.y);
        ctx.lineTo(ux + obj.w/4, obj.y);
        ctx.lineTo(ux + obj.w/3, obj.y + 8);
        ctx.lineTo(ux + obj.w/2, uy);
        ctx.closePath();
        ctx.fill();
        // Wrap lines
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
          const ly = obj.y + i * (obj.h / 5.5);
          const lw = (obj.w / 2) * (1 - i / 8);
          ctx.beginPath(); ctx.moveTo(ux - lw, ly); ctx.lineTo(ux + lw, ly); ctx.stroke();
        }
        // Head
        const hcg = ctx.createRadialGradient(ux, obj.y + 5, 0, ux, obj.y + 5, obj.w * 0.7);
        hcg.addColorStop(0, isNear ? "#a0a0c0" : "#888898");
        hcg.addColorStop(1, "#404048");
        ctx.fillStyle = hcg;
        ctx.beginPath();
        ctx.ellipse(ux, obj.y + 5, obj.w / 1.6, obj.w * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#c2a86b";
        ctx.beginPath(); ctx.ellipse(ux - 3, obj.y + 5, 2, 1.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(ux + 3, obj.y + 5, 2, 1.5, 0, 0, Math.PI*2); ctx.fill();
        // Nemes headdress lines
        ctx.strokeStyle = "rgba(80,70,60,0.5)"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(ux - obj.w/1.6, obj.y + 5); ctx.lineTo(ux - obj.w/3, obj.y + 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ux + obj.w/1.6, obj.y + 5); ctx.lineTo(ux + obj.w/3, obj.y + 12); ctx.stroke();
        // Hieroglyph on body
        ctx.fillStyle = "rgba(194,168,107,0.55)";
        ctx.font = `${obj.h * 0.28}px serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("𓁹", ux, obj.y + obj.h * 0.6);
        // Glow if near
        if (isNear) {
          ctx.strokeStyle = "#f9d342"; ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ux - obj.w/2, uy);
          ctx.lineTo(ux - obj.w/3, obj.y + 8);
          ctx.lineTo(ux - obj.w/4, obj.y);
          ctx.lineTo(ux + obj.w/4, obj.y);
          ctx.lineTo(ux + obj.w/3, obj.y + 8);
          ctx.lineTo(ux + obj.w/2, uy);
          ctx.closePath(); ctx.stroke();
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
          const bpulse = 0.8 + Math.sin(gameTime * 7) * 0.2;
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
  const pulse = 1 + Math.sin(gameTime * 2.5) * 0.1;
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
  checkDoorTransition();

  gameTime += 0.03;
  cameraState.zoom += (cameraState.targetZoom - cameraState.zoom) * 0.1;

  applyCameraTransform();
  drawTomb();
  drawObjects();
  drawPlayer();
  drawLighting();

  resetTransform();
  updateMapDot();

  requestAnimationFrame(loop);
}

// =====================
// BOOT
// =====================
updateUI();
loop();

