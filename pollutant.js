class Pollutant {

  constructor(x, y, alpha) {
    this.pos = createVector(x, y);
    this.alpha = alpha;
  }
  
  display(){
    noStroke();
    fill(this.alpha);
    ellipse(this.pos.x, this.pos.y, 30, 30);
    
  }
}