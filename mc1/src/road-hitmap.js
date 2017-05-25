var RoadHitmap = function RoadHitMap(partMap, visits) {
  this.parkMap = partMap;
  this.visits = visits;
};

RoadHitmap.prototype.renderVisits = function renderVisits (endTime, startTime) {

    if (endTime) {
        endTime =  '2015-05-01 00:43:28';
    }

    if (!startTime) {
        startTime =  '2015-05-01 00:43:28';
    }

    let visitsInThisPeriod = this.visits.filter(function (visit) {

    });
};

