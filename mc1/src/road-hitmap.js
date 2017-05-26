var RoadHitmap = function RoadHitMap(partMap, rawData) {
  this.parkMap = partMap;
  this.rawData = rawData;
  this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
  this.visitedCells = {};

};

RoadHitmap.prototype.getVisitsByTimePeriod = function getVisitsByTimePeriod (endTime, startTime) {
    let startTimeInMiliseconds = startTime.getTime();
    let endTimeInMiliseconds = endTime.getTime();

    let tmpRecord;
    let tmpCarObject;
    let myVisits = {};
    let carId;
    let timeStamp;

    let colorFunction = d3.scaleOrdinal(d3.schemeCategory10);


    for(let i=0; i< this.rawData.length; i++) {
        tmpRecord = this.rawData[i];

        carId = tmpRecord['car-id'];
        timeStamp = this.parseTime(tmpRecord['Timestamp']);
        if (!(timeStamp.getTime() > startTimeInMiliseconds && timeStamp.getTime() < endTimeInMiliseconds)) {
            continue;
        }

        if (!myVisits.hasOwnProperty(carId)) {
            tmpCarObject = new Object();
            tmpCarObject.carId = tmpRecord['car-id'];
            tmpCarObject.carType = tmpRecord['car-type'];
            let colorIdx = tmpCarObject.carType;
            tmpCarObject.color = tmpCarObject.carType == '2P' ? '#000000' : colorFunction(colorIdx);

            tmpCarObject.path = [];
            myVisits[carId] = tmpCarObject;
        }
        else {
            tmpCarObject = myVisits[carId];
        }

        tmpCarObject.path.push({time: timeStamp, gate: tmpRecord['gate-name']});
    }

    return myVisits;
};

RoadHitmap.prototype.getVisitedRoadCells = function getVisitedRoadCells (visits) {

    let visit;
    let visitedRoadCells = {};
    let self = this;
    let startGate;
    let endGate;

    let steps;
    let cellPos;
    let tmpCell;

    let baseColor = hexToRgb(MapPoint.BACKGROUND, 0.1);
    for(let carId in visits) {
        if (!visits.hasOwnProperty(carId)) {
            continue;
        }

        visit = visits[carId];
        for(let i=0; i< visit.path.length - 1; i++) {
            startGate = visit.path[i].gate;
            endGate = visit.path[i+1].gate;

            steps = self.parkMap.findSinglePathByName(startGate, endGate);
            steps.pop();
            steps.shift();

            steps.forEach(function (cell) {
                cellPos = cell.getPos();
                if (!visitedRoadCells.hasOwnProperty(cellPos)) {
                    visitedRoadCells[cellPos] = {
                        count: 0
                    };
                }

                tmpCell = visitedRoadCells[cellPos];
                tmpCell.count ++;

                if (!!tmpCell.color) {
                    baseColor = tmpCell.color;
                }
                tmpCell.color = mergeTwoRGBs(baseColor, hexToRgb(visit.color, 0.1));

            });

        }
    }

    return visitedRoadCells;
};

RoadHitmap.prototype.renderVisits = function renderVisits (endTime, startTime) {

    if (!endTime) {
        endTime =  '2015-05-1 23:59:59';
        // endTime =  '2016-05-31 23:56:06';

    }

    if (!startTime) {
        startTime =  '2015-05-01 00:00:01';
    }

    let self = this;
    endTime = this.parseTime(endTime);
    startTime = this.parseTime(startTime);

    let visitsInThisPeriod = this.getVisitsByTimePeriod(endTime, startTime);
    let visitedCells = this.getVisitedRoadCells(visitsInThisPeriod);

    debugger;

    Object.keys(visitedCells).forEach(function (pos) {
        let cellData = visitedCells[pos];
        // do something with key or value

        self.parkMap.highLightOneCellAtPos(pos, rgbToHex(cellData.color[0], cellData.color[1], cellData.color[2]), cellData.color[3]);

    });
};

