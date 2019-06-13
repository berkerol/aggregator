/* global performance FPSMeter */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const getTime = typeof performance === 'function' ? performance.now : Date.now;
const FRAME_DURATION = 1000 / 58;
let then = getTime();
let acc = 0;
const meter = new FPSMeter({
  left: canvas.width - 130 + 'px',
  top: 'auto',
  bottom: '12px',
  theme: 'colorful',
  heat: 1,
  graph: 1
});

const box = {
  size: 60,
  arc: 10,
  padding: 15,
  alphaIncrease: 0.008,
  color: 'rgb(100,149,237,',
  count: 4,
  orders: {
    12: 1.0,
    8: 0.9,
    13: 0.7,
    9: 0.6,
    4: 0.5,
    14: 0.22
  }
};

const deploy = {
  speed: 5,
  color: '#6495ED'
};

const particle = {
  highestAlpha: 0.8,
  highestRadius: 10,
  highestSpeed: 6,
  lowestAlpha: 0.4,
  lowestRadius: 5,
  lowestSpeed: 4,
  probability: 0.2
};

const boxes = [];
const deploys = [];
const particles = [];

const length = box.count * box.size + (box.count - 1) * box.padding;
const initialX = canvas.width / 2 - length / 2;
const initialY = canvas.height / 2 - length / 2;
for (let i = 0; i < box.count; i++) {
  for (let j = 0; j < box.count; j++) {
    boxes.push({
      x: initialX + (i * (box.size + box.padding)),
      y: initialY + (j * (box.size + box.padding)),
      alpha: 1.0
    });
  }
}
for (const i in box.orders) {
  boxes[i].alpha = box.orders[i];
}

draw();
document.addEventListener('mousedown', mouseDownHandler);
window.addEventListener('resize', resizeHandler);

function draw () {
  const now = getTime();
  let ms = now - then;
  let frames = 0;
  then = now;
  if (ms < 1000) {
    acc += ms;
    while (acc >= FRAME_DURATION) {
      frames++;
      acc -= FRAME_DURATION;
    }
  } else {
    ms = 0;
  }
  meter.tick();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of boxes) {
    ctx.fillStyle = box.color + b.alpha;
    ctx.beginPath();
    drawBox(b);
    ctx.fill();
  }
  if (deploys.length > 0) {
    ctx.fillStyle = deploy.color;
    ctx.beginPath();
    for (const d of deploys) {
      drawBox(d);
    }
    ctx.fill();
  }
  for (const p of particles) {
    drawCircle(p);
  }
  createParticles();
  processBoxes();
  processDeploys(frames);
  processParticles(frames);
  window.requestAnimationFrame(draw);
}

function drawBox (b) {
  ctx.moveTo(b.x + box.arc, b.y);
  ctx.lineTo(b.x + box.size - box.arc, b.y);
  ctx.quadraticCurveTo(b.x + box.size, b.y, b.x + box.size, b.y + box.arc);
  ctx.lineTo(b.x + box.size, b.y + box.size - box.arc);
  ctx.quadraticCurveTo(b.x + box.size, b.y + box.size, b.x + box.size - box.arc, b.y + box.size);
  ctx.lineTo(b.x + box.arc, b.y + box.size);
  ctx.quadraticCurveTo(b.x, b.y + box.size, b.x, b.y + box.size - box.arc);
  ctx.lineTo(b.x, b.y + box.arc);
  ctx.quadraticCurveTo(b.x, b.y, b.x + box.arc, b.y);
}

function drawCircle (c) {
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI);
  ctx.fill();
}

function createParticles () {
  if (Math.random() < particle.probability) {
    const c = generateRandomRgbColor();
    const x = 0;
    const y = Math.random() * canvas.height;
    const dX = canvas.width / 2 - x;
    const dY = canvas.height / 2 - y;
    const norm = Math.sqrt((dX ** 2) + (dY ** 2));
    const alpha = particle.lowestAlpha + Math.random() * (particle.highestAlpha - particle.lowestAlpha);
    const speed = particle.lowestSpeed + Math.random() * (particle.highestSpeed - particle.lowestSpeed);
    particles.push({
      x,
      y,
      radius: particle.lowestRadius + Math.random() * (particle.highestRadius - particle.lowestRadius),
      color: `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`,
      speedX: dX / norm * speed,
      speedY: dY / norm * speed
    });
  }
}

function createDeploy (b) {
  b.alpha = 0;
  const dX = canvas.width - b.x;
  const dY = 0 - b.y;
  const norm = Math.sqrt((dX ** 2) + (dY ** 2));
  deploys.push({
    x: b.x,
    y: b.y,
    speedX: dX / norm * deploy.speed,
    speedY: dY / norm * deploy.speed
  });
}

function processBoxes () {
  for (const i in box.orders) {
    const b = boxes[i];
    b.alpha += box.alphaIncrease;
    if (b.alpha > 1) {
      createDeploy(b);
    }
  }
}

function processDeploys (frames) {
  for (let i = deploys.length - 1; i >= 0; i--) {
    const d = deploys[i];
    d.x += d.speedX * frames;
    d.y += d.speedY * frames;
    if (d.x > canvas.width) {
      deploys.splice(i, 1);
    }
  }
}

function processParticles (frames) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.speedX * frames;
    p.y += p.speedY * frames;
    if (p.x > initialX) {
      particles.splice(i, 1);
    }
  }
}

function generateRandomRgbColor () {
  return [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)];
}

function mouseDownHandler (e) {
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;
  for (const i in box.orders) {
    const b = boxes[i];
    if (b.x < x && x < b.x + box.size && b.y < y && y < b.y + box.size) {
      createDeploy(b);
      break;
    }
  }
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
