export const MAX_ARTICULATION = 255;

export class Articulation {
  constructor() {
    this.articulationTable = [];
    
    // All pass setup
    this.allPass = false;
    // by default all-pass is middle 10% of articulation range
    this.allPassZone = 0.05;
    this.arThresholdLP = MAX_ARTICULATION * (0.5 - this.allPassZone);
    this.arThresholdHP = MAX_ARTICULATION * (0.5 + this.allPassZone);
    
    // portion of range at both the top and bottom where vibrato is active
    this.vibratoZone = 0.2;
    this.vibratoThreshLow = MAX_ARTICULATION * this.vibratoZone;
    this.vibratoThreshHigh = MAX_ARTICULATION * (1 - this.vibratoZone)
    
    // min and max articulation time in milliseconds
    this.minArTime = 5;
    this.maxArTime = 600;
    
    // min and max Fc in Hz, based off of human hearing range.
    this.minFc = 50;
    this.maxFc = 20000;
    
    // starting and ending Fc
    this.startFc = 1;
    this.endFc = 1;
    
    // graph parameters
    this.expFc = 1;
    this.graphL = 41
    this.graphTime = 1;
    this.timeVector = new Float32Array(this.graphL);
    this.artiGraph = new Float32Array(this.graphL);
    for (var i = 0; i < this.graphL; i++) {
      this.timeVector[i] = this.graphTime * i / (this.graphL - 1);
    }
    
    this.initArticulationTable();
    this.updateArticulation(127);
  }
  
  initArticulationTable() {
    for (var ar = 0; ar <= MAX_ARTICULATION; ar++) {
      
      // if articulation is in low-pass zone (lower end of range)
      if (ar <= this.arThresholdLP) {
        // Articulation time is longer the farther it is from the middle of the range, calculated on Linear scale
        this.articulationTable[ar] = (this.minArTime + ((this.maxArTime - this.minArTime) * (this.arThresholdLP - ar)/(this.arThresholdLP))) * 0.001;
      // if articulation is in high-pass zone (higher end of range)
      } else if (ar >= this.arThresholdHP) {
        // Articulation time is longer the farther it is from the middle of the range, calculated on Linear scale
        this.articulationTable[ar] = (this.minArTime + ((this.maxArTime - this.minArTime) * (ar - this.arThresholdHP)/(MAX_ARTICULATION - this.arThresholdHP))) * 0.001;
      // otherwise, we are in all-pass zone (middle of range). These values can be anything, won't be used.
      } else {
        this.articulationTable[ar] = 0;
      }
    }
  }
  
  updateArticulation(newValue) {
    if (this.articulation == newValue) {
      return;
    }
    
    // update articulation value
    this.articulation = newValue;
    
    // update articulation time
    this.arTime = this.articulationTable[this.articulation];
    
    //check articulation if low-pass
    if (this.articulation <= this.arThresholdLP)
    {
      this.filterType = 'lowpass';
      this.startFc = this.minFc;
      this.endFc = this.maxFc;
      this.allPass = false;
      this.expFc = this.endFc/this.startFc;
    }
    //check articulation if high-pass
    else if (this.articulation >= this.arThresholdHP)
    {
      this.filterType = 'highpass';
      this.startFc = this.maxFc;
      this.endFc = this.minFc;
      this.allPass = false;
      this.expFc = this.endFc/this.startFc;
    // otherwise we must be in the all-pass zone
    } else {
      this.allPass = true;
    }
    // console.log("ArticulationObj - ar: ", this.allPass, " fType: ", this.filterType);
    // console.log("ArticulationObj - ap: ", this.allPass, " fType: ", this.filterType);
  }
  
  calculateArticulationGraph(graphObj) {
    for (var i = 0; i < this.graphL; i++) {
      // if it's allPass or if we've alreay hit the maximum Fc
      if (this.allPass) {
        this.artiGraph[i] = 1;
      // otherwise calculate Fc at timestamp
      } else {
        var fc = this.startFc * Math.pow(this.expFc, this.timeVector[i] / this.arTime)
        if (fc < this.maxFc) {
          this.artiGraph[i] = fc / this.maxFc;
        } else {
          this.artiGraph[i] = 1;
          // maxedFc = true;
        }
      }
    }
    graphObj.setData(this.artiGraph);
    if (this.filterType == 'highpass' && !this.allPass) {
      graphObj.setEndPoints(1, 1);
    } else {
      graphObj.setEndPoints(0, 0);
    }
  }
}