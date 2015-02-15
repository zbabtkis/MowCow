var gameSettings = require('../settings'),
    Mower = require('../../lib/mower'),
    ModalMessage = require('../../lib/modal-message'),
    Level = require('../../lib/level');

var me = new Mower({
  x: 0,
  y: 0
}, {
  width: gameSettings.tile.width,
  height: gameSettings.tile.height,
  sprite: require('../sprites/mower-sprite')
});

me.onChange('lives', function() {
  if(me.lives <= 0) {
    var message = new ModalMessage('Game Over')
      .addButton('Reset Level', function() {
        me.reset();
        gameWorld.reset();

        // Restart the current level
        Level
          .current()
          .run();
      });

    // Add modal to the world
    me.gameWorld.addObject(message);

    // Remove dead character from the world
    return me.gameWorld.removeObject(me);
  }
});

module.exports = me;
