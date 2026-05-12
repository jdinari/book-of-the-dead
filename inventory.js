// =====================
// INVENTORY.JS
// Pick up, drop, cycle, and remove inventory items.
// Depends on: state.js, rooms.js, ui.js, objectives.js
// =====================

function addToInventory(obj) {
  if (!obj.hasBeenInspected) {
    // offering-items and key-fragments don't require prior inspection
    if (!["offering-item", "key-fragment", "canopic-ring", "canopic-seal"].includes(obj.type)) {
      ui.textContent = "You need to inspect this first.";
      return false;
    }
  }
  if (inventory.length >= inventoryCapacity) {
    ui.textContent = "Your inventory is full.";
    return false;
  }

  obj.pickedUp = true;
  inventory.push(obj);
  player.inventoryIndex = inventory.length - 1;
  player.heldItem = obj;

  if (obj.type === "torch") {
    player.lampOn = false;
    markObjective("find-torch");
  }

  if (obj.type === "rosetta") {
    Object.assign(playerGlyphMap, { [obj.glyph]: obj.letter });
    glyphKnowledge[obj.glyph] = obj.letter;
    ui.textContent = `Decoded fragment: ${obj.glyph} → ${obj.letter}`;
    if (hasFullTranslation()) {
      markObjective("collect-rosetta");
    }
  }

  // Niche reward items
  if (obj.type === "key-fragment") {
    markObjective("west-hall-niche");
    ui.textContent = `You take the ${obj.name}. One piece of several.`;
  }
  if (obj.type === "canopic-seal") {
    markObjective("collect-ossuary-seal");
    ui.textContent = `You take the ${obj.name}. The clay is smooth and cool.`;
  }
  if (obj.type === "canopic-ring") {
    markObjective("gallery-compartment");
    ui.textContent = `You take the ${obj.name}.`;
  }

  updateUI();
  return true;
}

function dropActiveItem() {
  const item = inventory[player.inventoryIndex];
  if (!item) return;

  item.pickedUp = false;
  item.x = player.x + 20;
  item.y = player.y + 10;

  if (item.type === "torch") {
    player.lampOn = false;
    item.vx = 1.5;
    item.vy = -1.5;
  }

  inventory.splice(player.inventoryIndex, 1);

  if (inventory.length === 0) {
    player.heldItem = null;
    player.inventoryIndex = 0;
  } else {
    player.inventoryIndex = Math.min(player.inventoryIndex, inventory.length - 1);
    player.heldItem = inventory[player.inventoryIndex];
  }

  updateUI();
}

function cycleInventory(direction) {
  if (inventory.length === 0) return;
  player.inventoryIndex = (player.inventoryIndex + direction + inventory.length) % inventory.length;
  player.heldItem = inventory[player.inventoryIndex];
  updateUI();
}

function removeItemFromInventory(type) {
  for (let i = inventory.length - 1; i >= 0; i--) {
    if (inventory[i].type === type) inventory.splice(i, 1);
  }
  player.inventoryIndex = Math.max(0, Math.min(player.inventoryIndex, inventory.length - 1));
  player.heldItem = inventory[player.inventoryIndex] || null;
  updateUI();
}

function consumeRosettaPieces() {
  // remove from room
  const objs = currentRoom.objects;
  for (let i = objs.length - 1; i >= 0; i--) {
    if (objs[i].type === "rosetta" && objs[i].pickedUp) objs.splice(i, 1);
  }
  // remove from inventory
  for (let i = inventory.length - 1; i >= 0; i--) {
    if (inventory[i].type === "rosetta") inventory.splice(i, 1);
  }
  player.heldItem = inventory[player.inventoryIndex] || null;
  updateUI();
}
