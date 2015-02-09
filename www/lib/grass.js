var Character = require('./character'),
    Mower = require('./mower');

function Grass() {
  Character.apply(this, arguments);
  this.type = 'grass';
}

Grass.prototype = Object.create(Character.prototype);

Grass.prototype.onCollision = function(collider) {
  if (collider instanceof Mower) {
    this.world.removeObject(this);
  }
};

module.exports = Grass;
