var Controller = require('./controller');

/**
 * Control a Character's motion through the devices accelerometer
 *
 * @class AcelerometerController
 * @property {Object} options Provide tuning for acelerometer sensitivity
 * @property {Integer} options.resistance How much force to apply against device acceleration
 * @property {Object} Keys Enum for directional key names
 * @property {Integer} Keys.UP Device tilted up enum value
 * @property {Integer} Keys.DOWN Device tilted down enum value
 * @property {Integer} Keys.RIGHT Device tilted right enum value
 * @property {Integer} Keys.LEFT Device tilted left enum value
 */
function AcelerometerController() {
  Controller.apply(this, arguments);

  // the resistance
  this.options.resistance = 5;

  // Always run onDeviceMotion handler in this context
  this.onDeviceMotion = _.bind(this.onDeviceMotion, this);

  window.addEventListener('devicemotion',this.onDeviceMotion);
};

AcelerometerController.Keys = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

AcelerometerController.prototype = Object.create(Controller.prototype);

/**
 * Set the state of the controller based on a device onmotion event
 *
 * @function onDeviceMotion
 * @memberof AcelerometerController
 * @param {Event} event A DOM event indicating the motion of the device
 * @return {AcelerometerController} Instance of this AcelerometerController
 */
AcelerometerController.prototype.onDeviceMotion = function(event) {

    // Get rotation along the X axis
    var xRotation = parseInt(event.accelerationIncludingGravity.x);

    // Convert -+ rotation to absolute value (force) of motion
    var absXRotation = Math.abs(xRotation);

    // Get direction that device is tilting on the X axis (right or left)
    var xDirection = xRotation > 0 ? AcelerometerController.Keys.RIGHT : AcelerometerController.Keys.LEFT;

    // Get the rotation of the device on the Y axis
    var yRotation = parseInt(event.accelerationIncludingGravity.y);

    // Get the absolute rotation of the device on the Y axis
    var absYRotation = Math.abs(yRotation);

    // Get the direction that the device is tilting along the Y axis
    var yDirection = yRotation > 0 ? AcelerometerController.Keys.UP : AcelerometerController.Keys.DOWN;

    // If the device is tilting a reasonable amount along the Y axis send control signal
    if(absYRotation) {
      this.setControlState(yDirection, absYRotation);
    }

    // If the device is tilting a reasonable amount along the X axis send control signal
    if(absXRotation) {
      this.setControlState(xDirection, absXRotation);
    }

    return this;
};

/**
 * Remove an entity from the entities this controller controls
 *
 * @function detachEntity
 * @memberof AcelerometerController
 * @return {AcelerometerController} Instance of this AcelerometerController
 */
AcelerometerController.prototype.detachEntity = function() {
  Controller.prototype.detachEntity.apply(this, arguments);

  return this;
};

/**
 * Send controls to controllers entities
 *
 * @function setControlState
 * @memberof AcelerometerController
 * @param {Integer} key The signal to set the control state sent to the controllers entities
 * @param {Integer} force How many times to execute control
 * @return {AcelerometerController} Instance of this AcelerometerController
 */
AcelerometerController.prototype.setControlState = function(key, force) {
  var state = {};

  switch (key) {
    case AcelerometerController.Keys.UP:
      state.isDirectionUp = true;
      break;
    case AcelerometerController.Keys.DOWN:
      state.isDirectionDown = true;
      break;
    case AcelerometerController.Keys.LEFT:
      state.isDirectionLeft = true;
      break;
    case AcelerometerController.Keys.RIGHT:
      state.isDirectionRight = true;
      break;
    default:
      break;
  }

  _.times(Math.round(force / this.options.resistance), _.bind(function() {
    _.invoke(this.entities, 'control', state);
  }, this));

  return this;
};

module.exports = AcelerometerController;
