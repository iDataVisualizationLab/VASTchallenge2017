var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';

let mapData = Util.createMapByteData(MAP_WIDTH, MAP_HEIGHT, mapFile);
var parkMap = new ParkMap(mapData);

debugger;

