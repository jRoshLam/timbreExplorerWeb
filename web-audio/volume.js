export const MAX_VOLUME = 255;

export class Volume {
  constructor(context, destination) {
    // init gain object
    this.gain = context.createGain();
    this.destination = destination;
    this.gain.connect(destination);
    
    // system constants
    this.minGain = 0.01;
    this.maxGain = 1;
    
    //initialize volume to gain lookup table
    this.volGainTable = [];
    var gainFactor = this.maxGain / this.minGain;
    for (var i = 0; i <= MAX_VOLUME; i++) {
      this.volGainTable[i] = this.minGain * Math.pow(gainFactor, i / MAX_VOLUME)
    }
    
    //initial volume value
    this.volume = 128;
    this.updateVolume(this.volume);
  }
  
  // set gain using new volume and lookup table
  updateVolume(volume) {
    this.volume = volume;
    this.gain.gain.value = this.volGainTable[volume];
    
    //TODO: disconnect gainNode if volume is 0?
  }
}