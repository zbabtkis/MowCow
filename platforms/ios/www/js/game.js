var AcelerometerController = require('../lib/accellerometer-controller'),
    Character = require('../lib/character'),
    ContinuousSwipeController = require('../lib/continuous-swipe-controller'),
    Cow = require('../lib/cow'),
    Entity = require('../lib/entity'),
    Explosive = require('../lib/explosive'),
    Grass = require('../lib/grass.js'),
    KeyboardController = require('../lib/keyboard-controller'),
    Level = require('../lib/level'),
    LevelHelpers = require('./level-helpers'),
    ModalMessage = require('../lib/modal-message'),
    Mower = require('../lib/mower'),
    RandomController = require('../lib/random-controller'),
    Renderer = require('../lib/renderer'),
    SlidingText = require('../lib/sliding-text'),
    Sprite = require('../lib/sprite.js'),
    StatsBar = require('../lib/stats-bar'),
    SwipeController = require('../lib/swipe-controller.js'),
    World = require('../lib/world');

var gameSettings = require('./settings');

var BasicCow = new Sprite('assets/cow_hide_1.jpg', gameSettings.tile.width, gameSettings.tile.height);

function _bootstrapGame() {
  var gameWorld = new World(document.getElementById('my-game'), {
    width: gameSettings.width,
    height: gameSettings.height
  });

  var gameRenderer = new Renderer(gameWorld, document.body);

  var me = new Mower({
    x: 0,
    y: 0
  }, {
    width: gameSettings.tile.width,
    height: gameSettings.tile.height,
    sprite: require('./sprites/mower-sprite')
  });

  me.onChange('lives', function() {
    console.log(me.lives);
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
      gameWorld.addObject(message);

      // Remove dead character from the world
      return gameWorld.removeObject(me);
    }
  });


  var meController;

//  if(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
//    meController = new AcelerometerController();
//  } else {
//    meController = new KeyboardController();
//  }
  meController = new ContinuousSwipeController();

  var statsBar = new StatsBar({
    x: 10,
    y: gameSettings.height - 10
  }, {});

  statsBar.trackStat('Lives', me, 'lives');
  statsBar.trackStat('Level', gameWorld, 'level');
  statsBar.trackStat('Weapon', me, 'weapon', 'weapon.type');

  var level1 = new Level(function() {
    var level1Message;

    gameWorld.set('level', 1);
    gameWorld.set('title', 'Kranky Kows');

    level1Message = LevelHelpers.generateLevelMessage(gameSettings, gameWorld);

    LevelHelpers.generateLevelWeapons(gameSettings, gameWorld, 3);
    LevelHelpers.generateLevelTiles(gameSettings, gameWorld);

    var enemy1 = new Cow({
      x: gameSettings.tile.width * 3,
      y: gameSettings.tile.height * 4
    },{
      width: gameSettings.tile.width,
      height: gameSettings.tile.height,
      sprite: BasicCow
    });

    var enemy2 = new Cow({
      x: gameSettings.tile.width * 5,
      y: gameSettings.tile.height * 2
    },{
      width: gameSettings.tile.width,
      height: gameSettings.tile.height,
      sprite: BasicCow
    });

    meController.controlEntity(me);

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
      .addObject(statsBar);

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

  var level2 = new Level(function() {
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
      sprite: BasicCow
    });
    
    enemy2 = new Cow({
      x: 400,
      y: 50
    },{
      width: 50,
      height: 50,
      sprite: BasicCow
    });

    enemy3 = new Cow({
      x: 200,
      y: 450
    },{
      width: 50,
      height: 50,
      sprite: BasicCow
    });
    
    new RandomController()
      .controlEntity(enemy1);
    new RandomController()
      .controlEntity(enemy2);
    new RandomController()
      .controlEntity(enemy3);

    // reattach controller
    meController
      .controlEntity(me);
    
    gameWorld
      .addObject(me)
      .addObject(enemy1)
      .addObject(enemy2)
      .addObject(enemy3)
      .addObject(level2Message)
      .addObject(statsBar);

    level2Message.slide();
  });

  Sprite.preloadSprites(function() {
    level1.run();
    gameRenderer.render();
  });
}

_bootstrapGame();
