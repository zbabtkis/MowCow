var Entity = require('./entity');

/**
 * A sliding message
 *
 * @class SlidingText
 * @extends Entity
 * @param {Object} location x, y coodinates of start of message
 * @param {Object} options Options to render method with
 */
function SlidingText(location, options) {
  Entity.apply(this, arguments);

  this.title = options.title;
  this.message = options.message;
}

SlidingText.prototype = Object.create(Entity.prototype);

/**
 * Move message to the right
 *
 * @function pan
 * @memberof SlidingText#
 */
SlidingText.prototype.pan = function() {
  this.x-=5;

  if (this.x + window.innerWidth <= 0) {
    this.world.removeObject(this);
  }
};

/**
 * Begin sliding message
 *
 * @function slide
 * @memberof SlidingText#
 */
SlidingText.prototype.slide = function() {
  setInterval(_.bind(this.pan, this), 16);
};

SlidingText.prototype.render = function() {
  var ctx = this.world.ctx;
  ctx.fillStyle = 'rgba(44, 62, 80, 0.5)';
  ctx.fillRect(this.x, this.y - 10, window.innerWidth, this.options.fontSize + 20);
  ctx.fillStyle = this.options.color;
  ctx.font = this.options.fontSize + 'px ' + this.options.fontFamily;
  ctx.fillText(this.title, this.x + 10, this.y + 10);
  ctx.font = '40px ' + this.options.fontFamily;
  ctx.fillText(this.message, this.x + 10, this.y + 50);
};

module.exports = SlidingText;
