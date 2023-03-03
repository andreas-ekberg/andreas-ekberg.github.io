console.log("Connected");

//HÄmntar canvas från html koden och gör den till variabler
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Tid för mellan frames
let lastTime;
let startTime;
let dt;

//Bools för att se ifall knappen är nertryckt
let UP;
let friction = 0.03;
let elasticity = 0.9;

let radius = 12;

let hasBeenPressed = 0;

let cueDist = 0;

//Array med alla bollar
const ballList = [];

const wallList = [];

//Vector klass för att kunna räkna ut vektor operationer.
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  subtr(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  mult(n) {
    return new Vector(this.x * n, this.y * n);
  }

  normal() {
    return new Vector(-this.y, this.x).unit();
  }

  unit() {
    if (this.mag() === 0) {
      return new Vector(0, 0);
    } else {
      return new Vector(this.x / this.mag(), this.y / this.mag());
    }
  }

  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  drawVec(start_x, start_y, n, color) {
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

class Ball {
  constructor(x, y, r, m, color) {
    //Posistion i x och y
    this.pos = new Vector(x, y);
    //Radien
    this.r = r;
    this.color = color;

    this.m = m;
    if (this.m === 0) {
      this.inv_m = 0;
    } else this.inv_m = 1 / this.m;
    //Horizontel och vertikal velocity
    this.vel = new Vector(0, 0);
    //acceleration vertikalt och horizontelt
    this.acc = new Vector(0, 0);
    this.acceleration = 1;
    //Lägger in den i boll arrayen
    this.angularVel = 0;
    this.angularVelocity = new Vector(0, 0);
    ballList.push(this);
  }

  //Funktion för att rita en boll som tar in 4 variabler
  // x-kord, y-kord, radius, färg
  drawBall() {
    ctx.beginPath();
    //Ritar en cirkel
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    //Fyller den med färg
    ctx.fillStyle = this.color;
    //Kanten på bollen
    ctx.stroke();
    //fyller den
    ctx.fill();
  }

  // för att rita ut linjer för acceleration och velocity
  displayLine() {
    this.vel.drawVec(this.x, this.y, 10, "blue");
    this.acc.drawVec(this.x, this.y, 50, "red");
  }

  reposition(dt) {
    //this.acc = this.acc.mult(this.acceleration);
    //this.acceleration = this.inv_m * -friction;

    //this.acc = this.vel.unit().mult(this.acceleration);

    //this.vel = this.vel.add(this.acc.mult(0.15));

    this.vel = this.angularVelocity.mult(this.r);
    this.angularVelocity = this.angularVelocity.mult(1 - friction);
    //console.log(dt);
    this.pos = this.pos.add(this.vel.mult(dt));

    //this.pos.y = this.pos.y + this.angularVel * this.r * 0.015;
  }
}

class Wall {
  constructor(x1, y1, x2, y2) {
    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);
    wallList.push(this);
  }

  drawWall() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  wallUnit() {
    return this.end.subtr(this.start).unit();
  }
}

class Cue {
  constructor(x1, y1, x2, y2) {
    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);
    let spring_konst = 3;
  }

  drawCue() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  moveQue() {
    let push = new Vector(0, 1);
    if (UP && cueDist < 40) {
      cueDist++;
      this.start = this.start.add(push);
      this.end = this.end.add(push);
    } else if (!UP && hasBeenPressed > 0) {
      this.start = new Vector(160, 400);
      this.end = new Vector(160, 440);

      //let V_initial_ball = 0;
      //V_initial_ball = (2 * 1 * cueDist ** 2) / mainBall.m;
      //mainBall.vel.y = -V_initial_ball;

      mainBall.angularVelocity.y = -60;

      hasBeenPressed = 0;
      cueDist = 0;
    }
  }
  repositionCue() {
    this.start = new Vector(mainBall.pos.x, mainBall.pos.y + 20);
    this.end = new Vector(mainBall.pos.x, mainBall.pos.y + 100);
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
    hasBeenPressed++;
  }
});

//Funktion för rörelse
function move() {
  if (UP) {
    // mainBall.acc.y = -mainBall.acceleration;
    //console.log("heheh");
    //mainBall.acc.y = mainBall.inv_m * (50 - friction);
    //let initialVel = new Vector(0, -5);
    //mainBall.vel = mainBall.vel.add(initialVel);
  }
  if (!UP) {
    mainBall.acc.y = 0;
  }
}

let distanceVector = new Vector(0, 0);

function round(number, precision) {
  let factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

function closestPointBW(b1, w1) {
  let ballToWallStart = w1.start.subtr(b1.pos);
  if (Vector.dot(w1.wallUnit(), ballToWallStart) > 0) {
    return w1.start;
  }

  let wallEndToBall = b1.pos.subtr(w1.end);
  if (Vector.dot(w1.wallUnit(), wallEndToBall) > 0) {
    return w1.end;
  }

  let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
  let closestVect = w1.wallUnit().mult(closestDist);
  return w1.start.subtr(closestVect);
}

function coll_det_bb(b1, b2) {
  if (b1.r + b2.r >= b1.pos.subtr(b2.pos).mag()) {
    return true;
  } else return false;
}

function pen_res_bb(b1, b2) {
  let dist = b1.pos.subtr(b2.pos);
  let pen_depth = b1.r + b2.r - dist.mag();
  let pen_res = dist.unit().mult(pen_depth / 2);
  b1.pos = b1.pos.add(pen_res);
  b2.pos = b2.pos.add(pen_res.mult(-1));
}

function coll_ress_bb(b1, b2) {
  let normal = b1.pos.subtr(b2.pos).unit();
  let relVel = b1.angularVelocity.subtr(b2.angularVelocity);
  let sepVel = Vector.dot(relVel, normal);
  let newSepVel = -sepVel * elasticity;

  let vesp_diff = newSepVel - sepVel;
  let impulse = vesp_diff / (b1.inv_m + b2.inv_m);
  let impulseVec = normal.mult(impulse);

  b1.angularVelocity = b1.angularVelocity.add(impulseVec.mult(b1.inv_m));
  b2.angularVelocity = b2.angularVelocity.add(impulseVec.mult(-b2.inv_m));
}

function coll_det_bw(b1, w1) {
  let ballToClosest = closestPointBW(b1, w1).subtr(b1.pos);
  if (ballToClosest.mag() <= b1.r) {
    return true;
  }
}

function pen_res_bw(b1, w1) {
  let penVect = b1.pos.subtr(closestPointBW(b1, w1));
  b1.pos = b1.pos.add(penVect.unit().mult(b1.r - penVect.mag()));
}

function coll_res_bw(b1, w1) {
  let normal = b1.pos.subtr(closestPointBW(b1, w1)).unit();
  let sepVel = Vector.dot(b1.vel, normal);
  let newSepVel = -sepVel * elasticity;
  let vesp_diff = sepVel - newSepVel;
  b1.vel = b1.vel.add(normal.mult(-vesp_diff));
}

//Animerar canvas varje frame
function mainLoop(currentTime) {
  //clear canvas
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  //Tid saker
  if (!startTime) {
    startTime = currentTime;
  }
  if (!lastTime) {
    lastTime = currentTime;
  }
  dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  //Move saker
  cue.moveQue();
  ballList.forEach((b, index) => {
    b.drawBall();
    if (Math.floor(b.angularVelocity.y) < 0) {
      b.reposition(dt);
    }

    wallList.forEach((w) => {
      if (coll_det_bw(ballList[index], w)) {
        pen_res_bw(ballList[index], w);
        coll_res_bw(ballList[index], w);
      }
    });

    for (let i = index + 1; i < ballList.length; i++) {
      if (coll_det_bb(ballList[index], ballList[i])) {
        pen_res_bb(ballList[index], ballList[i]);
        coll_ress_bb(ballList[index], ballList[i]);
      }
    }
  });

  wallList.forEach((w) => {
    w.drawWall();
  });
  if (round(mainBall.vel.y, 2) === 0 && !UP && round(mainBall.vel.x, 2) === 0) {
    cue.repositionCue();
    cue.drawCue();
  } else if (round(mainBall.vel.y, 2) === 0 && round(mainBall.vel.x, 2) === 0) {
    cue.drawCue();
  }

  requestAnimationFrame(mainLoop);
}

//Definerar bollarna
let mainBall = new Ball(160, 380, radius, 5, "white");

let Ball1 = new Ball(160, 180, radius, 5, "red");

let Ball2 = new Ball(150, 168, radius, 5, "red");
let Ball3 = new Ball(170, 168, radius, 5, "red");

let Ball4 = new Ball(140, 156, radius, 5, "red");
let Ball5 = new Ball(160, 156, radius, 5, "red");
let Ball6 = new Ball(180, 156, radius, 5, "red");

let Ball7 = new Ball(115, 138, radius, 5, "red");
let Ball8 = new Ball(140, 144, radius, 5, "red");
let Ball9 = new Ball(165, 144, radius, 5, "red");
let Ball10 = new Ball(190, 144, radius, 5, "red");

let Ball11 = new Ball(105, 115, radius, 5, "red");
let Ball12 = new Ball(130, 115, radius, 5, "red");
let Ball13 = new Ball(155, 115, radius, 5, "red");
let Ball14 = new Ball(185, 115, radius, 5, "red");
let Ball15 = new Ball(205, 115, radius, 5, "red");

let edge1 = new Wall(0, 0, 320, 0);
let edge2 = new Wall(0, 0, 0, 480);
let edge3 = new Wall(0, 480, 320, 480);
let edge4 = new Wall(320, 0, 320, 480);

/*let edgeBall1 = new Ball(0, 0, 12, 0, "black");
let edgeBall2 = new Ball(0, 240, 12, 0, "black");
let edgeBall3 = new Ball(0, 480, 12, 0, "black");
let edgeBall4 = new Ball(320, 0, 12, 0, "black");
let edgeBall5 = new Ball(320, 240, 12, 0, "black");
let edgeBall6 = new Ball(320, 480, 12, 0, "black");*/

let cue = new Cue(160, 400, 160, 440);

requestAnimationFrame(mainLoop);
