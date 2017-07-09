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
        let sensorLine;

        chemicalData.forEach(function (sensorData) {
            sensor = sensorData.getSensor();
            if (!sensorLines.hasOwnProperty(sensor)) {
                sensorLines[sensor] = [];
            }

            sensorLine = sensorLines[sensor];
            sensorLine.push(sensorData);
        });

        let xDomain = d3.extent(chemicalData, function (d) {
            return d.getTime().getTime();
        });

        let yDomain = d3.extent(chemicalData, function (d) {
            return d.getReading();
        });

        this.setXDomain(xDomain[0], xDomain[1]);
        this.setYDomain(yDomain[0], yDomain[1]);

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

    renderLegends() {
        let self = this;
        let g = this.nativeSvg.append('g').attr('class', 'legend');
        let legendWidth = 60;

        g.selectAll('.sensor-legend').data(this.lineData).enter()
            .append('rect')
            .attr('x', function (d, index) {
                return (legendWidth + 10) * index + self.options.margin.left;
            })
            .attr('y', this.height + 50)
            .attr('width', legendWidth)
            .attr('height', 10)
            .style('fill', function (d) {
                return d.context.color;
            })
        ;

        // text
        g.selectAll('.sensor-legend-text').data(this.lineData).enter()
            .append('text')
            .attr('x', function (d, index) {
                return (legendWidth + 10) * index + self.options.margin.left;
            })
            .attr('y', this.height + 75)
            .text(function (d) {
                return 'Sensor ' + d.context.id;
            })

    }
}