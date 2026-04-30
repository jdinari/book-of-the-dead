// =====================
// ROOMS.JS
// Room definitions, object configs, door factory.
// Depends on: state.js
// =====================

function createDoor(config) {
  return {
    type: "door",
    x: 0,
    y: 0,
    w: 30,
    h: 120,
    locked: true,
    opened: false,
    opening: false,
    openProgress: 0,
    ...config
  };
}

const rooms = [
  {
    id: "burial-chamber",
    name: "Burial Chamber",
    description: "You awaken in a warm, dustless tomb. Stone statues and a sealed sarcophagus surround you.",
    objectives: [
      { id: "find-torch",      label: "Find the torch and carry it.",                    done: false },
      { id: "collect-rosetta", label: "Collect all Rosetta stone pieces.",               done: false },
      { id: "decode-glyphs",   label: "Decode the glyphs with the Rosetta pieces.",      done: false },
      { id: "speak-ushabti",   label: "Touch the ushabti to learn its message.",         done: false }
    ],
    objects: [
      {
        name: "Sarcophagus",
        type: "sarcophagus",
        x: 350, y: 180, w: 100, h: 40,
        color: "#8b6b3f",
        text: "A stone coffin etched with funerary spells. It wants fire and words from the book.",
        opened: false
      },
      {
        name: "Ushabti",
        type: "ushabti",
        x: 100, y: 250, w: 18, h: 30,
        color: "#5e5e5e",
        text: "The ushabti whispers: 'Only the light of truth can guide your passage.'",
        inspectDone: false
      },
      {
        name: "Ushabti",
        type: "ushabti",
        x: 540, y: 230, w: 18, h: 30,
        color: "#5e5e5e",
        text: "The scholar ushabti murmurs: 'Decode the glyphs, then the passage will open.'",
        inspectDone: false
      },
      {
        name: "Torch",
        type: "torch",
        x: 420, y: 260, w: 10, h: 20,
        color: "#c9a24a",
        pickedUp: false,
        vx: 0, vy: 0,
        friction: 0.85,
        text: "A bronze wick torch. It will burn brighter once lit.",
        inspectDone: false
      },
      {
        name: "Glyph Stone",
        type: "glyph",
        x: 260, y: 120, w: 44, h: 44,
        color: "#766551",
        text: "The glyphs are etched across the stone in ancient script.",
        glyphText: ["𓂀", "𓄿", "𓈖", "𓏏", "𓊪"],
        inspectDone: false
      },
      {
        ...createDoor({
          name: "Right Door",
          x: 760, y: 200,
          color: "#4f3925",
          direction: "right",
          leadsTo: "right-room",
          pairId: "burial-right",
          text: "A sealed east passage. The right door will open when this chamber is complete."
        })
      },
      {
        ...createDoor({
          name: "Bottom Door",
          x: 360, y: 468, w: 80, h: 30,
          color: "#4f3925",
          locked: true,
          direction: "down",
          leadsTo: "bottom-room",
          pairId: "burial-bottom",
          text: "A south passage blocked by a second chamber's seal."
        })
      },
      {
        name: "Rosetta Piece",
        type: "rosetta",
        x: 130, y: 110, w: 14, h: 14,
        color: "#b98d4f",
        pickedUp: false,
        glyph: "𓂀", letter: "L",
        text: "𓂀 → L (light begins with sight)"
      },
      {
        name: "Rosetta Piece",
        type: "rosetta",
        x: 520, y: 150, w: 14, h: 14,
        color: "#b98d4f",
        pickedUp: false,
        glyph: "𓄿", letter: "I",
        text: "𓄿 → I (reed sound / breath of meaning)"
      },
      {
        name: "Rosetta Piece",
        type: "rosetta",
        x: 240, y: 345, w: 14, h: 14,
        color: "#b98d4f",
        pickedUp: false,
        glyph: "𓈖", letter: "G",
        text: "𓈖 → G (flowing water / continuity)"
      },
      {
        name: "Rosetta Piece",
        type: "rosetta",
        x: 600, y: 300, w: 14, h: 14,
        color: "#b98d4f",
        pickedUp: false,
        glyph: "𓏏", letter: "H",
        text: "𓏏 → H (bread / completion of sound)"
      },
      {
        name: "Rosetta Piece",
        type: "rosetta",
        x: 350, y: 400, w: 14, h: 14,
        color: "#b98d4f",
        pickedUp: false,
        glyph: "𓊪", letter: "T",
        text: "𓊪 → T (stool / final grounding)"
      }
    ],
    exit: null
  },

  {
    id: "right-room",
    name: "Antechamber",
    description: "The eastern chamber is narrower and lined with faded carvings. A soft glow breathes from the walls.",
    objectives: [
      { id: "find-scroll",  label: "Find the scroll.",                   done: false },
      { id: "read-tablet",  label: "Read the tablet's translation.",      done: false }
    ],
    objects: [
      {
        name: "Left Door",
        type: "door",
        x: -30, y: 200, w: 30, h: 120,
        color: "#4f3925",
        locked: false,
        direction: "left",
        pairId: "burial-right",
        leadsTo: "burial-chamber",
        text: "The opening back to the burial chamber."
      },
      {
        name: "Tablet",
        type: "tablet",
        x: 420, y: 130, w: 40, h: 52,
        color: "#6a5d44",
        text: "A carved tablet with a translation key. Inspect it.",
        inspectDone: false
      },
      {
        name: "Scroll",
        type: "scroll",
        x: 500, y: 330, w: 24, h: 12,
        color: "#e6d7b7",
        pickedUp: false,
        text: "An old scroll of instructions for the next path."
      }
    ],
    exit: null
  },

  {
    id: "bottom-room",
    name: "Sepulcher Depths",
    description: "A lower chamber hangs in silence. The air is heavy and the shadows are thicker here.",
    objectives: [
      { id: "find-amulet",  label: "Find the amulet hidden in the shadows.", done: false },
      { id: "offer-amulet", label: "Place the amulet at the altar.",          done: false }
    ],
    objects: [
      {
        name: "Top Door",
        type: "door",
        x: 360, y: -30, w: 80, h: 30,
        color: "#4f3925",
        locked: false,
        direction: "up",
        pairId: "burial-bottom",
        leadsTo: "burial-chamber",
        text: "The stair back up to the burial chamber."
      },
      {
        name: "Altar",
        type: "altar",
        x: 360, y: 220, w: 80, h: 24,
        color: "#5a5040",
        text: "A sacred altar for offerings."
      },
      {
        name: "Amulet",
        type: "amulet",
        x: 160, y: 150, w: 16, h: 16,
        color: "#d4b44f",
        pickedUp: false,
        text: "A golden amulet. Place it on the altar."
      }
    ],
    exit: null
  }
];

// Set the starting room
currentRoom = rooms[0];

function initRooms() {
  for (const room of rooms) {
    room.visited = false;
  }
  currentRoom.visited = true;
}

initRooms();

// =====================
// ROOM HELPERS
// =====================
function getCurrentObjects() {
  return currentRoom.objects;
}

function findObjectByType(type, filter) {
  return getCurrentObjects().find(item => item.type === type && (!filter || filter(item)));
}

function findDoorByDirection(direction) {
  return findObjectByType("door", door => door.direction === direction);
}

function getCollidingDoor() {
  return getCurrentObjects().find(obj =>
    obj.type === "door" && isColliding(player, obj)
  );
}
