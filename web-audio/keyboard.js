import * as note from './note.js'

export class Keyboard {
  constructor(context, spectrum, brightness, articulation, envelope, destination) {
    this.context = context;
    this.numNotes = 4;
    this.openPtr;

    this.noteArray = [];
    
    for (var i = 0; i < this.numNotes; i++) {
      this.noteArray[i] = new note.Note(context, spectrum, brightness, articulation, envelope, destination);
    }
    
    this.octaves = 10;
    this.currentOctave = 5;
    this.keyDictList = [];
    //initialize dictionaries mapping keyCodes to MIDI notes
    for (var i = 0; i < this.octaves; i++) {
      this.keyDictList[i] = {
        90  : 12*i + 0,  // z
        83  : 12*i + 1,  // s
        88  : 12*i + 2,  // x
        68  : 12*i + 3,  // d
        67  : 12*i + 4,  // c
        86  : 12*i + 5,  // v
        71  : 12*i + 6,  // g
        66  : 12*i + 7,  // b
        72  : 12*i + 8,  // h
        78  : 12*i + 9,  // n
        74  : 12*i + 10, // j
        77  : 12*i + 11, // m
        188 : 12*i + 12, // ,
        76  : 12*i + 13, // l
        190 : 12*i + 14, // .
        186 : 12*i + 15, // ;
        191 : 12*i + 16, // /
      };
    }
    // initialize map of MIDI notes to frequencies
    this.midiDict = [];
    for (var i = 0; i < 128; i++) {
      this.midiDict[i] = 440 * Math.pow(2, (i-69)/12);
    }
    
    // use 4 32 bit numbers to keep track of the status of the 128 MIDI notes
    this.numStatInts = 4;
    this.midiStatus = new Int32Array(this.numStatInts);
  }
  
  startAudio() {
    for (var i = 0; i < this.numNotes; i++) {
      this.noteArray[i].startAudio();
    }
  }
  
  updateSpectrum() {
    for (var i = 0; i < this.numNotes; i++) {
      this.noteArray[i].updateSpectrum();
    }
  }
  updateBrightness() {
    for (var i = 0; i < this.numNotes; i++) {
      this.noteArray[i].updateBrightness();
    }
  }
  updateArticulation() {
    for (var i = 0; i < this.numNotes; i++) {
      this.noteArray[i].updateArticulation();
    }
  }
  updateEnvelope() {
    for (var i = 0; i < this.numNotes; i++) {
      this.noteArray[i].updateEnvelope();
    }
  }
  
  keyPress(keyCode, keyDown) {
    // console.log("key code:", keyCode, "keyDown: ", keyDown);
    // console.log(Object.keys(this.keyDictList[0]));
    // if (keyCode == 39) {
    //   this.currentOctave++;
    //   if (this.currentOctave >= this.octaves) {
    //     this.currentOctave = this.octaves - 1;
    //   }
    // } else if (keyCode == 37) {
    //   this.currentOctave--;
    //   if (this.currentOctave < 0) {
    //     this.currentOctave = 0;
    //   }
    if (keyDown && (keyCode == 37 || keyCode == 39)) {
      this.changeOctave(keyCode);
    //check if key is a valid keyboard key
    } else if (Object.keys(this.keyDictList[0]).includes(String(keyCode))){
      // console.log("key is a valid keyboard key");
      // translate keyCode into MIDI number
      this.playNote(keyCode, keyDown);
    }
  }

  // cange octave using the left and right arrow keys
  changeOctave(keyCode) {
    var oldOctave = this.currentOctave;
    if (keyCode == 39) {
      this.currentOctave++;
      if (this.currentOctave >= this.octaves) {
        this.currentOctave = this.octaves - 1;
      }
    } else if (keyCode == 37) {
      this.currentOctave--;
      if (this.currentOctave < 0) {
        this.currentOctave = 0;
      }
    }
    
    // if the octave hasn't actually changed, exit
    if (this.currentOctave == oldOctave) {
      return;
    }
    
    // otherwise, move all active notes to new frequency
    // here only need to change the pressed notes (released notes are already on their way out)
    // need to keep track of associated key for the note object
    // use the old midi note to clear the status int and then use the new one to set the status int
    // loop through note list
    for (var i = 0; i < this.numNotes; i++) {
      if (this.noteArray[i].pressed) {
        var oldMidi = this.keyDictList[oldOctave][this.noteArray[i].key]
        var oldNote1Hot = 1 << (oldMidi % 32);
        var oldStatusInt = Math.floor(oldMidi / 32);
        var newMidi = this.keyDictList[this.currentOctave][this.noteArray[i].key];
        var newNote1Hot = 1 << (newMidi % 32);
        var newStatusInt = Math.floor(newMidi / 32);
        console.log("updating previously active midi note", oldMidi, "to", newMidi);
        //change frequency of noteObject
        this.noteArray[i].setFrequency(this.midiDict[newMidi])
        //clear status of previous note
        this.midiStatus[oldStatusInt] = this.midiStatus[oldStatusInt] ^ oldNote1Hot;
        //update status of new note
        this.midiStatus[newStatusInt] = this.midiStatus[newStatusInt] | newNote1Hot;
      }
    }
  }
  
  // when a key is pressed and held it continuously sends noteOn events
  // in order to play multiple of the same notes, we can only start a new one if
  // the key (associated with a midi note) has been released.
  // So we need to keep track of which keys (midi notes) are being held down
  // independent of which note objects are being played.
  // keep track of keys/midi notes using the statusInts
  // keep track of note object states using their pressed variable and their offTime
  playNote(keyCode, noteOn) {
    // search list of notes for next inactive note, if one is found, activate it
    var midiNum = this.keyDictList[this.currentOctave][keyCode];
    var note1Hot = 1 << (midiNum % 32);
    var statusInt = Math.floor(midiNum / 32);
    // console.log("MidiNum:", midiNum, "note1Hot:", note1Hot.toString(2), "statusInt:", statusInt);
    if (noteOn) {
      // check if midi note is currently active using the status array
      // if it's not active, then search for an unused note to play it
      if (!(this.midiStatus[statusInt] & note1Hot)) {
        // console.log("midi note status was false, searching for unused note object");
        for (var i = 0; i < this.numNotes; i++) {
          // look for  an unused note
          // unused: not pressed AND not being released
          if (!this.noteArray[i].pressed && this.context.currentTime > this.noteArray[i].getOffTime()) {
            // console.log("Starting note index: ", i, " with frequency ", this.midiDict[midiNum]);
            this.noteArray[i].setKey(keyCode);
            this.noteArray[i].setFrequency(this.midiDict[midiNum]);
            this.noteArray[i].playNote(true);
            // mark this midi number as active in the status array
            this.midiStatus[statusInt] = this.midiStatus[statusInt] | note1Hot;
            // stop looking
            break;
          }
          // if this note is active
          // then keep looking (do nothing)
        }
      }
      // if the midi note is active according to the status array, 
      // then ignore this playNote command (do nothing)
    }
    // assume noteOn is false, turn off note with input midiNum
    // search for a note with the matching frequency that is currently pressed and 
    else {
      for (var i = 0; i < this.numNotes; i++) {
        // look for a note with the matching frequency that's still pressed
        if (this.noteArray[i].frequency == this.midiDict[midiNum] && this.noteArray[i].pressed) {
          // console.log("ending note index: ", i, " with frequency ", this.midiDict[midiNum]);
          //turn it off
          this.noteArray[i].playNote(false);
          //mark this midi number as inactive in the status array
          this.midiStatus[statusInt] = this.midiStatus[statusInt] ^ note1Hot;
          // stop looking
          break;
        }
        // if this note either doesn't have the right frequency or is already unpressed
        // then keep looking (do nothing)
      }
    }
  }
  
  //detect if the tab is inactive - if inactive, de-activate all notes
  allNotesOff() {
    for (var i = 0; i < this.numNotes; i++) {
      // look for active notes
      // active - pressed and 
      // unused: not pressed AND not being released
      if (this.noteArray[i].pressed) {
        //turn it off
        this.noteArray[i].playNote(false);
      }
      
    }
    // reset all midiStatus's to reflect that all ntoes are off
    for (var i = 0; i < this.numStatInts; i++) {
      this.midiStatus[i] = this.midiStatus[i] & 0; 
    }
  }
  
}