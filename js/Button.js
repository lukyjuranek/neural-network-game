class Button{
    constructor(x, y, w, h, text, onClick){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.onClick = onClick;
        this.radius = 4;
    }
    is_hovering(){
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
    }
    draw(){
        push();
        translate(this.x, this.y);
        fill(60, 130, 255); // Nice blue
        if(this.is_hovering()){
            fill(200);
        }
        rect(0, 0, this.w, this.h, this.radius);
        fill(0);
        textSize(12);
        text(this.text, 5, 15);
        pop();
    }
    check_click(){
        if(this.is_hovering()){
            this.onClick();
        }
    }
}