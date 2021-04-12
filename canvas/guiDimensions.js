// class to keep track of graph positions and sizes
export class GuiDimensions {
  constructor(w, h) {
    this.resize(w, h);
  }
  
  resize(w, h) {
    // graph positions
    this.graphY = 0.11 * h;
    this.graphSX = 0.025 * w;
    this.graphBX = 0.265 * w;
    this.graphAX = 0.505 * w;
    this.graphEX = 0.745 * w;
    
    // graph sizes
    this.graphW = 0.23 * w;
    this.graphH = 0.35 * h;
    
    // graph title positions
    this.graphTtlY = 0.1 * h;
    this.graphSTtlX = 0.14 * w;
    
    // final graph size and position
    this.graphFX = 0.575 * w;
    this.graphFY = 0.48 * h;
    this.graphFW = 0.4 * w;
    this.graphFH = 0.35 * h;
    
    
  }
}