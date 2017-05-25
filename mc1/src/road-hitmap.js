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

    let self = this;
    endTime = this.parseTime(endTime);
    startTime = this.parseTime(startTime);

    let visitsInThisPeriod = this.getVisitsByTimePeriod(endTime, startTime);

    let roadSvg = this.parkMap.getSvg();

    roadSvg.selectAll('visit-overlay-traffic').data(visitsInThisPeriod).enter()
        .append('g')
        .attr('class', 'visit-overlay-traffic')
        .each(function (visit) {

            let steps;
            let startCarPoint;
            let endCarPoint;

            for(let i=0; i < visit.temporalPath.length - 1; i++) {
                startCarPoint = visit.temporalPath[i];
                endCarPoint = visit.temporalPath[i+1];
                steps = self.parkMap.findSinglePathByName(startCarPoint.getMapPoint().getName(), endCarPoint.getMapPoint().getName());
                steps.pop(); // remove start
                steps.shift(); // remove end


                d3.select(this).selectAll('.overlay-road-cell').data(steps).enter()
                    .append('rect')
                    .attr('class', 'overlay-road-cell')
                    .attr('x', function (mapPoint) {
                        return mapPoint.x;
                    })
                    .attr('y', function (mapPoint) {
                        return mapPoint.y;
                    })
                    .attr('width', ParkMap.CELL_WIDTH)
                    .attr('height', ParkMap.CELL_HEIGHT)
                    .attr('fill', visit.color)
                    .style('opacity', 0.1)
                ;
            }
        })
    ;
};

