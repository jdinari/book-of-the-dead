// =====================
// ROOMS.JS
// All room definitions. Every entity follows the schema:
//
//   Room:      { id, name, type:"room", description, objectives:[], objects:[] }
//   Object:    { id, name, type, x, y, w, h, color, text, ... }
//   Door:      { id, name, type:"door", x, y, w, h, color,
//                direction, leadsTo, pairId, locked, ... }
//   Objective: { id, name, type:"objective", label, roomId, done }
//
// Depends on: state.js
// =====================

// =====================
// DOOR FACTORY
// Supplies defaults; caller spreads overrides on top.
// =====================
function createDoor(config) {
  return {
    // schema fields
    id:           config.id   || `door-${config.pairId}-${config.direction}`,
    name:         config.name || "Door",
    type:         "door",

    // geometry defaults (vertical slab — override w/h for horizontal)
    x: 0, y: 0, w: 30, h: 120,

    // state defaults
    locked:       true,
    opened:       false,
    opening:      false,
    openProgress: 0,

    // spread all caller values last so they win
    ...config
  };
}

// =====================
// ROOMS
// =====================
const rooms = [

  // ------------------------------------------------------------------ //
  //  BURIAL CHAMBER  (origin 0,0)
  // ------------------------------------------------------------------ //
  {
    id:   "burial-chamber",
    name: "Burial Chamber",
    type: "room",
    description: "You awaken in a warm, dustless tomb. Stone statues and a sealed sarcophagus surround you.",

    objectives: [
      { id: "find-torch",      name: "Find Torch",        type: "objective", roomId: "burial-chamber", label: "Find the torch and carry it.",               done: false },
      { id: "collect-rosetta", name: "Collect Rosetta",   type: "objective", roomId: "burial-chamber", label: "Collect all Rosetta stone pieces.",           done: false },
      { id: "decode-glyphs",   name: "Decode Glyphs",     type: "objective", roomId: "burial-chamber", label: "Decode the glyphs with the Rosetta pieces.",  done: false },
      { id: "speak-ushabti",   name: "Speak to Ushabti",  type: "objective", roomId: "burial-chamber", label: "Touch the ushabti to learn its message.",     done: false }
    ],

    objects: [
      {
        id: "obj-sarcophagus", name: "Sarcophagus", type: "sarcophagus",
        x: 350, y: 180, w: 100, h: 40,
        color: "#8b6b3f",
        text: "A stone coffin etched with funerary spells. It wants fire and words from the book.",
        opened: false
      },
      {
        id: "obj-ushabti-1", name: "Ushabti", type: "ushabti",
        x: 100, y: 250, w: 18, h: 30,
        color: "#5e5e5e",
        text: "The ushabti whispers: 'Only the light of truth can guide your passage.'",
        inspectDone: false
      },
      {
        id: "obj-ushabti-2", name: "Ushabti", type: "ushabti",
        x: 540, y: 230, w: 18, h: 30,
        color: "#5e5e5e",
        text: "The scholar ushabti murmurs: 'Decode the glyphs, then the passage will open.'",
        inspectDone: false
      },
      {
        id: "obj-torch", name: "Torch", type: "torch",
        x: 420, y: 260, w: 10, h: 20,
        color: "#c9a24a",
        pickedUp: false, vx: 0, vy: 0, friction: 0.85,
        text: "A bronze wick torch. It will burn brighter once lit.",
        inspectDone: false
      },
      {
        id: "obj-glyph-stone", name: "Glyph Stone", type: "glyph",
        x: 260, y: 120, w: 44, h: 44,
        color: "#766551",
        text: "The glyphs are etched across the stone in ancient script.",
        glyphText: ["𓂀", "𓄿", "𓈖", "𓏏", "𓊪"],
        inspectDone: false
      },

      // doors
      createDoor({
        id: "door-burial-right", name: "East Door",
        x: 760, y: 200,
        color: "#4f3925",
        direction: "right", leadsTo: "right-room", pairId: "burial-right",
        text: "A sealed east passage. Complete the chamber's trials to open it."
      }),
      createDoor({
        id: "door-burial-bottom", name: "South Door",
        x: 360, y: 468, w: 80, h: 30,
        color: "#4f3925",
        direction: "down", leadsTo: "bottom-room", pairId: "burial-bottom",
        text: "A south passage blocked by a second chamber's seal."
      }),
      createDoor({
        id: "door-burial-left", name: "West Door",
        x: 0, y: 200,
        color: "#4f3925",
        locked: false, openProgress: 1,           // west hall is freely accessible
        direction: "left", leadsTo: "west-hall", pairId: "burial-west",
        text: "A passage leading west into the Hall of Preparation."
      }),
      createDoor({
        id: "door-burial-top", name: "North Door",
        x: 360, y: 0, w: 80, h: 30,
        color: "#4f3925",
        locked: false, openProgress: 1,           // north vestibule is freely accessible
        direction: "up", leadsTo: "north-vestibule", pairId: "burial-north",
        text: "A passage leading north into the Vestibule of Offerings."
      }),

      // rosetta pieces
      { id: "rosetta-1", name: "Rosetta Piece", type: "rosetta", x: 130, y: 110, w: 14, h: 14, color: "#b98d4f", pickedUp: false, glyph: "𓂀", letter: "L", text: "𓂀 → L (light begins with sight)" },
      { id: "rosetta-2", name: "Rosetta Piece", type: "rosetta", x: 520, y: 150, w: 14, h: 14, color: "#b98d4f", pickedUp: false, glyph: "𓄿", letter: "I", text: "𓄿 → I (reed sound / breath of meaning)" },
      { id: "rosetta-3", name: "Rosetta Piece", type: "rosetta", x: 240, y: 345, w: 14, h: 14, color: "#b98d4f", pickedUp: false, glyph: "𓈖", letter: "G", text: "𓈖 → G (flowing water / continuity)" },
      { id: "rosetta-4", name: "Rosetta Piece", type: "rosetta", x: 600, y: 300, w: 14, h: 14, color: "#b98d4f", pickedUp: false, glyph: "𓏏", letter: "H", text: "𓏏 → H (bread / completion of sound)" },
      { id: "rosetta-5", name: "Rosetta Piece", type: "rosetta", x: 350, y: 400, w: 14, h: 14, color: "#b98d4f", pickedUp: false, glyph: "𓊪", letter: "T", text: "𓊪 → T (stool / final grounding)" }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  ANTECHAMBER  (right-room, east 1,0)
  // ------------------------------------------------------------------ //
  {
    id:   "right-room",
    name: "Antechamber",
    type: "room",
    description: "The eastern chamber is narrower and lined with faded carvings. A soft glow breathes from the walls.",

    objectives: [
      { id: "find-scroll", name: "Find Scroll", type: "objective", roomId: "right-room", label: "Find the scroll.",              done: false },
      { id: "read-tablet", name: "Read Tablet", type: "objective", roomId: "right-room", label: "Read the tablet's translation.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-right-left", name: "West Door",
        x: 0, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,   // burial chamber is freely accessible from here
        direction: "left", leadsTo: "burial-chamber", pairId: "burial-right",
        text: "The opening back to the Burial Chamber."
      }),
      createDoor({
        id: "door-right-right", name: "East Door",
        x: 760, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,   // deep corridor is freely accessible from here
        direction: "right", leadsTo: "deep-corridor", pairId: "right-deep",
        text: "A passage east into the Deep Corridor."
      }),
      {
        id: "obj-tablet", name: "Tablet", type: "tablet",
        x: 420, y: 130, w: 40, h: 52,
        color: "#6a5d44",
        text: "A carved tablet with a translation key. Inspect it.",
        inspectDone: false
      },
      {
        id: "obj-scroll", name: "Scroll", type: "scroll",
        x: 500, y: 330, w: 24, h: 12,
        color: "#e6d7b7",
        pickedUp: false,
        text: "An old scroll of instructions for the next path."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  SEPULCHER DEPTHS  (bottom-room, south 0,1)
  // ------------------------------------------------------------------ //
  {
    id:   "bottom-room",
    name: "Sepulcher Depths",
    type: "room",
    description: "A lower chamber hangs in silence. The air is heavy and the shadows are thicker here.",

    objectives: [
      { id: "find-amulet",  name: "Find Amulet",  type: "objective", roomId: "bottom-room", label: "Find the amulet hidden in the shadows.", done: false },
      { id: "offer-amulet", name: "Offer Amulet", type: "objective", roomId: "bottom-room", label: "Place the amulet at the altar.",          done: false }
    ],

    objects: [
      createDoor({
        id: "door-bottom-top", name: "North Door",
        x: 360, y: 0, w: 80, h: 30,
        color: "#4f3925", locked: false, openProgress: 1,   // burial chamber is freely accessible from here
        direction: "up", leadsTo: "burial-chamber", pairId: "burial-bottom",
        text: "The stair back up to the Burial Chamber."
      }),
      createDoor({
        id: "door-bottom-right", name: "East Door",
        x: 760, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,   // east gallery is freely accessible
        direction: "right", leadsTo: "east-gallery", pairId: "bottom-east",
        text: "A passage east into the East Gallery."
      }),
      createDoor({
        id: "door-bottom-down", name: "South Door",
        x: 360, y: 468, w: 80, h: 30,
        color: "#4f3925", locked: false, openProgress: 1,   // ossuary is freely accessible
        direction: "down", leadsTo: "ossuary", pairId: "bottom-ossuary",
        text: "A narrow stair descending into the Ossuary."
      }),
      {
        id: "obj-altar", name: "Altar", type: "altar",
        x: 360, y: 220, w: 80, h: 24,
        color: "#5a5040",
        text: "A sacred altar for offerings."
      },
      {
        id: "obj-amulet", name: "Amulet", type: "amulet",
        x: 160, y: 150, w: 16, h: 16,
        color: "#d4b44f",
        pickedUp: false,
        text: "A golden amulet. Place it on the altar."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  WEST HALL  (west-hall, -1,0) — west of burial-chamber
  // ------------------------------------------------------------------ //
  {
    id:   "west-hall",
    name: "Hall of Preparation",
    type: "room",
    description: "A wide hall where priests once readied the dead for their journey. Stone basins line the walls, long dry.",

    objectives: [
      { id: "west-hall-explore", name: "Explore Hall", type: "objective", roomId: "west-hall", label: "Explore the Hall of Preparation.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-west-right", name: "East Door",
        x: 760, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,   // burial chamber is freely accessible from here
        direction: "right", leadsTo: "burial-chamber", pairId: "burial-west",
        text: "The passage back east to the Burial Chamber."
      }),
      // placeholder decoration
      {
        id: "obj-basin-1", name: "Stone Basin", type: "decoration",
        x: 80, y: 160, w: 40, h: 24,
        color: "#4a4237",
        text: "A wide basin carved from granite. Whatever it held has long since evaporated."
      },
      {
        id: "obj-basin-2", name: "Stone Basin", type: "decoration",
        x: 80, y: 300, w: 40, h: 24,
        color: "#4a4237",
        text: "A second basin, identical to the first. A faint residue of natron lines the inside."
      },
      {
        id: "obj-wall-inscription", name: "Wall Inscription", type: "decoration",
        x: 600, y: 140, w: 60, h: 80,
        color: "#5c5040",
        text: "Painted hieroglyphs list the names of the dead. Hundreds of them."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  NORTH VESTIBULE  (north-vestibule, 0,-1) — north of burial-chamber
  // ------------------------------------------------------------------ //
  {
    id:   "north-vestibule",
    name: "Vestibule of Offerings",
    type: "room",
    description: "A vaulted antechamber smelling of cedar resin. Rows of offering tables stand empty, waiting.",

    objectives: [
      { id: "north-vestibule-explore", name: "Explore Vestibule", type: "objective", roomId: "north-vestibule", label: "Explore the Vestibule of Offerings.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-north-down", name: "South Door",
        x: 360, y: 468, w: 80, h: 30,
        color: "#4f3925", locked: false, openProgress: 1,   // burial chamber is freely accessible from here
        direction: "down", leadsTo: "burial-chamber", pairId: "burial-north",
        text: "The passage back south to the Burial Chamber."
      }),
      // placeholder decorations
      {
        id: "obj-offering-table-1", name: "Offering Table", type: "decoration",
        x: 150, y: 180, w: 60, h: 20,
        color: "#5a4a30",
        text: "A low stone table. It once held bread, beer, and linen for the journey ahead."
      },
      {
        id: "obj-offering-table-2", name: "Offering Table", type: "decoration",
        x: 350, y: 180, w: 60, h: 20,
        color: "#5a4a30",
        text: "A second offering table, toppled on one side. Something disturbed this room long ago."
      },
      {
        id: "obj-offering-table-3", name: "Offering Table", type: "decoration",
        x: 560, y: 180, w: 60, h: 20,
        color: "#5a4a30",
        text: "A third table, still upright. A clay bowl sits on it, empty."
      },
      {
        id: "obj-cedar-chest", name: "Cedar Chest", type: "decoration",
        x: 340, y: 310, w: 50, h: 36,
        color: "#6b3f1e",
        text: "A small chest of Lebanese cedar. The lid is sealed with a dried resin that crumbles at your touch — but there is nothing inside."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  EAST GALLERY  (east-gallery, 1,1) — east of bottom-room
  // ------------------------------------------------------------------ //
  {
    id:   "east-gallery",
    name: "Gallery of Kings",
    type: "room",
    description: "A long gallery lined with royal cartouches carved in relief. The air here is strangely warm.",

    objectives: [
      { id: "east-gallery-explore", name: "Explore Gallery", type: "objective", roomId: "east-gallery", label: "Explore the Gallery of Kings.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-egallery-left", name: "West Door",
        x: 0, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,   // burial chamber is freely accessible from here
        direction: "left", leadsTo: "bottom-room", pairId: "bottom-east",
        text: "The passage back west to the Sepulcher Depths."
      }),
      // placeholder decorations
      {
        id: "obj-cartouche-1", name: "Royal Cartouche", type: "decoration",
        x: 100, y: 100, w: 36, h: 60,
        color: "#7a6540",
        text: "A cartouche bearing a pharaoh's name. The hieroglyphs within read: Amenhotep, Beloved of Amun."
      },
      {
        id: "obj-cartouche-2", name: "Royal Cartouche", type: "decoration",
        x: 300, y: 100, w: 36, h: 60,
        color: "#7a6540",
        text: "A second cartouche. This name is partially chiseled away — deliberately erased."
      },
      {
        id: "obj-cartouche-3", name: "Royal Cartouche", type: "decoration",
        x: 500, y: 100, w: 36, h: 60,
        color: "#7a6540",
        text: "A third cartouche. The name reads: Thutmose, Son of Ra."
      },
      {
        id: "obj-floor-mosaic", name: "Floor Mosaic", type: "decoration",
        x: 260, y: 300, w: 200, h: 80,
        color: "#3d3328",
        text: "A mosaic of lapis lazuli and carnelian depicting the solar barque crossing the underworld sky."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  DEEP CORRIDOR  (deep-corridor, 2,0) — east of right-room
  // ------------------------------------------------------------------ //
  {
    id:   "deep-corridor",
    name: "Deep Corridor",
    type: "room",
    description: "A long, narrow passage carved deeper into the bedrock. The ceiling is low and the walls press close. Torch smoke has blackened the stone.",

    objectives: [
      { id: "deep-corridor-explore", name: "Explore Corridor", type: "objective", roomId: "deep-corridor", label: "Explore the Deep Corridor.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-dcorridor-left", name: "West Door",
        x: 0, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,   // antechamber is freely accessible from here
        direction: "left", leadsTo: "right-room", pairId: "right-deep",
        text: "The passage back west to the Antechamber."
      }),
      // placeholder decorations
      {
        id: "obj-soot-wall", name: "Soot-Stained Wall", type: "decoration",
        x: 200, y: 80, w: 300, h: 20,
        color: "#2a2520",
        text: "Centuries of torch smoke have turned the limestone black. Faint finger-marks are pressed into the soot — left by someone feeling their way in the dark."
      },
      {
        id: "obj-collapsed-block", name: "Collapsed Block", type: "decoration",
        x: 500, y: 260, w: 80, h: 60,
        color: "#3e3830",
        text: "A large limestone block has fallen from the ceiling. The gap above it is dark and impassable."
      },
      {
        id: "obj-bracket", name: "Empty Torch Bracket", type: "decoration",
        x: 140, y: 200, w: 16, h: 20,
        color: "#5a4a35",
        text: "An iron bracket bolted to the wall. The torch it once held is long gone."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  OSSUARY  (ossuary, 0,2) — south of bottom-room
  // ------------------------------------------------------------------ //
  {
    id:   "ossuary",
    name: "The Ossuary",
    type: "room",
    description: "A vaulted bone-room. Hundreds of skulls are stacked in alcoves floor to ceiling. The silence here is absolute.",

    objectives: [
      { id: "ossuary-explore", name: "Explore Ossuary", type: "objective", roomId: "ossuary", label: "Explore the Ossuary.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-ossuary-up", name: "North Door",
        x: 360, y: 0, w: 80, h: 30,
        color: "#4f3925", locked: false, openProgress: 1,   // sepulcher depths is freely accessible from here
        direction: "up", leadsTo: "bottom-room", pairId: "bottom-ossuary",
        text: "The stair back up to the Sepulcher Depths."
      }),
      // placeholder decorations
      {
        id: "obj-skull-alcove-1", name: "Skull Alcove", type: "decoration",
        x: 60, y: 80, w: 50, h: 120,
        color: "#3a3530",
        text: "Dozens of skulls stacked with precise care. The arrangement is deliberate — these were people of rank."
      },
      {
        id: "obj-skull-alcove-2", name: "Skull Alcove", type: "decoration",
        x: 650, y: 80, w: 50, h: 120,
        color: "#3a3530",
        text: "A matching alcove on the opposite wall. One skull near the top has a small painted eye on its forehead."
      },
      {
        id: "obj-central-slab", name: "Central Slab", type: "decoration",
        x: 300, y: 200, w: 160, h: 40,
        color: "#4a3f33",
        text: "A flat slab at the room's center. An inscription reads: 'We who wait here were not forgotten. We wait still.'"
      },
      {
        id: "obj-canopic-shelf", name: "Canopic Shelf", type: "decoration",
        x: 180, y: 360, w: 120, h: 20,
        color: "#5c4e3a",
        text: "A low shelf holding four canopic jars. Their stoppers are shaped like the heads of the four sons of Horus."
      }
    ],
    exit: null
  }

]; // end rooms[]

// =====================
// BOOT: set starting room
// =====================
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

/** Returns the objects array for the room the player is currently in. */
function getCurrentObjects() {
  return currentRoom.objects;
}

/**
 * Find the first object in the current room matching type,
 * with an optional extra filter predicate.
 */
function findObjectByType(type, filter) {
  return getCurrentObjects().find(
    obj => obj.type === type && (!filter || filter(obj))
  );
}

/** Shorthand: find a door by its direction string. */
function findDoorByDirection(direction) {
  return findObjectByType("door", door => door.direction === direction);
}

/** Returns the first door that is geometrically colliding with the player. */
function getCollidingDoor() {
  return getCurrentObjects().find(
    obj => obj.type === "door" && isColliding(player, obj)
  );
}
