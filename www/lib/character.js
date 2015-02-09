var Entity = require('./entity'),
    Controller = require('./controller');

/**
 * A movable game entity to render in a world
 *
 * @class Character
 * @extends Entity
 * @param {Object} location Initail coordinates in the game
 * @param {Integer} location.x x-coordinate for character to start in
 * @param {Integer} location.y y-coordinate for character to start in
 * @param {Object} css Css rules to apply to character
 */
function Character(location, options) {
  // Extend an entity
  Entity.apply(this, arguments);

  // How far a character should travel per control movement
  this.distancePerCycle = 50;
  this.type = 'character';

  // Position to render character in intially
  this.currentPosition = {
    x: location.x,
    y: location.y
  };
};

Character.prototype = Object.create(Entity.prototype);

/**
 * The character controller
 *
 * @function control
 * @memberof Character#
 * @param {Object} state The control messages being sent
 * @param {Boolean} state.isDirectionUp Whether the character should move up
 * @param {Boolean} state.isDirectionDown Whether the character should move down
 * @param {Boolean} state.isDirectionLeft Whether the character should move left
 * @param {Boolean} state.isDirectionRight Whether the character should move right
 * @return {Character} Instance of this character
 */
Character.prototype.control = function(state) {
  if (state.isDirectionUp && this.y > 0) {
    this.set('y', this.y - Math.min(this.distancePerCycle, this.y));
  }
  
  if (state.isDirectionDown && this.y + this.options.height < this.world.height) {
    this.set('y', this.y + Math.min(this.distancePerCycle, this.world.height - this.options.height - this.y));
  }
  
  if (state.isDirectionLeft && this.x > 0) {
    this.set('x', this.x - Math.min(this.distancePerCycle, this.x));
  }
  
  if (state.isDirectionRight && this.x + this.options.width < this.world.width) {
    this.set('x', this.x + Math.min(this.distancePerCycle, this.world.width - this.options.width - this.x));
  }

  return this;
};

/**
 * Teardown Character
 *
 * @function destroy
 * @memberof Character#
 * @return {Character} Instance of this character
 */
Character.prototype.destroy = function() {
  Entity.prototype.destroy.apply(this, arguments);

  if (this.controller instanceof Controller) {
    this.controller.detachEntity(this);
  }

  return this;
};

/**
 * Handle a collision with another object
 *
 * @function onCollision
 * @memberof Character#
 * @param {Array<Entity>} state Entities that are touching this character
 * @return {Character} This character instance
 */
Character.prototype.onCollision = _.noop;

/**
 * Render the character in the context of the world
 *
 * @function render
 * @memberof Character#
 * @return {Object} Instance of this character
 */
Character.prototype.render = function() {
  var ctx = this.world.ctx;

  this.currentPosition.x += Math.round((this.x - this.currentPosition.x) / 3);
  this.currentPosition.y += Math.round((this.y - this.currentPosition.y) / 3);

  if (this.options.color) {
    ctx.beginPath();
    ctx.fillStyle = this.options.color;
    ctx.fillRect(
      this.currentPosition.x,
      this.currentPosition.y,
      this.options.width,
      this.options.height
    );
    ctx.stroke();
  } else if (this.sprite) {
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
  }
};

module.exports = Character;
