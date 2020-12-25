import { Playfield } from "./ui/Playfield.js";
import { Player } from "./Player.js";
import { Visual } from "./ui/ui.js";

export const gameID = [];
export var currentID;
export var myPlayer;
export const socket = io();


const vCtrl = new Visual();
const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
var myPlayfield = new Playfield(canvas, context, 20);



vCtrl.initBtns.join.addEventListener("click", function () {
  vCtrl.show("join");

  vCtrl.joinConfirm.onclick = function () {
    let id2check= vCtrl.idInput.value;

    if (id2check < 101 && id2check > 0) { 
      socket.emit("sendGameID", id2check);   
  }
  else{
    throw new Error("your ID is out of range");
  }
    vCtrl.hide("join");
  };
});
vCtrl.initBtns.new.addEventListener("click", () => {
  socket.on("theGameID", (data) => {
    gameID.push(parseInt(data));
    document.getElementById("id2share").innerHTML =
      "you are the host of Game: " + gameID + " share it with your bro!!";
  });
  socket.emit("createID", "weNeedAnID");
});

myPlayfield.drawAll();
myPlayfield.drawCloud();


socket.on("gotaHealthbar", (data) => {
  myPlayfield.players.forEach((player) => {
    if (data.playerId == player.socketId) {
      player.healthbar = data.healthbar.toString()
    }
  });
});

socket.on("rightID", (data) => {
  gameID.push(parseInt(data));
});
socket.on("falseID", () => {
  alert('this id does not exist')
});


//players basic info
socket.on("currentPlayers", (players) => {
   Object.keys(players).forEach((id) => {

     let rightRoom = players[id].roomID == gameID;
     let iAmMe = players[id].playerId === socket.id ;

     if(rightRoom){

      if (iAmMe) {
        myPlayer = playerFactory(players[socket.id],1)
        myPlayfield.players.push(myPlayer);
      } 
  
      else{
        myPlayfield.drawTimer();
        myPlayfield.players.pop();
        myPlayfield.players.push(playerFactory(players[id],2));
      }

     }

    
  });
});
socket.on("newPlayer", (p2) => {
  if (p2.playerId !== socket.id && gameID.includes(parseInt(p2.roomID))) {

    myPlayfield.players.push(playerFactory(p2,2));
    myPlayfield.drawTimer();

  }
});
//players updates
socket.on("playerUpdate", (msg) => {
  myPlayfield.players.forEach((p) => {
    if (p.socketId === msg.id) {
      p.x = msg.x;
      p.y = msg.y;
      p.pressedKey = msg.key;
    
    }
  });
});

socket.on("healthReduction", (hurted) => {
  let index=0;
  if (hurted !== myPlayfield.players[0].socketId) {
      index = 1;
  } 
  document.getElementById(myPlayfield.players[index].healthbar).value -= 2;
});


socket.on("noHP", (died) => {
  if (died == socket.id) {
    vCtrl.show("Lose");
  } else {
    vCtrl.show("Win");
  }
});

socket.on("remove", (out) => {
  myPlayfield.players = myPlayfield.players.filter((e) => e.socketId !== out);
  vCtrl.show("Left");
});


function playerFactory(p,hbIndex){
  let index="health2"
  if(hbIndex ===1){
    index="health1"
  }
  let newPlayer = new Player(
    p.x,
    p.y,
    100,
    p.playerId,
    p.roomID,
    (p.healthbar = index)
  );
  return newPlayer;
}



