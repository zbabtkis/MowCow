/**
 * A movable game entity
 *
 * @class Character
 * @param {Object} location Initail coordinates in the game
 * @param {Integer} location.x x-coordinate for character to start in
 * @param {Integer} location.y y-coordinate for character to start in
 * @param {Object} css Css rules to apply to character
 */
var Character = function(location, css) {
  this.el = document.createElement('div');
  _.assign(this.el.style, css);
  this.el.style.position = 'absolute';
  this.state = {};
  this.x = location.x;
  this.y = location.y;
  this.distancePerCycle = 5;
  this.id = _.uniqueId('character_');
};

/**
 * The character controller
 *
 * @function control
 * @memberof Character#
 * @param {Object} state The control messages being sent
 * @param {Boolean} state.isDirectionUp Whether the character should move up
 * @param {Boolean} state.isDirectionDown Whether the character should move down
 * @param {Boolean} state.isDirectionLeft Whether the character should move left
 * @param {Boolean} state.isDirectionRight Whether the character should move right
 * @return {Character} Instance of this character
 */
Character.prototype.control = function(state) {
  console.log(state);
  if(state.isDirectionUp && this.y > 0) {
    this.y--;
  }
  
  if(state.isDirectionDown && this.y < this.world.height) {
    this.y++;
  }
  
  if(state.isDirectionLeft && this.x > 0) {
    this.x--;
  }
  
  if(state.isDirectionRight && this.y < this.world.width) {
    this.x++;
  }
};

/**
 * Handle a collision with another object
 *
 * @function onCollision
 * @memberof Character#
 * @param {Array<Entity>} state Entities that are touching this character
 * @return {Character} This character instance
 */
Character.prototype.onCollision = function(state) {
  var control = this.control.bind(this),
      _this = this;
  
  this.control = _.noop;
  
  function bounce(speed) {
    var nextSpeed = (speed || 0) + 100;
    this.y--;
    
    if(speed !== 1000) {
      setTimeout(bounce.bind(this, nextSpeed), nextSpeed); 
    } else {
      console.log('control', control);
      this.control = control;
    }
  }
  
  bounce.apply(this);;
};

/**
 * Render the character in the context of the world
 *
 * @function render
 * @memberof Character#
 * @return {Object} X and Y pixel ranges character was rendered in
 * @property {Array<Integer>} x X pixel range
 * @property {Array<Integer>} y Y pixel range
 */
Character.prototype.render = function() {
  this.el.style.left = this.x + 'px';
  this.el.style.top = this.y + 'px';
  
  return {
    x: _.range(this.x, this.x + parseInt(this.el.style.width)),
    y: _.range(this.y, this.y + parseInt(this.el.style.height))
  };
};

/**
 * Make character disappear
 *
 * @function destroy
 * @memberof Character#
 * @return {Character} Instance of this character
 */
Character.prototype.destroy = function() {
  this.el.parentNode.removeChild(this.el);

  return this;
};

module.exports = Character;

/**
 * Controls the movement of an Entity
 *
 * @class Controller
 */
var Controller = function() {
  this.state = {};
  this.entities = [];
};


/**
 * Start controling an entities movement
 *
 * @function controlEntity
 * @memberof Controller#
 * @param {Entity} entity An entity to move
 * @return {Controller} Instance of this controller
 */
Controller.prototype.controlEntity = function(entity) {
  this.entities.push(entity);

  return this;
};

module.exports = Controller;

var Controller = require('./controller');

/**
 * A controller that uses a keyboard direction keys as input
 *
 * @class KeyboardController
 * @extends Controller
 */
var KeyboardController = function() {
  Controller.apply(this, arguments);
  
  window.addEventListener('keyup', this.setControlState.bind(this));
  window.addEventListener('keydown', this.setControlState.bind(this));
};

KeyboardController.prototype = Object.create(Controller.prototype);

KeyboardController.Keys = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
};

/**
 * Set the state of the controller and send it to the entities it controls
 *
 * @function setControllerState
 * @memberof KeyboardController#
 * @param {Object} state The direction state
 * @return {RandomController} Instance of this controller
 */
KeyboardController.prototype.setControlState = function(event) {
  switch (event.which) {
    case KeyboardController.Keys.UP:
      this.state.isDirectionUp = event.type === "keydown";
      break;
    case KeyboardController.Keys.DOWN:
      this.state.isDirectionDown = event.type === "keydown";
      break;
    case KeyboardController.Keys.LEFT:
      this.state.isDirectionLeft = event.type === "keydown";
      break;
    case KeyboardController.Keys.RIGHT:
      this.state.isDirectionRight = event.type === "keydown";
      break;
    default:
      break;
  }
  
  _.invoke(this.entities, 'control', this.state);

  return this;
};

module.exports = KeyboardController;

/**
 * A game level
 *
 * @class Level
 * @param {Function} run Function to run when the level is starting
 */
function Level(run) {
  Level._levels.push(this);
  this.run = run;
}

Level._levels = [];
Level._current = 0;

/**
 * Get the next level in the game
 *
 * @function next
 * @memberof Level
 * @return {Level} Instance of next level
 */
Level.next = function() {
  return Level._levels[
    Level._current+1
  ];
};

module.exports = Level;

var Controller = require('./controller');

/**
 * A controller that controls an entity with random movements
 *
 * @class RandomController
 * @extends Controller
 */
var RandomController = function() {
  var _this = this;
  
  Controller.apply(this, arguments);
  
  this.key = {
    direction: 1
  };
  
  setInterval(this.setControllerState.bind(this, this.key), 40);
  setInterval(this.changeKey.bind(this), 2000);
};

RandomController.Keys = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

RandomController.prototype = Object.create(Controller.prototype);

/**
 * Change the direction of an entity to a random direction
 *
 * @function changeKey
 * @memberof RandomController#
 * @return {RandomController} Instance of this controller
 */
RandomController.prototype.changeKey = function() {
  this.key.direction = Math.floor(Math.random() * 5);

  return this;
};

/**
 * Set the state of the controller and send it to the entities it controls
 *
 * @function setControllerState
 * @memberof RandomController#
 * @param {Object} state The direction state
 * @return {RandomController} Instance of this controller
 */
RandomController.prototype.setControllerState = function(state) {
  this.state = {
    isDirectionUp: state.direction === RandomController.Keys.UP,
    isDirectionDown: state.direction === RandomController.Keys.DOWN,
    isDirectionLeft: state.direction === RandomController.Keys.LEFT,
    isDirectionRight: state.direction === RandomController.Keys.RIGHT
  };
  
  _.invoke(this.entities, 'control', this.state);

  return this;
};

module.exports = RandomController;

/**
 * Runs a render loop
 *
 * @class Renderer
 * @param {World} world A world to render
 */
var Renderer = function(world) {
  this.world = world;
};

/**
 * Start the world render loop
 *
 * @function render
 * @memberof Renderer#
 * @return {Renderer} Instance of this renderer
 */
Renderer.prototype.render = function() {
  this.world.tick();
  
  setTimeout(this.render.bind(this), 40);
  
  return this;
};

module.exports = Renderer;

/**
 * An environment for your characters and entities to live in
 *
 * @class World
 * @param {HTMLElement} el Canvas to render game entities in
 * @param {Object} options Options to configure the game world
 * @param {Integer} options.height Height of game viewport
 * @param {Integer} options.width Width of game viewport
 */
var World = function(el, options) {
  this.el = el;
  
  // Set the size of the canvas
  this.el.style.width = options.width + 'px';
  this.el.style.height = options.height + 'px';
  
  this.entities = [];
  this.options = options;
  this.height = options.height;
  this.width = options.width;
  this.locations = {};
};

/**
 * Add an entity to the game
 *
 * @function addObject
 * @memberof World#
 * @param {Entity} entity An instance of a game entity to render in the game
 * @return {World} This world instance
 */
World.prototype.addObject = function(entity) {
  entity.world = this;
  var coords = entity.render();
  
  this.el.appendChild(entity.el);
  this.entities.push(entity);

  return this;
};

/**
 * Remove an entity from the game
 *
 * @function removeObject
 * @memberof World
 * @param {Entity} entity An entity that exists in the game
 * @return {World} This world instance
 */
World.prototype.removeObject = function(entity) {
  _.remove(this.entities, entity);
  delete this.locations[entity.id];
  entity.destroy();

  return this;
};

/**
 * Render every object in the game and update collision state
 *
 * @function tick
 * @memberof World#
 * @return {World} This world instance
 */
World.prototype.tick = function() {
  var _this = this;
  
  this.entities
    .forEach(function(object) {
      var coords = object.render();

      _this.locations[object.id] = coords;
    });
    
  var objectOverlapState = this.detectOverlappingEntities();
  
  _.forEach(objectOverlapState, function(overlapState, objectId) {
    if(overlapState.length) {
      _.find(_this.entities, {id: objectId})
        .onCollision(overlapState); 
    }
  });

  return this;
};

/**
 * Find entities that are in collision with any entities on the board
 *
 * @function detectOverlappingEntities
 * @memberof World#
 * @return {Hash} Map of entity ids to entities they are in collision with
 */
World.prototype.detectOverlappingEntities = function() {
  var _this = this;
  var overlap = {};
  
  var xs = _.pluck(this.locations, 'x');
  var ys = _.pluck(this.locations, 'y');
  
  _.forEach(xs, function(xRange, xIndex) {
    overlap[_this.entities[xIndex].id] = _.chain(xs)
      .map(function(x2Range) {
        return xRange !== x2Range && _.intersection(xRange, x2Range).length;
      })
      .map(function(isInXRange, index) {
        return isInXRange && ys[xIndex] !== ys[index] && _.intersection(ys[xIndex], ys[index]).length;
      })
      .map(function(isInXYRange, index) {
        return isInXYRange ? index : false;
      })
      .compact()
      .map(function(locationIndex) {
        return _this.entities[locationIndex];
      })
      .value();
  });
  
  return overlap;
};

module.exports = World;
