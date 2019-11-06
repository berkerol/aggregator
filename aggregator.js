/* global canvas ctx animation addPause addResize loop paintCircle drawRoundRect paintRoundRect generateRandomNumber generateRandomRgbColor */
const box = {
  size: 60,
  arc: 10,
  padding: 15,
  alphaIncrease: 0.008,
  color: 'rgba(100,149,237,',
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
  shadowBlur: 20,
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

addPause();
addResize();
document.addEventListener('mousedown', mouseDownHandler);

loop(function (frames) {
  for (const b of boxes) {
    paintRoundRect(b.x, b.y, box.size, box.size, box.arc, box.arc, box.color + b.alpha + ')');
  }
  if (deploys.length > 0) {
    ctx.fillStyle = deploy.color;
    ctx.beginPath();
    for (const d of deploys) {
      drawRoundRect(d.x, d.y, box.size, box.size, box.arc, box.arc);
    }
    ctx.fill();
  }
  ctx.save();
  ctx.shadowBlur = particle.shadowBlur;
  for (const p of particles) {
    ctx.shadowColor = p.color;
    paintCircle(p.x, p.y, p.radius, p.color);
  }
  ctx.restore();
  createParticles();
  processBoxes();
  processDeploys(frames);
  processParticles(frames);
});

function createParticles () {
  if (Math.random() < particle.probability) {
    const c = generateRandomRgbColor();
    const x = 0;
    const y = Math.random() * canvas.height;
    const dX = canvas.width / 2 - x;
    const dY = canvas.height / 2 - y;
    const norm = Math.sqrt((dX ** 2) + (dY ** 2));
    const alpha = generateRandomNumber(particle.lowestAlpha, particle.highestAlpha);
    const speed = generateRandomNumber(particle.lowestSpeed, particle.highestSpeed);
    particles.push({
      x,
      y,
      radius: generateRandomNumber(particle.lowestRadius, particle.highestRadius),
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

function mouseDownHandler (e) {
  if (animation !== undefined) {
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
}
