console.log("Connected");

//HÄmntar canvas från html koden och gör den till variabler
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Funktion för att rita en boll som tar in 4 variabler
// x-kord, y-kord, radius, färg
function drawBall(x, y, r, color) {
  ctx.beginPath();
  //Ritar en cirkel
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  //Fyller den med färg
  ctx.fillStyle = color;
  //Kanten på bollen
  ctx.stroke();
  //fyller den
  ctx.fill();
}

drawBall(160, 380, 20, "white");
drawBall(160, 180, 20, "red");
