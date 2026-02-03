class Button{
    constructor(x, y, w, h, text, onClick){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.onClick = onClick;
        this.radius = 6;
        // Palette: accent blue (matches loss/NN)
        this.colorNormal = [50, 120, 220];
        this.colorHover = [80, 150, 255];
        this.colorPressed = [30, 90, 180];
    }
    is_hovering(){
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
    }
    is_pressed(){
        return this.is_hovering() && mouseIsPressed;
    }
    draw(){
        push();
        translate(this.x, this.y);
        if (this.is_pressed()) {
            fill(this.colorPressed[0], this.colorPressed[1], this.colorPressed[2]);
            translate(0, 1);
        } else if (this.is_hovering()) {
            fill(this.colorHover[0], this.colorHover[1], this.colorHover[2]);
        } else {
            fill(this.colorNormal[0], this.colorNormal[1], this.colorNormal[2]);
        }
        noStroke();
        rect(0, 0, this.w, this.h, this.radius);
        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        text(this.text, this.w/2, this.h/2);
        pop();
    }
    check_click(){
        if(this.is_hovering()){
            this.onClick();
        }
    }
}
