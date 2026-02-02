const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

let history = [];
let redoStack = [];
const colors = ["red", "blue", "green", "purple", "orange"];

io.on("connection", (socket) => {
  const userColor = colors[Math.floor(Math.random() * colors.length)];
  socket.emit("init", { color: userColor });

  socket.emit("sync", history);

  socket.on("stroke", (stroke) => {
    history.push(stroke);
    redoStack = [];
    socket.broadcast.emit("stroke", stroke);
  });

  socket.on("undo", () => {
    if (!history.length) return;
    redoStack.push(history.pop());
    io.emit("sync", history);
  });

  socket.on("redo", () => {
    if (!redoStack.length) return;
    history.push(redoStack.pop());
    io.emit("sync", history);
  });

  socket.on("cursor", (pos) => {
    socket.broadcast.emit("cursor", {
      id: socket.id,
      color: userColor,
      pos
    });
  });

  socket.on("disconnect", () => {
    io.emit("cursor-remove", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
