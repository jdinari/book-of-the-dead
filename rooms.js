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
      },
      {
        id: "obj-ushabti-rr", name: "Ushabti of Horus", type: "ushabti",
        x: 650, y: 320, w: 18, h: 30,
        god: "horus",
        text: "A faience figurine — falcon-headed Horus, son of Osiris, lord of the sky.\n\nThe ushabti speaks: \'The scroll holds the key to the eastern passage. Read the tablet, then seek further east through the corridor.\'",
        inspectDone: false
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
      },
      {
        id: "obj-ushabti-br", name: "Ushabti of Osiris", type: "ushabti",
        x: 620, y: 150, w: 18, h: 30,
        god: "osiris",
        text: "A faience figurine — green-skinned Osiris, lord of the dead, wearing the atef crown.\n\nThe ushabti intones: \'The amulet of protection belongs on the altar. Lay it down and I shall show you the way east.\'",
        inspectDone: false
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  WEST HALL  (west-hall, -1,0) — west of burial-chamber
  //
  //  PUZZLE: Canopic Jar Ritual Order
  //  The wall inscription gives the ritual order of the four sons of Horus:
  //    Imsety (human)  → Hapy (baboon) → Duamutef (jackal) → Qebehsenuef (falcon)
  //  Inspecting the four canopic jars in that order opens a hidden niche
  //  containing a Key Fragment used later in the deep corridor.
  // ------------------------------------------------------------------ //
  {
    id:   "west-hall",
    name: "Hall of Preparation",
    type: "room",
    description: "A wide hall where priests once readied the dead for their journey. Stone basins line the walls, long dry.",

    objectives: [
      { id: "canopic-ritual",  label: "Perform the ritual of the four sons of Horus.",   done: false },
      { id: "west-hall-niche", label: "Retrieve the key fragment from the hidden niche.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-west-right", name: "East Door",
        x: 760, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,
        direction: "right", leadsTo: "burial-chamber", pairId: "burial-west",
        text: "The passage back east to the Burial Chamber."
      }),

      // ── clue inscription ──────────────────────────────────────────
      {
        id: "obj-ritual-inscription", name: "Ritual Inscription", type: "decoration",
        x: 580, y: 100, w: 100, h: 130,
        color: "#5c5040",
        text: "A painted list of priestly instructions:\n\n" +
              "\"First, Imsety the human-headed, guardian of the liver.\n" +
              " Then Hapy the baboon, guardian of the lungs.\n" +
              " Then Duamutef the jackal, guardian of the stomach.\n" +
              " Last, Qebehsenuef the falcon, guardian of the intestines.\n\n" +
              "Touch each in order and the passage of organs shall open.\""
      },

      // ── stone basins (decoration only) ────────────────────────────
      {
        id: "obj-basin-1", name: "Stone Basin", type: "decoration",
        x: 80, y: 140, w: 44, h: 26,
        color: "#4a4237",
        text: "A wide basin carved from granite. A faint residue of natron lines the inside — used to dry the body for preservation."
      },
      {
        id: "obj-basin-2", name: "Stone Basin", type: "decoration",
        x: 80, y: 330, w: 44, h: 26,
        color: "#4a4237",
        text: "A second basin, stained a pale white. The linen wrappings that soaked here are long gone."
      },

      // ── four canopic jars ─────────────────────────────────────────
      // order index: Imsety=1, Hapy=2, Duamutef=3, Qebehsenuef=4
      {
        id: "canopic-imsety", name: "Canopic Jar — Imsety", type: "canopic",
        x: 200, y: 200, w: 24, h: 32,
        color: "#8a7055",
        ritualIndex: 1,
        head: "human",
        text: "A alabaster jar with a human-headed stopper. Imsety, son of Horus, guardian of the liver. The first in the rite.",
        inspectDone: false
      },
      {
        id: "canopic-hapy", name: "Canopic Jar — Hapy", type: "canopic",
        x: 280, y: 200, w: 24, h: 32,
        color: "#8a7055",
        ritualIndex: 2,
        head: "baboon",
        text: "A alabaster jar with a baboon-headed stopper. Hapy, son of Horus, guardian of the lungs. The second in the rite.",
        inspectDone: false
      },
      {
        id: "canopic-duamutef", name: "Canopic Jar — Duamutef", type: "canopic",
        x: 360, y: 200, w: 24, h: 32,
        color: "#8a7055",
        ritualIndex: 3,
        head: "jackal",
        text: "A alabaster jar with a jackal-headed stopper. Duamutef, son of Horus, guardian of the stomach. The third in the rite.",
        inspectDone: false
      },
      {
        id: "canopic-qebehsenuef", name: "Canopic Jar — Qebehsenuef", type: "canopic",
        x: 440, y: 200, w: 24, h: 32,
        color: "#8a7055",
        ritualIndex: 4,
        head: "falcon",
        text: "A alabaster jar with a falcon-headed stopper. Qebehsenuef, son of Horus, guardian of the intestines. The fourth and last in the rite.",
        inspectDone: false
      },

      {
        id: "obj-ushabti-wh", name: "Ushabti of Sekhmet", type: "ushabti",
        x: 150, y: 320, w: 18, h: 30,
        god: "sekhmet",
        text: "A faience figurine — lioness-headed Sekhmet, goddess of war and healing.\n\nThe ushabti growls softly: \'The four sons of Horus must be honoured in their proper order. Imsety first, then Hapy, then Duamutef, then Qebehsenuef. Touch each in turn.\'",
        inspectDone: false
      },

      // ── hidden niche (revealed after ritual) ──────────────────────
      {
        id: "obj-west-niche", name: "Hidden Niche", type: "niche",
        x: 580, y: 300, w: 50, h: 50,
        color: "#2a2218",
        hidden: true,       // drawn as plain wall until canopic-ritual completes
        text: "A hollow in the wall, revealed by the ritual. Inside rests a small iron key fragment.",
        containsItem: {
          id: "key-fragment-west", name: "Key Fragment", type: "key-fragment",
          x: 600, y: 320, w: 14, h: 10,
          color: "#888070",
          pickedUp: false,
          text: "A fragment of an iron key. One piece of several needed to open something deeper in the tomb."
        }
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  NORTH VESTIBULE  (north-vestibule, 0,-1) — north of burial-chamber
  //
  //  PUZZLE: Three Offerings
  //  Three offering bowls (food, oil, incense) must each be "filled" by
  //  inspecting the bowl while holding the matching item in inventory.
  //  The items are hidden across the tomb:
  //    - dried bread  → found on the cedar chest in this room
  //    - oil flask    → found in the west-hall basin (added below)
  //    - incense cone → found in the ossuary canopic shelf
  //  When all three bowls are filled a locked northern alcove door opens,
  //  revealing a Canopic Seal needed to progress in the ossuary.
  // ------------------------------------------------------------------ //
  {
    id:   "north-vestibule",
    name: "Vestibule of Offerings",
    type: "room",
    description: "A vaulted antechamber smelling of cedar resin. Three offering tables stand before a sealed alcove.",

    objectives: [
      { id: "fill-offering-bread",    label: "Place dried bread in the food bowl.",   done: false },
      { id: "fill-offering-oil",     label: "Pour oil into the oil bowl.",            done: false },
      { id: "fill-offering-incense", label: "Set incense in the incense bowl.",       done: false },
      { id: "open-alcove",           label: "Open the sealed offering alcove.",       done: false }
    ],

    objects: [
      createDoor({
        id: "door-north-down", name: "South Door",
        x: 360, y: 468, w: 80, h: 30,
        color: "#4f3925", locked: false, openProgress: 1,
        direction: "down", leadsTo: "burial-chamber", pairId: "burial-north",
        text: "The passage back south to the Burial Chamber."
      }),

      // ── sealed alcove door (unlocks when all three offerings placed) ──
      createDoor({
        id: "door-alcove-north", name: "Sealed Alcove",
        x: 360, y: 0, w: 80, h: 30,
        color: "#5a3a20", locked: true,
        direction: "up", leadsTo: "inner-sanctum", pairId: "vestibule-sanctum",
        text: "A sealed stone alcove. The inscription above reads: \'Feed the three needs of the dead: sustenance, light, and fragrance.\'"
      }),

      // ── clue: false door inscription ──────────────────────────────
      {
        id: "obj-false-door", name: "False Door", type: "decoration",
        x: 320, y: 60, w: 160, h: 80,
        color: "#3e3428",
        text: "A painted false door — the passage between the living and the dead. An inscription frames the three bowls below it:\n\n'Bread for the body. Oil for the flame. Smoke for the gods. Bring each and the alcove shall open.'"
      },

      // ── three offering bowls ──────────────────────────────────────
      {
        id: "bowl-food", name: "Food Bowl", type: "offering-bowl",
        x: 160, y: 200, w: 50, h: 20,
        color: "#6a5535",
        offeringType: "bread",
        filled: false,
        text: "An empty clay bowl carved with loaves of bread. It waits for sustenance."
      },
      {
        id: "bowl-oil", name: "Oil Bowl", type: "offering-bowl",
        x: 375, y: 200, w: 50, h: 20,
        color: "#6a5535",
        offeringType: "oil",
        filled: false,
        text: "A stone bowl with a lamp-wick groove. It waits for oil."
      },
      {
        id: "bowl-incense", name: "Incense Bowl", type: "offering-bowl",
        x: 590, y: 200, w: 50, h: 20,
        color: "#6a5535",
        offeringType: "incense",
        filled: false,
        text: "A shallow bowl blackened by centuries of old smoke. It waits for incense."
      },

      {
        id: "obj-ushabti-nv", name: "Ushabti of Hathor", type: "ushabti",
        x: 680, y: 310, w: 18, h: 30,
        god: "hathor",
        text: "A faience figurine — cow-horned Hathor, goddess of love and offerings, with a sun disk between her horns.\n\nThe ushabti sings softly: \'Three gifts sustain the dead: bread for the body, oil for the flame, smoke for the gods. Bring each to its bowl, and the sealed alcove shall open.\' The ushabti\'s gaze lifts toward the hidden passage beyond.",
        inspectDone: false
      },

      // ── cedar chest with dried bread ──────────────────────────────
      {
        id: "obj-cedar-chest", name: "Cedar Chest", type: "decoration",
        x: 340, y: 340, w: 50, h: 36,
        color: "#6b3f1e",
        text: "A small chest of Lebanese cedar. Inside, surprisingly preserved, a round of dried funerary bread."
      },
      {
        id: "item-bread", name: "Dried Bread", type: "offering-item",
        x: 355, y: 348, w: 14, h: 12,
        color: "#c8a870",
        offeringType: "bread",
        pickedUp: false,
        text: "A round of hardened funerary bread. Still faintly fragrant after centuries. Place it in the food bowl."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  EAST GALLERY  (east-gallery, 1,1) — east of bottom-room
  //
  //  PUZZLE: The Erased Cartouche
  //  Cartouche-1 and Cartouche-3 each contain a name-fragment clue
  //  (one gives the first syllable, the other the second). Inspecting
  //  both in any order loads nameFragments[]. When both are known,
  //  inspecting the erased cartouche (obj-cartouche-2) "restores" it,
  //  marks the objective, and spawns a secret compartment with an item.
  // ------------------------------------------------------------------ //
  {
    id:   "east-gallery",
    name: "Gallery of Kings",
    type: "room",
    description: "A long gallery lined with royal cartouches carved in relief. The air here is strangely warm.",

    objectives: [
      { id: "read-cartouche-clues",  label: "Study the intact cartouches for clues.",      done: false },
      { id: "restore-cartouche",     label: "Restore the erased cartouche's name.",         done: false },
      { id: "gallery-compartment",   label: "Retrieve the item from the secret compartment.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-egallery-left", name: "West Door",
        x: 0, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,
        direction: "left", leadsTo: "bottom-room", pairId: "bottom-east",
        text: "The passage back west to the Sepulcher Depths."
      }),

      // ── cartouche 1: gives syllable "AKHEN" ──────────────────────
      {
        id: "obj-cartouche-1", name: "Royal Cartouche — Amenhotep", type: "cartouche",
        x: 100, y: 80, w: 36, h: 70,
        color: "#7a6540",
        nameFragment: "AKHEN",
        fragmentSlot: 0,
        inspectDone: false,
        text: "A cartouche bearing the name Amenhotep, Beloved of Amun. Beneath the main inscription, almost too small to see, a mason has scratched a syllable: AKHEN — as if recording a secret name alongside the official one."
      },

      // ── cartouche 2: erased ───────────────────────────────────────
      {
        id: "obj-cartouche-2", name: "Erased Cartouche", type: "cartouche-erased",
        x: 310, y: 80, w: 36, h: 70,
        color: "#524535",
        restored: false,
        text: "A cartouche deliberately chiseled away — damnatio memoriae. The name has been erased from history. Fragments of the oval border remain, but the glyphs within are gone.\n\nIf you knew the name, perhaps you could speak it aloud and restore its memory."
      },

      // ── cartouche 3: gives syllable "ATEN" ───────────────────────
      {
        id: "obj-cartouche-3", name: "Royal Cartouche — Thutmose", type: "cartouche",
        x: 530, y: 80, w: 36, h: 70,
        color: "#7a6540",
        nameFragment: "ATEN",
        fragmentSlot: 1,
        inspectDone: false,
        text: "A cartouche reading: Thutmose, Son of Ra. In the lower margin, another scratched syllable: ATEN — the same careful hand as the first cartouche. Two halves of a hidden name."
      },

      // ── floor mosaic: atmospheric decoration ─────────────────────
      {
        id: "obj-floor-mosaic", name: "Floor Mosaic", type: "decoration",
        x: 220, y: 310, w: 360, h: 80,
        color: "#3d3328",
        text: "A mosaic of lapis lazuli and carnelian depicting the solar barque crossing the underworld sky. Ra stands at the prow, his head a disk of gold tesserae. The inscription below reads: 'He who is named shall sail. He who is unnamed shall drift.'"
      },

      {
        id: "obj-ushabti-eg", name: "Ushabti of Ra", type: "ushabti",
        x: 680, y: 300, w: 18, h: 30,
        god: "ra",
        text: "A faience figurine — Ra the sun god, his head a gleaming solar disk ringed in gold.\n\nThe ushabti speaks: \'Two cartouches guard a third name. Find the hidden syllables, speak the name of the erased king, and the gallery shall yield its secret.\'",
        inspectDone: false
      },

      // ── secret compartment (hidden, revealed after cartouche restored) ─
      {
        id: "obj-gallery-compartment", name: "Secret Compartment", type: "niche",
        x: 310, y: 180, w: 36, h: 30,
        color: "#2a2218",
        hidden: true,
        text: "A small compartment has opened in the wall beneath the restored cartouche. Inside: a sealed canopic ring — a priestly token of authority.",
        containsItem: {
          id: "item-canopic-ring", name: "Canopic Ring", type: "canopic-ring",
          x: 318, y: 188, w: 14, h: 14,
          color: "#c8a030",
          pickedUp: false,
          text: "A bronze ring bearing the seal of the four sons of Horus. Priestly authority, carried into the tomb."
        }
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  DEEP CORRIDOR  (deep-corridor, 2,0) — east of right-room
  //
  //  PUZZLE: Mount the Torch
  //  An empty torch bracket on the wall. If the player holds a lit torch
  //  and presses T near the bracket, they mount it, permanently lighting
  //  the room. The light reveals three faded wall paintings that were
  //  invisible in darkness. The central painting contains a new glyph
  //  clue — a cartouche name that hints at the erased pharaoh.
  //  Mounting also unlocks the bracket as a waypoint (torch stays lit
  //  even after the player leaves, tracked by corridorTorchMounted flag).
  // ------------------------------------------------------------------ //
  {
    id:   "deep-corridor",
    name: "Deep Corridor",
    type: "room",
    description: "A long, narrow passage carved deeper into the bedrock. The ceiling is low. Torch smoke has blackened the stone.",

    objectives: [
      { id: "mount-corridor-torch", label: "Mount your torch in the wall bracket.",              done: false },
      { id: "read-wall-paintings",  label: "Read the revealed paintings in the lit corridor.",   done: false }
    ],

    objects: [
      createDoor({
        id: "door-dcorridor-left", name: "West Door",
        x: 0, y: 200,
        color: "#4f3925", locked: false, openProgress: 1,
        direction: "left", leadsTo: "right-room", pairId: "right-deep",
        text: "The passage back west to the Antechamber."
      }),

      // ── soot-stained wall: atmospheric, always visible ─────────────
      {
        id: "obj-soot-wall", name: "Soot-Stained Wall", type: "decoration",
        x: 180, y: 60, w: 340, h: 22,
        color: "#2a2520",
        text: "Centuries of torch smoke have turned the limestone black. Faint finger-marks are pressed into the soot — left by someone feeling their way in the dark."
      },

      // ── torch bracket: the puzzle trigger ─────────────────────────
      {
        id: "obj-bracket", name: "Empty Torch Bracket", type: "bracket",
        x: 140, y: 195, w: 20, h: 26,
        color: "#5a4a35",
        mounted: false,
        text: "An iron bracket bolted to the wall. The torch it once held is long gone. It looks like it could hold a torch again. (Hold a lit torch and press T to mount it.)"
      },

      // ── collapsed block: decoration ───────────────────────────────
      {
        id: "obj-collapsed-block", name: "Collapsed Block", type: "decoration",
        x: 530, y: 255, w: 80, h: 65,
        color: "#3e3830",
        text: "A large limestone block has fallen from the ceiling. The gap above it is dark and silent."
      },

      {
        id: "obj-ushabti-dc", name: "Ushabti of Sobek", type: "ushabti",
        x: 650, y: 220, w: 18, h: 30,
        god: "sobek",
        text: "A faience figurine — Sobek the crocodile god, guardian of dark and watery places.\n\nThe ushabti hisses: \'Darkness hides what light reveals. Mount your torch in the bracket and see what has waited here for centuries.\'",
        inspectDone: false
      },

      // ── three wall paintings: hidden until torch is mounted ────────
      {
        id: "obj-painting-hunt", name: "Wall Painting — The Hunt", type: "wall-painting",
        x: 220, y: 100, w: 90, h: 120,
        color: "#4a3e2e",
        hidden: true,
        text: "A hunting scene: a pharaoh in a chariot draws a bow against a lion. The cartouche above the figure identifies him — the glyphs read AKHENATEN. The same name scratched beneath the cartouches in the Gallery."
      },
      {
        id: "obj-painting-offerings", name: "Wall Painting — Offerings", type: "wall-painting",
        x: 340, y: 100, w: 90, h: 120,
        color: "#4a3e2e",
        hidden: true,
        text: "A priest carries offerings before the Aten — the sun disk. The rays end in small hands, each touching a figure. This is not the Amun religion. This is Akhenaten's heresy, hidden here in secret."
      },
      {
        id: "obj-painting-judgment", name: "Wall Painting — Judgment", type: "wall-painting",
        x: 460, y: 100, w: 90, h: 120,
        color: "#4a3e2e",
        hidden: true,
        text: "The Weighing of the Heart: Anubis holds the scales. On one side, a feather; on the other, a painted heart. Below: 'He who was erased shall be weighed nonetheless. Truth outlasts stone.'\n\nBeneath the painting, scratched into the plaster: AKHENATEN."
      }
    ],
    exit: null
  },

  // ------------------------------------------------------------------ //
  //  OSSUARY  (ossuary, 0,2) — south of bottom-room
  //
  //  PUZZLE: Watcher Skulls
  //  Four "watcher" skulls each face a cardinal direction. The player
  //  must inspect all four to record their directions. A fifth object
  //  — the central inscription — gives a hint: "Where all watchers
  //  agree, the path opens." The four directions triangulate to a
  //  specific wall niche (east wall). When the player inspects the niche
  //  after reading all four skulls, it opens and yields the Canopic Seal
  //  (also referenced in the north-vestibule puzzle thread).
  //
  //  Also contains: oil flask (offering item for north-vestibule puzzle)
  //                 incense cone (offering item for north-vestibule puzzle)
  // ------------------------------------------------------------------ //
  {
    id:   "ossuary",
    name: "The Ossuary",
    type: "room",
    description: "A vaulted bone-room. Hundreds of skulls are stacked in alcoves floor to ceiling. The silence here is absolute.",

    objectives: [
      { id: "read-watcher-skulls",  label: "Inspect all four watcher skulls.",               done: false },
      { id: "find-ossuary-niche",   label: "Find the niche where the watchers look.",         done: false },
      { id: "collect-ossuary-seal", label: "Collect the Canopic Seal from the niche.",        done: false }
    ],

    objects: [
      createDoor({
        id: "door-ossuary-up", name: "North Door",
        x: 360, y: 0, w: 80, h: 30,
        color: "#4f3925", locked: false, openProgress: 1,
        direction: "up", leadsTo: "bottom-room", pairId: "bottom-ossuary",
        text: "The stair back up to the Sepulcher Depths."
      }),

      // ── regular skull alcoves: decoration ─────────────────────────
      {
        id: "obj-skull-alcove-1", name: "Skull Alcove", type: "decoration",
        x: 40, y: 60, w: 50, h: 140,
        color: "#3a3530",
        text: "Dozens of skulls stacked with precise care. The arrangement is deliberate — these were people of rank."
      },
      {
        id: "obj-skull-alcove-2", name: "Skull Alcove", type: "decoration",
        x: 710, y: 60, w: 50, h: 140,
        color: "#3a3530",
        text: "A matching alcove on the opposite wall. The skulls here face inward, toward the center of the room."
      },

      // ── four watcher skulls — each has a painted direction symbol ──
      // The four directions resolve to EAST when combined (they all
      // face the east wall: north→ look right, south→ look left toward
      // east is actually right). Narratively each says its direction;
      // the player must notice they all ultimately point east.
      {
        id: "watcher-north", name: "Watcher Skull — North", type: "watcher-skull",
        x: 380, y: 70, w: 28, h: 28,
        color: "#7a7060",
        watchDirection: "east",
        facePainted: "→",
        inspectDone: false,
        text: "This skull, set apart from the others, has a painted symbol on its forehead: an arrow pointing east. Its empty sockets stare toward the eastern wall."
      },
      {
        id: "watcher-south", name: "Watcher Skull — South", type: "watcher-skull",
        x: 380, y: 390, w: 28, h: 28,
        color: "#7a7060",
        watchDirection: "east",
        facePainted: "→",
        inspectDone: false,
        text: "A skull placed low, near the floor. The painted arrow on its brow also points east. It is oriented to face the far wall."
      },
      {
        id: "watcher-west", name: "Watcher Skull — West", type: "watcher-skull",
        x: 80, y: 240, w: 28, h: 28,
        color: "#7a7060",
        watchDirection: "east",
        facePainted: "→",
        inspectDone: false,
        text: "A skull on a small shelf, separated from the others. Its painted mark: an eastward arrow. It has been deliberately turned to face the opposite wall."
      },
      {
        id: "watcher-east", name: "Watcher Skull — East", type: "watcher-skull",
        x: 690, y: 240, w: 28, h: 28,
        color: "#7a7060",
        watchDirection: "east",
        facePainted: "✦",
        inspectDone: false,
        text: "A skull on the east wall itself, with a star painted where the arrow would go. This one is not pointing — it is the destination. The four watchers all converge here."
      },

      // ── central inscription: gives the puzzle's solution hint ──────
      {
        id: "obj-central-slab", name: "Central Inscription", type: "decoration",
        x: 290, y: 215, w: 220, h: 50,
        color: "#4a3f33",
        text: "An inscription at the room's center:\n\n'We who wait here were not forgotten. We wait still. Four among us watch. Follow their gaze to find what endures.'"
      },

      {
        id: "obj-ushabti-os", name: "Ushabti of Nephthys", type: "ushabti",
        x: 400, y: 420, w: 18, h: 30,
        god: "nephthys",
        text: "A faience figurine — winged Nephthys, protector of the dead. Her painted wings wrap around her body.\n\nThe ushabti whispers: \'Four watchers guard this place. Inspect each skull — north, south, east, west. All four agree on where the path opens. Follow their gaze.\'",
        inspectDone: false
      },

      // ── east niche: hidden until all four watcher skulls inspected ─
      {
        id: "obj-ossuary-niche", name: "Wall Niche", type: "niche",
        x: 735, y: 200, w: 30, h: 80,
        color: "#2a2218",
        hidden: true,
        text: "A hidden niche in the east wall, exactly where all four watcher skulls point. Inside: a clay canopic seal, stamped with the four sons of Horus.",
        containsItem: {
          id: "item-canopic-seal", name: "Canopic Seal", type: "canopic-seal",
          x: 740, y: 225, w: 16, h: 16,
          color: "#c8b880",
          pickedUp: false,
          text: "A clay seal bearing the four sons of Horus. It feels important — as if it belongs somewhere specific."
        }
      },

      // ── canopic shelf with oil and incense (offering puzzle items) ─
      {
        id: "obj-canopic-shelf", name: "Canopic Shelf", type: "decoration",
        x: 170, y: 370, w: 140, h: 22,
        color: "#5c4e3a",
        text: "A low shelf holding funerary equipment. Among the jars, two items stand out."
      },
      {
        id: "item-oil-flask", name: "Oil Flask", type: "offering-item",
        x: 185, y: 345, w: 16, h: 22,
        color: "#8a8060",
        offeringType: "oil",
        pickedUp: false,
        text: "A small alabaster flask, still sealed. Oil — for the lamp-bowl in the Vestibule of Offerings."
      },
      {
        id: "item-incense-cone", name: "Incense Cone", type: "offering-item",
        x: 215, y: 350, w: 16, h: 16,
        color: "#5a3a2a",
        offeringType: "incense",
        pickedUp: false,
        text: "A compressed cone of kyphi incense — resin, honey, myrrh. Meant for the incense bowl in the Vestibule of Offerings."
      }
    ],
    exit: null
  },

// ------------------------------------------------------------------ //
  //  INNER SANCTUM  (inner-sanctum) — north of north-vestibule (secret)
  //
  //  Accessed only after filling all three offering bowls in the
  //  Vestibule of Offerings. A small, perfectly preserved chamber
  //  containing the pharaoh\'s private altar and a final revelation.
  // ------------------------------------------------------------------ //
  {
    id:   "inner-sanctum",
    name: "The Inner Sanctum",
    type: "room",
    description: "A tiny chamber, barely larger than a cell. The air is dry and cold — sealed since the burial. Everything here is perfectly preserved.",

    objectives: [
      { id: "read-sanctum-stele",  label: "Read the offering stele.", done: false },
      { id: "find-heart-scarab",   label: "Take the Heart Scarab from the altar.", done: false }
    ],

    objects: [
      createDoor({
        id: "door-sanctum-south", name: "Return South",
        x: 360, y: 468, w: 80, h: 30,
        color: "#5a3a20", locked: false, openProgress: 1,
        direction: "down", leadsTo: "north-vestibule", pairId: "vestibule-sanctum",
        text: "The passage back south to the Vestibule of Offerings."
      }),

      // ── the private altar ─────────────────────────────────────────
      {
        id: "obj-sanctum-altar", name: "Private Altar", type: "decoration",
        x: 300, y: 160, w: 200, h: 36,
        color: "#4a3828",
        text: "A small alabaster altar, its surface still bearing dried flower petals and resin — offerings left at the burial. A name is carved into its face in deep hieroglyphs: AKHENATEN. Below: \'He who is erased cannot be buried. He who is named shall pass into the Field of Reeds.\'"
      },

      // ── offering stele ────────────────────────────────────────────
      {
        id: "obj-sanctum-stele", name: "Offering Stele", type: "decoration",
        x: 200, y: 80, w: 60, h: 100,
        color: "#6a5835",
        text: "A limestone stele painted in vivid colours — reds and yellows undimmed by time in this sealed room. It shows the pharaoh Akhenaten making offerings to the Aten, the sun disk. His elongated face and long fingers are unmistakeable.\n\nBelow the scene, a dedication:\n\'For he who was erased by small men. Truth lives where stone does not. May the Aten weigh your heart and find it light.\'",
        inspectDone: false
      },

      // ── offering stele right ──────────────────────────────────────
      {
        id: "obj-sanctum-stele-r", name: "Offering Stele", type: "decoration",
        x: 540, y: 80, w: 60, h: 100,
        color: "#6a5835",
        text: "A second stele, its paint flaking at the edges. It shows Akhenaten\'s queen — Nefertiti — shaking a sistrum before the solar disk. The inscription names her: Neferneferuaten Nefertiti.\n\nBeneath: \'She who endures. She who was beautiful. She who is not forgotten.\'",
        inspectDone: false
      },

      // ── gold canopic chest ────────────────────────────────────────
      {
        id: "obj-gold-chest", name: "Canopic Chest", type: "decoration",
        x: 330, y: 320, w: 140, h: 60,
        color: "#8a6825",
        text: "A gilded chest inlaid with lapis lazuli. Four compartments each hold a small alabaster canopic jar. The lids have been sealed with wax — untouched for three thousand years. This is the heart of the burial."
      },

      // ── heart scarab — the key collectible ───────────────────────
      {
        id: "item-heart-scarab", name: "Heart Scarab", type: "heart-scarab",
        x: 370, y: 215, w: 20, h: 16,
        color: "#2a8040",
        pickedUp: false,
        text: "A green jasper scarab beetle, wings outstretched. The underside is engraved with spell 30B from the Book of the Dead:\n\'O my heart which I had from my mother, do not stand up against me as a witness. Do not oppose me in the tribunal.\'"
      },

      // ── ushabti of Ptah (mummiform, creator god) ──────────────────
      {
        id: "obj-ushabti-is", name: "Ushabti of Ptah", type: "ushabti",
        x: 120, y: 280, w: 18, h: 30,
        god: "ptah",
        text: "A faience figurine — mummiform Ptah, creator god of Memphis, holding a was-sceptre before him. His skin is vivid blue.\n\nThe ushabti speaks clearly: \'You have fed the dead. You have honoured the gods. Take the Heart Scarab — it is the final offering. The pharaoh can now be weighed.\'",
        inspectDone: false
      },

      // ── wall inscription — ambient lore ──────────────────────────
      {
        id: "obj-sanctum-wall", name: "Wall Inscription", type: "decoration",
        x: 90, y: 60, w: 80, h: 360,
        color: "#3a3020",
        text: "The entire north wall is covered in text — columns of hieroglyphs from floor to ceiling, perfectly preserved. This is spell 125 from the Book of the Dead: the Declaration of Innocence, spoken before the scales of Anubis.\n\n\'I have not committed sin. I have not committed robbery with violence. I have not stolen. I have not slain men and women. I have not destroyed food supplies. I have not caused pain. I have not committed fornication...\' It continues for forty-two declarations.\n\nIn the margin, a later hand has added: \'Akhenaten said these things. Let the scales judge him, not the priests.\'",
        inspectDone: false
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

