/**
 * A sprite class and sprite registry
 *
 * @class Sprite
 * @param {String} src An image source for a sprite
 * @param {Integer} frameWidth Width of a single sprite frame
 * @param {Integer} frameHeight Height of a single sprite frame
 * @property {Image} img HTML image element for rendering sprite
 * @property {Object} options Options for rendering a sprite
 * @property {Integer} options.frameHeight Height of a single sprite frame
 * @property {Integer} options.frameWidth Width of a single sprite frame
 */
function Sprite(src, frameWidth, frameHeight) {
  this._actions = {};

  this.options = {
    frameHeight: frameHeight,
    frameWidth: frameWidth
  };

  this.img = document.createElement('img');
  this.img.src = src;
  this.img.width = this.options.frameWidth;
  this.img.height = this.options.frameHeight;

  // Register sprite
  Sprite._sprites[src] = this;

  // By default, the beginning of the sprite is the default action
  this.defineAction('default', [{
    offsetX: 0,
    offsetY: 0,
    width: 50,
    height: 50
  }]);
}

// Sprite registry
Sprite._sprites = {};

/**
 * Preload all sprites
 *
 * @function preloadSprites
 * @memberof Sprite
 * @param {Function} successCallback Callback called when all sprites have been loaded
 * @param {Function} errorCallback Callback to call if there is an error loading a sprite
 */
Sprite.preloadSprites = function(successCallback, errorCallback) {
  var countImagesLoaded = 0,
      countTotalImages = _.keys(Sprite._sprites).length;

  errorCallback = errorCallback || _.noop;

  function checkLoadCount() {
    countImagesLoaded++;
    if (countImagesLoaded === countTotalImages) {
      successCallback();
    }
  }

  _.forEach(Sprite._sprites, function(sprite) {
      if (sprite.img.complete) {
        countImagesLoaded++;
        checkLoadCount();
      } else {
        sprite.img.onload = function() {
          checkLoadCount();
        };

        sprite.img.onerror = function() {
          errorCallback();
        };
      }
  });
};

/**
 * Load a sprite from the registry
 *
 * @function load
 * @memberof Sprite
 * @param {String} spritePath The path to a sprite image file (used as the key to retrieve a sprite)
 * @return {Sprite} The sprite for the sprite image path key
 */
Sprite.load = function(spritePath) {
  return Sprite._sprites[spritePath];
};

/**
 * Define a set of positions for a sprite that represent an action (e.g. running)
 *
 * @function defineAction
 * @memberof Sprite#
 * @param {String} action Name of action
 * @param {Integer} [frameRefreshRate] Optional rate at which to go to next frame
 * @param {Array.<Object>} states Array of hashes holding sprite offset positions
 * @param {Integer} states.offsetX X offset of sprite position
 * @param {Integer} states.offsetY Y offset of sprite position
 * @return {Sprite} Instance of this sprite
 */
Sprite.prototype.defineAction = function(actionName, frameRefreshRate, frames) {
  if (!frames) {
    frames = frameRefreshRate;
    frameRefreshRate = undefined;
  }

  this._actions[actionName] = {
    frames: frames,
    frameRefreshRate: frameRefreshRate
  };

  return this;
};

Sprite.prototype.create = function() { 
  var action = this._actions['default'],
      state = { frameIndex: 0, timeout: null },
      spriteInstance;

  function onActionChange() {
    spriteInstance.destroy();

    // If action uses a set of frames, set frame incrementer
    if(action.frameRefreshRate) {
      state.timeout = setInterval(function() {
        state.frameIndex++;

        if(state.frameIndex === action.frames.length) {
          state.frameIndex = 0;
        }

        spriteInstance.frame = action.frames[state.frameIndex];
      }, action.frameRefreshRate);
    }

    spriteInstance.frame = action.frames[state.frameIndex];
  }

  spriteInstance = {

    // stop a frame incrementer from running
    destroy: function() {
      clearInterval(state.timeout);
    },

    // use a predefined sprite action
    startAction: _.bind(function(actionName) {
      action = this._actions[actionName]; 
      onActionChange();
    }, this),

    image: this.img,
  };

  onActionChange();

  return spriteInstance;
};

module.exports = Sprite;
