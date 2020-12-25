//building server
import express from "express";
import httpServer from "http";
import socketIo from "socket.io";
import path from "path";
const app = express();
const http = httpServer.createServer(app);
const io = socketIo(http);
const clientPath = path.join(path.resolve(), "client");
http.listen(3000, () => {
  console.log(`serving ${clientPath} on *:3000.`);
});
app.use(express.static(clientPath));

//game
var ID = [];
var players = {};


io.on("connection", (socket) => {
  let executed1 = false;
  let executed2 = false;

  socket.on("createID", () => {
    //if does not exist, create a new id
    let gameID;
    while (ID.includes(gameID) == false) {
      gameID = Math.floor(Math.random() * Math.floor(101))
      ID.push(gameID); 
    }
    console.log("The GameID is: " + gameID);
    console.log("All current IDs are: " + ID);
    socket.join(gameID);
    io.to(gameID).emit("theGameID", gameID);
    createPlayer(gameID);
    console.log("we joined a room yei");
  });
  socket.on("sendGameID", (data) => {
    let checkID = parseInt(data, 10);
    console.log(checkID);
    if (ID.includes(checkID)) {
      socket.join(checkID);
      io.to(checkID).emit("rightID", checkID);
      createPlayer(checkID);
    } else {
      socket.emit("falseID","opppps this id does not exist");
    }
  });
  socket.on("attack", (data) => {
    let distance = 0;
    if (!executed2) {
      for (let x in players) {
        distance = Math.hypot(
          parseInt(players[data].x) - parseInt(players[x].x),
          parseInt(players[data].y) - parseInt(players[x].y)
        );
        if (distance > 0) {
          console.log("distance is " + distance);
        }
        if (distance <= 30 && distance > 0) {
          if (players[x].hp > 0) {
            players[x].hp -= 2;
            io.to(players[x].roomID).emit(
              "healthReduction",
              players[x].playerId
            );
            console.log(players[x].hp);
          } else if (!executed1) {
            executed1 = true;
            executed2 = true;
            console.log("executed noHP");
            io.to(players[x].roomID).emit("noHP", players[x].playerId);
            return executed1, executed2; //executed3, string;
          }
        }
      }
    }
  });

  function createPlayer(gameID) {
    console.log(`user ${socket.id} connected`);
    // create a new player and add it to our players object

    players[socket.id] = {
      x: Math.floor(Math.random() * 600),
      y: 352,
      playerId: socket.id,
      hp: 100,
      roomID: gameID,
      healthbar: "health1",
    };

    socket.on("disconnect", () => {
      let out = players[socket.id].playerId;
      delete players[socket.id];
      io.to(gameID).emit("remove", out);
    });

    socket.on("location", (msg) => {
      for (let z in players) {
        if (msg.id == players[z].playerId) {
          players[z].x = msg.x;
          players[z].y = msg.y;
        }
      }
      io.to(gameID).emit("playerUpdate", msg);
    });
    // let the new player know about other players
    io.to(gameID).emit("currentPlayers", players);

    // let other players know about the new player
    io.to(gameID).emit("newPlayer", players[socket.id]);
  }

});
