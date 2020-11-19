// import * as spectrum from './spectrum.js'
import * as spectrSynth from './spectrSynth.js'
// import * as brightness from './brightness.js'
import * as brightFilter from './brightFilter.js'
// import * as articulation from './articulation.js'
import * as articuFilter from './articuFilter.js'
import * as enveloADSR from './enveloADSR.js'

export class Note {
  constructor(context, spectrum, brightness, articulation, envelope, destination) {
    
    this.frequency = 440;
    this.pressed = false;
    this.destination = destination;
    
    this.enADSR = new enveloADSR.EnveloADSR(context, envelope, this.destination);
    this.arFilter = new articuFilter.ArticuFilter(context, articulation, this.enADSR.input);
    this.brFilter = new brightFilter.BrightFilter(context, brightness, this.arFilter.input);
    this.spSynth = new spectrSynth.SpectrSynth(context, spectrum, this.brFilter.input);
    
    this.spSynth.synthOn();
  }
  
  startAudio() {
    this.spSynth.startAudio();
  }
  
  updateSpectrum() {
    this.spSynth.updateSpectrum();
  }
  updateBrightness() {
    this.brFilter.updateBrightness();
  }
  updateArticulation() {
    this.arFilter.updateArticulation();
  }
  updateEnvelope() {
    this.enADSR.updateEnvelope();
  }
  
  setFrequency(frequency) {
    this.frequency = frequency;
    this.spSynth.setFrequency(frequency);
  }
  
  getOffTime() {
    return this.enADSR.offTime;
  }
  
  playNote(pressed) {
    // only take action if something has changed
    // if note first turns on
    if (!this.pressed && pressed) {
      console.log("onset");
      // this.spSynth.synthOn();
      this.arFilter.schedule();
      this.enADSR.scheduleOnset();
      this.pressed = true;
    // when the note turns off
    } else if (this.pressed && !pressed) {
      console.log("release");
      this.enADSR.scheduleRelease();
      // this.spSynth.synthOff();
      this.pressed = false;
    }
  }
  
}