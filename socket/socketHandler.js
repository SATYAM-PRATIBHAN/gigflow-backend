const setupSocketIO = (io) => {
  // Store user socket connections
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // User authentication and registration
    socket.on("register", (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Remove user from map
      for (let [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return userSockets;
};

module.exports = setupSocketIO;
