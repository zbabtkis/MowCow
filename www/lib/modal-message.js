var Hammer = require('../bower_components/hammerjs/hammer.min');

function ModalMessage(text) {
  this.text = text;
  this.onClickButton = _.bind(this.onClickButton, this);
  this.mc = Hammer(document.body)
  
  // Bind modal tap actions
  this.mc.on('tap', this.onClickButton);
}

ModalMessage.prototype.render = function() {
  var WORLD_START_TOP = 0,
      WORLD_START_LEFT = 0,
      ctx = this.world.ctx,
      textSize,
      textHeight,
      textWidth,
      offsetWidth,
      offsetHeight;

  // Draw modal background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(
    WORLD_START_TOP + 10,
    WORLD_START_LEFT + 10 ,
    this.world.options.width - 20,
    this.world.options.height - 20
  );

  // Draw message text
  ctx.fillStyle = "white";
  ctx.font = '50px Helvetica';
  textSize = ctx.measureText(this.text);
  textWidth = textSize.width;
  textHeight = 50;
  offsetWidth = (this.world.options.width / 2) - (textWidth / 2);
  offsetHeight = (this.world.options.height / 2) - (textHeight / 2);
  ctx.fillText(this.text, offsetWidth, offsetHeight)

  if (this.button) {
    var buttonOffsetHeight = offsetHeight + textHeight + 30;

    ctx.fillStyle = '#1abc9c';
    ctx.font = '30px Helvetica';
    textSize = ctx.measureText(this.button.label);
    textWidth = textSize.width;
    textHeight = 30;
    offsetWidth = (this.world.options.width / 2) - (textWidth / 2) - 20;
    ctx.fillRect(offsetWidth, buttonOffsetHeight, textWidth + 20, textHeight + 20);
    ctx.strokeStyle = '#16a085';
    ctx.lineWidth = 5;
    ctx.strokeRect(offsetWidth, buttonOffsetHeight, textWidth + 20, textHeight + 20);
    ctx.fillStyle = 'white';
    ctx.fillText(this.button.label, offsetWidth + 10, buttonOffsetHeight + 30);
    ctx.lineWidth = 1;
    this.button.xStart = offsetWidth;
    this.button.yStart = buttonOffsetHeight;
    this.button.xEnd = offsetWidth + textWidth + 20;
    this.button.yEnd = buttonOffsetHeight + textHeight + 20;
  }
};

ModalMessage.prototype.destroy = function() {
  this.mc.off('tap', this.onClickButton);
};


ModalMessage.prototype.addButton = function(label, action) {
  this.button = {
    label: label,
    action: action
  };


  return this;
};

ModalMessage.prototype.onClickButton = function(event) {
  if (!this.button) return;

  var x = event.center.x,
      y = event.center.y,
      isClickInButton = (x > this.button.xStart &&
        x < this.button.xEnd &&
        y > this.button.yStart &&
        y < this.button.yEnd);

  if (isClickInButton) {
    this.button.action();
  }
};

module.exports = ModalMessage;
