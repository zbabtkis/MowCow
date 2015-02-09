describe('Controller', function() {
  var Controller = require('../lib/controller');

  describe('#controlEntity()', function() {
    it('should add en entity to its registry', function() {
      var myController = new Controller();

      myController.controlEntity({});

      expect(myController.entities.length).toEqual(1);
    });
  });
})
