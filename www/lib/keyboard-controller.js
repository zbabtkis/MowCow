var Controller = require('./controller');

/**
 * A controller that uses a keyboard direction keys as input
 *
 * @class KeyboardController
 * @extends Controller
 */
var KeyboardController = function() {
  Controller.apply(this, arguments);
  
  window.addEventListener('keyup', this.setControlState.bind(this));
  window.addEventListener('keydown', this.setControlState.bind(this));
};

KeyboardController.prototype = Object.create(Controller.prototype);

KeyboardController.Keys = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
};

/**
 * Set the state of the controller and send it to the entities it controls
 *
 * @function setControllerState
 * @memberof KeyboardController#
 * @param {Object} state The direction state
 * @return {RandomController} Instance of this controller
 */
KeyboardController.prototype.setControlState = function(event) {
  switch (event.which) {
    case KeyboardController.Keys.UP:
      this.state.isDirectionUp = event.type === "keydown";
      break;
    case KeyboardController.Keys.DOWN:
      this.state.isDirectionDown = event.type === "keydown";
      break;
    case KeyboardController.Keys.LEFT:
      this.state.isDirectionLeft = event.type === "keydown";
      break;
    case KeyboardController.Keys.RIGHT:
      this.state.isDirectionRight = event.type === "keydown";
      break;
    default:
      break;
  }
  
  _.invoke(this.entities, 'control', this.state);

  return this;
};

module.exports = KeyboardController;
