var SwipeController = require('./swipe-controller');

function ContinuousSwipeController() {
  SwipeController.apply(this, arguments);

  // Send the current controller action to the character ever 200 ms
  setInterval(_.bind(this.sendControl, this), 200);
}

ContinuousSwipeController.prototype = Object.create(SwipeController.prototype);

ContinuousSwipeController.prototype.setControlState = function(key, event) {
  this.state = this.getStateByKey(key); 
};

ContinuousSwipeController.prototype.sendControl = function() {
  _.invoke(this.entities, 'control', this.state);
};

module.exports = ContinuousSwipeController;
