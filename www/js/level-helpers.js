var Explosive = require('../lib/explosive'),
    Grass = require('../lib/grass'),
    HeatBomb = require('./sprites/heat-bomb'),
    SlidingText = require('../lib/sliding-text');

/** @namespace LevelHelpers */

/**
 * Generate a message for the given level
 *
 * @function generateLevelMessage
 * @memberof LevelHelpers
 * @param {Object} gameSettings Settings for game
 * @param {World} gameWorld A game world to add tiles to
 */
function generateLevelMessage(gameSettings, gameWorld) {
  return new SlidingText({
    x: gameSettings.width,
    y: gameSettings.height / 2
  }, {
    fontFamily: 'Helvetica',
    fontSize: 50,
    color: '#ecf0f1',
    title: 'Level ' + gameWorld.level,
    message: gameWorld.title
  });
}

exports.generateLevelMessage = generateLevelMessage;

/**
 * Add tiles to game level
 *
 * @function generateLevelTiles
 * @memberof LevelHelpers
 * @param {Object} gameSettings Settings for game
 * @param {World} gameWorld A game world to add tiles to
 */
function generateLevelTiles(gameSettings, gameWorld) {
    // iterate through horizontal tile columns
    _.range(0, gameSettings.width, gameSettings.tile.width)
      .forEach(function(x) {

        // iterate through vertical tile rows
        _.range(0, gameSettings.height, gameSettings.tile.height)
          .forEach(function(y) {

            // add a tile of grass to the X,Y coordinate
            gameWorld.addObject(new Grass({
              x: x,
              y: y
            }, {
              color: '#16a085',
              width: gameSettings.tile.width,
              height: gameSettings.tile.height,
              canCollide: false
            }));
          });
      });
}

exports.generateLevelTiles = generateLevelTiles;

/**
 * Add weapons to gameworld for a level
 *
 * @function generateLevelWeapons
 * @memberof LevelHelpers
 * @param {Object} gameSettings Game settings
 * @param {World} gameWorld Game World to add tiles to
 * @param {Integer} weaponCount Number of weapons to add
 */
function generateLevelWeapons(gameSettings, gameWorld, weaponCount) {
  // generate 3 weapons randomy placed on game board
  _.times(3, function() {

    // random X,Y tile coordinates to place weapon
    var x = Math.round(Math.random() * (gameSettings.horizontalTiles + 1)) * gameSettings.tile.width,
        y = Math.round(Math.random() * (gameSettings.verticalTiles + 1)) * gameSettings.tile.height;

    // add new explosive to board
    gameWorld.addObject(new Explosive({
      x: x,
      y: y
    }, {
      width: gameSettings.tile.width,
      height: gameSettings.tile.height,
      sprite: HeatBomb,
      type: 'Heat Sensing Bomb'
    }));
  });
}

exports.generateLevelWeapons = generateLevelWeapons;
