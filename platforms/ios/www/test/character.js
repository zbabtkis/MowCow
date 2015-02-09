describe('Character', function() {
  var Character = require('../lib/character.js');

  it('should start with cycle distance of 5', function() {
    var character = new Character();

    expect(character.distancePerCycle).toEqual(5);
  });
});
