const express = require("express");
const socket = require("socket.io");
const http = require("http");

const app = express();
app.set('port', process.env.PORT || 5000);
const server = http.createServer(app);

app.use(express.static("public")); //Archivos estáticos
const io = socket(server); //Socket
let users = []; //Array de jugadores

io.on("connection", (socket) => {
  console.log("Socket conectado", socket.id);

  socket.on("join", (data) => {
    users.push(data);
    io.sockets.emit("join", data);
  });

  socket.on("joined", () => {
    socket.emit("joined", users);
  });

  socket.on("rollDice", (data) => {
    users[data.id].pos = data.pos;
    const turn = data.num != 6 ? (data.id + 1) % users.length : data.id;
    io.sockets.emit("rollDice", data, turn);
  });

  socket.on("restart", () => {
    users = [];
    io.sockets.emit("restart");
  });
});

server & app.listen(app.get('port'), () => {
  console.log(`Servidor en el puerto ${app.get('port')}`);
});