const express = require("express");
const path = require('path');
const socket = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socket(server); //SOCKET

app.set('port', process.env.PORT || 5000);
app.use(express.static(path.join(__dirname, 'public'))); //Archivos estáticos
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

server.listen(app.get('port'), () => {
  console.log(`Servidor en el puerto ${app.get('port')}`);
});