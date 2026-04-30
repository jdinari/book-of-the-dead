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
    case "torch":       return "🔥";
    case "sarcophagus": return "🪦";
    case "ushabti":     return "🗿";
    case "glyph":       return "𓂀";
    case "rosetta":     return "🔹";
    case "tablet":      return "📜";
    case "scroll":      return "📜";
    case "amulet":      return "💠";
    default:            return "•";
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
function renderMap() {
  const padding = 40;
  const size    = 120;

  const panel   = mapPanel.getBoundingClientRect();
  const current = MAP_LAYOUT[currentRoom.id];
  if (!current) return;

  const centerX = panel.width  / 2;
  const centerY = panel.height / 2;

  const offsetX = centerX - (current.x * size + padding + size / 2);
  const offsetY = centerY - (current.y * size + padding + size / 2);

  let html = `<div class="map-canvas" style="position:relative;">`;

  // rooms
  for (const room of rooms) {
    const pos = MAP_LAYOUT[room.id];
    if (!pos) continue;

    const x         = pos.x * size + padding + offsetX;
    const y         = pos.y * size + padding + offsetY;
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

  // player dot
  const p = MAP_LAYOUT[currentRoom.id];
  if (p) {
    html += `
      <div style="
        position:absolute;
        left:${p.x * size + padding + size / 2 + offsetX}px;
        top:${p.y  * size + padding + size / 2 + offsetY}px;
        transform:translate(-50%,-50%);
        width:10px; height:10px; border-radius:50%;
        background:red; box-shadow:0 0 10px red;
      "></div>
    `;
  }

  html += `</div>`;
  mapPanel.innerHTML = html;
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
  let help = "Controls: W/A/S/D or arrows to move · E to inspect · X to pick up/drop · Q to cycle held item · L to light torch";
  if (mapUnlocked) help += " · M to toggle map";
  if (nearObject?.type === "glyph" && hasFullTranslation()) {
    help += " · G to decode glyphs";
  }
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
  if (mapVisible) renderMap();
}
