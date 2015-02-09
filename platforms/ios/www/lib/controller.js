/**
 * Controls the movement of an Entity
 *
 * @class Controller
 */
var Controller = function(options) {
  this.state = {};
  this.options = _.assign({}, options);
  this.entities = [];
};


/**
 * Start controling an entities movement
 *
 * @function controlEntity
 * @memberof Controller#
 * @param {Entity} entity An entity to move
 * @return {Controller} Instance of this controller
 */
Controller.prototype.controlEntity = function(entity) {
  entity.controller = this;
  this.entities.push(entity);

  return this;
};

Controller.prototype.detachEntity = function(entity) {
  _.remove(this.entities, entity);
};

module.exports = Controller;
