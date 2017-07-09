'use strict';

class ChemicalChart2D extends Chart2D {
    constructor(divId, width, height, options) {
        super(divId, width, height, options);

    }

    handleOption(options) {
        options = super.handleOption(options);
        options.margin.left = 60;
        options.margin.bottom = 70;

        return options;
    }

    setData(chemicalName, chemicalData) {

        let self = this;

        let sensorLines = {};
        let sensor;
        let sensorLine, preS, preT, time, end;
        let preSensorData = {};

        let xDomain = d3.extent(chemicalData, function (d) {
            return d.getTime().getTime();
        });

        let yDomain = d3.extent(chemicalData, function (d) {
            return d.getReading();
        });

        this.setXDomain(xDomain[0], xDomain[1]);
        this.setYDomain(-1* yDomain[1], yDomain[1]);


        chemicalData.forEach(function (sensorData, index) {
            sensor = sensorData.getSensor();
            if (!sensorLines.hasOwnProperty(sensor)) {
                sensorLines[sensor] = [];
            }

            sensorLine = sensorLines[sensor];

            preS = preSensorData[sensor];
            if (!!preS) {
                time = new Date(preS.getTime());
                end = sensorData.getTime().getTime();
                // push missing time value
                do {
                    time.setHours(time.getHours() + 1);
                    if (time >= end) {
                        break;
                    }

                    sensorLine.push(new SensorReading(chemicalName, sensor, new Date(time.getTime()), -yDomain[1]));

                }
                while(true);
            }

            sensorLine.push(sensorData);

            preSensorData[sensor] = sensorData;
        });


        let colorFunction = d3.scaleOrdinal(d3.schemeCategory10);

        Object.keys(sensorLines).forEach(function (sensor, index) {
            sensorLine = sensorLines[sensor];
            self.addData({id: sensor, color: colorFunction(index), chemical: chemicalName}, sensorLine, 'time', 'reading');

        });
    }

    render(events) {
        super.render(events);

        super.renderAxis("Time", "Reading", '%m/%d %H %S');

        this.renderLegends();
    }

    highlightSensor(sensor) {

        this.lineData.forEach(function (line) {
            line.context.opacity = line.context.id == sensor ? 1 : 0.1;

        });

        this.updateData();
    }

    renderLegends() {
        let self = this;
        this.legend = this.nativeSvg.append('g').attr('class', 'legend');
        let legendWidth = 60;

        this.legend.selectAll('.sensor-legend').data(this.lineData).enter()
            .append('rect')
            .attr('class', 'sensor-legend')
            .attr('x', function (d, index) {
                return (legendWidth + 10) * index + self.options.margin.left;
            })
            .attr('y', this.height + 50)
            .attr('width', legendWidth)
            .attr('height', 10)
            .style('fill', function (d) {
                return d.context.color;
            })
            .on('mouseover', function (d) {
                self.highlightSensor(d.context.id);
            })
        ;

        // text
        this.legend.selectAll('.sensor-legend-text').data(this.lineData).enter()
            .append('text')
            .attr('class', 'sensor-legend-text')
            .attr('x', function (d, index) {
                return (legendWidth + 10) * index + self.options.margin.left;
            })
            .attr('y', this.height + 75)
            .text(function (d) {
                return 'Sensor ' + d.context.id;
            })

    }

    updateData() {
        this.legend.selectAll('.sensor-legend')
            .style('opacity', function (line) {
                return line.context.opacity;
            })
        ;

        this.svg.selectAll('.line-graph')
            .style('opacity', function (line) {
                return line.context.opacity;
            })
        ;
    }
}