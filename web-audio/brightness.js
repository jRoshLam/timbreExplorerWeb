export const MAX_BRIGHTNESS = 255;

export class Brightness {
  constructor() {
    this.brightToFcTable = [];
    this.allPassZone = 0.05;
    this.brThresholdLP = MAX_BRIGHTNESS * (0.5 - this.allPassZone);
    this.brThresholdHP = MAX_BRIGHTNESS * (0.5 + this.allPassZone);
    
    this.minLPFc = 50;
    this.maxLPFc = 20000;
    this.minHPFc = 0;
    this.maxHPFc = 15000;
    
    this.allPass = false;
    
    this.initBrightnessTable();
    this.updateBrightness(127);
  }
  
  initBrightnessTable() {
    var br;
    for (br = 0; br <= MAX_BRIGHTNESS; br++) {
      if (br <= this.brThresholdLP) {
        this.brightToFcTable[br] = this.minLPFc + Math.pow(this.maxLPFc - this.minLPFc, br/this.brThresholdLP);
      } else if (br >= this.brThresholdHP) {
        this.brightToFcTable[br] = this.minHPFc + Math.pow(this.maxHPFc - this.minHPFc, (br-this.brThresholdHP)/(MAX_BRIGHTNESS - this.brThresholdLP));
      } else {
        this.brightToFcTable[br] = 0
      }
    }
  }
  
  updateBrightness(newValue) {
    if (newValue == this.brightness) {
      return;
    }
    
    this.brightness = newValue;
    
    // use lookup table to retrieve desired cutoff frequency
    var targetFc = this.brightToFcTable[this.brightness];
    
    // add transition zone for High-Pass where cutoff frequency starts at 0
    // this smoothes out the sound when making the transition
    if(this.brightness >= this.brThresholdHP && this.brightness < this.brThresholdHP + 10)
      this.filterFc = 0.1 * (this.brightness - this.brThresholdHP) * targetFc;
    // if not in transition zone, no need to make further changes
    else
      this.filterFc = targetFc;
    
    // check brightness to determine filter type
    if (this.brightness <= this.brThresholdLP) {
      this.filterType = 'lowpass';
      this.allPass = false;
    } else if (this.brightness >= this.brThresholdHP) {
      this.filterType = 'highpass';
      this.allPass = false;
    } else {
      this.allPass = true;
    }
  }
}