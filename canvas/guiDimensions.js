// class to keep track of graph positions and sizes
export class GuiDimensions {
  constructor(w, h) {
    this.resize(w, h);
  }
  
  resize(w, h) {
    this.graphY = 0.1 * h;
    this.graphSX = 0.025 * w;
    this.graphBX = 0.265 * w;
    this.graphAX = 0.505 * w;
    this.graphEX = 0.745 * w;
    
    this.graphW = 0.23 * w;
    this.graphH = 0.35 * h;
    
    this.graphFX = 0.505 * w;
    this.graphFY = 0.5 * h;
    this.graphFW = 0.45 * w;
    this.graphFH = 0.4 * h;
  }
}