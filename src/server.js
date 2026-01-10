const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/socket.io.js", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../node_modules/socket.io/client-dist/socket.io.js")
  );
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
  socket.join(roomId);
  console.log(`User ${socket.id} joined room ${roomId}`);
});

socket.on("sendMessage", (data) => {
  const { roomId, text } = data;
  console.log("Message:", text, "Room:", roomId);

  socket.to(roomId).emit("receiveMessage", {
    text,
    sender: socket.id,
  });
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

