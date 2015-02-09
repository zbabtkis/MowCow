var Controller = require('./controller'),
    Hammer = require('../bower_components/hammerjs/hammer.min');

function SwipeController() {
  Controller.apply(this, arguments);

  var swipeRecognizer = new Hammer.Manager(document.body);

  swipeRecognizer.add(new Hammer.Swipe({
    direciton: Hammer.DIRECTION_ALL,
    threshold: 2,
    velocity: 0.03
  }));

  swipeRecognizer.on('swipeleft', _.bind(this.setControlState, this, SwipeController.Keys.LEFT));
  swipeRecognizer.on('swiperight', _.bind(this.setControlState, this, SwipeController.Keys.RIGHT));
  swipeRecognizer.on('swipeup', _.bind(this.setControlState, this, SwipeController.Keys.UP));
  swipeRecognizer.on('swipedown', _.bind(this.setControlState, this, SwipeController.Keys.DOWN));
}

SwipeController.Keys = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

SwipeController.prototype = Object.create(Controller.prototype);

SwipeController.prototype.getStateByKey = function(key) {
  var state = {};

  switch (key) {
    case SwipeController.Keys.UP:
      state.isDirectionUp = true;
      break;
    case SwipeController.Keys.DOWN:
      state.isDirectionDown = true;
      break;
    case SwipeController.Keys.LEFT:
      state.isDirectionLeft = true;
      break;
    case SwipeController.Keys.RIGHT:
      state.isDirectionRight = true;
      break;
    default:
      break;
  }

  return state;
};

SwipeController.prototype.setControlState = function(key, event) {
  var state = this.getStateByKey(key),
      force = Math.round(Math.abs(event.velocity));

  _.times(force, _.bind(function() {
    _.invoke(this.entities, 'control', state);
  }, this));

  return this;
};

module.exports = SwipeController;
