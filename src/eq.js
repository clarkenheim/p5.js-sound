'use strict';

define(function (require) {

  var Effect = require('effect');
  var EQFilter = require('src/eqFilter');

  /**
   * p5.EQ is an audio effect that performs the function of a multiband
   * audio equalizer. Equalization is used to adjust the balance of
   * frequency compoenents of an audio signal. This process is commonly used
   * in sound production and recording to change the waveform before it reaches
   * a sound output device. EQ can also be used as an audio effect to create
   * interesting distortions by filtering out parts of the spectrum. p5.EQ is
   * built using a chain of Web Audio Biquad Filter Nodes and can be
   * instantiated with 3 or 8 bands. Bands can be added or removed from
   * the EQ by directly modifying p5.EQ.bands (the array that stores filters).
   *
   * This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.
   * Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   * @class p5.EQ
   * @constructor
   * @extends p5.Effect
   * @param {Number} [_eqsize] Constructor will accept 3 or 8, defaults to 3
   * @return {Object} p5.EQ object
   *
   * @example
   * <div><code>
   * var eq;
   * var band_names;
   * var band_index;
   * 
   * var soundFile, play;
   * 
   * function preload() {
   *   soundFormats('mp3', 'ogg');
   *   soundFile = loadSound('assets/beat');
   * }
   * 
   * function setup() {
   *   eq = new p5.EQ(3);
   *   soundFile.disconnect();
   *   eq.process(soundFile);
   * 
   *   band_names = ['lows','mids','highs'];
   *   band_index = 0;
   *   play = false;
   *   textAlign(CENTER);
   * }
   * 
   * function draw() {
   *   background(30);
   *   noStroke();
   *   fill(255);
   *   text('click to kill',50,25);
   * 
   *   fill(255, 40, 255);
   *   textSize(26);
   *   text(band_names[band_index],50,55);
   * 
   *   fill(255);
   *   textSize(9);
   *   text('space = play/pause',50,80);
   * }
   * 
   * //If mouse is over canvas, cycle to the next band and kill the frequency
   * function mouseClicked() {
   *   for (var i = 0; i < eq.bands.length; i++) {
   *     eq.bands[i].gain(0);
   *   }
   *   eq.bands[band_index].gain(-40);
   *   if (mouseX > 0 && mouseX < width && mouseY < height && mouseY > 0) {
   *     band_index === 2 ? band_index = 0 : band_index++;
   *   }
   * }
   * 
   * //use space bar to trigger play / pause
   * function keyPressed() {
   *   if (key===' ') {
   *     play = !play
   *     play ? soundFile.loop() : soundFile.pause();
   *   }
   * }
   * </code></div>
   */
  p5.EQ = function(_eqsize) {
    Effect.call(this);

    //p5.EQ can be of size (3) or (8), defaults to 3
    _eqsize = _eqsize === 3 || _eqsize === 8 ? _eqsize : 3;

    var factor;
    _eqsize === 3 ? factor = Math.pow(2,3) : factor = 2;

    /**
      *  The p5.EQ is built with abstracted p5.Filter objects.
      *  To modify any bands, use methods of the <a 
      *  href="/reference/#/p5.Filter" title="p5.Filter reference">
      *  p5.Filter</a> API, especially `gain` and `freq`.
      *  Bands are stored in an array, with indices 0 - 3, or 0 - 7
      *  @property {Array}  bands
      *
    */
    this.bands = [];


    var freq, res;
    for (var i = 0; i < _eqsize; i++) {
      if (i === _eqsize - 1) {
        freq = 21000;
        res = .01;
      } else if (i === 0) {
        freq = 100;
        res = .1;
      }
      else if (i===1) {
        freq = _eqsize === 3 ? 360 * factor : 360;
        res = 1;
      }else {
        freq = this.bands[i-1].freq() * factor;
        res = 1;
      }
      this.bands[i] = this._newBand(freq, res);

      if (i>0) {
        this.bands[i-1].connect(this.bands[i].biquad);
      } else {
        this.input.connect(this.bands[i].biquad);        
      }
    }
    this.bands[_eqsize-1].connect(this.output);    
  };
  p5.EQ.prototype = Object.create(Effect.prototype);

  /**
   * Process an input by connecting it to the EQ
   * @method  process
   * @param  {Object} src Audio source
   */
  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };

  //  /**
  //   * Set the frequency and gain of each band in the EQ. This method should be
  //   * called with 3 or 8 frequency and gain pairs, depending on the size of the EQ.
  //   * ex. eq.set(freq0, gain0, freq1, gain1, freq2, gain2);
  //   *
  //   * @method  set
  //   * @param {Number} [freq0] Frequency value for band with index 0
  //   * @param {Number} [gain0] Gain value for band with index 0
  //   * @param {Number} [freq1] Frequency value for band with index 1
  //   * @param {Number} [gain1] Gain value for band with index 1
  //   * @param {Number} [freq2] Frequency value for band with index 2
  //   * @param {Number} [gain2] Gain value for band with index 2
  //   * @param {Number} [freq3] Frequency value for band with index 3
  //   * @param {Number} [gain3] Gain value for band with index 3
  //   * @param {Number} [freq4] Frequency value for band with index 4
  //   * @param {Number} [gain4] Gain value for band with index 4
  //   * @param {Number} [freq5] Frequency value for band with index 5
  //   * @param {Number} [gain5] Gain value for band with index 5
  //   * @param {Number} [freq6] Frequency value for band with index 6
  //   * @param {Number} [gain6] Gain value for band with index 6
  //   * @param {Number} [freq7] Frequency value for band with index 7
  //   * @param {Number} [gain7] Gain value for band with index 7
  //   */
  p5.EQ.prototype.set = function() {
    if (arguments.length === this.bands.length * 2) {
      for (var i = 0; i < arguments.length; i+=2) {
        this.bands[i/2].freq(arguments[i]);
        this.bands[i/2].gain(arguments[i+1]);
      }
    }
    else {
      console.error('Argument mismatch. .set() should be called with ' + this.bands.length*2 +
        ' arguments. (one frequency and gain value pair for each band of the eq)');
    }
  };

  /**
   * Add a new band. Creates a p5.Filter and strips away everything but
   * the raw biquad filter. This method returns an abstracted p5.Filter,
   * which can be added to p5.EQ.bands, in order to create new EQ bands.
   * @private
   * @method  _newBand
   * @param  {Number} freq
   * @param  {Number} res
   * @return {Object}      Abstracted Filter
   */
  p5.EQ.prototype._newBand = function(freq, res) {
    return new EQFilter(freq, res);
  };

  p5.EQ.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);

    if (this.bands) {
      while (this.bands.length > 0) {
        delete this.bands.pop().dispose();
      }
      delete this.bands;
    }
  };

  return p5.EQ;
});
