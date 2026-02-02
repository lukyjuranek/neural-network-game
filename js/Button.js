class Button{
    constructor(x, y, w, h, text, onClick){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.onClick = onClick;
        this.radius = 6;
    }
    is_hovering(){
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
    }
    draw(){
        push();
        translate(this.x, this.y);
        fill(40, 100, 200); // Slightly darker blue
        if(this.is_hovering()){
            fill(200);
        }
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