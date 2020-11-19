export const MAX_ENVELOPE = 255;

export class Envelope {
  constructor() {
    this.envAtkTable = [];
    this.envDcyTable = [];
    
    this.noteOn = false;
    this.minAtkTime = 5;
    this.maxAtkTime = 291;
    this.minDcyTime = 5;
    this.maxDcyTime = 291;
    this.sustain = 0.9;
    this.rlsTime = 0.01
    
    this.initEnevelopeTable();
    this.updateEnvelope(127);
    
    // ADSR graph data is a collated list of coordinate pairs
    // 5 points: onset, attack peak, sustain start, release start, end
    this.graphL = 10;
    this.adsrGraph = new Float32Array(this.graphL);
    
    //graph always starts at 0,0
    this.adsrGraph[0] = 0; // 0,0
    this.adsrGraph[1] = 0; // 0,1
    this.adsrGraph[3] = 1; // 1,1 attack peak is always at 1
    this.adsrGraph[8] = 1; // 4,0 graph always ends at 1,0
    this.adsrGraph[9] = 0; // 4,1

  }
  
  initEnevelopeTable() {
    var env;
    for (env = 0; env <= MAX_ENVELOPE; env++) {
      this.envAtkTable[env] = (this.minAtkTime + Math.pow(this.maxAtkTime - this.minAtkTime, (env)/(MAX_ENVELOPE))) * 0.001;
      this.envDcyTable[env] = (this.maxDcyTime - Math.pow(this.maxDcyTime - this.minDcyTime, (env)/(MAX_ENVELOPE))) * 0.001;
    }
  }
  
  updateEnvelope(newValue) {
    if (newValue == this.envelope) {
      return;
    }
    
    this.envelope = newValue;
    
    this.atkTime = this.envAtkTable[this.envelope];
    this.dcyTime = this.envDcyTable[this.envelope];
  }
  
  calculateADSRGraph(graphObj) {
    this.adsrGraph[2] = this.atkTime; // attack peak
    this.adsrGraph[4] = this.atkTime + this.dcyTime; // sustain start
    this.adsrGraph[5] = this.sustain;
    this.adsrGraph[6] = 1 - this.rlsTime;
    this.adsrGraph[7] = this.sustain;
    
    graphObj.setData(this.adsrGraph);
  }
}