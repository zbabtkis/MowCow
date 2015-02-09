var Character = require('./character'),
    Explosive = require('./explosive');

/**
 * A cow character
 *
 * @class Cow
 */
function Cow() {
  Character.apply(this, arguments);
  this.type = 'cow';
}

Cow.prototype = Object.create(Character.prototype);

/**
 * Handle a cow colliding into another object
 *
 * @function onCollision
 * @memberof Cow#
 * @param {Entity} collider An entity that the cow is colliding with
 */
Cow.prototype.onCollision = function(collider) {
  if (collider instanceof Explosive && collider.explosion.state.isExploding) {

    // bounce cow out of world
    this.set('x', -200);
    this.set('y', -200);

    // After cow should be out of frame, remove from world
    setTimeout(_.bind(function() {
      this.world.removeObject(this);
    }, this), 1000);
  }
};

/**
 * Render a cow to the world
 *
 * @function render
 * @memberof Cow#
 * @return {Cow} Instance of this cow
 */
Cow.prototype.render = function() {
  var ctx = this.world.ctx;

  this.currentPosition.x += Math.round((this.x - this.currentPosition.x) / 6);
  this.currentPosition.y += Math.round((this.y - this.currentPosition.y) / 6);

  this.currentPosition.x = this.currentPosition.x - 6 <= 0 ? this.x : this.currentPosition.x; 
  this.currentPosition.y = this.currentPosition.y - 6 <= 0 ? this.y : this.currentPosition.y; 

  ctx.drawImage(
    this.sprite.image,
    this.sprite.frame.offsetX,
    this.sprite.frame.offsetY,
    this.options.width,
    this.options.height,
    this.currentPosition.x,
    this.currentPosition.y,
    this.options.width,
    this.options.height
  );

  ctx.restore();

  return this;
};

module.exports = Cow;
