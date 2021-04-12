
export class BrightFilter {
  constructor(context, brightness, destination) {
    this.filter = context.createBiquadFilter();
    this.destination = destination;
    // important: do not change input from henceforth, as other objects expect this to stay the same
    this.input = context.createGain();
    this.filterOn = false;
    
    this.brightness = brightness;
    
    //frf variables
    this.frfL = 81;
    this.freq = new Float32Array(this.frfL);
    this.frfM = new Float32Array(this.frfL);
    this.frfP = new Float32Array(this.frfL);
    this.freq[0] = 0;
    for (var i = 1; i < this.frfL; i++) {
      this.freq[i] = i / (this.frfL - 1) * 20000;
    }
    
    this.f0 = 0;
    this.filter.connect(this.destination);
    this.input.connect(this.destination);
    this.updateBrightness();
  }
  
  setFrequency(frequency) {
    this.f0 = frequency;
  }
  
  updateBrightness() {
    // if we are in all pass mode, connect input node straight to destination (bypass filter)
    if (this.brightness.allPass) {
      if (this.filterOn) {
        // console.log("disconnecting filter. bap: ", this.brightness.allPass, " fOn: ", this.filterOn);
        this.input.connect(this.destination);
        this.input.disconnect(this.filter);
        this.filterOn = false;
      }
      return;
    }
    
    // if not in all-pass mode, connect input to filter (which is already connected to the destination)
    if (!this.filterOn) {
      // console.log("connecting filter. bap: ", this.brightness.allPass, " fOn: ", this.filterOn);
      this.filterOn = true;
      this.input.connect(this.filter);
      this.input.disconnect(this.destination);
    }
    // update filter type as necessary
    if (this.filter.type != this.brightness.filterType)
      this.filter.type = this.brightness.filterType;
    // update filter cutoff frequency as necessary
    if (this.filter.frequency.value != this.f0 + this.brightness.filterFc)
      this.filter.frequency.value = this.f0 + this.brightness.filterFc;
  }
  
  calculateFRF(graphObj) {
    // if the fitler is off, show an FRF with a uniform unity response
    if (!this.filterOn) {
      graphObj.setData([0.75, 0.75]);
      return;
    }
    this.filter.getFrequencyResponse(this.freq, this.frfM, this.frfP);
    // convert magnitude to decibels, then between the range of 0 and 1
    for (var i = 0; i < this.frfL; i++) {
      // convert to decibels
      if (this.frfM[i] > 0.001) {
        this.frfM[i] = 20 * Math.log10(this.frfM[i]);
      // set threshold for minimum decibel values (avoid log(0))
      } else {
        this.frfM[i] = -60;
      }
      //convert to range [-60, 20] to [0, 1] (0.0125 is dividing by 80)
      this.frfM[i] = (this.frfM[i] + 60) * 0.0125;
    }
    graphObj.setData(this.frfM);
  }
}