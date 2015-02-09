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
  Level._current++;
  return Level.current();
};

Level.current = function() {
  return Level._levels[
    Level._current
  ]
};

module.exports = Level;
