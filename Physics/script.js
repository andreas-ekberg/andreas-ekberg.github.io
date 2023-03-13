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
let LEFT;
let RIGHT;

//Konstanter som har används
let friction = 0.03;
let elasticity = 0.9;
let radius = 12;
let hasBeenPressed = 0;
let cueDist = 0;

//Array med alla bollar och väggar
const ballList = [];
const wallList = [];

//Vektor klass för att kunna räkna ut vektor operationer.
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

//Matris klass för att kunna skapa matriser och sen multiplicera med en vektor
class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = [];

    for (let i = 0; i < this.rows; i++) {
      this.data[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = 0;
      }
    }
  }

  multiplyVector(vec) {
    let result = new Vector(0, 0);
    result.x = this.data[0][0] * vec.x + this.data[0][1] * vec.y;
    result.y = this.data[1][0] * vec.x + this.data[1][1] * vec.y;
    return result;
  }
}

//Boll klass
class Ball {
  //Tar in x och y kordninater, radie, massa, färg, halvfylld eller helfylld, och vilken siffra bollen har
  constructor(x, y, r, m, color, type, number) {
    this.pos = new Vector(x, y);
    this.r = r;
    this.color = color;
    this.m = m;
    this.type = type;
    this.number = number;
    if (this.m === 0) {
      this.inv_m = 0;
    } else this.inv_m = 1 / this.m;
    this.angularVelocity = new Vector(0, 0);

    //Lägg till bollen i listan med alla bollar
    ballList.push(this);
  }

  //Funktion för att kunna rita ut en boll
  drawBall() {
    //Kollar vilken typ av boll det är
    if (this.type === "fill") {
      //Ritar en cirkel
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);

      //Fyller den med färg
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.fillText(this.number, this.pos.x, this.pos.y + 3);
      ctx.textAlign = "center";
      ctx.stroke();
    }

    if (this.type === "half") {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);

      //Fyller den med färg
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.r - 4, 0, 2 * Math.PI);
      ctx.fillStyle = "White";
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(this.number, this.pos.x, this.pos.y + 3);
    }
  }

  // för att rita ut linjer för acceleration och velocity
  displayLine() {
    this.vel.drawVec(this.x, this.y, 10, "blue");
    this.acc.drawVec(this.x, this.y, 50, "red");
  }

  //Euler approximation av bollens rullning där dt är tiden mellan frames
  reposition(dt) {
    this.vel = this.angularVelocity.mult(this.r);
    this.angularVelocity = this.angularVelocity.mult(1 - friction);
    this.pos = this.pos.add(this.vel.mult(dt));
  }
}

//Vägg klassen
class Wall {
  //Tar in start x och y koordinater, och slut x och y koordninater
  constructor(x1, y1, x2, y2) {
    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);
    //Lägger till i wall listan
    wallList.push(this);
  }

  //Ritar ut väggen
  drawWall() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  //Ger väggens unit vector
  wallUnit() {
    return this.end.subtr(this.start).unit();
  }
}

//Kö klassen
class Cue {
  //Tar in start x och y, slut x och y
  constructor(x1, y1, x2, y2) {
    //Refrences till den vita bollens positioner
    this.ballRef = new Vector(mainBall.pos.x, mainBall.pos.y);

    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);

    //Längden från vita bollen till slutet av kön
    this.endLength = this.end.subtr(this.ballRef).mag();
    //Längden från vita bollen till starten av kön
    this.startLength = this.start.subtr(this.ballRef).mag();
    this.angle = 0;

    this.refUnit = this.end.subtr(this.start).unit();
  }

  drawCue() {
    //Rotation av kön vektorn
    let rotMat = rotMx(this.angle);
    let newDir = rotMat.multiplyVector(this.refUnit);
    this.start = mainBall.pos.add(newDir.mult(this.startLength));
    this.end = mainBall.pos.add(newDir.mult(this.endLength));

    //Ritar ut kön
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  moveQue() {
    if (!UP && hasBeenPressed > 0) {
      //Riktningen av kön
      let pushVector = this.start.subtr(this.end).unit();
      //Riktningen gånger kraften av slaget
      mainBall.angularVelocity = pushVector.mult(80);

      hasBeenPressed = 0;
    }
  }

  rotateCue() {
    if (LEFT) {
      this.angle += 0.05;
    }
    if (RIGHT) {
      this.angle -= 0.05;
    }
  }

  repositionCue() {
    this.start = new Vector(mainBall.pos.x, mainBall.pos.y + 20);
    this.end = new Vector(mainBall.pos.x, mainBall.pos.y + 100);
  }
}

//Event handler för att lyssna på när man trycker ner en knapp
canvas.addEventListener("keydown", function (e) {
  if (e.keyCode === 38) {
    UP = true;
  }
  if (e.keyCode === 37) {
    LEFT = true;
  }
  if (e.keyCode === 39) {
    RIGHT = true;
  }
});

//Event handler för att lyssna ifall man släpper en knapp
canvas.addEventListener("keyup", function (e) {
  if (e.keyCode === 38) {
    UP = false;
    hasBeenPressed++;
  }
  if (e.keyCode === 37) {
    LEFT = false;
  }
  if (e.keyCode === 39) {
    RIGHT = false;
  }
});

//för att kunna avrunda tal
function round(number, precision) {
  let factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

//Skapa en rotations matris
function rotMx(angle) {
  let mx = new Matrix(2, 2);
  mx.data[0][0] = Math.cos(angle);
  mx.data[0][1] = -Math.sin(angle);
  mx.data[1][0] = Math.sin(angle);
  mx.data[1][1] = Math.cos(angle);
  return mx;
}

//Räknar ut vart den närmaste punkten på en vägg är i förhållandet med en boll
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

//Kollar ifall två bollar ligger över varandra
function coll_det_bb(b1, b2) {
  if (b1.r + b2.r >= b1.pos.subtr(b2.pos).mag()) {
    return true;
  } else return false;
}

//Puttar tillbaka två bollar ifall de ligger över varandra
function pen_res_bb(b1, b2) {
  let dist = b1.pos.subtr(b2.pos);
  let pen_depth = b1.r + b2.r - dist.mag();
  let pen_res = dist.unit().mult(pen_depth / 2);
  b1.pos = b1.pos.add(pen_res);
  b2.pos = b2.pos.add(pen_res.mult(-1));
}

//Räknar ut nya riktningar för kollisionen samt hur snabbt de åker mellan två bollar
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

//Kollar ifall en boll åker in i en vägg
function coll_det_bw(b1, w1) {
  let ballToClosest = closestPointBW(b1, w1).subtr(b1.pos);
  if (ballToClosest.mag() <= b1.r) {
    return true;
  }
}

//Puttar tillbaka en boll från en vägg
function pen_res_bw(b1, w1) {
  let penVect = b1.pos.subtr(closestPointBW(b1, w1));
  b1.pos = b1.pos.add(penVect.unit().mult(b1.r - penVect.mag()));
}

//Räknar ut den nya riktningen på bollen som kolliderar med en vägg
function coll_res_bw(b1, w1) {
  let normal = b1.pos.subtr(closestPointBW(b1, w1)).unit();
  let sepVel = Vector.dot(b1.angularVelocity, normal);
  let newSepVel = -sepVel * elasticity;
  let vesp_diff = sepVel - newSepVel;
  b1.angularVelocity = b1.angularVelocity.add(normal.mult(-vesp_diff));
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

  cue.moveQue();
  //Ritar alla väggar
  wallList.forEach((w) => {
    w.drawWall();
  });

  //Går igenom varje boll
  ballList.forEach((b, index) => {
    b.drawBall();
    b.reposition(dt);

    //Går igenom varje vägg och ser ifall en boll kolliderar med väggen
    wallList.forEach((w) => {
      if (coll_det_bw(ballList[index], w)) {
        //Ifall kollision gör detta
        pen_res_bw(ballList[index], w);
        coll_res_bw(ballList[index], w);
      }
    });

    //Kollar en boll coh går igenom alla andra bollar för att se ifall den kolliderar med någon annan boll
    for (let i = index + 1; i < ballList.length; i++) {
      if (coll_det_bb(ballList[index], ballList[i])) {
        //Ifall de kolliderar gör detta
        pen_res_bb(ballList[index], ballList[i]);
        coll_ress_bb(ballList[index], ballList[i]);
      }
    }
  });

  //När kön ska vissas eller inte
  if (
    Math.round(mainBall.vel.y) === 0 &&
    !UP &&
    Math.round(mainBall.vel.y) === 0
  ) {
    cue.repositionCue();
    cue.rotateCue();
    cue.drawCue();
  } else if (
    Math.round(mainBall.vel.y) === 0 &&
    Math.round(mainBall.vel.y) === 0
  ) {
    cue.drawCue();
  }

  requestAnimationFrame(mainLoop);
}

//Definerar bollarna
let mainBall = new Ball(160, 380, radius, 5, "white", "fill", "");

let Ball1 = new Ball(160, 190, radius, 5, "red", "half", "11");

let Ball3 = new Ball(145, 170, radius, 5, "blue", "fill", "2");
let Ball12 = new Ball(170, 170, radius, 5, "yellow", "half", "9");

let Ball4 = new Ball(132, 149, radius, 5, "blue", "half", "10");
let Ball15 = new Ball(157, 149, radius, 5, "black", "fill", "8");
let Ball10 = new Ball(182, 148, radius, 5, "darkblue", "half", "12");

let Ball7 = new Ball(120, 127, radius, 5, "darkgreen", "fill", "6");
let Ball8 = new Ball(143, 127, radius, 5, "darkgreen", "half", "14");
let Ball9 = new Ball(168, 127, radius, 5, "darkblue", "fill", "4");
let Ball6 = new Ball(193, 127, radius, 5, "orange", "half", "13");

let Ball11 = new Ball(106, 107, radius, 5, "yellow", "fill", "1");
let Ball2 = new Ball(130, 108, radius, 5, "red", "fill", "3");
let Ball5 = new Ball(155, 108, radius, 5, "orange", "fill", "5");
let Ball13 = new Ball(181, 108, radius, 5, "darkred", "fill", "7");
let Ball14 = new Ball(202, 109, radius, 5, "darkred", "half", "15");

let edge1 = new Wall(0, 0, 320, 0);
let edge2 = new Wall(0, 0, 0, 480);
let edge3 = new Wall(0, 480, 320, 480);
let edge4 = new Wall(320, 0, 320, 480);

let cue = new Cue(160, 400, 160, 480);

requestAnimationFrame(mainLoop);
