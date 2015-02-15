var ContinuousSwipeController = require('../../lib/continuous-swipe-controller'),
    CowSprite = require('../sprites/cow-sprite'),
    Cow = require('../../lib/cow'),
    LevelHelpers = require('../level-helpers'),
    Level = require('../../lib/level'),
    RandomController = require('../../lib/random-controller'),
    StatsBar = require('../../lib/stats-bar');

var me = require('../singletons/me');

new Level(function(gameWorld, gameSettings) {
  var cowSettings = {
        height: gameSettings.tile.height,
        sprite: CowSprite,
        width: gameSettings.tile.width
      },
      levelStats = new StatsBar({
        x: 10,
        y: gameSettings.height - 10
      }, {}),
      level1Message,
      enemy1,
      enemy2;

  levelStats
    .trackStat('Lives', me, 'lives')
    .trackStat('Level', gameWorld, 'level')
    .trackStat('Weapon', me, 'weapon', 'weapon.type');

  gameWorld
    .set('level', 1)
    .set('title', 'Kranky Kows');

  // Generate a message to display at the beginning
  // of the level
  level1Message = LevelHelpers
    .generateLevelMessage(gameSettings, gameWorld);

  // Add 3 weapons to the world
  LevelHelpers
    .generateLevelWeapons(gameSettings, gameWorld, 3);

  // Add grass to the level
  LevelHelpers
    .generateLevelTiles(gameSettings, gameWorld);

  enemy1 = new Cow({
    x: gameSettings.tile.width * 3,
    y: gameSettings.tile.height * 4
  }, cowSettings);

  enemy2 = new Cow({
    x: gameSettings.tile.width * 5,
    y: gameSettings.tile.height * 2
  }, cowSettings);

  // User changes character direction by swiping
  new ContinuousSwipeController()
    .controlEntity(me);

  // Control enemy with stupid AI controller
  new RandomController()
    .controlEntity(enemy1);

  new RandomController()
    .controlEntity(enemy2);

  // Add enemies to world
  gameWorld
    .addObject(me)
    .addObject(enemy1)
    .addObject(enemy2)
    .addObject(levelStats);

  // Show the opening message after 1 second
  setTimeout(function() {
    gameWorld.addObject(level1Message);
    level1Message.slide();
  }, 1000);

  var isLevelComplete = gameWorld.onRemoveObject(function(entity) {
    function isEntityNotGrass(e) {
      return !(e instanceof Grass);
    }

    // If main character has mowed all the grass
    if(gameWorld.entities.length < 10 && _.every(gameWorld.entities, isEntityNotGrass)) {
      gameWorld.offRemoveObject(isLevelComplete);

      // Reset main character position
      me.x = 0;
      me.y = 0;

      gameWorld.reset();

      // Advance to the next level
      Level
        .next()
        .run();
    }
  });
});

