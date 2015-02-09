var CollisionDetector = require('./collision-detector-2'),
    Entity = require('./entity'),
    Observable = require('./observable');

/**
 * An environment for your characters and entities to live in
 *
 * @class World
 * @param {HTMLElement} el Canvas to render game entities in
 * @param {Object} options Options to configure the game world
 * @param {Integer} options.height Height of game viewport
 * @param {Integer} options.width Width of game viewport
 */
var World = function(el, options) {

  // make world attributes observable
  Observable.call(this);

  this.el = document.createElement('canvas');
  this.collisionDetector = new CollisionDetector({
    x: options.width,
    y: options.height
  });
  this.ctx = this.el.getContext('2d');

  // Set the size of the canvas
  this.el.width = options.width;
  this.el.height = options.height;
  
  this.entities = [];
  this.options = options;
  this._onRemoveObjectNotifiers = [];
  this.height = options.height;
  this.width = options.width;
};

/**
 * Add an entity to the game
 *
 * @function addObject
 * @memberof World#
 * @param {Entity} entity An instance of a game entity to render in the game
 * @return {World} This world instance
 */
World.prototype.addObject = function(entity) {
  entity.world = this;

  if (entity instanceof Entity) {
    this.collisionDetector.trackCollisions(entity);
  }

  this.entities.push(entity);

  return this;
};

/**
 * Remove an entity from the game
 *
 * @function removeObject
 * @memberof World
 * @param {Entity} entity An entity that exists in the game
 * @return {World} This world instance
 */
World.prototype.removeObject = function(entity) {
  _.remove(this.entities, entity);
  this.collisionDetector.untrackCollisions(entity);
  entity.destroy();
  _.invoke(this._onRemoveObjectNotifiers, 'cb', entity);

  return this;
};

World.prototype.reset = function(entity) {
  this.collisionDetector.reset();
  _.invoke(this.entities, 'destroy');
  this.entities = [];
};

/**
 * Register a callback to run whenever an object is removed from the world
 *
 * @function onRemoveObject
 * @memberof World#
 * @param {Function} notifier Callback to call when object is removed
 * @return {Object} Pointer to object notifier (can be used with offRemoveObject)
 */
World.prototype.onRemoveObject = function(notifier) {
  this._onRemoveObjectNotifiers.push({
    cb: notifier
  });

  return _.last(this._onRemoveObjectNotifiers);
};

/**
 * Remove a callback registered with onRemoveObject
 *
 * @function offRemoveObject
 * @memberof World#
 * @param {Object} notifier Returned notifier object from onRemoveObject
 */
World.prototype.offRemoveObject = function(notifier) {
  _.remove(this._onRemoveObjectNotifiers, notifier);
};

/**
 * Render every object in the game and update collision state
 *
 * @function tick
 * @memberof World#
 * @return {World} This world instance
 */
World.prototype.tick = function() {
  var _this = this;

  // Clear the entire before redraw
  this.ctx.clearRect(0, 0, this.options.width, this.options.height);

  // Render all objects in world
  _.invoke(this.entities, 'render');

  return this;
};

module.exports = World;
