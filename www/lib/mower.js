var Character = require('./character'),
    Cow = require('./cow'),
    Hammer = require('../bower_components/hammerjs/hammer'),
    Explosive = require('./explosive');

function Mower(location, options) {
  _.defaults(options, {lives:3});

  Character.apply(this, arguments);  
  this.set('lives', options.lives);

  this.dropWeapon = _.bind(this.dropWeapon, this);

  this.mc = Hammer(document.body);
  this.mc.on('doubletap', this.dropWeapon);
}

Mower.prototype = Object.create(Character.prototype);

Mower.prototype.destroy = function() {
  Character.prototype.destroy.apply(this, arguments);
  this.mc.off('doubletap', this.dropWeapon);
};

Mower.prototype.control = function(state) {
  Character.prototype.control.apply(this, arguments);

  if(state.isDirectionUp) {
    this.sprite.startAction('goUp');
  }

  if(state.isDirectionDown) {
    this.sprite.startAction('goDown');
  }

  if(state.isDirectionLeft) {
    this.sprite.startAction('goLeft');
  }

  if(state.isDirectionRight) {
    this.sprite.startAction('goRight');
  }
};

Mower.prototype.dropWeapon = function(event) {
  var x = event.center.x,
      y = event.center.y;

  // Get middle of click
  x = (x + (this.options.width / 2))
  y = (y + (this.options.height / 2))

  // Get beginning coordinates of the closest cell
  x = x - (x % this.options.width);
  y = y - (y % this.options.height);

  if (this.weapon) {
    this.weapon.place({
      x: x,
      y: y
    });
    this.world.addObject(this.weapon);
    this.weapon.activate();
    this.set('weapon', null);
  }
}

Mower.prototype.onCollision = function(collider) {
  setTimeout(function() {
    var isColliderCow = collider instanceof Cow,
        isColliderExploding = collider instanceof Explosive 
          && collider.explosion.state.isExploding;

    if (isColliderCow || isColliderExploding) {
      return this.die();
    }

    if (collider instanceof Explosive && !this.weapon) {
      this.set('weapon', collider);

      this.set('weapon.currentPosition.x', this.currentPosition.x);
      this.set('weapon.currentPosition.y', this.currentPosition.y);

      return this.world.removeObject(this.weapon);
    }
  }.bind(this));
};

// Mower can only die once in a second
Mower.prototype.die = _.throttle(function() {
  this.set('x', 0);
  this.set('y', 0);

  if(this.lives > 0) {
    this.set('lives', this.lives - 1);
  }
}, 1000, {leading: true});

Mower.prototype.reset = function() {
  this.x = 0;
  this.y = 0;
  this.lives = this.options.lives;
};

module.exports = Mower;
