const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const Message = require("./models/Message");



const app = express();
app.use(cors());
app.use(express.json());

app.get("/socket.io.js", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../node_modules/socket.io/client-dist/socket.io.js")
  );
});



const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
connectDB(); 


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

 socket.on("joinRoom", async (roomId) => {
  socket.join(roomId);
  console.log(`User ${socket.id} joined room ${roomId}`);

  const messages = await Message.find({ roomId })
    .sort({ createdAt: 1 })
    .limit(50);

  socket.emit("chatHistory", messages);
});


socket.on("sendMessage", async (data) => {
  const { roomId, text, sender } = data;

  // 🔥 Save message in MongoDB
  const message = new Message({
    roomId,
    sender,
    text,
  });

  await message.save();

  // Send to others in room (not sender)
  socket.to(roomId).emit("receiveMessage", {
    text,
    sender,
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

