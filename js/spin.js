// the game itself
var game;

var turns = 3;

var gameOptions = {
  // slices (prizes) placed in the wheel
  slices: 8,

  // prize names, starting from 12 o'clock going clockwise
  slicePrizes: [
    "SORRY, YOU MISSED!",
    "CONGRATULATIONS!",
    "SORRY, YOU MISSED!",
    "SORRY, YOU MISSED!",
    "SORRY, YOU MISSED!",
    "CONGRATULATIONS!",
    "SORRY, YOU MISSED!",
    "CONGRATULATIONS!",
  ],

  // wheel rotation duration, in milliseconds
  rotationTime: 4000,
};

const randomize = () => {
  const win = [2, 6, 8];
  const fail = [1, 3, 4, 5, 7];
  let slice = fail[Phaser.Math.Between(0, fail.length - 1)];

  if (turns == 1) {
    slice = win[Phaser.Math.Between(0, win.length - 1)];
    $("#spin").prop("disabled", true);
  }

  turns -= 1;
  const sliceSize = 360 / gameOptions.slices;
  let endDeg = sliceSize * slice;
  const startDeg = endDeg - sliceSize + 2;
  endDeg = endDeg - 2;

  // console.log(startDeg, endDeg, slice, sliceSize);

  return { prize: slice - 1, degrees: Phaser.Math.Between(startDeg, endDeg) };
};

// once the window loads...
window.onload = function () {
  // game configuration object
  var gameConfig = {
    // render type
    type: Phaser.CANVAS,

    // game width, in pixels
    width: 550,

    // game height, in pixels
    height: 550,

    // game background color
    //    backgroundColor: 0x880044,
    transparent: true,

    // scenes used by the game
    scene: [playGame],

    // element to render
    parent: "dwheel",
  };

  // game constructor
  game = new Phaser.Game(gameConfig);

  // pure javascript to give focus to the page/frame and scale the game
  window.focus();
  resize();
  window.addEventListener("resize", resize, false);
};

// PlayGame scene
class playGame extends Phaser.Scene {
  // constructor
  constructor() {
    super("PlayGame");
  }

  // method to be executed when the scene preloads
  preload() {
    // loading assets
    this.load.image("wheel", "./assets/images/InnerFrame.png");
    this.load.image("pin", "./assets/images/pointer.png");
  }

  // method to be executed once the scene has been created
  create() {
    // adding the wheel in the middle of the canvas
    this.wheel = this.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "wheel"
    );
    // this.wheel.setScale(0.7);

    // adding the pin in the middle of the canvas
    this.pin = this.add.sprite(game.config.width / 2, 125, "pin");
    this.pin.setScale(0.6);

    // adding the text field
    // this.prizeText = this.add.text(
    //   game.config.width / 2,
    //   game.config.height - 20,
    //   "Spin the wheel",
    //   {
    //     font: "bold 32px Arial",
    //     align: "center",
    //     color: "white",
    //   }
    // );

    // center the text
    // this.prizeText.setOrigin(0.5);

    // the game has just started = we can spin the wheel
    this.canSpin = true;

    // waiting for your input, then calling "spinWheel" function
    // this.input.on("pointerdown", this.spinWheel, this);

    $("#spin").click(() => this.spinWheel());
  }

  // function to spin the wheel
  spinWheel() {
    // can we spin the wheel?
    if (this.canSpin) {
      // resetting text field
    //   this.prizeText.setText("");

      // the wheel will spin round from 2 to 4 times. This is just coreography
      var rounds = Phaser.Math.Between(5, 10);

      // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
      // var degrees = randomize(true);
      var { degrees, prize } = randomize(true);

      // before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
      // var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices));

      // now the wheel cannot spin because it's already spinning
      this.canSpin = false;

      // stop spinner timer
      clearInterval(repeater);

      // hide info and button
      $(".info").fadeOut(300);
      $("#spin").fadeOut(300);

      // animation tweeen for the spin: duration 3s, will rotate by (360 * rounds + degrees) degrees
      // the quadratic easing will simulate friction
      this.tweens.add({
        // adding the wheel to tween targets
        targets: [this.wheel],

        // angle destination
        angle: 360 * rounds + degrees * -1,

        // tween duration
        duration: gameOptions.rotationTime,

        // tween easing
        ease: "Cubic.easeOut",

        // callback scope
        callbackScope: this,

        // function to be executed once the tween has been completed
        onComplete: function (tween) {
          // displaying prize text
          //   this.prizeText.setText(gameOptions.slicePrizes[prize]);

          // disable blink animation
          $(".info h5, .info small").removeClass("blink");

          // unhide info
          $(".info").fadeIn(300);

          $("#info-header").text(gameOptions.slicePrizes[prize]);
          if(turns == 0) {
            $("#info-body").text(`You are the winner!`);
            $(".info h5, .info small").addClass("blink");

            setTimeout(() => {
              $("#first-step").fadeOut(300, function() {$(this).addClass('d-none')});
              setTimeout(() => {
                $("#second-step").fadeIn(300, function() {$(this).removeClass('d-none')});
              }, 300);
            }, 1000);
            
          } else {
            $("#info-body").text(`You have ${turns} more spin${turns > 1 ? "s" : ""}`);
            $("#spin").fadeIn(300);
          }
          

          // player can spin again
          this.canSpin = true;
        },
      });
    }
  }
}

// pure javascript to scale the game
function resize() {
  var canvas = document.querySelector("canvas");
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;
  var gameRatio = game.config.width / game.config.height;
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + "px";
    canvas.style.height = windowWidth / gameRatio + "px";
  } else {
    canvas.style.width = windowHeight * gameRatio + "px";
    canvas.style.height = windowHeight + "px";
  }
}
