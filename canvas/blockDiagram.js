//dev imports
import * as graph from './graph.js'
import * as guiDimensions from './guiDimensions.js'

export class BlockDiagram {
  constructor(context, gui) {
    this.context = context;
    this.gui = gui;
    
    this.colorS = 'red';
    this.colorB = 'yellow';
    this.colorA = '#00FF00';
    this.colorE = 'blue';
    this.colorF = 'black'
    
    this.specGraph = new graph.Graph(context, this.colorS);
    this.brigGraph = new graph.Graph(context, this.colorB);
    this.artiGraph = new graph.Graph(context, this.colorA);
    this.enveGraph = new graph.Graph(context, this.colorE);
    this.finaGraph = new graph.Graph(context, this.colorF);
    
    this.specGraph.resize(gui.graphSX, gui.graphY, gui.graphW, gui.graphH);
    this.brigGraph.resize(gui.graphBX, gui.graphY, gui.graphW, gui.graphH);
    this.artiGraph.resize(gui.graphAX, gui.graphY, gui.graphW, gui.graphH);
    this.enveGraph.resize(gui.graphEX, gui.graphY, gui.graphW, gui.graphH);
    this.finaGraph.resize(gui.graphFX, gui.graphFY, gui.graphFW, gui.graphFH);
    
    // change envelop graph to read data as consecutive pairs of coords
    this.enveGraph.setType(1);
  }
  
  draw() {
    this.specGraph.drawGraph();
    this.brigGraph.drawGraph();
    this.artiGraph.drawGraph();
    this.enveGraph.drawGraph();
    
    this.finaGraph.drawGraph();
    
  }
  
  resize(w, h) {
    this.gui.resize(w, h);
    this.specGraph.resize(this.gui.graphSX, this.gui.graphY, this.gui.graphW, this.gui.graphH);
    this.brigGraph.resize(this.gui.graphBX, this.gui.graphY, this.gui.graphW, this.gui.graphH);
    this.artiGraph.resize(this.gui.graphAX, this.gui.graphY, this.gui.graphW, this.gui.graphH);
    this.enveGraph.resize(this.gui.graphEX, this.gui.graphY, this.gui.graphW, this.gui.graphH);
    this.enveGraph.resize(this.gui.graphFX, this.gui.graphFY, this.gui.graphFW, this.gui.graphFH);
  }
  
}