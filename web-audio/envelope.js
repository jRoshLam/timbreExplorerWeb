export const MAX_ENVELOPE = 255;

export class Envelope {
  constructor() {
    this.envAtkTable = [];
    this.envDcyTable = [];
    this.envRlsTable = [];
    
    this.noteOn = false;
    this.minAtkTime = 5;
    this.maxAtkTime = 291;
    this.minDcyTime = 5;
    this.maxDcyTime = 291;
    this.minRlsTime = 10;
    this.maxRlsTime = 500;
    this.sustain = 0.9;
    // portion of range at both top and bottom of envelope range
    this.longRlsZone = 0.25; 
    // max distance from neutral that we have short release (threshold to start long release)
    this.shortRlsDistance = Math.floor(this.longRlsZone * MAX_ENVELOPE);
    // actual size/distance of "long release" ranges at top of the bottom of range 
    this.longRlsDistance = Math.floor((0.5 - this.longRlsZone) * MAX_ENVELOPE)
    // size of zone at the center of the range which is the "short release" zone
    this.shortRlsZoneD = this.shortRlsDistance * 2;
    
    this.initEnvelopeTable();
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
  
  initEnvelopeTable() {
    var env;
    for (env = 0; env <= MAX_ENVELOPE; env++) {
      var rlsDistance = Math.abs(env - MAX_ENVELOPE / 2) - this.shortRlsDistance
      var shortRlsEnv = env - this.longRlsDistance;
      
      // attack and decay
      // if we are in the short release zone in the center - attack and decay scale proportionally on a logarithmic scale
      // attack shortest and decay longest at lower envelope values and opposite at higher values
      // release is fixed value
      if (rlsDistance < 0) {
        this.envAtkTable[env] = (this.minAtkTime + Math.pow(this.maxAtkTime - this.minAtkTime, (shortRlsEnv)/(this.shortRlsZoneD))) * 0.001;
        this.envDcyTable[env] = (this.maxDcyTime - Math.pow(this.maxDcyTime - this.minDcyTime, (shortRlsEnv)/(this.shortRlsZoneD))) * 0.001;
        this.envRlsTable[env] = this.minRlsTime * 0.001;
      // if we are in one of the long release zones at the ends of the range
      // attack and decay are fixed at either min or max values depending on which end we are on
      // release scales logarithmically the farther away from neutral we are
      } else {
        // at the bottom end of the env range - min attack and max decay
        if (env < MAX_ENVELOPE / 2) {
          this.envAtkTable[env] = this.minAtkTime * 0.001;
          this.envDcyTable[env] = this.maxDcyTime * 0.001;
        // at the top end of the env range - max attack and min decay
        } else {
          this.envAtkTable[env] = this.maxAtkTime * 0.001;
          this.envDcyTable[env] = this.minDcyTime * 0.001;
        }
        this.envRlsTable[env] = (this.minRlsTime + Math.pow(this.maxRlsTime - this.minRlsTime, (rlsDistance)/(this.longRlsDistance))) * 0.001;
        
      }
        
    }
  }
  
  updateEnvelope(newValue) {
    if (newValue == this.envelope) {
      return;
    }
    
    this.envelope = newValue;
    
    this.atkTime = this.envAtkTable[this.envelope];
    this.dcyTime = this.envDcyTable[this.envelope];
    this.rlsTime = this.envRlsTable[this.envelope];
  }
  
  calculateADSRGraph(graphObj) {
    this.adsrGraph[2] = this.atkTime; // attack peak x-coord
    this.adsrGraph[4] = this.atkTime + this.dcyTime; // sustain start x-coord
    this.adsrGraph[5] = this.sustain;
    this.adsrGraph[6] = 1 - this.rlsTime; // release start x-coord
    this.adsrGraph[7] = this.sustain;
    
    graphObj.setData(this.adsrGraph);
  }
}