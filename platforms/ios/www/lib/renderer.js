/**
 * Runs a render loop
 *
 * @class Renderer
 * @param {World} world A world to render
 * @param {HTMLElement} rootNode Element to install game in
 */
var Renderer = function(world, rootNode) {
  this.world = world;
  rootNode.appendChild(this.world.el);
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
  
  requestAnimationFrame(this.render.bind(this));
  
  return this;
};

module.exports = Renderer;
