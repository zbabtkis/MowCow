var Observable = require('./observable');

/**
 * A base game entity to render in a world
 *
 * @class Entity
 */
function Entity(location, options) {
  // Add Observable mixin
  Observable.call(this);

  this.id = _.uniqueId('entity_');
  this.options = options;
  this.set('x', location.x);
  this.set('y', location.y);

  if (options.sprite) {
    this.sprite = options.sprite.create();
  }
}

/**
 * Teardown entity
 *
 * @function destroy
 * @memberof Entity#
 * @return {Entity} Instance of this entity
 */
Entity.prototype.destroy = function() {
  Observable.disable(this);
  return this;
};

/**
 * Register a function to call when the entity moves
 *
 * @function onMove
 * @memberof Entity#
 * @deprecated Use onChange instead
 * @param {Function} notifier Function to call when movement occurs
 * @return {Entity} Instance of this entity
 */
Entity.prototype.onMove = function(notifier) {
  this.onChange('x y', notifier);
};

module.exports = Entity;
