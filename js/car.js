CAR_SPEED = 6;
ROT_CAR_SPEED = CAR_SPEED*3/4;

class Car {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 20;
    this.rotation = -90;
    this.moving = 0;
    this.rays = [];
    this.ai_action = 2;
    this.steerSmooth = 0;
  }
  move() {
    this.x += cos(this.rotation) * this.moving * CAR_SPEED;
    this.y += sin(this.rotation) * this.moving * CAR_SPEED;
  }
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    imageMode(CENTER);
    image(carImage, 0, 0, this.w, this.h);
    // rectMode(CENTER);
    // stroke(0,255,0);
    // strokeWeight(1);
    // noFill();
    // rect(0, 0, this.w, this.h);

    // Draw headlights as two simple semi-transparent yellow triangles at the front corners of the car
    let headlightOffsetX = this.w / 2; // front of car (from center)
    let headlightSpacingY = this.h / 2 - 4; // off-center to left/right
    let beamLength = 30;
    let beamWidth = 8;

    // Headlights
    fill(255, 255, 0, 80);
    noStroke();
    triangle(
      headlightOffsetX, -headlightSpacingY,
      headlightOffsetX + beamLength, -headlightSpacingY - beamWidth,
      headlightOffsetX + beamLength, -headlightSpacingY + beamWidth
    );
    triangle(
      headlightOffsetX, headlightSpacingY,
      headlightOffsetX + beamLength, headlightSpacingY - beamWidth,
      headlightOffsetX + beamLength, headlightSpacingY + beamWidth
    );
    pop();
  }
  increaseCarSpeed(diff) {
    CAR_SPEED += diff;
    ROT_CAR_SPEED = CAR_SPEED*3/4;
  }
  resetPosition() {
    this.x = 130;
    this.y = 400;
    this.rotation = -90;
  }
  flipCar() {
    this.rotation += 180;
  }
  startMoving() {
    this.moving = 1;
  }
  stopMoving() {
    this.moving = 0;
  }
  applySteering(action) {
    const steerTarget = action === 0 ? -1 : action === 1 ? 1 : 0;
    const smoothFactor = 0.2;  // higher = snappier (e.g. 0.1 = very smooth, 0.25 = responsive)
    this.steerSmooth += (steerTarget - this.steerSmooth) * smoothFactor;

    const turnRate = CAR_SPEED > 0 ? ROT_CAR_SPEED : 0;
    this.rotation += this.steerSmooth * turnRate;

    const labels = ["LEFT", "RIGHT", "STRAIGHT"];
    UI.action = labels[action] ?? "STRAIGHT";
  }
  handle_predicted_controls() {
    this.applySteering(this.ai_action);
  }

  handle_inputs() {
    if (GAME_STATE != "GAME") return;
    let action;
    if (keyIsDown(LEFT_ARROW) === true || keyIsDown(65) === true) {
      action = 0;
    } else if (keyIsDown(RIGHT_ARROW) === true || keyIsDown(68) === true) {
      action = 1;
    } else {
      action = 2;
    }
    this.applySteering(action);
    return false;
  }
  inputs() {
    return this.rays.map(ray => ray.normalizedDistance);
  }
  outputs() {
    // convert the action to one-hot encoding
    if (NN_MODE === "PREDICT") {
     switch (this.ai_action) {
      case 0:
        return [1, 0, 0]
      case 1:
        return [0, 1, 0]
      case 2:
        return [0, 0, 1]
     }
    } else {
      if (keyIsDown(LEFT_ARROW) === true || keyIsDown(65) === true) {
        return [1, 0, 0]
      } else if (keyIsDown(RIGHT_ARROW) === true || keyIsDown(68) === true) {
        return [0, 1, 0]
      } else {
        return [0, 0, 1]
      }
    }
  }
}
