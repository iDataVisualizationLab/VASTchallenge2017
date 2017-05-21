var MAP_WIDTH = 200;
var MAP_HEIGHT = 200;
var mapFile = 'data/Lekagul Roadways.bmp';

var mapSvg = d3.select('body').select('#map')
    .append('svg')
        .attr('width', MAP_WIDTH * (ParkMap.CELL_WIDTH + 1))
        .attr('height', MAP_HEIGHT * (ParkMap.CELL_HEIGHT + 1))
    ;


Util.createMapByteData(MAP_WIDTH, MAP_HEIGHT, mapFile, function (mapByteData) {
    var parkMap = new ParkMap(mapByteData, mapSvg);
    parkMap.render(true);

    let path = parkMap.findSinglePathByName("entrance4", "entrance2");

    parkMap.highLightPath(path);

});


d3.json("data/all-car-path.json", function(error, paths) {

    debugger;
});
