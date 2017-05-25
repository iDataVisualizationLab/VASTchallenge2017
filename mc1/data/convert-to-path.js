var fs = require('fs');
var parse = require('csv-parse');
var jsonfile = require('jsonfile');



var file = 'Lekagul Sensor Data.csv';
var mappingUniprotToMgi = {};

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

            // time = csvrow[0];
            // carId = csvrow[1];
            // tmpGateName = csvrow[3];
            // // gate timestamp record
            // tmpGateTime = {};
            // tmpGateTime[tmpGateName] = time;
            //
            // if (!myCar.hasOwnProperty(carId)) {
            //     tmpCar = new Object();
            //     tmpCar.carId = carId;
            //     tmpCar.carType = csvrow[2];
            //     tmpCar.path = [];
            //     tmpCar.enter = false;
            //     tmpCar.exit = false;
            //
            //     myCar[carId] = tmpCar;
            // }
            //
            // tmpCar = myCar[carId];
            // if (tmpCar.path.length < 1 && (tmpCar.carType != '2P' && !tmpGateName.startsWith('entrance') || tmpCar.carType == '2P' && !tmpGateName.startsWith('ranger-base') )) {
            //     console.error('This car has not entered the park. carId=' + tmpCar.carId + "; time=" + tmpCar.time);
            //     outliner[tmpCar.carId] = tmpCar;
            // }
            //
            // // ignore outliner
            // if (outliner.hasOwnProperty(carId)) {
            //     console.error('This car is in outlier list. id=' + carId);
            //     return;
            // }
            //
            // // add current hop to path
            // tmpCar.path.push(tmpGateTime);
            // if (tmpCar.carType != '2P' && tmpGateName.startsWith('entrance') || tmpCar.carType == '2P' && tmpGateName.startsWith('ranger-base') ) {
            //     if (tmpCar.exit) {
            //         throw new Error('Car has already exit. Invalid data processing for car id: ' + carId);
            //     }
            //
            //     if (tmpCar.enter) {
            //         tmpCar.exit = true;
            //     }
            //     else {
            //         tmpCar.enter = true;
            //     }
            // }
            //
            // if (!myCarData.hasOwnProperty(tmpCar.carType)) {
            //     myCarData[tmpCar.carType] = [];
            // }
            //
            // cars = myCarData[tmpCar.carType];
            // if (tmpCar.exit) {
            //     cars.push(myCar[carId]);
            //     delete myCar[carId];
            // }

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
                myCar[carId] = tmpCar;
            }

            tmpCar = myCar[carId];
            // add current hop to path
            tmpCar.path.push(tmpGateTime);
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

readExistingSensorData();

