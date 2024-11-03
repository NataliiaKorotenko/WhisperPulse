const socket = io("http://localhost:3001");

// Функция для обновления времени последнего визита
function updateLastSeen(userId) {
  socket.emit("userInChat", userId);
}

// Функция для преобразования временной метки в формат "минуту назад" и т.д.
function formatTimeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  const intervals = [
    { label: "год", seconds: 31536000 },
    { label: "месяц", seconds: 2592000 },
    { label: "день", seconds: 86400 },
    { label: "час", seconds: 3600 },
    { label: "минута", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? " назад" : ""}`;
    }
  }
  return "только что";
}

// Обновляем статус при открытии чата
document.addEventListener("DOMContentLoaded", () => {
  const userId = "uniqueUserId"; // уникальный ID для каждого пользователя
  updateLastSeen(userId);
});

// Получаем обновления времени последнего визита других пользователей
socket.on("updateLastSeen", (data) => {
  console.log(
    `Пользователь ${data.userId} был в сети в ${formatTimeAgo(data.lastSeen)}`
  );
});
