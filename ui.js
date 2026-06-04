// =====================
// UI.JS — Enhanced
// =====================

// =====================
// USHABTI HINT SYSTEM
// =====================

// Hint lines keyed by room id — each ushabti god speaks to their domain
const USHABTI_HINTS = {
  "burial-chamber": [
    "Anubis weighs the heart. Find the torch first — its light will guide you through the passages ahead. Press L to ignite it once picked up.",
    "Seek the five golden Rosetta fragments scattered about this chamber. Each bears a hieroglyph. Collect them all, then approach the glyph stone and press G.",
    "Thoth records all knowledge. The glyph stone above holds the sacred word — but you must collect all five Rosetta pieces before you can decode it.",
    "When all trials of this chamber are complete, the sarcophagus shall open. The pharaoh waits to be acknowledged."
  ],
  "right-room": [
    "Horus sees far. The scroll on the eastern shelf holds the key to understanding the tablet. Find it first.",
    "Read the scroll, then approach the great tablet. Knowledge must be carried, not merely sought.",
    "The deep corridor lies east from here — but prepare yourself first. Read all you can in this chamber."
  ],
  "bottom-room": [
    "Osiris commands the dead. Something gleams hidden in the western shadows of this chamber. Seek it carefully.",
    "The altar at the center of this room hungers for an offering. Carry the amulet you find, then press E at the altar to place it.",
    "The east passage opens when the altar is satisfied. All things must be given before they can be received."
  ],
  "west-hall": [
    "Sekhmet speaks the ritual order: Imsety the human-headed first, then Hapy the baboon, then Duamutef the jackal, then Qebehsenuef the falcon.",
    "Touch each canopic jar in sequence. If you err, begin again from Imsety. The rite forgives those who return to the beginning.",
    "The niche shall open when the four sons are honoured in their proper order. Patience, seeker."
  ],
  "north-vestibule": [
    "Hathor accepts three offerings: bread for the body, oil for the flame, smoke for the gods. The bread lies in the cedar chest to the south.",
    "The oil flask and incense cone are not here — seek them in the deeper places of the tomb. The Ossuary holds what you need.",
    "Fill all three bowls and the sealed alcove above shall open onto a hidden sanctum. Few have passed this threshold."
  ],
  "east-gallery": [
    "Ra illuminates what was hidden. Two intact cartouches each bear a scratched syllable — read both before approaching the erased one.",
    "AKHEN from the first. ATEN from the third. Together they form the name of a king the priests tried to unmake. Speak it at the erased cartouche.",
    "He who is named shall be remembered. He who is erased shall be restored by those who seek truth."
  ],
  "deep-corridor": [
    "Sobek lurks in darkness. Carry a lit torch to the iron bracket on the west wall and press T to mount it — then light shall reveal the hidden paintings.",
    "The three wall scenes are invisible in darkness. Light the corridor first. Only then will the pharaoh's story emerge from the stone.",
    "Once lit, this corridor will stay lit — even when you leave. The torch becomes a waypoint."
  ],
  "ossuary": [
    "Nephthys guards the dead with her wings. Four watcher skulls have been placed apart from the others — inspect each one to learn what they see.",
    "All four skulls point in the same direction. Stand where their gazes converge, on the east wall, and press E on the niche you find there.",
    "The oil flask and incense on the southern shelf belong in the Vestibule of Offerings above. Take them when you are ready."
  ],
  "inner-sanctum": [
    "Ptah the creator speaks plainly: you have honoured the gods and fed the dead. The Heart Scarab on the altar is yours — take it.",
    "Read the offering stele and the wall inscription. The story of Akhenaten is told in full here, preserved in this sealed place for three thousand years.",
    "The Heart Scarab carries spell 30B from the Book of the Dead. It is the final offering — the plea to the heart not to testify against its owner."
  ]
};

// Track which hint index we've shown per room
const ushabtiHintIndex = {};
let ushabtiSpeechTimeout = null;

function getUshabtiHint() {
  const roomId = currentRoom?.id;
  if (!roomId) return "I have nothing to say in this place.";

  // If there are ushabtis in this room, prioritize their room-specific hints
  const hints = USHABTI_HINTS[roomId];
  if (!hints || hints.length === 0) {
    return "The ushabtis in this chamber are silent. Explore further.";
  }

  if (!ushabtiHintIndex[roomId]) ushabtiHintIndex[roomId] = 0;
  const hint = hints[ushabtiHintIndex[roomId] % hints.length];
  ushabtiHintIndex[roomId]++;
  return hint;
}

function showUshabtiSpeech(text) {
  const bubble = document.getElementById("ushabti-speech");
  const textEl = document.getElementById("ushabti-speech-text");
  if (!bubble || !textEl) return;
  textEl.textContent = text;
  bubble.classList.add("visible");
  if (ushabtiSpeechTimeout) clearTimeout(ushabtiSpeechTimeout);
  ushabtiSpeechTimeout = setTimeout(() => {
    bubble.classList.remove("visible");
  }, 6000);
}

// =====================
// INSPECT UI
// =====================
function showInspectUI(obj) {
  ui.style.display = "block";
  // Apply papyrus texture background if sprite is loaded
  if (typeof sprites !== "undefined" && sprites.papyrus && sprites.papyrus.complete && sprites.papyrus.naturalWidth > 0) {
    ui.style.backgroundImage = `url(${sprites.papyrus.src})`;
    ui.style.backgroundSize = "cover";
    ui.style.backgroundRepeat = "no-repeat";
  }
  const lines = [];

  if (obj.type === "sarcophagus") {
    lines.push({ head: true, text: "Sarcophagus" });
    lines.push("An ancient sarcophagus carved with prayers for the afterlife.");
    lines.push("It may open once the door is unlocked and the fire is lit.");
  } else if (obj.type === "ushabti") {
    const godName = obj.name || "Ushabti";
    lines.push({ head: true, text: godName });
    lines.push(obj.text || "A small ushabti figurine, its gaze fixed on you.");
  } else if (obj.type === "torch") {
    lines.push({ head: true, text: "Bronze Torch" });
    lines.push(obj.text || "A bronze torch. It will help you see deeper in the tomb.");
    lines.push("Press X to carry it · Press L to ignite it.");
  } else if (obj.type === "rosetta") {
    lines.push({ head: true, text: "Rosetta Fragment" });
    lines.push(obj.text || "A fragment of the Rosetta stone.");
    lines.push(`Glyph: ${obj.glyph}  →  Letter: ${obj.letter}`);
    lines.push("Press X to add to your satchel.");
  } else if (obj.type === "glyph") {
    lines.push({ head: true, text: "Glyph Stone" });
    lines.push(obj.text || "A stone slab etched with hieroglyphs.");
    const glyphDisplay = Array.isArray(obj.glyphText) ? obj.glyphText.join(" ") : obj.glyphText;
    lines.push(`Inscription: ${glyphDisplay || "𓂀 𓄿 𓈖 𓏏 𓊪"}`);
    const known = Object.entries(glyphKnowledge);
    if (known.length === 0) {
      lines.push("No glyphs deciphered yet. Find Rosetta fragments.");
    } else {
      lines.push("Known: " + known.map(([g,m]) => `${g}=${m}`).join("  "));
    }
    if (inventory.filter(item => item.type === "rosetta").length >= 3) {
      lines.push("Press G to decode with your Rosetta fragments.");
    }
  } else if (obj.type === "door") {
    lines.push({ head: true, text: obj.locked ? "Sealed Passage" : "Open Passage" });
    lines.push(obj.text || "A heavy stone door sealed by magic.");
    lines.push(obj.locked ? "It remains sealed. Complete this chamber's trials." : "Step through to continue.");
  } else if (obj.type === "canopic") {
    lines.push({ head: true, text: `Canopic Jar — ${obj.head}` });
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
    lines.push({ head: true, text: `Offering Bowl — ${obj.offeringType}` });
    lines.push(obj.filled ? `✓ ${obj.offeringType} offering accepted.` : (obj.text || ""));
    if (!obj.filled) {
      const has = inventory.some(i => i.type === "offering-item" && i.offeringType === obj.offeringType);
      lines.push(has ? `You carry the ${obj.offeringType}. Press E to place it.` : `Find the ${obj.offeringType} offering to fill this bowl.`);
    }
  } else if (obj.type === "cartouche" || obj.type === "cartouche-erased") {
    lines.push({ head: true, text: obj.type === "cartouche-erased" ? "Erased Cartouche" : "Royal Cartouche" });
    lines.push(obj.text || "A royal cartouche.");
    if (obj.type === "cartouche-erased" && !obj.restored && galleryNameFragments.length >= 2) {
      lines.push(`You know the name: ${galleryNameFragments.join("")}EN. Press E to speak it.`);
    }
  } else if (obj.type === "niche") {
    lines.push({ head: true, text: obj.hidden ? "Blank Wall" : "Hidden Niche" });
    if (obj.hidden) {
      lines.push("A blank section of wall.");
    } else {
      lines.push(obj.text || "A hidden niche.");
      if (obj.containsItem && !obj.containsItem.pickedUp) {
        lines.push(`Press X to take the ${obj.containsItem.name}.`);
      }
    }
  } else if (obj.type === "watcher-skull") {
    lines.push({ head: true, text: "Watcher Skull" });
    lines.push(obj.text || "A skull with a painted marking.");
    lines.push(`Direction: ${obj.facePainted}  ·  Observed: ${watcherSkullsRead} / ${WATCHER_SKULL_COUNT}`);
  } else if (obj.type === "wall-painting") {
    lines.push({ head: true, text: obj.hidden ? "Darkened Wall" : "Wall Painting" });
    lines.push(obj.hidden ? "It's too dark to see clearly here. Light the corridor first." : (obj.text || "A painted wall scene."));
  } else if (obj.type === "bracket") {
    lines.push({ head: true, text: obj.mounted ? "Torch Bracket (Lit)" : "Empty Torch Bracket" });
    lines.push(obj.text || "A wall bracket.");
    if (!obj.mounted) {
      lines.push(player.heldItem?.type === "torch" && player.lampOn
        ? "Press T to mount your lit torch here."
        : "Hold a lit torch (L to light) and press T to mount it.");
    }
  } else if (["key-fragment", "canopic-ring", "canopic-seal"].includes(obj.type)) {
    lines.push({ head: true, text: obj.name });
    lines.push(obj.text || "A curious artifact.");
    lines.push("Press X to pick it up.");
  } else if (obj.type === "offering-item") {
    lines.push({ head: true, text: obj.name });
    lines.push(obj.text || "An offering item.");
    lines.push("Press X to carry it · Bring it to the matching bowl.");
  } else {
    lines.push({ head: true, text: obj.name || "Object" });
    lines.push(obj.text || "You inspect the object and sense ancient purpose.");
  }

  if (obj.type === "torch") {
    lines.push("Press X to carry it.");
  }

  ui.innerHTML = lines.map(line => {
    if (typeof line === "object" && line.head) {
      return `<div style="font-family:'Cinzel',serif;font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;color:#c2a86b;margin-bottom:8px;">${line.text}</div>`;
    }
    return `<div>${line}</div>`;
  }).join("");
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
    case "ushabti":      return "𓁹";
    case "glyph":        return "𓂀";
    case "rosetta":      return "𓋴";
    case "tablet":       return "📜";
    case "scroll":       return "📜";
    case "amulet":       return "𓂧";
    case "offering-item":
      if (item.offeringType === "bread")   return "🫓";
      if (item.offeringType === "oil")     return "🏺";
      if (item.offeringType === "incense") return "𓇋";
      return "•";
    case "key-fragment":  return "🗝";
    case "canopic-ring":  return "⭕";
    case "canopic-seal":  return "𓏥";
    default:              return "•";
  }
}

// =====================
// GLYPH NOTEBOOK
// =====================
function renderGlyphNotebook() {
  const entries = Object.entries(glyphKnowledge);
  glyphPanel.innerHTML = `
    <div class="notebook-title">𓂀 Glyph Codex 𓂀</div>
    <div class="notebook-sub">Fragments of the ancient script, decoded</div>
    <div class="notebook-grid">
      ${
        entries.length === 0
          ? `<div class="note-entry" style="grid-column:1/-1;text-align:center;font-style:italic;opacity:0.6;">No glyphs decoded yet. Find Rosetta fragments.</div>`
          : entries.map(([glyph, meaning]) => `
              <div class="note-entry">
                <span class="glyph-big">${glyph}</span>
                <div class="glyph-line">${meaning}</div>
              </div>
            `).join("")
      }
    </div>
    <div style="margin-top:20px;text-align:center;opacity:0.45;font-size:0.75rem;font-family:'Cinzel',serif;letter-spacing:0.1em;text-transform:uppercase;">Press V to close</div>
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
const _mapCache = { padding: 30, size: 100, offsetX: 0, offsetY: 0, roomLeft: 0, roomTop: 0 };

function renderMap() {
  const { padding, size } = _mapCache;
  const panel   = mapPanel.getBoundingClientRect();
  const current = MAP_LAYOUT[currentRoom.id];
  if (!current) return;

  _mapCache.offsetX  = panel.width  / 2 - (current.x * size + padding + size / 2);
  _mapCache.offsetY  = panel.height / 2 - (current.y * size + padding + size / 2);
  _mapCache.roomLeft = current.x * size + padding + _mapCache.offsetX;
  _mapCache.roomTop  = current.y * size + padding + _mapCache.offsetY;

  let html = `<div style="position:relative;width:100%;height:100%;padding-top:18px;">`;

  for (const room of rooms) {
    const pos = MAP_LAYOUT[room.id];
    if (!pos) continue;
    const x = pos.x * size + padding + _mapCache.offsetX;
    const y = pos.y * size + padding + _mapCache.offsetY;
    const isCurrent = room.id === currentRoom.id;
    const isVisited = room.visited;

    html += `
      <div style="
        position:absolute; left:${x}px; top:${y}px;
        width:${size}px; height:${size}px;
        background:${isCurrent ? "rgba(194,168,107,0.18)" : isVisited ? "rgba(40,34,24,0.9)" : "rgba(20,16,10,0.8)"};
        border:1px solid ${isCurrent ? "rgba(240,208,112,0.8)" : "rgba(90,80,60,0.5)"};
        box-sizing:border-box;
        display:flex; align-items:center; justify-content:center;
        color:${isCurrent ? "#f0d080" : isVisited ? "rgba(194,168,107,0.6)" : "rgba(90,80,60,0.4)"};
        font-size:9px; text-align:center; padding:6px;
        font-family:'Cinzel',serif; letter-spacing:0.05em;
        text-transform:uppercase;
      ">${isVisited || isCurrent ? room.name : "?"}</div>
    `;
  }

  html += `<div id="map-player-dot" style="
    position:absolute; width:8px; height:8px; border-radius:50%;
    background:#ffd76a; box-shadow:0 0 8px rgba(255,215,106,0.9);
    transform:translate(-50%,-50%); pointer-events:none;
  "></div>`;

  html += `</div>`;
  mapPanel.innerHTML = html;
  updateMapDot();
}

function updateMapDot() {
  if (!mapVisible) return;
  const dot = document.getElementById("map-player-dot");
  if (!dot) return;
  const { padding, size, offsetX, offsetY } = _mapCache;
  const pos = MAP_LAYOUT[currentRoom.id];
  if (!pos) return;
  const roomLeft = pos.x * size + padding + offsetX;
  const roomTop  = pos.y * size + padding + offsetY;
  dot.style.left = (roomLeft + (player.x / world.width) * size) + "px";
  dot.style.top  = (roomTop  + (player.y / world.height) * size + 18) + "px";
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
    const bubble = document.getElementById("ushabti-speech");
    if (bubble) bubble.style.display = "none";
  }
}

// =====================
// HELP TEXT
// =====================
function updateHelpText() {
  const parts = ["WASD Move", "E Inspect", "X Pick up", "Q Cycle", "L Light torch"];
  if (mapUnlocked) parts.push("M Map");
  if (nearObject?.type === "glyph" && hasFullTranslation()) parts.push("G Decode");
  if (nearObject?.type === "bracket" && !nearObject.mounted && player.heldItem?.type === "torch" && player.lampOn) parts.push("T Mount");
  if (glyphNotebookUnlocked) parts.push("V Codex");
  helpText.textContent = parts.join("  ·  ");
}

// =====================
// QUEST PANEL — quests hidden until completed
// =====================
function updateUI() {
  roomTitle.textContent = currentRoom.name;

  // Count completed vs total for this room
  const total = currentRoom.objectives.length;
  const doneCount = currentRoom.objectives.filter(o => gameState.completedObjectives[o.id] || o.done).length;

  // Build the objective display
  // RULE: only show objectives that are DONE, plus count of undone
  const doneObjectives = currentRoom.objectives.filter(o => gameState.completedObjectives[o.id] || o.done);

  let html = "";

  // If all done, show a completion line
  if (doneCount === total && total > 0) {
    html += `<div class="obj-entry done"><span class="obj-icon">✦</span><span class="obj-label" style="color:#7dba6a;font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.08em;">Chamber complete</span></div>`;
    doneObjectives.forEach(o => {
      html += `<div class="obj-entry done"><span class="obj-icon">✓</span><span class="obj-label">${o.label}</span></div>`;
    });
  } else {
    // Show completed ones
    doneObjectives.forEach(o => {
      html += `<div class="obj-entry done"><span class="obj-icon">✓</span><span class="obj-label">${o.label}</span></div>`;
    });
    // Show mystery count for remaining
    const remaining = total - doneCount;
    if (remaining > 0) {
      html += `<div class="obj-entry" style="opacity:0.45;font-style:italic;font-size:0.78rem;">
        <span class="obj-icon">…</span>
        <span class="obj-label">${remaining} secret${remaining > 1 ? "s" : ""} remain in this chamber — ask the Ushabti for guidance</span>
      </div>`;
    }
  }

  objectiveText.innerHTML = html;

  inventorySlots.forEach((slot, index) => {
    const item = inventory[index];
    slot.textContent = item ? `${getItemIcon(item)} ${item.name}` : "";
    slot.classList.toggle("active", index === player.inventoryIndex);
  });

  updateHelpText();
}

