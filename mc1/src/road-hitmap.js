var RoadHeatmap = function RoadHeatmap(partMap, rawData) {
  this.parkMap = partMap;
  this.rawData = rawData;
  this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
  this.visitedCells = {};

};
//
// RoadHitmap.prototype.getVisitsByTimePeriod = function getVisitsByTimePeriod (endTime, startTime) {
//     let startTimeInMiliseconds = startTime.getTime();
//     let endTimeInMiliseconds = endTime.getTime();
//
//     let tmpRecord;
//     let tmpCarObject;
//     let myVisits = {};
//     let carId;
//     let timeStamp;
//
//     let colorFunction = d3.scaleOrdinal(d3.schemeCategory10);
//
//
//     for(let i=0; i< this.rawData.length; i++) {
//         tmpRecord = this.rawData[i];
//
//         carId = tmpRecord['car-id'];
//         timeStamp = this.parseTime(tmpRecord['Timestamp']);
//         if (!(timeStamp.getTime() > startTimeInMiliseconds && timeStamp.getTime() < endTimeInMiliseconds)) {
//             continue;
//         }
//
//         if (!myVisits.hasOwnProperty(carId)) {
//             tmpCarObject = new Object();
//             tmpCarObject.carId = tmpRecord['car-id'];
//             tmpCarObject.carType = tmpRecord['car-type'];
//             let colorIdx = tmpCarObject.carType;
//             tmpCarObject.color = tmpCarObject.carType == '2P' ? '#000000' : colorFunction(colorIdx);
//
//             tmpCarObject.path = [];
//             myVisits[carId] = tmpCarObject;
//         }
//         else {
//             tmpCarObject = myVisits[carId];
//         }
//
//         tmpCarObject.path.push({time: timeStamp, gate: tmpRecord['gate-name']});
//     }
//
//     return myVisits;
// };

/**
 *
 * @param lines
 * @param fullPath: boolean: get all cells of full path or context path. Context path depends on time
 * @return {{}}
 */
RoadHeatmap.prototype.getVisitedRoadCellHeatMap = function getVisitedRoadCellHeatMap (lines, options) {

    let visitedRoadCells = {};
    let tmpCell;

    if (!options) {
        options = {};
    }

    if (!options.hasOwnProperty('alpha')) {
        options.alpha = 0.1;
    }

    let baseColor = hexToRgb(MapPoint.BACKGROUND, options.alpha);

    lines.forEach(function (line) {

        let lineColor = line.context.color;
        let paths = !!options.fullPath ? line.context.path : line.data;
        paths.forEach(function (carPoint) {

            if (!carPoint.path) {
                return;
            }

            carPoint.path.forEach(function (cellPos, index) {

                 if (index >= carPoint.path.length-1) { // ignore last point because it is sensor position which has color on map already
                     return;
                 }

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

                 tmpCell.color = mergeTwoRGBs(baseColor, hexToRgb(lineColor, options.alpha));
            });
        });
    });

    return visitedRoadCells;
};

RoadHeatmap.prototype.renderHeatMap = function renderHeatMap (lines, options) {

    if (!options) {
        options = {};
    }
    if (!options.endTime) {
        options.endTime = '2015-05-1 23:59:59';

    }

    if (!options.startTime) {
        options.startTime = '2015-05-01 00:00:01';
    }

    if (!options.hasOwnProperty('fullPath')) {
        options.fullPath = false;
    }

    let self = this;
    self.parkMap.clearRoad();

    let cellColors = this.getVisitedRoadCellHeatMap(lines, options);

    let hexColor;
    let tmpCellColor;

    for(let pos in cellColors) {
        if (!cellColors.hasOwnProperty(pos)) {
            continue;
        }

        tmpCellColor = cellColors[pos];
        hexColor = rgbToHex(tmpCellColor.color[0], tmpCellColor.color[1], tmpCellColor.color[2]);

        self.parkMap.highLightOneCellAtPos(pos, hexColor, tmpCellColor.color[3]);
    }


};

RoadHeatmap.prototype.renderVisitHeatMap = function renderVisitHeatMap (lines) {

    let self = this;

    this.updateVisitCount(lines);

    self.parkMap.renderStopHeatMap();

};

RoadHeatmap.prototype.updateVisitCount = function renderVisitHeatMap (lines) {

    let self = this;

    self.parkMap.resetStopCount();

    lines.forEach(function (l) {

        let path = l.context.path;

        path.forEach(function (cp, index) {
            if (index > 0) {
                let preidx = index - 1;
                let prePoint = path[preidx];
                let mp = cp.getMapPoint();

                if (prePoint.getGate() == cp.getGate()) {
                    // stop point
                    mp.increaseStopCount();

                }
            }
        });


    });
};