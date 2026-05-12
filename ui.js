// =====================
// UI.JS
// All rendering/display functions for HUD, map,
// inspect panel, notebook, inventory, help text.
// Depends on: state.js, rooms.js
// =====================

// =====================
// INSPECT UI
// =====================
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
    const glyphDisplay = Array.isArray(obj.glyphText)
      ? obj.glyphText.join(" ")
      : obj.glyphText;
    lines.push(`Inscription: ${glyphDisplay || "𓂀 𓄿 𓈖 𓍿 𓏏 𓊪"}`);
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
    lines.push(obj.locked
      ? "It remains sealed. The glyphs and the light should reveal the way."
      : "The door is open. Step through to continue.");
  } else if (obj.type === "canopic") {
    lines.push(`Canopic jar — ${obj.head}-headed stopper.`);
    lines.push(obj.text || "");
    const next = CANOPIC_ORDER[canopicSequence.length];
    if (canopicSequence.includes(obj.ritualIndex)) {
      lines.push("✓ Already touched in this ritual.");
    } else if (obj.ritualIndex === next) {
      lines.push("This is the next jar in the ritual sequence.");
    } else {
      lines.push("Not yet. Follow the inscription's order.");
    }
  } else if (obj.type === "offering-bowl") {
    lines.push(obj.filled ? `✓ ${obj.offeringType} offering accepted.` : (obj.text || ""));
    if (!obj.filled) {
      const has = inventory.some(i => i.type === "offering-item" && i.offeringType === obj.offeringType);
      lines.push(has ? `You have the right offering. Press E to place it.` : `Find the ${obj.offeringType} offering to fill this bowl.`);
    }
  } else if (obj.type === "cartouche" || obj.type === "cartouche-erased") {
    lines.push(obj.text || "A royal cartouche.");
    if (obj.type === "cartouche-erased" && !obj.restored && galleryNameFragments.length >= 2) {
      lines.push(`You know the name: ${galleryNameFragments.join("")}EN. Inspect it again to speak the name.`);
    }
  } else if (obj.type === "niche") {
    if (obj.hidden) {
      lines.push("A blank section of wall.");
    } else {
      lines.push(obj.text || "A hidden niche.");
      if (obj.containsItem && !obj.containsItem.pickedUp) {
        lines.push(`Press X to take the ${obj.containsItem.name}.`);
      }
    }
  } else if (obj.type === "watcher-skull") {
    lines.push(obj.text || "A skull with a painted marking.");
    lines.push(`Direction: ${obj.facePainted}`);
    lines.push(`Watchers observed: ${watcherSkullsRead} / ${WATCHER_SKULL_COUNT}`);
  } else if (obj.type === "wall-painting") {
    if (obj.hidden) {
      lines.push("It's too dark to see anything on this wall.");
    } else {
      lines.push(obj.text || "A painted wall scene.");
    }
  } else if (obj.type === "bracket") {
    lines.push(obj.text || "A wall bracket.");
    if (!obj.mounted) {
      lines.push(player.heldItem?.type === "torch" && player.lampOn
        ? "Press T to mount your lit torch here."
        : "Hold a lit torch (L to light) and press T to mount it.");
    }
  } else if (["key-fragment", "canopic-ring", "canopic-seal"].includes(obj.type)) {
    lines.push(obj.text || "A curious artifact.");
    lines.push("Press X to pick it up.");
  } else if (obj.type === "offering-item") {
    lines.push(obj.text || "An offering item.");
    lines.push("Press X to pick it up, then bring it to the matching bowl.");
  } else {
    // covers decoration, altar, tablet, scroll, amulet, etc.
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

// =====================
// INVENTORY ICONS
// =====================
function getItemIcon(item) {
  if (!item) return "";
  switch (item.type) {
    case "torch":        return "🔥";
    case "sarcophagus":  return "🪦";
    case "ushabti":      return "🗿";
    case "glyph":        return "𓂀";
    case "rosetta":      return "🔹";
    case "tablet":       return "📜";
    case "scroll":       return "📜";
    case "amulet":       return "💠";
    case "offering-item":
      if (item.offeringType === "bread")   return "🫓";
      if (item.offeringType === "oil")     return "🏺";
      if (item.offeringType === "incense") return "🪔";
      return "•";
    case "key-fragment":  return "🗝";
    case "canopic-ring":  return "⭕";
    case "canopic-seal":  return "🔶";
    default:              return "•";
  }
}

// =====================
// GLYPH NOTEBOOK
// =====================
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
    <div style="margin-top:16px; opacity:0.6; font-size:12px;">Press V to close</div>
  `;
}

function toggleNotebook() {
  notebookOpen = !notebookOpen;

  if (notebookOpen) {
    glyphPanel.classList.remove("hidden");
    renderGlyphNotebook();
    setHUDVisible(false);
    inspectState.active = false;
    hideInspectUI();
  } else {
    glyphPanel.classList.add("hidden");
    setHUDVisible(true);
  }
}

// =====================
// MAP
// =====================
// Cached map geometry — computed once per renderMap call, reused every frame in updateMapDot
const _mapCache = { padding: 40, size: 120, offsetX: 0, offsetY: 0, roomLeft: 0, roomTop: 0 };

function renderMap() {
  const { padding, size } = _mapCache;

  const panel   = mapPanel.getBoundingClientRect();
  const current = MAP_LAYOUT[currentRoom.id];
  if (!current) return;

  _mapCache.offsetX  = panel.width  / 2 - (current.x * size + padding + size / 2);
  _mapCache.offsetY  = panel.height / 2 - (current.y * size + padding + size / 2);
  _mapCache.roomLeft = current.x * size + padding + _mapCache.offsetX;
  _mapCache.roomTop  = current.y * size + padding + _mapCache.offsetY;

  let html = `<div style="position:relative; width:100%; height:100%;">`;

  for (const room of rooms) {
    const pos = MAP_LAYOUT[room.id];
    if (!pos) continue;

    const x         = pos.x * size + padding + _mapCache.offsetX;
    const y         = pos.y * size + padding + _mapCache.offsetY;
    const isCurrent = room.id === currentRoom.id;

    html += `
      <div class="map-room-node ${isCurrent ? "current" : ""}"
           style="
             position:absolute; left:${x}px; top:${y}px;
             width:${size}px; height:${size}px;
             background:${isCurrent ? "#c9a24a" : "#3a352d"};
             border:2px solid #222; box-sizing:border-box;
             display:flex; align-items:center; justify-content:center;
             color:#fff; font-size:11px; text-align:center; padding:4px;
           ">
        ${room.name}
      </div>
    `;
  }

  // Stable id — updateMapDot moves this element every frame, no innerHTML rebuild
  html += `<div id="map-player-dot" style="
    position:absolute;
    width:10px; height:10px; border-radius:50%;
    background:#ffd76a; box-shadow:0 0 8px rgba(255,215,106,0.9);
    transform:translate(-50%,-50%);
    pointer-events:none;
  "></div>`;

  html += `</div>`;
  mapPanel.innerHTML = html;

  updateMapDot();   // position dot immediately so it's never invisible on open
}

/**
 * updateMapDot()
 * Repositions the player dot each frame to match exact world position.
 * Only touches two style properties — no DOM reconstruction.
 */
function updateMapDot() {
  if (!mapVisible) return;
  const dot = document.getElementById("map-player-dot");
  if (!dot) return;

  const { padding, size, offsetX, offsetY } = _mapCache;
  const pos = MAP_LAYOUT[currentRoom.id];
  if (!pos) return;

  const roomLeft = pos.x * size + padding + offsetX;
  const roomTop  = pos.y * size + padding + offsetY;

  dot.style.left = (roomLeft + (player.x / world.width)  * size) + "px";
  dot.style.top  = (roomTop  + (player.y / world.height) * size) + "px";
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

// =====================
// HUD VISIBILITY
// =====================
function setHUDVisible(visible) {
  document.getElementById("quest-panel").style.display    = visible ? "block" : "none";
  document.getElementById("inventory-grid").style.display = visible ? "grid"  : "none";

  if (!visible) {
    mapPanel.classList.add("hidden");
    mapVisible = false;
  }
}

// =====================
// HELP TEXT
// =====================
function updateHelpText() {
  let help = "W/A/S/D · E inspect · X pick up/drop · Q cycle · L light torch";
  if (mapUnlocked) help += " · M map";
  if (nearObject?.type === "glyph" && hasFullTranslation()) help += " · G decode";
  if (nearObject?.type === "bracket" && !nearObject.mounted && player.heldItem?.type === "torch" && player.lampOn) help += " · T mount torch";
  if (nearObject?.type === "offering-bowl" && inventory.some(i => i.type === "offering-item" && i.offeringType === nearObject.offeringType)) help += " · E to place offering";
  helpText.textContent = help;
}

// =====================
// MAIN HUD UPDATE
// =====================
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
}
