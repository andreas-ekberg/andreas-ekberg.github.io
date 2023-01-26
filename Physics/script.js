console.log("Connected");

//HÄmntar canvas från html koden och gör den till variabler
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Bools för att se ifall knappen är nertryckt
let UP;
let friction = 0.1;

//Array med alla bollar
let ballList = [];

class Ball {
  constructor(x, y, r, color) {
    //Posistion i x och y
    this.x = x;
    this.y = y;
    //Radien
    this.r = r;
    this.color = color;
    //Horizontel och vertikal velocity
    this.vel_x = 0;
    this.vel_y = 0;
    //acceleration vertikalt och horizontelt
    this.acc_x = 0;
    this.acc_y = 0;
    this.acceleration = 1;
    //Lägger in den i boll arrayen
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

  // för att rita ut linjer för acceleration och velocity
  displayLine() {
    //Linje för acceleration
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.acc_x * 50, this.y + this.acc_y * 50);
    ctx.strokeStyle = "red";
    ctx.stroke();

    //Linje för velocity
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.vel_x * 10, this.y + this.vel_y * 10);
    ctx.strokeStyle = "blue";
    ctx.stroke();
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
    mainBall.acc_y = -mainBall.acceleration;
  }
  if (!UP) {
    mainBall.acc_y = 0;
  }
  //Velocity påvärkas av accerleration
  mainBall.vel_y += mainBall.acc_y;
  mainBall.vel_y *= 1 - friction;
  mainBall.y += mainBall.vel_y;
}

//Animerar canvas varje frame
function mainLoop() {
  requestAnimationFrame(mainLoop);
  //clear canvas
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  move();
  ballList.forEach((b) => {
    b.drawBall();
    b.displayLine();
  });
}

//Definerar bollarna
let mainBall = new Ball(160, 380, 20, "white");
let Ball1 = new Ball(160, 180, 20, "red");

requestAnimationFrame(mainLoop);
