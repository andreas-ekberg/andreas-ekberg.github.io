console.log("Connected");

//HÄmntar canvas från html koden och gör den till variabler
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Bools för att se ifall knappen är nertryckt
let UP;

//Array med alla bollar
let ballList = [];

class Ball {
  constructor(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    ballList.push(this);
  }

  //Funktion för att rita en boll som tar in 4 variabler
  // x-kord, y-kord, radius, färg
  drawBall() {
    ctx.beginPath();
    //Ritar en cirkel
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    //Fyller den med färg
    ctx.fillStyle = this.color;
    //Kanten på bollen
    ctx.stroke();
    //fyller den
    ctx.fill();
  }
}

//Event handler för att lyssna på när man trycker ner en knapp
canvas.addEventListener("keydown", function (e) {
  //Lyssna och hitta vad key har för kod
  //console.log(e);

  if (e.keyCode === 38) {
    UP = true;
  }
});

//Event handler för att lyssna ifall man släpper en knapp
canvas.addEventListener("keyup", function (e) {
  if (e.keyCode === 38) {
    UP = false;
  }
});

//Funktion för rörelse
function move() {
  if (UP) {
    mainBall.y--;
  }
}

//Animerar canvas varje frame
function mainLoop() {
  requestAnimationFrame(mainLoop);
  //clear canvas
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  move();
  ballList.forEach((b) => {
    b.drawBall();
  });
}

//Definerar bollarna
let mainBall = new Ball(160, 380, 20, "white");
let Ball1 = new Ball(160, 180, 20, "red");

requestAnimationFrame(mainLoop);
