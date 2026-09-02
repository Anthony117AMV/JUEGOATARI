const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const keys = {
  left: false,
  right: false,
  thrust: false
};

let score = 0;
let lives = 3;

const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: -Math.PI / 2,

  vx: 0,
  vy: 0,

  radius: 16
};

let bullets = [];
let asteroids = [];

function createAsteroid() {

  let size = 25 + Math.random() * 30;

  let x;
  let y;

  do {
    x = Math.random() * canvas.width;
    y = Math.random() * canvas.height;
  }
  while (
    Math.hypot(
      x - ship.x,
      y - ship.y
    ) < 180
  );

  asteroids.push({
    x,
    y,

    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,

    radius: size
  });
}

for (let i = 0; i < 6; i++) {
  createAsteroid();
}

function wrap(obj) {

  if (obj.x < 0)
    obj.x = canvas.width;

  if (obj.x > canvas.width)
    obj.x = 0;

  if (obj.y < 0)
    obj.y = canvas.height;

  if (obj.y > canvas.height)
    obj.y = 0;
}

function shoot() {

  bullets.push({

    x:
      ship.x +
      Math.cos(ship.angle) *
      ship.radius,

    y:
      ship.y +
      Math.sin(ship.angle) *
      ship.radius,

    vx:
      Math.cos(ship.angle) * 8 +
      ship.vx,

    vy:
      Math.sin(ship.angle) * 8 +
      ship.vy,

    life: 70
  });
}

function resetShip() {

  ship.x = canvas.width / 2;
  ship.y = canvas.height / 2;

  ship.vx = 0;
  ship.vy = 0;

  ship.angle = -Math.PI / 2;
}

function loseLife() {

  lives--;

  livesElement.textContent = lives;

  resetShip();

  if (lives <= 0) {

    lives = 3;
    score = 0;

    scoreElement.textContent = score;
    livesElement.textContent = lives;

    asteroids = [];

    for (let i = 0; i < 6; i++) {
      createAsteroid();
    }
  }
}

function update() {

  if (keys.left)
    ship.angle -= 0.07;

  if (keys.right)
    ship.angle += 0.07;

  if (keys.thrust) {

    ship.vx +=
      Math.cos(ship.angle) * 0.12;

    ship.vy +=
      Math.sin(ship.angle) * 0.12;
  }

  ship.vx *= 0.995;
  ship.vy *= 0.995;

  ship.x += ship.vx;
  ship.y += ship.vy;

  wrap(ship);

  bullets.forEach(bullet => {

    bullet.x += bullet.vx;
    bullet.y += bullet.vy;

    bullet.life--;

    wrap(bullet);
  });

  bullets =
    bullets.filter(bullet =>
      bullet.life > 0
    );

  asteroids.forEach(asteroid => {

    asteroid.x += asteroid.vx;
    asteroid.y += asteroid.vy;

    wrap(asteroid);
  });

  for (
    let b = bullets.length - 1;
    b >= 0;
    b--
  ) {

    for (
      let a = asteroids.length - 1;
      a >= 0;
      a--
    ) {

      let distance =
        Math.hypot(
          bullets[b].x - asteroids[a].x,
          bullets[b].y - asteroids[a].y
        );

      if (
        distance <
        asteroids[a].radius
      ) {

        bullets.splice(b, 1);
        asteroids.splice(a, 1);

        score += 100;

        scoreElement.textContent =
          score;

        createAsteroid();

        break;
      }
    }
  }

  asteroids.forEach(asteroid => {

    let distance =
      Math.hypot(
        ship.x - asteroid.x,
        ship.y - asteroid.y
      );

    if (
      distance <
      ship.radius +
      asteroid.radius
    ) {

      loseLife();
    }
  });
}

function drawShip() {

  ctx.save();

  ctx.translate(
    ship.x,
    ship.y
  );

  ctx.rotate(
    ship.angle
  );

  ctx.beginPath();

  ctx.moveTo(
    ship.radius,
    0
  );

  ctx.lineTo(
    -ship.radius,
    -ship.radius * 0.7
  );

  ctx.lineTo(
    -ship.radius * 0.5,
    0
  );

  ctx.lineTo(
    -ship.radius,
    ship.radius * 0.7
  );

  ctx.closePath();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.stroke();

  if (keys.thrust) {

    ctx.beginPath();

    ctx.moveTo(
      -ship.radius,
      -6
    );

    ctx.lineTo(
      -ship.radius - 15,
      0
    );

    ctx.lineTo(
      -ship.radius,
      6
    );

    ctx.stroke();
  }

  ctx.restore();
}

function draw() {

  ctx.fillStyle = "black";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawShip();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  asteroids.forEach(asteroid => {

    ctx.beginPath();

    ctx.arc(
      asteroid.x,
      asteroid.y,
      asteroid.radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  });

  ctx.fillStyle = "white";

  bullets.forEach(bullet => {

    ctx.beginPath();

    ctx.arc(
      bullet.x,
      bullet.y,
      3,
      0,
      Math.PI * 2
    );

    ctx.fill();
  });
}

function loop() {

  update();
  draw();

  requestAnimationFrame(loop);
}

loop();


/* TECLADO */

window.addEventListener(
  "keydown",
  event => {

    if (event.key === "ArrowLeft")
      keys.left = true;

    if (event.key === "ArrowRight")
      keys.right = true;

    if (event.key === "ArrowUp")
      keys.thrust = true;

    if (event.code === "Space")
      shoot();
  }
);

window.addEventListener(
  "keyup",
  event => {

    if (event.key === "ArrowLeft")
      keys.left = false;

    if (event.key === "ArrowRight")
      keys.right = false;

    if (event.key === "ArrowUp")
      keys.thrust = false;
  }
);


/* TOUCH */

function touchButton(
  id,
  keyName
) {

  const button =
    document.getElementById(id);

  button.addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      button.setPointerCapture(
        event.pointerId
      );

      keys[keyName] = true;
    }
  );

  function release(event) {

    event.preventDefault();

    keys[keyName] = false;
  }

  button.addEventListener(
    "pointerup",
    release
  );

  button.addEventListener(
    "pointercancel",
    release
  );
}

touchButton(
  "left",
  "left"
);

touchButton(
  "right",
  "right"
);

touchButton(
  "thrust",
  "thrust"
);

document
  .getElementById("shoot")
  .addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      shoot();
    }
  );