export class ArticuFilter {
  constructor(context, articulation, destination) {
    this.context = context
    this.filter = context.createBiquadFilter();
    this.destination = destination;
    // important: do not change input from henceforth, as other objects expect this to stay the same
    this.input = context.createGain();
    
    this.articulation = articulation;
    
    this.filter.connect(this.destination);
    
    this.filterOn = false;
    this.input.connect(this.destination);
    this.updateArticulation();
  }
  
  updateArticulation() {
    
    // if we are in all pass mode, connect input node straight to destination (bypass filter)
    if (this.articulation.allPass) {
      if (this.filterOn) {
        // console.log("disconnecting filter. aap: ", this.articulation.allPass, " fOn: ", this.filterOn);
        this.input.connect(this.destination);
        this.input.disconnect(this.filter);
        this.filterOn = false;
      }
      return;
    }
    
    // if not in all-pass mode, connect input to filter (which is already connected to the destination)
    if (!this.filterOn) {
      // console.log("connecting filter. aap: ", this.articulation.allPass, " fOn: ", this.filterOn);
      this.filterOn = true;
      this.input.connect(this.filter);
      this.input.disconnect(this.destination);
    }
    // update filter type as necessary
    if (this.filter.type != this.articulation.filterType)
      this.filter.type = this.articulation.filterType;
  }
  
  schedule() {
    if (this.filterOn) {
      this.filter.frequency.setValueAtTime(this.articulation.startFc, this.context.currentTime);
      this.filter.frequency.exponentialRampToValueAtTime(this.articulation.endFc, this.context.currentTime + this.articulation.arTime);
    }
  }
}