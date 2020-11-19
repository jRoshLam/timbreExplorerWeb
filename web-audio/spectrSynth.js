export class SpectrSynth {
  constructor(context, spectrum, destination) {
    // set input parameters
    this.context = context;
    this.spectrum = spectrum;
    this.destination = destination
    
    // spectrum analyzer
    this.fft = context.createAnalyser();
    this.fft.fftSize = 1024;
    this.fftL = this.fft.frequencyBinCount
    // console.log("fft size: ", this.fftL);
    this.fftData = new Uint8Array(this.fftL);
    this.fftDataDB = new Float32Array(this.fftL);
    
    // oscillators and their gains for the operators
    this.oscList = [];
    this.gainList = [];
    for (var i = 0; i < 4; i++) {
      this.oscList[i] = context.createOscillator();
      this.gainList[i] = context.createGain();
      this.oscList[i].connect(this.gainList[i])
      this.gainList[i].connect(this.fft);
    }

    // set default values
    this.frequency = 440;
    this.updateSpectrum();
  }
  
  startAudio() {
    for (var i = 0; i < 4; i++) {
      this.oscList[i].start();
    }
  }
  
  setFrequency(frequency) {
    this.frequency = frequency;
    for (var i = 0; i < this.oscList.length; i++) {
      this.oscList[i].frequency.value = this.spectrum.fRatios[i]*this.frequency;
    }
  }
  
  updateSpectrum() {
    for (var i = 0; i < this.oscList.length; i++) {
      this.gainList[i].gain.value = this.spectrum.amps[i];
      this.oscList[i].frequency.value = this.spectrum.fRatios[i]*this.frequency;
      this.oscList[i].type = this.spectrum.shapes[i];
    }
    
    // for frequency modulation: this.oscList[1].connect(this.oscList[0]);
  }
  
  synthOn() {
    this.fft.connect(this.destination);
  }
  
  synthOff() {
    this.fft.disconnect(this.destination);
  }
  
  calculateFFT(graphObj) {
    // maximum value is 128
    this.fft.getByteFrequencyData(this.fftData);
    // console.log(this.fftData); 
    for (var i = 0; i < this.fftL; i++) {
      this.fftDataDB[i] = this.fftData[i] / 256.0;
      if (this.fftDataDB[i] > 0.01) {
        this.fftDataDB[i] = 20 * Math.log10(this.fftDataDB[i]);
      } else {
        this.fftDataDB[i] = -40;
      }
      
      this.fftDataDB[i] = (this.fftDataDB[i] + 40) * 0.025;
    }
    
    graphObj.setData(this.fftDataDB);
  }
}