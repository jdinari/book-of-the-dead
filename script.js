const player = document.getElementById("player");

let x = 100;
const speed = 10;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    x += speed;
  }

  if (e.key === "ArrowLeft") {
    x -= speed;
  }

  player.style.left = x + "px";
});