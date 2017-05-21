var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';

var mapSvg = d3.select('body').select('#map')
    .append('svg')
        .attr('width', MAP_WIDTH * 11)
        .attr('height', MAP_HEIGHT * 11)
    ;


Util.createMapByteData(MAP_WIDTH, MAP_HEIGHT, mapFile, function (mapByteData) {
    var parkMap = new ParkMap(mapByteData);
    parkMap.render(mapSvg);


});



