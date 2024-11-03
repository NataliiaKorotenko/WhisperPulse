require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Схема для хранения истории времени посещений
const userSchema = new mongoose.Schema({
  userId: String,
  lastSeenTimes: [Date], // Массив для хранения временных меток каждого посещения
});

const User = mongoose.model("User", userSchema);

// WebSocket соединение
io.on("connection", (socket) => {
  console.log("Пользователь подключился:", socket.id);

  // Событие при входе пользователя в чат
  socket.on("userInChat", async (userId) => {
    const user = await User.findOneAndUpdate(
      { userId },
      { $push: { lastSeenTimes: new Date() } }, // Добавляем новое время в массив lastSeenTimes
      { new: true, upsert: true }
    );
    io.emit("updateLastSeen", {
      userId,
      lastSeen: user.lastSeenTimes.slice(-1)[0],
    }); // Отправляем последнее время
  });

  // Событие при выходе пользователя из чата
  socket.on("disconnect", () => {
    console.log("Пользователь отключился:", socket.id);
  });
});

// API для получения истории просмотров пользователя
app.get("/api/user/:userId/last-seen", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (user) {
      res.json({ userId, lastSeenTimes: user.lastSeenTimes });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Запуск сервера
server.listen(3001, () => {
  console.log("Сервер запущен на порту 3001");
});


