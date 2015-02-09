var Controller = require('./controller');

/**
 * A controller that controls an entity with random movements
 *
 * @class RandomController
 * @extends Controller
 */
var RandomController = function() {
  var _this = this;
  
  Controller.apply(this, arguments);
  
  this.key = {
    direction: 1
  };
  
  setInterval(this.setControllerState.bind(this, this.key), 200);
  setInterval(this.changeKey.bind(this), 1000);
};

RandomController.Keys = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

RandomController.prototype = Object.create(Controller.prototype);

/**
 * Change the direction of an entity to a random direction
 *
 * @function changeKey
 * @memberof RandomController#
 * @return {RandomController} Instance of this controller
 */
RandomController.prototype.changeKey = function() {
  this.key.direction = Math.floor(Math.random() * 5);

  return this;
};

/**
 * Set the state of the controller and send it to the entities it controls
 *
 * @function setControllerState
 * @memberof RandomController#
 * @param {Object} state The direction state
 * @return {RandomController} Instance of this controller
 */
RandomController.prototype.setControllerState = function(state) {
  this.state = {
    isDirectionUp: state.direction === RandomController.Keys.UP,
    isDirectionDown: state.direction === RandomController.Keys.DOWN,
    isDirectionLeft: state.direction === RandomController.Keys.LEFT,
    isDirectionRight: state.direction === RandomController.Keys.RIGHT
  };
  
  _.invoke(this.entities, 'control', this.state);

  return this;
};

module.exports = RandomController;
