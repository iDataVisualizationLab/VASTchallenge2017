var RoadHitmap = function RoadHitMap(partMap, visits) {
  this.parkMap = partMap;
  this.visits = visits;
  this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

};

RoadHitmap.prototype.getVisitsByTimePeriod = function getVisitsByTimePeriod (endTime, startTime) {
    let startTimeInMiliseconds = startTime.getTime();
    let endTimeInMiliseconds = endTime.getTime();

    let visitsInThisPeriod = [];
    let tmpVisit;
    let tmpPath;

    for(let i=0; i< this.visits.length; i++) {
        tmpVisit = this.visits[i];
        tmpPath = tmpVisit.path.filter(function (carPoint) {

            let pointTime = carPoint.getTimeInMiliseconds();

            return pointTime > startTimeInMiliseconds && pointTime < endTimeInMiliseconds;
        });

        if (tmpPath.length > 0) { // has overlap

            tmpVisit.temporalPath = tmpPath;
            visitsInThisPeriod.push(tmpVisit);
        }
    }

    return visitsInThisPeriod;
};

RoadHitmap.prototype.renderVisits = function renderVisits (endTime, startTime) {

    if (!endTime) {
        endTime =  '2015-05-02 16:56:18';
    }

    if (!startTime) {
        startTime =  '2015-05-01 00:43:28';
    }

    endTime = this.parseTime(endTime);
    startTime = this.parseTime(startTime);

    let visitsInThisPeriod = this.getVisitsByTimePeriod(endTime, startTime);

    debugger;
};

