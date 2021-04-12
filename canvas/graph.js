export class Graph {
  //should call resize after constructor
  constructor(context, color, xLbl, yLbl) {
    this.context = context;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.gX = 0;
    this.gY = 0;
    this.gW = 0;
    this.gH = 0;
    this.data = [];
    this.dataType = 0;
    // console.log(this.data);
    this.bufferLength = this.data.length;
    this.y0 = this.y + 0;
    this.startY = 0;
    this.endY = 0;
    this.color = color;
    this.dx = this.w / (this.bufferLength - 1);
    
    this.xLbl = xLbl;
    this.yLbl = yLbl;
  }
  
  setEndPoints(startY, endY) {
    this.startY = startY;
    this.endY = endY;
  }
  
  setData(data) {
    this.data = data;
    this.bufferLength = this.data.length;
    this.dx = this.gW / (this.bufferLength - 1);
  }
  
  setType(type) {
    this.dataType = type;
  }
  
  drawGraph() {
    // clear the graph by filling it
    this.context.fillStyle = 'rgb(200, 200, 200)';
    this.context.fillRect(this.gX, this.gY, this.gW, this.gH);
    // prepare line and fill style
    this.context.lineWidth = 2;
    this.context.strokeStyle = 'rgb(0, 0, 0)';
    this.context.fillStyle = this.color;
    this.context.beginPath();
    // initialize starting location
    if (this.dataType == 0) {
      // graph starting point
      var x = this.gX;
      this.context.moveTo(this.gX, this.y0 - this.startY * this.gH);
      // loop through data and draw
      for (var i = 0; i < this.bufferLength; i++) {
        var v = this.data[i];
        var y = v * this.gH;

        this.context.lineTo(x, this.y0 - y);

        x += this.dx;
      }
      // end graph 
      this.context.lineTo(this.gX + this.gW, this.y0 - this.endY * this.gH);
    } else if (this.dataType == 1) {
      for (var i = 0; i < this.bufferLength / 2; i++) {
        var x = this.data[2*i] * this.gW;
        var y = this.data[2*i+1] * this.gH;

        this.context.lineTo(this.gX + x, this.y0 - y);
      }
    }
    
    // fill graph
    this.context.fill();
    
    // draw axis labels
    // use smaller font size of x and y
    if (this.xLblFontSize < this.yLblFontSize)
      this.context.font = this.xLblFontSize + "px Verdana";
    else
      this.context.font = this.yLblFontSize + "px Verdana";
    this.context.fillStyle = "black";
    this.context.textAlign = "center";
    this.context.textBaseline = "top";
    // x-axis
    this.context.fillText(this.xLbl, this.xLblX, this.xLblY);
    
    // y-axis is vertical text - save, translate, rotate, draw, restore
    this.context.save();
    
    this.context.textBaseline = "bottom";
    this.context.translate(this.yLblX, this.yLblY);
    this.context.rotate(-Math.PI/2)
    this.context.fillText(this.yLbl, 0, 0);
    this.context.restore();
  }
  
  resize(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.gX = x + 0.06 * w;
    this.gY = y;
    this.gW = 0.94 * w;
    this.gH = 0.94 * h;
    this.y0 = this.y + this.gH;
    
    this.xLblFontSize = 0.05 * h;
    this.yLblFontSize = 0.05 * w;
    this.xLblX = this.gX + (this.gW / 2);
    this.xLblY = y + this.gH;
    this.yLblX = this.gX;
    this.yLblY = y + (this.gH / 2);
  }
}