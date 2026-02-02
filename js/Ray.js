
class Ray {
    constructor(angle) {
      this.angle = angle;
      this.distance = 1000;
      this.normalizedDistance = 1;
    }
    draw() {
      push();
      translate(car.x, car.y);
      strokeWeight(0.5);
      stroke(255,0,0);
      let dx = cos(car.rotation + this.angle) * this.distance;
      let dy = sin(car.rotation + this.angle) * this.distance;
      line(0, 0, dx, dy);
      pop();
    }
    normalizeDistance(distance) {
      return min(distance / 800, 1);
    }
    update_distance() {
      this.distance = 10000; // reset
      road.walls.forEach((wall) => {
        const d = this.lineCircleCollisionDistance(
          car.x,
          car.y,
          this.angle + car.rotation,
          wall.x,
          wall.y,
          wall.radius
        );
        if (d !== null && d >= 0) {
          this.distance = min(this.distance, d);
        }
        this.normalizedDistance = this.normalizeDistance(this.distance);
      });
    }
  
    lineCircleCollisionDistance(x0, y0, angle, cx, cy, r) {
      const dx = cos(angle);
      const dy = sin(angle);
  
      const fx = cx - x0;
      const fy = cy - y0;
  
      const t = fx * dx + fy * dy;
  
      const closestX = x0 + dx * t;
      const closestY = y0 + dy * t;
  
      const distToCenter = dist(closestX, closestY, cx, cy);
  
      if (distToCenter <= r) {
        const dt = Math.sqrt(r * r - distToCenter * distToCenter);
        return t - dt >= 0 ? t - dt : t + dt;
      }
  
      return null;
    }
  }
  