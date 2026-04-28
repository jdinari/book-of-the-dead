const player = document.getElementById("player");

let x = 400;
let y = 300;

const speed = 3;

const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function update() {
  if (keys["arrowleft"] || keys["a"]) x -= speed;
  if (keys["arrowright"] || keys["d"]) x += speed;
  if (keys["arrowup"] || keys["w"]) y -= speed;
  if (keys["arrowdown"] || keys["s"]) y += speed;

  player.style.left = x + "px";
  player.style.top = y + "px";

  requestAnimationFrame(update);
}

update();