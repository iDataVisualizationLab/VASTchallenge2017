var fs = require('fs');
var parse = require('csv-parse');
var jsonfile = require('jsonfile');


var PF = require('pathfinding');

var moment = require('moment');
var file = 'Lekagul Sensor Data.csv';

let ignoreHeader = true;
let grid = new PF.Grid(200, 200);
let CELL_WIDTH = 3;
let CELL_HEIGHT = 3;
let SPEED_LIMIT = 25;
let EXTRA_10 = 27.5;
let CELL_WIDTH_IN_MILE = 0.06; // mile

var MapPoint = function (row, column, name, walkable) {
    this.row = +row;
    this.column = +column;
    this.name = name;
    this.walkable = walkable;
};

var mapPointByName = {};

var calculateVelocity = function (fromGateTime, toGateTime) {

    if (fromGateTime.gate == toGateTime.gate) {
        return {velocity: 0, path: null}; // some delay time
    }

    let timeTo = moment(toGateTime.time, 'YYYY-MM-DD HH:mm:ss').toDate();
    let timeFrom = moment(fromGateTime.time, 'YYYY-MM-DD HH:mm:ss').toDate();

    let timeDurationInMiliSecond = timeTo.getTime() - timeFrom.getTime();
    let distance = findSinglePathByName(fromGateTime.gate , toGateTime.gate);
    distance.shift(); // avoid counting current position

    let path = distance.map(function (coords) {
       return coords[0]*200 + coords[1];
    });

    let velocity = distance.length * CELL_WIDTH_IN_MILE * 3600000 / timeDurationInMiliSecond; // mile per hour

    return {velocity: velocity.toFixed(2), path: path};
};

var readExistingSensorData = function() {
    let myCarData = {};
    let myCar = {};

    let ignoreHeader = true;
    let tmpCar;

    let tmpGateName;
    let tmpGateTime;
    let time;
    let carId;
    let outliner = {};
    let cars;

    fs.createReadStream(file)
        .pipe(parse({delimiter: ','}))
        .on('data', function(csvrow, i) {
            if (ignoreHeader) {
                ignoreHeader = false;
                return;
            }

            time = csvrow[0];
            carId = csvrow[1];
            tmpGateName = csvrow[3];
            // gate timestamp record

            tmpGateTime = {
                time: time,
                gate: tmpGateName
            };
            // tmpGateTime[tmpGateName] = time;

            if (!myCar.hasOwnProperty(carId)) {
                tmpCar = new Object();
                tmpCar.carId = carId;
                tmpCar.carType = csvrow[2];
                tmpCar.entranceCount = 0;
                tmpCar.camping = false;
                tmpCar.path = [];
                tmpCar.velocity = 0;
                tmpCar.startTime = time;
                myCar[carId] = tmpCar;
            }

            tmpCar = myCar[carId];
            if (tmpCar.path.length > 0 ) {
                let prePoint = tmpCar.path[tmpCar.path.length-1];
                let velocityAndPath = calculateVelocity(prePoint, tmpGateTime);
                prePoint.velocity = velocityAndPath.velocity;
                prePoint.path = velocityAndPath.path;

                if (!isNaN(prePoint.velocity) && tmpCar.velocity < prePoint.velocity) {
                    tmpCar.velocity = prePoint.velocity;
                }
            }
            // add current hop to path
            tmpCar.path.push( tmpGateTime );
            if (!tmpCar.camping && hasCampingBehavior(tmpCar.path)) {
                tmpCar.camping = true;
            }

            tmpCar.entranceCount = countEntrance(tmpCar.path);

        })
        .on('end',function() {
            let myCarPaths = Object.keys(myCar).map(function (key) {
                return myCar[key];
            });

            jsonfile.writeFile("all-car-path.json", myCarPaths, function (err) {
                console.error(err)
            });
        });

    function hasCampingBehavior(path) {

        let p;
        for (let i=0; i< path.length; i++) {
            p = path[i];
            if (p.gate.startsWith('camping') && i < path.length - 1 && path[i + 1].gate.startsWith('camping')) {
                return true;
            }
        }

        return false;
    }

    function countEntrance(path) {
        let entranceCount = 0;
        path.forEach(function (p) {
            if (p.gate.startsWith('entrance')) {
                entranceCount ++;
            }
        });

        return entranceCount;
    }
};



fs.createReadStream('map-data.csv')
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow, i) {
        if (ignoreHeader) {
            ignoreHeader = false;
            return;
        }

        let mp = new MapPoint(csvrow[0], csvrow[1], csvrow[2], csvrow[3] == 1);
        if (!!mp.name) {
            mapPointByName[mp.name] = mp;
        }

        grid.setWalkableAt(mp.row, mp.column, mp.walkable);
    })
    .on('end',function() {

        readExistingSensorData();

    });


var finder = new PF.AStarFinder();
function findSinglePathByName (fromName, toName) {
    let myGrid = grid.clone();

    let fromPoint = mapPointByName[fromName];
    let toPoint = mapPointByName[toName];

    if (!fromPoint || !toPoint) {
        throw new Error('Invalid name');
    }

    myGrid.setWalkableAt(fromPoint.row, fromPoint.column, true);
    myGrid.setWalkableAt(toPoint.row, toPoint.column, true);

    let paths = finder.findPath(fromPoint.row, fromPoint.column, toPoint.row, toPoint.column, myGrid);

    return paths;
}

//
// function convertPathToMapPoint (path) {
//
//     let self = this;
//     return path.map(function (coords) {
//         if (coords.length != 2) {
//             throw new Error('Invalid point coordinate. Require row amd col vaue');
//         }
//         return self.getMapPoint(coords[0], coords[1]);
//     })
// }
//
// function getMapPoint (row, col) {
//
//     if (row < 0 || row >= this.mapPoints.length) {
//         throw new Error('Invalid row index');
//     }
//
//     let rowItems = this.mapPoints[row];
//     if (col < 0 || col >= rowItems.length) {
//         throw new Error('Invalid col index');
//     }
//
//     return rowItems[col];
// };
//
//
