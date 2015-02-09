var Sprite = require('../../lib/sprite'),
    gameSettings = require('../settings.js');

var MowerSprite = new Sprite('assets/mower.gif', gameSettings.tile.width, gameSettings.tile.height)
  .defineAction('goUp', [{
    offsetX: 0,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }])
  .defineAction('goLeft', [{
    offsetX: 50,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }])
  .defineAction('goDown', [{
    offsetX: 100,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }])
  .defineAction('goRight', [{
    offsetX: 150,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }]);

module.exports = MowerSprite;
