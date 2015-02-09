var gameSettings = require('../settings'),
    Sprite = require('../../lib/sprite');

module.exports = new Sprite('assets/heatbomb.gif', gameSettings.tile.width * 2, gameSettings.tile.height)
  .defineAction('active', [{
    offsetX: 50,
    offsetY: 0,
    width: gameSettings.tile.width,
    height: gameSettings.tile.height
  }]);
