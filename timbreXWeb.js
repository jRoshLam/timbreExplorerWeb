import * as spectrum from './web-audio/spectrum.js'
import * as spectrSynth from './web-audio/spectrSynth.js'
import * as brightness from './web-audio/brightness.js'
import * as brightFilter from './web-audio/brightFilter.js'
import * as articulation from './web-audio/articulation.js'
import * as articuFilter from './web-audio/articuFilter.js'
import * as envelope from './web-audio/envelope.js'
import * as enveloADSR from './web-audio/enveloADSR.js'

import * as note from './web-audio/note.js'
import * as keyboard from './web-audio/keyboard.js'


//dev imports
import * as graph from './canvas/graph.js'
import * as guiDimensions from './canvas/guiDimensions.js'
import * as blockDiagram from './canvas/blockDiagram.js'

(function(){
  
  var init = false;
  
  //dev graph
  var canvas = document.getElementById("canvas");
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // canvas.style.left = "0px";
  // canvas.style.top = "0.34*window.innerWidth";
  // canvas.style.position = "absolute";
  var canvasContext = canvas.getContext('2d');
  // canvasContext.fillStyle = 'rgb(200, 200, 200)';
  // canvasContext.fillRect(this.x, this.y, this.w, this.h);
  
  var gui = new guiDimensions.GuiDimensions(canvas.width, canvas.height);
  var blkD = new blockDiagram.BlockDiagram(canvasContext, gui);
  
//   var x = 0.02 * canvas.width;
//   var y = 0.1 * canvas.height;
//   var w = 0.23 * canvas.width;
//   var h = 0.35 * canvas.height;
//   var data = new Float32Array(3);
//   var color = 'red'
  
//   var frfL = 21;
//   var freq = new Float32Array(frfL);
//   var frfM = new Float32Array(frfL);
//   var frfP = new Float32Array(frfL);
//   freq[0] = 0;
//   for (var i = 1; i < frfL; i++) {
//     freq[i] = i / (frfL - 1) * 20000;
//   }
//   console.log(freq);
  
//   data[0] = 0.2;
//   data[1] = 0.7;
//   data[2] = 0.3;
  
  // var specGraph = new graph.Graph(canvasContext, x, y, w, h, data, color);
  // console.log(graphObj.context);

  // check browser usability @caniuse.com
  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  var specSlider = document.getElementById("specSlider");
  var brigSlider = document.getElementById("brigSlider");
  var artiSlider = document.getElementById("artiSlider");
  var enveSlider = document.getElementById("enveSlider");
  
  var gainNode = ctx.createGain();
  // console.log(gainNode);
  gainNode.gain.value = 0.1;
  
  var enveObj = new envelope.Envelope();
  
  //articulation objects
  var artiObj = new articulation.Articulation();
  // var arFilterObj = new articuFilter.ArticuFilter(ctx, artiObj, gainNode)
  
  //brightness objects
  var brigObj = new brightness.Brightness();
  // var brFilterObj = new brightFilter.BrightFilter(ctx, brigObj, arFilterObj.input);
  
  //spectrum objects
  var specObj = new spectrum.Spectrum();
  // specObj.updateSpectrum(250);
  // var synthObj = new spectrSynth.SpectrSynth(ctx, specObj, brFilterObj.input);
  // synthObj.updateSpectrum();
  
  var noteObj = new note.Note(ctx, specObj, brigObj, artiObj, enveObj, gainNode);
  var kbObj = new keyboard.Keyboard(ctx, specObj, brigObj, artiObj, enveObj, gainNode);
  
  
  // spectrum.audioNodeParamTest(osc);
  
  var analyser = ctx.createAnalyser();
  gainNode.connect(analyser);
  analyser.connect(ctx.destination);
  analyser.fftSize = 1024;
  var fftL = analyser.frequencyBinCount;
  var fftData = new Uint8Array(fftL);
  var fftDB = new Float32Array(fftL);
  
  var setup = function(e){
    if (init) return;
    ctx.resume();
    console.log('Playback resumed successfully')
    noteObj.startAudio();
    kbObj.startAudio();
    init = true;
    // console.log(blkD.artiGraph.data);
    // testOsc.start();
    
  }
  
  var onKeyDown = function(e){
    // switch (e.keyCode) {
    //   case 74: // j
    //       break;
    // }
    kbObj.keyPress(e.keyCode, true);
    // noteObj.playNote(true);
    console.log("keydown");
  };
  
  var onKeyUp = function(e){
    kbObj.keyPress(e.keyCode, false);
    // noteObj.playNote(false);
    console.log("keyup");
  }
  
  specSlider.oninput = function() {
    specObj.updateSpectrum(this.value);
    noteObj.updateSpectrum();
    kbObj.updateSpectrum();
  }
  brigSlider.oninput = function() {
    brigObj.updateBrightness(this.value);
    noteObj.updateBrightness();
    kbObj.updateBrightness();
  }
  artiSlider.oninput = function() {
    artiObj.updateArticulation(this.value);
    noteObj.updateArticulation();
    kbObj.updateArticulation();
  }
  
  enveSlider.oninput = function() {
    enveObj.updateEnvelope(this.value);
    noteObj.updateEnvelope();
    kbObj.updateEnvelope();
  }

  
  window.addEventListener('keydown', setup);
    
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  
  // var testOsc = ctx.createOscillator();
  // testOsc.type = 'sawtooth';
  // testOsc.connect(analyser);
  // testOsc.connect(analyser);

  // TODO: Turn off all audio when tab is switched
  // document.addEventListener("visibilitychange", function() {
  //   if (document.hidden){
  //       console.log("Browser tab is hidden")
  //   } else {
  //       console.log("Browser tab is visible")
  //   }
  // });
  
  
  
  function draw() {
    
    canvasContext.fillStyle = 'rgb(255, 255, 255)';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(fftData);
    for (var i = 0; i < fftL; i++) {
      fftDB[i] = fftData[i] / 256.0;
      if (fftDB[i] > 0.01) {
        fftDB[i] = 20 * Math.log10(fftDB[i]);
      } else {
        fftDB[i] = -40;
      }
      
      // convert range of [-40, 0] to [0,1]
      fftDB[i] = (fftDB[i] + 40) * 0.025;

    }
    noteObj.spSynth.calculateFFT(blkD.specGraph);
    noteObj.brFilter.calculateFRF(blkD.brigGraph);
    artiObj.calculateArticulationGraph(blkD.artiGraph);
    enveObj.calculateADSRGraph(blkD.enveGraph);
    blkD.finaGraph.setData(fftDB);
    // graphObj.setData(fftDB);
    blkD.draw();
    
    window.requestAnimationFrame(draw);
  }
  
  var resize = function() {
    canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
    console.log("resizing");
    blkD.resize(window.innerWidth, window.innerHeight);
    // gui.resize(window.innerWidth, window.innerHeight);
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    // var x = 0.05 * window.innerWidth;
    // var y = 0.34 * window.innerHeight;
    // var w = 0.19 * window.innerWidth;
    // var h = 0.25 * window.innerHeight;
    // specGraph.resize(x, y, w, h);
    // specGraph.resize(gui.graphSX, gui.graphY, gui.graphW, gui.graphH);
  }
  
  window.addEventListener('resize', resize);
  // var drawVisual = requestAnimationFrame(draw);
  window.requestAnimationFrame(draw);
  
})()