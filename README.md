# Book of the Dead

A top-down 2D Egyptian tomb exploration game built in vanilla JavaScript (no framework, no build step). You explore a multi-room tomb, decipher hieroglyphs, perform ancient rituals, and piece together the identity of a forgotten pharaoh.

**[▶ Play it live →](https://jdinari.github.io/book-of-the-dead/)** *(update link after enabling GitHub Pages)*

---

## Controls

| Key | Action |
|-----|--------|
| `W A S D` / Arrow keys | Move |
| `E` | Inspect nearby object / close inspect panel |
| `Escape` | Close inspect panel |
| `X` | Pick up item / drop active item |
| `Q` | Cycle inventory |
| `L` | Toggle torch on/off |
| `T` | Mount lit torch in wall bracket |
| `G` | Decode glyphs (when near glyph stone with full translation) |
| `V` | Open/close glyph notebook (unlocked after reading the tablet) |
| `M` | Toggle map (unlocked after opening the east passage) |

---

## Architecture

The project is intentionally no-build, no-dependencies — plain HTML + CSS + JS. Scripts are loaded in dependency order:

```
state.js       — shared variables, canvas, player, flags
rooms.js       — all room/object data + helpers (getCurrentObjects, etc.)
ui.js          — HUD, map, inventory display, glyph notebook
inventory.js   — pick up, drop, cycle, consume items
objectives.js  — quest logic, inspect dispatch, door unlock, ritual checks
engine.js      — game loop, input, physics, collision, camera, rendering
```

---

## Running Locally

No build step needed — just open `index.html` in a browser:

```bash
# Option 1: open directly
open index.html

# Option 2: serve with any static server (avoids some browser file:// quirks)
npx serve .
# or
python3 -m http.server 8000
```

---

## Deploying to GitHub Pages

1. Push to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Update the play link at the top of this README

---

## Performance

The rendering pipeline uses two optimizations to keep the frame rate smooth:

**Offscreen background cache** — `drawTomb()` pre-renders the static room environment (stone grid ~160 rect/stroke calls, glyph frieze ~36 glyphs, columns, wall decorations, ossuary skulls ~200 fillText calls) to an offscreen `<canvas>` once per room transition. Every subsequent frame is a single `drawImage()` blit. The cache is invalidated automatically on room change and on window resize.

**Memoized lighting gradients** — `drawLighting()` creates `RadialGradient` objects (up to 3 per frame previously) only when the player's position changes by more than 2px or the lamp/corridor state changes. Flicker animation is achieved by modulating `globalAlpha` each frame (free) rather than rebuilding gradient objects.

---



- [ ] Save/load progress (localStorage)
- [ ] Mobile touch controls
- [ ] Sound design (ambient tomb drone, interaction cues)
- [ ] Animated sprites for the player character
- [ ] Ending screen / credits sequence
- [ ] Room transition fade effect

---

## License

MIT
