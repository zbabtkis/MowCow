var Character = require('./character');

function Explosive(location, options) {
  Character.apply(this, arguments);

  this.type = options.type || 'weapon';
  this.set('explosion', {
    state: {
      isExploded: false,
      isExploding: false,
      strength: 20
    }
  });
}

Explosive.prototype = Object.create(Character.prototype);

Explosive.prototype.explode = function() {
  var _this = this;

  this.set('explosion.state.isExploding', true); 

  var degradeExplosionVerocity = _.bind(function() {
    this.state.strength -= 0.5;

    if(!this.state.strength) {
      _this.world.removeObject(_this);
    } else {
      setTimeout(degradeExplosionVerocity, 20);
    }
  }, this.explosion);

  degradeExplosionVerocity();

  return this;
};

Explosive.prototype.activate = function() {
  this.sprite.startAction('active');
  this.onCollision = this.explode;

  return this; 
};

Explosive.prototype.render = function() {
  var ctx = this.world.ctx,
      centerX = this.currentPosition.x + (this.options.width / 2),
      centerY = this.currentPosition.y + (this.options.height / 2);

  this.currentPosition.x += Math.round((this.x - this.currentPosition.x) / 2);
  this.currentPosition.y += Math.round((this.y - this.currentPosition.y) / 2);

  ctx.drawImage(
    this.sprite.image,
    this.sprite.frame.offsetX,
    this.sprite.frame.offsetY,
    this.options.width,
    this.options.height,
    this.currentPosition.x,
    this.currentPosition.y,
    this.options.width,
    this.options.height
  );

  ctx.restore();

  if (this.explosion.state.isExploding) {
    ctx.beginPath();
    ctx.lineWidth = this.explosion.state.strength;
    ctx.arc(centerX, centerY, (20 - this.explosion.state.strength) * 3, 0, 2, Math.PI, false);
    ctx.strokeStyle = 'orange';
    ctx.stroke();
    ctx.restore();
  }
};

Explosive.prototype.place = function(coordinates) {
  this.set('x', coordinates.x);
  this.set('y', coordinates.y);
};

module.exports = Explosive;
