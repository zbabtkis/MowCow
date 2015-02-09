var Entity = require('./entity'),
    Observable = require('./observable');

function StatsBar() {
  Entity.apply(this, arguments);
  this.messages = {};
}

StatsBar.prototype = Object.create(Entity.prototype);

StatsBar.prototype.trackStat = function(statName, source, attribute, changeAttribute) {
  changeAttribute = changeAttribute || attribute;
  var stat = {
    name: statName,
    value: Observable.getNestedValue(source, changeAttribute)
  };

  this.messages[statName] = stat;

  source.onChange(attribute, _.bind(function(attr, value) {
    stat.value = Observable.getNestedValue(source, changeAttribute);
    this.messageString = this.buildMessageString(this.messages);
  }, this));

  this.messageString = this.buildMessageString(this.messages);
};

StatsBar.prototype.buildMessageString = function(messages) {
  return _.chain(messages)
    .filter(function(stat) {
      return stat.value;
    })
    .map(function(stat) {
      return stat.name + ': ' + stat.value;
    })
    .value()
    .join(', ');
}

StatsBar.prototype.render = function() {
  var ctx = this.world.ctx;

  ctx.font = "15px Helvetica";
  ctx.fillStyle = "white";
  ctx.fillText(
    this.messageString,
    this.x,
    this.y
  );
};

module.exports = StatsBar;
