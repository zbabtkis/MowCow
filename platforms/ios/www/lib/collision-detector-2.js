function CollisionDetector(options) {
  this.entities = {};
  this.entityMap = {};
}

CollisionDetector.prototype.detectCollisions = function(entity) {
  var _this = this,
      a = this.entityMap[entity.id],
      aId = entity.id;;

  _.forEach(this.entityMap, function(b, bId) {
    if (b) {
      var bEnt = _this.entities[bId],
          isOverlapping = (
            a.min[0] < b.max[0] &&
            a.min[1] < b.max[1] &&
            a.max[0] > b.min[0] && 
            a.max[1] > b.min[1]
          );

      if(isOverlapping && b !== a) {
        bEnt.onCollision(entity);

        // currently it is more important that
        // an entity responds after something it hits
        // this is bad
        entity.onCollision(bEnt);
      }
    }
  });
};

CollisionDetector.prototype.removeEntityFromMatrix = function(entity, previousCoordinates) {
  return this;
};

CollisionDetector.prototype.addEntityToMatrix = function(entity, coordinates) {
  return this;
};

CollisionDetector.prototype.updateEntityPosition = function(entity) {
  this.entityMap[entity.id] = this.getAABB(entity);
  this.detectCollisions(entity);
};

CollisionDetector.prototype.getAABB = function(entity) {
  return {
    min: [
      entity.x,
      entity.y
    ],
    max: [
      entity.x + entity.options.width,
      entity.y + entity.options.height
    ]
  };
};

CollisionDetector.prototype.untrackCollisions = function(entity) {
  delete this.entities[entity.id];
  delete this.entityMap[entity.id];
};

CollisionDetector.prototype.trackCollisions = function(entity) {
  this.entities[entity.id] = entity;
  entity.onChange('x y', _.bind(this.updateEntityPosition, this, entity));
  this.updateEntityPosition(entity);
};

CollisionDetector.prototype.reset = function() {
  this.entities = {};
  this.entityMap = {};
}

module.exports = CollisionDetector;
