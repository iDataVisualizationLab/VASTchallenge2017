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

RoadHeatmap.prototype.getVisitedRoadCellHeatMap = function getVisitedRoadCellHeatMap (lines) {

    let visitedRoadCells = {};
    let tmpCell;

    let baseColor = hexToRgb(MapPoint.BACKGROUND, 0.1);

    lines.forEach(function (line) {

        let lineColor = line.context.color;
        line.data.forEach(function (carPoint) {

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

                 tmpCell.color = mergeTwoRGBs(baseColor, hexToRgb(lineColor, 0.1));
            });
        });
    });

    return visitedRoadCells;
};

RoadHeatmap.prototype.renderHeatMap = function renderHeatMap (lines, endTime, startTime) {
    if (!endTime) {
        endTime = '2015-05-1 23:59:59';

    }

    if (!startTime) {
        startTime = '2015-05-01 00:00:01';
    }

    let self = this;
    self.parkMap.clearRoad();

    let cellColors = this.getVisitedRoadCellHeatMap(lines);

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