export class Graph {
  //should call resize after constructor
  constructor(context, color) {
    this.context = context;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.data = [];
    this.dataType = 0;
    // console.log(this.data);
    this.bufferLength = this.data.length;
    this.y0 = this.y + 0;
    this.startY = 0;
    this.endY = 0;
    this.color = color;
    this.dx = this.w / (this.bufferLength - 1);
  }
  
  setEndPoints(startY, endY) {
    this.startY = startY;
    this.endY = endY;
  }
  
  setData(data) {
    this.data = data;
    this.bufferLength = this.data.length;
    this.dx = this.w / (this.bufferLength - 1);
  }
  
  setType(type) {
    this.dataType = type;
  }
  
  drawGraph() {
    // clear the graph by filling it
    this.context.fillStyle = 'rgb(200, 200, 200)';
    this.context.fillRect(this.x, this.y, this.w, this.h);
    // prepare line and fill style
    this.context.lineWidth = 2;
    this.context.strokeStyle = 'rgb(0, 0, 0)';
    this.context.fillStyle = this.color;
    this.context.beginPath();
    // initialize starting location
    if (this.dataType == 0) {
      // graph starting point
      var x = this.x;
      this.context.moveTo(this.x, this.y0 - this.startY * this.h);
      // loop through data and draw
      for (var i = 0; i < this.bufferLength; i++) {
        var v = this.data[i];
        var y = v * this.h;

        this.context.lineTo(x, this.y0 - y);

        x += this.dx;
      }
      // end graph 
      this.context.lineTo(this.x + this.w, this.y0 - this.endY * this.h);
    } else if (this.dataType == 1) {
      for (var i = 0; i < this.bufferLength / 2; i++) {
        var x = this.data[2*i] * this.w;
        var y = this.data[2*i+1] * this.h;

        this.context.lineTo(this.x + x, this.y0 - y);
      }
    }
    
    // fill graph
    this.context.fill();
  }
  
  resize(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.y0 = this.y + h;
  }
}