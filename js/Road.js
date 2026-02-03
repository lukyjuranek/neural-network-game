
const outerPath = [
  [146, 61],
  [265, 40],
  [399, 46],
  [514, 73],
  [607, 151],
  [640, 268],
  [600, 386],
  [511, 457],
  [436, 479],
  [407, 490],
  [400, 513],
  [419, 585],
  [355, 692],
  [246, 739],
  [132, 723],
  [44, 642],
  [26, 523],
  [55, 464],
  [37, 422],
  [25, 330],
  [37, 238],
  [61, 161],
  [146, 61]
];

const innerPath = [
  [209, 219],
  [275, 200],
  [381, 204],
  [446, 217],
  [473, 239],
  [480, 262],
  [470, 294],
  [439, 313],
  [374, 331],
  [283, 390],
  [240, 507],
  [261, 565],
  [255, 568],
  [224, 581],
  [198, 577],
  [186, 568],
  [184, 547],
  [215, 476],
  [193, 388],
  [185, 330],
  [193, 272],
  [209, 245],
  [209, 219],
];

class Road {
  constructor() {
    this.outerPath = outerPath;
    this.innerPath = innerPath;
    this.walls = [];
  }

  draw() {
    fill(55, 55, 60);
    noStroke();
    beginShape();
  }
  createWalls(path) {
    const step = 10; // distance between wall circles, smaller for smooth curves
    for (let i = 0; i < path.length - 1; i++) {
      const [x1, y1] = path[i];
      const [x2, y2] = path[i + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(dist / step);
      for (let s = 0; s <= steps; s++) {
        const wx = x1 + dx * s / steps;
        const wy = y1 + dy * s / steps;
        this.walls.push(new Wall(wx, wy));
      }
    }
  }
  initiate_walls() {
    this.walls = [];


    this.createWalls(innerPath);
    this.createWalls(outerPath);
  }


  drawIsland() {
    fill(35, 95, 40);
    noStroke();
    beginShape();
    for (let i = 0; i < innerPath.length; i++) {
      vertex(innerPath[i][0], innerPath[i][1]);
    }
    endShape(CLOSE);
    // Lighter green stroke so island reads clearly
    stroke(60, 130, 65);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < innerPath.length; i++) {
      vertex(innerPath[i][0], innerPath[i][1]);
    }
    endShape(CLOSE);
    noStroke();
  }
  drawTrackRoad() {
    fill(55, 55, 60);
    noStroke();
    beginShape();
    for (let i = 0; i < outerPath.length; i++) {
      vertex(outerPath[i][0], outerPath[i][1]);
    }
    beginContour();
    for (let i = innerPath.length - 1; i >= 0; i--) {
      vertex(innerPath[i][0], innerPath[i][1]);
    }
    endContour();
    endShape(CLOSE);
    // White outer edge and inner edge strokes for clarity
    stroke(200, 200, 205);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < outerPath.length; i++) {
      vertex(outerPath[i][0], outerPath[i][1]);
    }
    endShape(CLOSE);
    beginShape();
    for (let i = 0; i < innerPath.length; i++) {
      vertex(innerPath[i][0], innerPath[i][1]);
    }
    endShape(CLOSE);
    noStroke();
  }

  drawCourseCoordinates() {
    innerPath.forEach(([x, y], index) => {
      fill(0, 0, 255);
      noStroke();
      circle(x, y, 10);

      fill(0);
      textSize(12);
      text(`(${x}, ${y})`, x + 8, y - 8);
    });

    outerPath.forEach(([x, y], index) => {
      fill(0, 0, 255);
      noStroke();
      circle(x, y, 10);

      fill(0);
      textSize(12);
      text(`(${x}, ${y})`, x - 50, y + 20);
    });
  }

}