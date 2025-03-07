import { io } from "socket.io-client";

// Use HTTPS if your Azure App supports it
const socket = io("flaskwebsockets.azurewebsites.net", {
  transports: ["websocket"], // Force WebSocket transport
//   reconnection: true, // Auto-reconnect if disconnected
});

export default socket;
