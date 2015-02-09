var gameSettings = {
  width: window.innerWidth,
  height: window.innerHeight,

  // displays current stats about the level
  statusBar: {

    // height of the status bar that runs along the bottom
    bottomHeight: 0,

    // width of the status bar that runs along the right side
    sideWidth: 0
  },

  // a tile is a pixel in the game
  tile: {
    width: 50,
    height: 50
  }
};

// how many tiles can be rendered along the X and Y axis of the game board
gameSettings.width -= gameSettings.width % gameSettings.tile.width;
gameSettings.height -= gameSettings.height % gameSettings.tile.height;

// calculate how many tiles can be displayed along the X and Y axis
gameSettings.horizontalTiles = gameSettings.width / gameSettings.tile.width;
gameSettings.verticalTiles = gameSettings.height / gameSettings.tile.height;

module.exports = gameSettings;
