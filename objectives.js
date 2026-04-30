// =====================
// OBJECTIVES.JS
// Objective tracking, inspect logic, door unlocking,
// glyph decoding, altar interactions.
// Depends on: state.js, rooms.js, ui.js, inventory.js
// =====================

// =====================
// OBJECTIVE TRACKING
// =====================
function markObjective(id) {
  gameState.completedObjectives[id] = true;

  const objective = currentRoom.objectives.find(o => o.id === id);
  if (objective) objective.done = true;

  updateUI();
}

function syncObjectivesFromGameState() {
  for (const room of rooms) {
    for (const obj of room.objectives) {
      if (gameState.completedObjectives[obj.id]) {
        obj.done = true;
      }
    }
  }
}

// =====================
// GLYPH HELPERS
// =====================
function hasFullTranslation() {
  return REQUIRED_GLYPHS.every(g => playerGlyphMap[g]);
}

function learnGlyphs() {
  for (const g in GLYPH_SOLUTION) {
    glyphKnowledge[g] = GLYPH_SOLUTION[g];
  }
}

function decodeGlyphs(obj) {
  if (!hasFullTranslation()) {
    ui.textContent = "You have not fully deciphered the glyphs yet.";
    return;
  }

  if (glyphDecoded) {
    ui.textContent = "You already decoded the word: LIGHT.";
    return;
  }

  glyphDecoded = true;
  markObjective("decode-glyphs");
  learnGlyphs();
  consumeRosettaPieces();

  if (obj) {
    showInspectUI(obj);
    ui.innerHTML += `<div>The glyphs resolve: LIGHT.</div>`;
  } else {
    ui.textContent = "The glyphs resolve: LIGHT.";
  }
}

function checkGlyphSolution(obj) {
  for (const g of Object.keys(GLYPH_SOLUTION)) {
    if ((playerGlyphMap[g] || "") !== GLYPH_SOLUTION[g]) return;
  }

  glyphDecoded = true;
  markObjective("decode-glyphs");
  ui.textContent = "The glyphs resolve: LIGHT AND TRUTH OPEN THE EASTERN PASSAGE.";
}

// =====================
// DOOR UNLOCK
// =====================
function attemptDoorUnlock(door) {
  if (!door) return;

  if (door.direction === "right") {
    const allDone = currentRoom.objectives.every(
      o => gameState.completedObjectives[o.id]
    );
    if (allDone) {
      door.locked = false;
      door.opening = true;
      mapUnlocked = true;
      ui.textContent = "The eastern passage swings open. A map toggle is now available.";
      updateUI();
      return;
    }
    ui.textContent = "The eastern passage remains sealed until the chamber's trials are complete.";
    return;
  }

  if (door.direction === "down") {
    const secondRoom = rooms.find(r => r.id === "right-room");
    const secondComplete = secondRoom.objectives.every(
      o => gameState.completedObjectives[o.id]
    );
    if (secondComplete) {
      door.locked = false;
      door.opening = true;
      ui.textContent = "The southern passage loosens its seal. You may return here when ready.";
      updateUI();
      return;
    }
    ui.textContent = "This passage remains sealed until the eastern chamber's tasks are finished.";
    return;
  }

  ui.textContent = door.locked ? "The door is sealed." : "The door stands open.";
}

// =====================
// INSPECT DISPATCH
// =====================
function inspectObject(obj) {
  if (!obj) return;
  obj.hasBeenInspected = true;

  showInspectUI(obj);

  if (obj.type === "ushabti" && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("speak-ushabti");
  }

  if (obj.type === "glyph") {
    const partial = obj.glyphText
      .map(g => playerGlyphMap[g] || "?")
      .join("");

    if (glyphDecoded) {
      ui.textContent = "The glyphs resolve clearly: LIGHT.";
    } else {
      ui.textContent = `Inscription: ${partial}`;
      if (hasFullTranslation()) {
        ui.textContent += " — You now understand the full word. Press G to finalize.";
      }
    }
  }

  if (obj.type === "scroll" && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("find-scroll");
    ui.textContent = "An old scroll. It explains how to interpret the tablet.";
  }

  if (obj.type === "tablet" && !obj.inspectDone) {
    const scroll = inventory.find(i => i.type === "scroll");

    if (!scroll) {
      ui.textContent = "You cannot understand the tablet without first finding the scroll.";
      return;
    }

    obj.inspectDone = true;
    const objState = currentRoom.objectives.find(o => o.id === "read-tablet");
    if (objState && !objState.done) {
      markObjective("read-tablet");
    }

    removeItemFromInventory("scroll");

    notebookOpen = false;
    glyphPanel.classList.add("hidden");
    glyphNotebookUnlocked = true;

    ui.textContent = "You can now study the glyph notebook (V).";
  }

  if (obj.type === "door") {
    attemptDoorUnlock(obj);
  }

  if (obj.type === "amulet" && !obj.pickedUp) {
    markObjective("find-amulet");
  }

  if (obj.type === "altar" && currentRoom.id === "bottom-room") {
    const amulet = inventory.find(item => item.type === "amulet");

    if (amulet) {
      inventory.splice(inventory.indexOf(amulet), 1);
      player.heldItem = null;
      markObjective("offer-amulet");
      ui.textContent = "The amulet settles into the altar with a soft glow.";
      updateUI();
    } else {
      ui.textContent = "The altar demands an offering to open the next path.";
    }
  }
}
