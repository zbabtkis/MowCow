var ContinuousSwipeController = require('../../lib/continuous-swipe-controller'),
    Cow = require('../../lib/cow'),
    CowSprite = require('../sprites/cow-sprite'),
    RandomController = require('../../lib/random-controller'),
    Level = require('../../lib/level'),
    LevelHelpers = require('../level-helpers');

new Level(function(gameWorld, gameSettings) {
  var enemy1,
      enemy2,
      enemy3;

  gameWorld.set('level', 2);
  gameWorld.set('title', 'Tipping Point');

  var level2Message = LevelHelpers.generateLevelMessage(gameSettings, gameWorld);

  LevelHelpers.generateLevelWeapons(gameSettings, gameWorld, 5);
  LevelHelpers.generateLevelTiles(gameSettings, gameWorld);

  enemy1 = new Cow({
    x: 100,
    y: 200
  },{
    width: 50,
    height: 50,
    sprite: CowSprite
  });
  
  enemy2 = new Cow({
    x: 400,
    y: 50
  },{
    width: 50,
    height: 50,
    sprite: CowSprite
  });

  enemy3 = new Cow({
    x: 200,
    y: 450
  },{
    width: 50,
    height: 50,
    sprite: CowSprite
  });
  
  new RandomController()
    .controlEntity(enemy1);
  new RandomController()
    .controlEntity(enemy2);
  new RandomController()
    .controlEntity(enemy3);

  new ContinuousSwipeController()
    .controlEntity(me);
  
  gameWorld
    .addObject(me)
    .addObject(enemy1)
    .addObject(enemy2)
    .addObject(enemy3)
    .addObject(level2Message)
    .addObject(statsBar);

  level2Message
    .slide();
});
