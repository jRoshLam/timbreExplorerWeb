export class EnveloADSR {
  constructor(context, envelope, destination) {
    
    this.context = context
    this.envelope = envelope;
    this.destination = destination;
    
    this.input = context.createGain();
    this.gain = context.createGain();
    this.gain.gain.value = 0;
    
    
    // create a gain node whose gain value is the current ADSR state
    // 0: ADSR is in attack/decay phase (release must be queued)
    // 1: ADSR is in sustain phase (release can be started immediately)
    // this.adsrState = context.createGain();
    
    this.onsetTime = this.context.currentTime;
    this.sustainTime = this.context.currentTime;
    this.offTime = this.context.currentTime;
    
    this.input.connect(this.gain);
    this.gain.connect(this.destination);
    
    this.updateEnvelope();
  }
  
  updateEnvelope() {
    
  }
  
  
  
  scheduleOnset() {
    this.onsetTime = this.context.currentTime;
    this.sustainTime = this.onsetTime + this.envelope.atkTime + this.envelope.dcyTime;
    
    //TBD: use exponentialRampToValueAtTime or linearRampToValueAtTime ?
    //schedule attack
    this.gain.gain.setValueAtTime(0, this.onsetTime);
    // this.adsrState.gain.setValueAtTime(0, this.onsetTime);
    this.gain.gain.linearRampToValueAtTime(1, this.onsetTime + this.envelope.atkTime);
    //schedule decay
    // this.adsrState.gain.setValueAtTime(1, this.sustainTime);
    this.gain.gain.linearRampToValueAtTime(this.envelope.sustain, this.sustainTime);
  }
  
  scheduleRelease() {
    //check current state of ADSR
    //if still in the process of onset, schedule release to be after onset
    // console.log("currentTime: ", this.context.currentTime , "sustainTime: ", this.sustainTime);
    // if (this.adsrState.gain.value == 0) {
    if (this.context.currentTime < this.sustainTime) {
      // console.log("onset still active, queueing release");
      this.offTime = this.sustainTime + this.envelope.rlsTime;
    } else {
      //schedule release
      this.offTime = this.context.currentTime + this.envelope.rlsTime;
    }
    this.gain.gain.linearRampToValueAtTime(0, this.offTime);
  }
}