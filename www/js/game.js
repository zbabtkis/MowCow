var Level = require('../lib/level'),
    Renderer = require('../lib/renderer'),
    Sprite = require('../lib/sprite'),
    World = require('../lib/world'),
    gameSettings = require('./settings'),
    gameWorld;

gameWorld = new World(document.getElementById('my-game'), {
  width: gameSettings.width,
  height: gameSettings.height
});

Level.useWorld(gameWorld);
Level.configure(gameSettings);

require('./levels/level_1');
require('./levels/level_2');

Sprite.preloadSprites(function() {
  Level
    .current()
    .run();
  new Renderer(gameWorld, document.body)
    .render();
});
