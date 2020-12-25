export class Visual {
  constructor() {
    this.initBtns = {
      new: document.getElementById("btnNewGame"),
      join: document.getElementById("btnJoinGame"),
    }

    this.quitBtn = document.getElementById("btnQuit");
    this.newRoundBtn = document.getElementById("newRound");
    this.idInput = document.getElementById("idInput");
    this.joinConfirm = document.getElementById("joinConfirm");
    this.homepage = document.getElementById("homepage");
    this.setup();
  }

  setup() {
    document.getElementById("btnNewGame").style.backgroundImage =
      "url(ui/pics/figures/figure1.jpg)";
      
    document.getElementById("btnJoinGame").style.backgroundImage =
      "url(ui/pics/figures/figure2.jpg)";
    document.getElementById("menu").style.backgroundImage =
      "url(ui/pics/bg.jpg)";

    this.quit();
    this.newRound();
  }

  hide(element) {
    let toHide = document.getElementById(element);
    toHide.style.display = "none";
  }

  show(element) {
    let toShow = document.getElementById(element);
    toShow.style.display = "block";
  }

  quit() {
    this.quitBtn.addEventListener("click", () => {
      this.show("confirmMsg");
      document.getElementById("noquit").addEventListener("click", () => {
        this.hide("confirmMsg");
      });
    });
  }

  newRound() {
    this.homepage.onclick = function(){
      location.replace("./index.html");
    }
    this.newRoundBtn.onclick = function () {
      location.replace("./index.html");
    };
  }
}

//background music
const BGM = document.getElementById("BGM");
const mute = document.getElementById("btnMute");
const fireBtns = [
  document.getElementById("btnNewGame"),
  document.getElementById("btnJoinGame"),
];

fireBtns.forEach((btn) => {
  btn.addEventListener("click", init, false);
  function init() {
    if (BGM.paused) {
      playAudio();
    } else {
      BGM.pause();
      btn.classList.remove("playing");
    }

    btn.closest("#menu").classList.remove("active");
    overlay.classList.remove("active");
  }

  async function playAudio() {
    try {
      await BGM.play();
      btn.classList.add("playing");
    } catch (err) {
      btn.classList.remove("playing");
    }
  }

  mute.addEventListener("click", function () {
    BGM.pause();
  });
});
