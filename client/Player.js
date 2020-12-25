import { myPlayer } from "./main.js";
import { socket } from "./main.js";

const platform1 = {
  x1: 200, // left side
  x2: 280, // right side
  y: 280, // height
};

var platforms=[platform1]


export class Player {
  constructor(x, y, remainedLife, socketId, roomID, healthbar) {
    this.x = x;
    this.y = y;
    this.remainedLife = remainedLife;
    this.socketId = socketId;
    this.roomID = roomID;
    this.healthbar = healthbar;
    this.keyEvent;
    //init key event for drawing players
    this.pressedKey = "ArrowRight";
    //movement
    this.onPlatform = false;
    this.jumping = true;
    this.x_velocity = 0;
    this.y_velocity = 0;

    this.direction = {
      left: false,
      right: false,
      up: false,
      fly: false,
    };
    this.attackMode = false;
    this.lastAttack = 0;

    document.addEventListener("keyup", this.keyListener.bind(this));
    document.addEventListener("keydown", this.keyListener.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  // draw image update by pressing key 
  handleKeyDown(event) {
    if (
      event.code === "ArrowRight" ||
      event.code === "ArrowLeft" ||
      event.code === "KeyF" ||
      event.code === "KeyD"
    ) {
      if (this.socketId === myPlayer.socketId) {
        this.pressedKey = event.code;
      }
    }
  }
  // movement control
  keyListener(event) {
    this.keyEvent = event;
    var key_state = event.type == "keydown" ? true : false;

    switch (event.keyCode) {
      case 37: // left key
        this.direction.left = key_state;
        break;
      case 38: // up key
        this.direction.up = key_state;
        break;
      case 39: // right key
        this.direction.right = key_state;
        break;
      case 83: //space
        this.direction.fly = key_state;
        break;
      case 68: //attack
        this.attackMode = key_state;
        break;
      case 70: //attack
        this.attackMode = key_state;
        break;
    }
  }

  movePlayer() {
    if (this.socketId === myPlayer.socketId) {
      if (this.direction.up && this.jumping == false) {
        this.y_velocity -= 25;
        this.jumping = true;
      }

      if (this.direction.left) {
        this.x_velocity -= 0.5;
      }

      if (this.direction.right) {
        this.x_velocity += 0.5;
      }

      if (this.direction.fly && this.jumping == false) {
        this.y_velocity -= 50;
        this.jumping = true;
      }

      this.y_velocity += 1.0; // gravity
      this.x += this.x_velocity;
      this.y += this.y_velocity;
      this.x_velocity *= 0.9; // friction
      this.y_velocity *= 0.9; // friction

      if (this.y < 0) {
        this.y = 0;
      }

      // if play.y is falling into the ground
      if (this.y > 352) {
        this.jumping = false;
        this.y = 352;
        this.y_velocity = 0;
      }

      // teleport
      if (this.x < 0) {
        this.x = 608;
      }

      if (this.x > 640) {
        this.x = 0;
      }
      platforms.forEach(platform => {
        
      
      // jump to the platform
      if (this.x > platform.x1 && this.x < platform.x2) {
        if (this.y <= platform.y - 32) {
          this.onPlatform = true;
        }
      } else {
        this.onPlatform = false;
      }

      if (this.onPlatform) {
        if (this.y > platform.y - 32) {
          this.jumping = false;
          this.y = platform.y - 32;
          this.y_velocity = 0;
        }
      }
    });

      socket.emit("location", {
        x: myPlayer.x,
        y: myPlayer.y,
        id: myPlayer.socketId,
        key: myPlayer.pressedKey,
        healthbar: myPlayer.healthbar,
      });
    }
  }

  attack() {
    if (
      this.socketId == myPlayer.socketId &&
      this.attackMode == true &&
      this.lastAttack < new Date() - 500
    ) {
      this.lastAttack = new Date();
      socket.emit("attack", this.socketId);
    }
  }

  getDistance(otherPlayer) {
    return Math.sqrt(
      Math.pow(self.x - otherPlayer.x, 2) + Math.pow(self.y - otherPlayer.y, 2)
    );
  }
}
