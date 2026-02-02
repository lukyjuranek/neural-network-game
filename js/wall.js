class Wall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 6;
    this.isColliding = false;
  }
  
  draw() {
    if (this.isColliding) {
      fill(255, 0, 0);
    } else {
      fill(0);
    }
    push();
    translate(this.x, this.y);
    circle(0, 0, this.radius * 2);
    // Inneer circlew so it looks like a tire
    fill(50);
    circle(0, 0, this.radius*2 - 8);
    pop();
  }
  
  circleRotatedRectCollision(cx, cy, radius, rx, ry, rw, rh, rot) {
    // Step 1: rotate circle center into rectangle's local space
    const cosR = Math.cos(-rot);
    const sinR = Math.sin(-rot);

    const localX = cosR * (cx - rx) - sinR * (cy - ry);
    const localY = sinR * (cx - rx) + cosR * (cy - ry);

    // Step 2: clamp to rectangle bounds (axis-aligned in local space)
    const halfW = rw / 2;
    const halfH = rh / 2;

    const closestX = Math.max(-halfW, Math.min(localX, halfW));
    const closestY = Math.max(-halfH, Math.min(localY, halfH));

    // Step 3: distance from circle center to closest point
    const dx = localX - closestX;
    const dy = localY - closestY;

    return dx*dx + dy*dy <= radius*radius;
  }
  
  check_collision() {
    if (
      this.circleRotatedRectCollision(
        this.x,
        this.y,
        this.radius,
        car.x,
        car.y,
        car.w,
        car.h,
        car.rotation
      )
    ) {
      this.isColliding = true;
    } else{
      this.isColliding = false;
    }
  }
}
