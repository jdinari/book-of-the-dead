// =====================
// OBJECTIVES.JS
// Objective tracking, inspect dispatch, door unlock logic,
// glyph decoding, altar interactions.
// Depends on: state.js, rooms.js, ui.js, inventory.js
// =====================

// =====================
// OBJECTIVE TRACKING
// =====================
function markObjective(id) {
  gameState.completedObjectives[id] = true;

  // mark in whichever room owns this objective
  for (const room of rooms) {
    const obj = room.objectives.find(o => o.id === id);
    if (obj) { obj.done = true; break; }
  }

  updateUI();
}

function syncObjectivesFromGameState() {
  for (const room of rooms) {
    for (const obj of room.objectives) {
      if (gameState.completedObjectives[obj.id]) obj.done = true;
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

// Glyph solution validation is handled inside decodeGlyphs() via hasFullTranslation().

// =====================
// DOOR UNLOCK
// =====================
function attemptDoorUnlock(door) {
  if (!door) return;

  if (door.direction === "right" && currentRoom.id === "burial-chamber") {
    const allDone = currentRoom.objectives.every(o => gameState.completedObjectives[o.id]);
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

  if (door.direction === "down" && currentRoom.id === "burial-chamber") {
    const secondRoom    = rooms.find(r => r.id === "right-room");
    const secondComplete = secondRoom.objectives.every(o => gameState.completedObjectives[o.id]);
    if (secondComplete) {
      door.locked = false;
      door.opening = true;
      ui.textContent = "The southern passage loosens its seal.";
      updateUI();
      return;
    }
    ui.textContent = "This passage remains sealed until the eastern chamber's tasks are finished.";
    return;
  }

  // all other doors: just report state
  ui.textContent = door.locked ? "The door is sealed." : "The door stands open.";
}

// =====================
// INSPECT DISPATCH
// =====================
function inspectObject(obj) {
  if (!obj) return;
  obj.hasBeenInspected = true;

  showInspectUI(obj);

  // --- ushabti ---
  if (obj.type === "ushabti") {
    if (!obj.inspectDone) {
      obj.inspectDone = true;
      markObjective("speak-ushabti");
    }
    // Always show speech on inspect — player can return for hints
    const hint = getUshabtiHint();
    showUshabtiSpeech(hint);
  }

  // --- glyph stone ---
  if (obj.type === "glyph") {
    const partial = obj.glyphText.map(g => playerGlyphMap[g] || "?").join("");
    if (glyphDecoded) {
      ui.textContent = "The glyphs resolve clearly: LIGHT.";
    } else {
      ui.textContent = `Inscription: ${partial}`;
      if (hasFullTranslation()) {
        ui.textContent += " — You now understand the full word. Press G to finalize.";
      }
    }
  }

  // --- scroll ---
  if (obj.type === "scroll" && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("find-scroll");
    ui.textContent = "An old scroll. It explains how to interpret the tablet.";
  }

  // --- tablet ---
  if (obj.type === "tablet" && !obj.inspectDone) {
    const scroll = inventory.find(i => i.type === "scroll");
    if (!scroll) {
      ui.textContent = "You cannot understand the tablet without first finding the scroll.";
      return;
    }
    obj.inspectDone = true;
    const objState = currentRoom.objectives.find(o => o.id === "read-tablet");
    if (objState && !objState.done) markObjective("read-tablet");

    removeItemFromInventory("scroll");

    notebookOpen = false;
    glyphPanel.classList.add("hidden");
    glyphNotebookUnlocked = true;
    ui.textContent = "You can now study the glyph notebook (V).";
  }

  // --- door ---
  if (obj.type === "door") {
    attemptDoorUnlock(obj);
  }

  // --- amulet (on ground) ---
  if (obj.type === "amulet" && !obj.pickedUp) {
    markObjective("find-amulet");
  }

  // --- altar ---
  if (obj.type === "altar" && currentRoom.id === "bottom-room") {
    const amulet = inventory.find(item => item.type === "amulet");
    if (amulet) {
      inventory.splice(inventory.indexOf(amulet), 1);
      player.inventoryIndex = Math.max(0, Math.min(player.inventoryIndex, inventory.length - 1));
      player.heldItem = inventory[player.inventoryIndex] || null;
      markObjective("offer-amulet");
      ui.textContent = "The amulet settles into the altar with a soft glow.";
      updateUI();
    } else {
      ui.textContent = "The altar demands an offering to open the next path.";
    }
  }

  // --- decoration: mark room-explore objective on first inspect ---
  if (obj.type === "decoration") {
    const exploreId = `${currentRoom.id}-explore`;
    if (!gameState.completedObjectives[exploreId]) {
      markObjective(exploreId);
    }
  }

  // ============================================================
  // NEW PUZZLE INTERACTIONS
  // ============================================================

  // --- canopic jar (west-hall ritual) ---
  if (obj.type === "canopic") {
    const next = CANOPIC_ORDER[canopicSequence.length];
    if (obj.ritualIndex === next) {
      canopicSequence.push(obj.ritualIndex);
      const remaining = CANOPIC_ORDER.length - canopicSequence.length;
      if (remaining > 0) {
        ui.textContent = `You touch the jar of ${obj.head}. The ritual continues — ${remaining} jar${remaining > 1 ? "s" : ""} remain.`;
      } else {
        // Ritual complete
        markObjective("canopic-ritual");
        ui.textContent = "You complete the ritual of the four sons of Horus. A hidden niche grinds open in the wall.";
        _revealNiche("obj-west-niche");
      }
    } else {
      // Wrong order — reset
      canopicSequence.length = 0;
      ui.textContent = `The jar of ${obj.head} hums and grows cold. The sequence is broken. Begin again with Imsety.`;
    }
  }

  // --- offering bowl (north-vestibule) ---
  if (obj.type === "offering-bowl") {
    if (obj.filled) {
      ui.textContent = `The ${obj.offeringType} bowl is already filled. Its offering has been accepted.`;
      return;
    }
    const matchItem = inventory.find(i => i.type === "offering-item" && i.offeringType === obj.offeringType);
    if (!matchItem) {
      ui.textContent = `The ${obj.offeringType} bowl waits. Find the right offering to fill it.`;
      return;
    }
    // Consume the item and fill the bowl
    inventory.splice(inventory.indexOf(matchItem), 1);
    player.inventoryIndex = Math.max(0, Math.min(player.inventoryIndex, inventory.length - 1));
    player.heldItem = inventory[player.inventoryIndex] || null;
    obj.filled = true;
    obj.color  = "#a07840"; // visually indicate filled
    offeringsFilled[obj.offeringType] = true;
    markObjective(`fill-offering-${obj.offeringType}`);
    ui.textContent = `You place the ${matchItem.name} in the bowl. It settles with a faint glow.`;
    updateUI();
    // Check if all three bowls are filled
    if (offeringsFilled.bread && offeringsFilled.oil && offeringsFilled.incense) {
      markObjective("open-alcove");
      // Unlock and open the alcove door
      const alcoveDoor = currentRoom.objects.find(o => o.id === "door-alcove-north");
      if (alcoveDoor) {
        alcoveDoor.locked = false;
        alcoveDoor.opening = true;
      }
      ui.textContent = "The three offerings are complete. The sealed alcove above grinds open with a deep resonance. A hidden sanctum lies beyond.";
      showUshabtiSpeech("Hathor smiles. The Inner Sanctum is open. Few have ever stood where you are about to.");
    }
  }

  // --- heart scarab ---
  if (obj.type === "heart-scarab" && !obj.pickedUp) {
    markObjective("find-heart-scarab");
    ui.textContent = "You take the Heart Scarab. It is warm to the touch despite the cold of the tomb. Spell 30B is inscribed on its base: \'O my heart, do not stand against me.\'";
  }

  // --- sanctum stele ---
  if ((obj.type === "decoration" || obj.type === "stele") && obj.id && obj.id.includes("stele") && !obj.inspectDone) {
    obj.inspectDone = true;
    markObjective("read-sanctum-stele");
  }

  // --- intact cartouche (east-gallery clue) ---
  if (obj.type === "cartouche" && !obj.inspectDone) {
    obj.inspectDone = true;
    if (!galleryNameFragments.includes(obj.nameFragment)) {
      galleryNameFragments.push(obj.nameFragment);
    }
    if (galleryNameFragments.length >= 2) {
      markObjective("read-cartouche-clues");
      ui.textContent = `You note the scratched syllable: ${obj.nameFragment}. Combined with the other: ${galleryNameFragments.join("")}. You now know the erased name.`;
    } else {
      ui.textContent = `You note a scratched syllable: ${obj.nameFragment}. One piece of the name — find the other cartouche.`;
    }
  }

  // --- erased cartouche (east-gallery restoration) ---
  if (obj.type === "cartouche-erased" && !obj.restored) {
    if (galleryNameFragments.length < 2) {
      ui.textContent = "The cartouche is blank. You cannot restore what you do not yet know. Study the other cartouches first.";
      return;
    }
    const restoredName = galleryNameFragments.join("");
    obj.restored = true;
    obj.color = "#9a8450";
    obj.text  = `The erased cartouche, restored in memory: ${restoredName}EN. AKHENATEN — the Heretic King, purged from history.`;
    markObjective("restore-cartouche");
    ui.textContent = `You speak the name aloud: ${restoredName}EN. AKHENATEN. The stone trembles. A compartment opens beneath the cartouche.`;
    _revealNiche("obj-gallery-compartment");
  }

  // --- niche (general — both west-hall and east-gallery) ---
  if (obj.type === "niche" && !obj.hidden) {
    if (obj.containsItem && !obj.containsItem.pickedUp) {
      ui.textContent = `${obj.text}\n\nPress X to take the ${obj.containsItem.name}.`;
    } else {
      ui.textContent = obj.text + " It is empty now.";
    }
  }

  // --- watcher skull (ossuary) ---
  if (obj.type === "watcher-skull" && !obj.inspectDone) {
    obj.inspectDone = true;
    watcherSkullsRead++;
    ui.textContent = obj.text;
    if (watcherSkullsRead >= WATCHER_SKULL_COUNT) {
      markObjective("read-watcher-skulls");
      ui.textContent += "\n\nAll four watchers observed. They all point east. Find the niche on the eastern wall.";
      _revealNiche("obj-ossuary-niche");
    } else {
      ui.textContent += ` (${watcherSkullsRead} of ${WATCHER_SKULL_COUNT} watchers observed.)`;
    }
  }
// mark 
  if (obj.type === "canopic-seal") {
    markObjective("find-ossuary-niche");
 }

  // --- wall painting (deep-corridor, revealed after torch mounted) ---
  if (obj.type === "wall-painting") {
    if (obj.hidden) {
      ui.textContent = "It's too dark to see clearly here. Light the corridor first.";
      return;
    }
    if (!gameState.completedObjectives["read-wall-paintings"]) {
      // Mark objective after inspecting any painting once lit
      const room = rooms.find(r => r.id === "deep-corridor");
      const allPaintings = room.objects.filter(o => o.type === "wall-painting");
      obj.inspectDone = true; // mark before counting so this one is included
      const seenCount = allPaintings.filter(p => p.inspectDone).length;
      if (seenCount >= allPaintings.length) {
        markObjective("read-wall-paintings");
        ui.textContent = obj.text + "\n\nYou have read all three paintings. The name AKHENATEN now connects the corridor to the Gallery of Kings.";
        return;
      }
    }
    obj.inspectDone = true;
  }

  // --- bracket: just describe if inspected without torch ---
  if (obj.type === "bracket") {
    if (obj.mounted) {
      ui.textContent = "The torch burns steadily in its bracket, lighting the corridor.";
    } else if (!player.heldItem || player.heldItem.type !== "torch") {
      ui.textContent = obj.text;
    } else if (!player.lampOn) {
      ui.textContent = "You hold the torch near the bracket, but it isn't lit. Press L to light it first.";
    } else {
      ui.textContent = "Hold a lit torch and press T to mount it in the bracket.";
    }
  }
}

// =====================
// NICHE REVEAL HELPER
// =====================
function _revealNiche(nicheId) {
  const room = currentRoom;
  const niche = room.objects.find(o => o.id === nicheId);
  if (!niche) return;
  niche.hidden = false;
  niche.color  = "#5a4e3a";
  // Spawn the contained item into the room as a proper top-level object
  if (niche.containsItem && !room.objects.find(o => o.id === niche.containsItem.id)) {
    const item = niche.containsItem;
    // Mark as inspected so X can pick it up without the "inspect first" gate
    item.hasBeenInspected = true;
    room.objects.unshift(item);
  }
}

// =====================
// TORCH BRACKET MOUNT
// =====================
function mountTorchInBracket(bracket) {
  if (!player.heldItem || player.heldItem.type !== "torch") {
    ui.textContent = "You need to be holding a lit torch to mount it.";
    return;
  }
  if (!player.lampOn) {
    ui.textContent = "Light the torch first (L), then mount it in the bracket (T).";
    return;
  }

  // Remove torch from inventory, keep it "mounted" in the room
  const torchItem = player.heldItem;
  inventory.splice(inventory.indexOf(torchItem), 1);
  player.heldItem = inventory[player.inventoryIndex] || null;
  player.inventoryIndex = Math.max(0, Math.min(player.inventoryIndex, inventory.length - 1));

  // Place torch at bracket position, mark as mounted
  torchItem.x = bracket.x;
  torchItem.y = bracket.y - 10;
  torchItem.pickedUp = false;
  torchItem.vx = 0;
  torchItem.vy = 0;

  bracket.mounted = true;
  bracket.color   = "#8a6a40";
  corridorTorchMounted = true;
  player.lampOn = true; // room stays lit via corridor flag

  markObjective("mount-corridor-torch");

  // Reveal all wall paintings
  const room = rooms.find(r => r.id === "deep-corridor");
  for (const obj of room.objects) {
    if (obj.type === "wall-painting") {
      obj.hidden = false;
    }
  }

  ui.textContent = "You mount the torch in the bracket. The corridor floods with warm light — and three hidden paintings emerge from the darkness.";
  updateUI();
}

