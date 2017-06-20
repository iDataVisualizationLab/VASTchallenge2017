var Tooltip = function Tooltip(divId, eventHandler) {
    this.tooltip = d3.select('body').select('#' + divId)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
    ;

    this.eventHandler = eventHandler;

    this.init();

};

Tooltip.prototype.init = function init() {

    let self = this;
    this.tooltip
        .on('mouseover', function () {
            d3.select(this)
                .style('visibility', 'visible')
        })
        .on('mouseout', function () {
            d3.select(this)
                .style('visibility', 'hidden')
            ;

            self.eventHandler.fireEvent('mouseout');
        })
    ;
};

Tooltip.prototype.render = function render(line) {

    let self = this;

    this.show();

    let carPoints = line.context.path;

    let tableRows = '<tr><td colspan="2"> Car: ' + line.context.carId +
        '</td></tr>' +
        '<tr><th>Time</th><th>Gate</th></tr>';

    carPoints.forEach(function (carPoint) {
        tableRows += '<tr>' +
            '<td>' + carPoint.getFormattedTime() +
            '</td>' +
            '<td>' + carPoint.getGate() +
            '</td>' +
            '</tr>'
    });

    self.tooltip.html('<table style="background: #000000; color: #FFFFFF; opacity: 0.5">' + tableRows + '</table>')
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
    ;
};


Tooltip.prototype.hide = function hide() {
    this.tooltip
        .style('visibility', 'hidden')
    ;
};

Tooltip.prototype.show = function show() {
    this.tooltip.transition()
        .duration(200)
        .style("visibility", 'visible')
        .style("opacity", .9);
};