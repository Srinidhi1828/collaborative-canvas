const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const socket = io();

/* ========= STATE ========= */
let drawing = false;
let currentStroke = null;

let tool = "brush"; // brush | eraser
let myColor = "black";

let history = [];
let redoStack = [];

const cursors = {};

/* ========= CANVAS EVENTS ========= */
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  redoStack = [];

  const pos = getPos(e);

  currentStroke = {
    tool,
    color: tool === "eraser" ? "#ffffff" : myColor,
    width: tool === "eraser" ? 20 : 4,
    points: [pos],
  };
});

canvas.addEventListener("mousemove", (e) => {
  const pos = getPos(e);
  socket.emit("cursor", pos);

  if (!drawing) return;

  const last = currentStroke.points[currentStroke.points.length - 1];
  currentStroke.points.push(pos);

  drawSegment(last, pos, currentStroke); // 🔥 IMMEDIATE DRAW
});

canvas.addEventListener("mouseup", () => {
  if (!drawing) return;
  drawing = false;

  history.push(currentStroke);
  socket.emit("stroke", currentStroke);
});

/* ========= SOCKET ========= */
socket.on("init", (data) => {
  myColor = data.color;
});

socket.on("stroke", (stroke) => {
  history.push(stroke);
  redrawAll();
});

socket.on("sync", (strokes) => {
  history = strokes;
  redoStack = [];
  redrawAll();
});

socket.on("cursor", (data) => {
  cursors[data.id] = data;
  redrawAll();
});

socket.on("cursor-remove", (id) => {
  delete cursors[id];
  redrawAll();
});

/* ========= KEYBOARD ========= */
window.addEventListener("keydown", (e) => {
  if (e.key === "b") tool = "brush";
  if (e.key === "e") tool = "eraser";

  if (e.ctrlKey && e.key === "z") {
    undo();
    socket.emit("undo");
  }

  if (e.ctrlKey && e.key === "y") {
    redo();
    socket.emit("redo");
  }
});

/* ========= DRAWING ========= */
function drawSegment(a, b, stroke) {
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawStroke(stroke) {
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";

  ctx.beginPath();
  stroke.points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

function redrawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  history.forEach(drawStroke);
  drawCursors();
}

function drawCursors() {
  Object.values(cursors).forEach(({ pos, color }) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ========= UNDO / REDO ========= */
function undo() {
  if (!history.length) return;
  redoStack.push(history.pop());
  redrawAll();
}

function redo() {
  if (!redoStack.length) return;
  history.push(redoStack.pop());
  redrawAll();
}

/* ========= UTILS ========= */
function getPos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top,
  };
}
