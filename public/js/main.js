// Making Connection
const socket = io.connect("http://localhost:3000");
socket.emit("joined");

let players = []; // Jugadores en el juego
let currentPlayer; // Objeto del jugador actual

let canvas = document.getElementById("canvas");
canvas.width = document.documentElement.clientHeight * 0.9;
canvas.height = document.documentElement.clientHeight * 0.9;
let ctx = canvas.getContext("2d");

const piezaRoja = "../img/pieza_roja.png";
const piezaAzul = "../img/pieza_azul.png";
const piezaAmarilla = "../img/pieza_amarilla.png";
const piezaNegra = "../img/pieza_negra.png";

const side = canvas.width / 10;
const offsetX = side / 2;
const offsetY = side / 2 + 20;

const images = [piezaRoja, piezaAzul, piezaAmarilla, piezaNegra];

const ladders = [
  [2, 38],
  [7, 14],
  [8, 31],
  [15, 26],
  [21, 42],
  [28, 84],
  [36, 44],
  [51, 67],
  [71, 91],
  [78, 98],
  [87, 94],
];

const snakes = [
  [99, 80],
  [95, 75],
  [92, 88],
  [89, 68],
  [74, 53],
  [64, 60],
  [62, 19],
  [49, 11],
  [46, 25],
  [16, 6],
];

class Player {
  constructor(id, name, pos, img) {
    this.id = id;
    this.name = name;
    this.pos = pos;
    this.img = img;
  }

  draw() {
    let xPos =
      Math.floor(this.pos / 10) % 2 == 0
        ? (this.pos % 10) * side - 15 + offsetX
        : canvas.width - ((this.pos % 10) * side + offsetX + 15);
    let yPos = canvas.height - (Math.floor(this.pos / 10) * side + offsetY);

    let image = new Image();
    image.src = this.img;
    ctx.drawImage(image, xPos, yPos, 30, 40);
  }

  updatePos(num) {
    if (this.pos + num <= 99) {
      this.pos += num;
      this.pos = this.isLadderOrSnake(this.pos + 1) - 1;
    }
  }

  isLadderOrSnake(pos) {
    let newPos = pos;

    for (let i = 0; i < ladders.length; i++) {
      if (ladders[i][0] == pos) {
        newPos = ladders[i][1];
        break;
      }
    }

    for (let i = 0; i < snakes.length; i++) {
      if (snakes[i][0] == pos) {
        newPos = snakes[i][1];
        break;
      }
    }

    return newPos;
  }
}

document.getElementById("start-btn").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  document.getElementById("name").disabled = true;
  document.getElementById("start-btn").hidden = true;
  document.getElementById("roll-button").hidden = false;
  currentPlayer = new Player(players.length, name, 0, images[players.length]);
  document.getElementById("current-player").innerHTML = `<p></p>`;
  socket.emit("join", currentPlayer);
});

document.getElementById("roll-button").addEventListener("click", () => {
  const num = rollDice();
  currentPlayer.updatePos(num);
  socket.emit("rollDice", {
    num: num,
    id: currentPlayer.id,
    pos: currentPlayer.pos,
  });
});

function rollDice() {
  const number = Math.ceil(Math.random() * 6);
  return number;
}

function drawPins() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  players.forEach((player) => {
    player.draw();
  });
}

// Eventos
socket.on("join", (data) => {
  players.push(new Player(players.length, data.name, data.pos, data.img));
  drawPins();
  document.getElementById(
    "players-table"
  ).innerHTML += `<tr><td>${data.name}</td><td><img src=${data.img} height=50 width=40></td></tr>`;
});

socket.on("joined", (data) => {
  data.forEach((player, index) => {
    players.push(new Player(index, player.name, player.pos, player.img));
    console.log(player);
    document.getElementById(
      "players-table"
    ).innerHTML += `<tr><td>${player.name}</td><td><img src=${player.img}></td></tr>`;
  });
  drawPins();
});

socket.on("rollDice", (data, turn) => {
  players[data.id].updatePos(data.num);
  drawPins();
  document.getElementById("turno_jugador").innerHTML = `<p>Avanzas: ${data.num}</p>`;


  if (turn != currentPlayer.id) {
    document.getElementById("roll-button").hidden = true;
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>Es turno de ${players[turn].name}</p>`;
  } else {
    document.getElementById("roll-button").hidden = false;
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>Tú turno</p>`;
  }

  let winner;
  for (let i = 0; i < players.length; i++) {
    if (players[i].pos == 99) {
      winner = players[i];
      break;
    }
  }

  if (winner) {
    document.getElementById(
      "current-player"
    ).innerHTML = `<p>${winner.name} ha ganado</p>`;
    document.getElementById("roll-button").hidden = true;
    document.getElementById("restart-btn").hidden = false;
  }
});

// Reiniciar juego
document.getElementById("restart-btn").addEventListener("click", () => {
  socket.emit("restart");
});

socket.on("restart", () => {
  window.location.reload();
});
