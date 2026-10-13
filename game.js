const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#high-score");
const message = document.querySelector("#message");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");

const cells = 20;
const cellSize = canvas.width / cells;
const speed = 115;
let snake;
let direction;
let nextDirection;
let food;
let score;
let timer;
let running = false;
let paused = false;
let highScore = Number(localStorage.getItem("snake-high-score")) || 0;

highScoreElement.textContent = highScore;

function randomFood() {
  let candidate;
  do {
    candidate = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
  } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));
  return candidate;
}

function resetGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  food = randomFood();
  score = 0;
  scoreElement.textContent = score;
}

function draw() {
  context.fillStyle = "#152a29";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#31504c";
  context.lineWidth = 1;
  for (let line = 0; line <= cells; line += 1) {
    context.beginPath(); context.moveTo(line * cellSize, 0); context.lineTo(line * cellSize, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, line * cellSize); context.lineTo(canvas.width, line * cellSize); context.stroke();
  }
  context.fillStyle = "#f06963";
  context.beginPath();
  context.arc((food.x + .5) * cellSize, (food.y + .5) * cellSize, cellSize * .32, 0, Math.PI * 2);
  context.fill();
  snake.forEach((segment, index) => {
    context.fillStyle = index === 0 ? "#c7f18b" : "#83d96a";
    context.fillRect(segment.x * cellSize + 2, segment.y * cellSize + 2, cellSize - 4, cellSize - 4);
  });
}

function endGame() {
  running = false;
  clearInterval(timer);
  pauseButton.disabled = true;
  startButton.textContent = "再来一局";
  message.innerHTML = `<strong>游戏结束</strong><span>本局得分：${score}</span>`;
  message.hidden = false;
}

function tick() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);
  if (hitWall || hitSelf) return endGame();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreElement.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreElement.textContent = highScore;
      localStorage.setItem("snake-high-score", String(highScore));
    }
    food = randomFood();
  } else snake.pop();
  draw();
}

function startGame() {
  clearInterval(timer);
  resetGame();
  running = true;
  paused = false;
  message.hidden = true;
  startButton.textContent = "重新开始";
  pauseButton.disabled = false;
  pauseButton.textContent = "暂停";
  draw();
  timer = setInterval(tick, speed);
}

function setDirection(x, y) {
  if (!running || paused || (x === -direction.x && y === -direction.y)) return;
  nextDirection = { x, y };
}

document.addEventListener("keydown", (event) => {
  const controls = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
  if (controls[event.key]) { event.preventDefault(); setDirection(...controls[event.key]); }
  if (event.key === " ") pauseButton.click();
});
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", () => {
  if (!running) return;
  paused = !paused;
  pauseButton.textContent = paused ? "继续" : "暂停";
  if (paused) { clearInterval(timer); message.innerHTML = "<strong>已暂停</strong><span>按空格或点击继续</span>"; message.hidden = false; }
  else { message.hidden = true; timer = setInterval(tick, speed); }
});

resetGame();
draw();
