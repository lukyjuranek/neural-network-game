WIDTH = 1200;
HEIGHT = 750;

let car;
let road;

let UI = {
  lossHistory: [],
  action: "",
  buttons: [],
};

GAME_STATE = "PAUSE"; // PAUSE, GAME
NN_MODE = "TRAIN"; // TRAIN or PREDICT

function preload() {
  carImage = loadImage('assets/car.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT)
  angleMode(DEGREES);
  textFont('Segoe UI');
  frameRate(40);
  noStroke();
  fill(0);
  textSize(12);
  NN.createModel();

  var rays = [-70, -40, -5, 0, 5, 40, 70].map((angle) => new Ray(angle));

  road = new Road();
  car = new Car(130, 400);
  car.rays = rays;

  UI.buttons.push(new Button(682, 72, 156, 28, "Toggle Mode (SPACE)", () => {
    if (NN_MODE === "TRAIN") {
      NN_MODE = "PREDICT";
    } else {
      NN_MODE = "TRAIN";
    }
  }));
  UI.buttons.push(new Button(682, 104, 156, 28, "Reset car (R)", () => {
    car.resetPosition();
  }));
  UI.buttons.push(new Button(682, 136, 156, 28, "Reset model", () => {
    NN.reset();
  }));
  UI.buttons.push(new Button(767, 172, 28, 28, "-", () => car.increaseCarSpeed(-1)));
  UI.buttons.push(new Button(807, 172, 28, 28, "+", () => car.increaseCarSpeed(1)));


  road.initWalls();
}

function keyPressed() {
  if (key === " ") {
    if (NN_MODE === "TRAIN") {
      car.resetPosition();
      car.stopMoving();
      NN_MODE = "PREDICT";
      GAME_STATE = "PAUSE";
    } else {
      car.resetPosition();
      car.stopMoving();
      NN_MODE = "TRAIN";
      GAME_STATE = "PAUSE";
    }
  }
  if (keyCode === UP_ARROW || key === 'w') {
    car.startMoving();
    GAME_STATE = "GAME";
  }
  if (key === "r") {
    car.resetPosition();
    car.stopMoving();
    GAME_STATE = "PAUSE";
    console.log(JSON.stringify(NN.model))
  }
  if (key === "f") {
    car.flipCar();
  }
}
let training = false;   // flag to know if fit() is running
let trainInterval = 3;  // train every 3 frames
let frameCount = 0;

const REPLAY_BUFFER_MAX = 2000;   // max stored (input, output) pairs
const BATCH_SIZE = 32;
const TRAIN_EVERY_N = 10;         // run a batch training every N frames
let replayBuffer = [];     

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function trainFromReplayBuffer() {
  if (training || replayBuffer.length < BATCH_SIZE) return;
  training = true;

  const indices = shuffleArray(replayBuffer.map((_, i) => i)).slice(0, BATCH_SIZE);
  const batchInputs = indices.map(i => replayBuffer[i].inputs);
  const batchOutputs = indices.map(i => replayBuffer[i].outputs);

  const xs = tf.tensor2d(batchInputs);
  const ys = tf.tensor2d(batchOutputs);

  await NN.model.fit(xs, ys, {
    batchSize: BATCH_SIZE,
    epochs: 1,
    verbose: 0
  }).then((response) => {
    NN.response = response;
    UI.lossHistory.push(NN.response.history.loss[0]);
  });

  xs.dispose();
  ys.dispose();
  training = false;
}

function mouseClicked() {
  UI.buttons.forEach(button => {
    button.check_click();
  });
}

function game_over(){
  car.resetPosition();
  car.stopMoving();
  GAME_STATE = "PAUSE";
}


function draw() {
  background(255);
  road.drawTrackRoad();
  
  car.rays.forEach((ray) => {
    if (NN_MODE === "PREDICT") {
      ray.draw();
    }
    ray.update_distance();
  });
  car.move();
  car.draw();

  road.drawIsland();

  road.walls.forEach((wall) => {
    wall.draw();
    wall.check_collision();
    if (wall.isColliding) {
      game_over();
    }
  });

  if (NN_MODE === "PREDICT" && GAME_STATE !== "PAUSE") {
    let prediction = NN.model.predict(tf.tensor2d([car.inputs()]));
    car.ai_action = prediction.argMax(1).dataSync()[0];
    car.handle_predicted_controls();
  } else if (NN_MODE === "TRAIN" && GAME_STATE !== "PAUSE") {
    car.handle_inputs();

    const sample = {
      inputs: car.inputs().slice(),
      outputs: car.outputs().slice()
    };
    const cls = sample.outputs.indexOf(Math.max(...sample.outputs));
    if (cls !== 2 || Math.random() < 0.2) {
      replayBuffer.push(sample);
      if (replayBuffer.length > REPLAY_BUFFER_MAX) {
        replayBuffer.shift();
      }
    }

    if (frameCount % TRAIN_EVERY_N === 0) {
      trainFromReplayBuffer();
    }
  }

  drawUI(670, 20);

  UI.buttons.forEach((button) => {
    button.draw();
  });
  const anyHovering = UI.buttons.some((b) => b.is_hovering());
  cursor(anyHovering ? HAND : ARROW);
}

