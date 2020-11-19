// FM Operator configs 
export const fmConfig = {
  ADD : 0, // AKA SINGLE
  DOUBLE22 : 1,
  DOUBLE31 : 2,
  DOUBLE33 : 3,
  TRIPLE1 : 4,
  TRIPLE2 : 5,
  QUAD : 6
}

// export function spectrumSetup(specObj, oscArray) {
  
// }
export class Spectrum {
  constructor() {
    this.updateSpectrum(127);
  }
  
  // update spectrum dimensions
  updateSpectrum(newValue) {
    // if no change, exit
    if (newValue == this.spectrum) {
      return;
    }

    this.spectrum = newValue;
    // within the spectrum system, operator algorithm is always additive
    this.fmAlg = fmConfig.ADD;

    if (newValue >= 200) {
      // Add increasing inharmonicity as spectrum goes above 200
      let inharmonicity = 1 + (newValue - 200) * 0.0002;
      // only first operator as a saw wave
      this.amps = [1, 0, 0, 0];
      this.fRatios = [inharmonicity, inharmonicity, inharmonicity, inharmonicity];
      this.shapes = ['sawtooth', 'sawtooth', 'sawtooth', 'sawtooth']
    } else if (newValue >= 100) {
      // TODO: kFmConfigAM divides total amplitude by 4, must compensate
      let evenOddRatio = (newValue - 100) * 0.01;
      let oddEvenRatio = (1 - evenOddRatio);
      // change balance between sawtooth (all harmonics) and square wave (odd harmonics)
      // don't need other 2 operators
      this.amps = [evenOddRatio, oddEvenRatio, 0, 0];
      this.fRatios  = [1, 1, 1, 1];
      this.shapes = ['sawtooth', 'square', 'sine', 'sine'];
    } else if (newValue >= 50) {
      // convert range of 0-50 to 0-1
      let evenOddRatio = (newValue - 50) * 0.02;
      let oddEvenRatio = (1 - evenOddRatio);
      // Change balance between square wave (odd harmonics) and Triangle (quieter odd harmonics)
      // don't need other 2 operators
      this.amps = [oddEvenRatio, evenOddRatio, 0, 0];
      this.fRatios = [1, 1, 1, 1];
      this.shapes = ['triangle', 'square', 'sine', 'sine'];
    } else if (newValue >=  40) {
      let evenOddRatio = (newValue - 40) * 0.1;
      let oddEvenRatio = (1 - evenOddRatio);
      
      this.amps = [evenOddRatio, oddEvenRatio, 0, 0];
      this.fRatios = [1, 1, 1, 1];
      this.shapes = ['triangle', 'sine', 'sine', 'sine'];
    } else if (newValue >= 30) {
      this.amps = [1, 0.8, 0.6, 0.4];
      this.fRatios = [1, 1.5, 1.98, 2.44];
      this.shapes = ['sine', 'sine', 'sine', 'sine'];
    } else if (newValue >= 20) {
      this.amps = [1, 0.8, 0.8, 0];
      this.fRatios = [1, 4, 9.2, 1];
      this.shapes = ['sine', 'sine', 'sine', 'sine'];
    } else if (newValue >= 10) {
      this.amps = [1, 0.8, 0, 0];
      this.fRatios = [1, 3, 1, 1];
      this.shapes = ['sine', 'sine', 'sine', 'sine'];
    } else {
      this.amps = [1, 0, 0, 0];
      this.fRatios = [1, 1, 1, 1];
      this.shapes = ['sine', 'sine', 'sine', 'sine'];
    }
  }
}


  
export function audioNodeParamTest(node) {
  node.frequency.value = 1320;
}