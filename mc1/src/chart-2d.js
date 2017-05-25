var Chart2D = function Chart2D(svg, width, height, options) {
    this.svg = svg;
    this.width = width;
    this.height = height;

    if (!options) {
        options = {};
    }

    this.options = options;

    // set the ranges
    this.x = !!this.options.timeChart ? d3.scaleTime().range([0, width]) :  d3.scaleLinear().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);
};

Chart2D.prototype.getSvg = function getSvg() {
    return this.svg;
};

/**
 *
 * Set data before rendering the chart
 *
 * @param context: context information
 * @param dataArray data array, containing [ [{x: xValue1, y: yValue1}, {x: xValue2, y: yValue2}], [{}]]
 * @param xKey: key to get data for x axis. Default is x
 * @param yKey: key to get data for y axis. Default is y
 */
Chart2D.prototype.addData = function addData(context, dataArray, xKey, yKey) {

    if (!this.lineData) {
        this.lineData = [];
    }

    if (!xKey) {
        xKey = 'x';
    }

    if (!yKey) {
        yKey = 'y';
    }

    if (!context) {
        context = {};
    }


    if (!context.color) {
        context.color = '#000000';
    }

    let self = this;

    let valueLine = d3.line()
        .x(function(d) {
            return self.x(d[xKey]);
        })
        .y(function(d) { return self.y(d[yKey]); })
    ;

    this.lineData.push( {valueLine: valueLine, data: dataArray, context: context});
};

Chart2D.prototype.setXDomain = function setXDomain(min, max) {
    this.x.domain([min, max]);
};

Chart2D.prototype.setYDomain = function setYDomain(min, max) {
    this.y.domain([min, max]);
};
/**
 *
 * Render axis with label for bottom and left axis
 *
 * @param bottomLabel
 * @param leftLabel
 */
Chart2D.prototype.renderAxis = function renderAxis(bottomLabel, leftLabel) {

    let height = this.height;
    let width = this.width;
    let margin = this.options.margin;
    // Add the x Axis
    this.svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.x));

    // text label for the x axis
    if (!!bottomLabel) {
        this.svg.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text(bottomLabel)
        ;
    }

    // Add the y Axis
    this.svg.append("g")
        .call(d3.axisLeft(this.y));

    if (!!leftLabel) {
        // text label for the y axis
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(leftLabel)
        ;
    }
};

Chart2D.prototype.renderChart = function renderChart(events) {

    let self = this;
    self.myLine = this.svg.selectAll('.line-graph').data(this.lineData).enter()
        .append('g')
        .attr('class', 'line-graph')
    ;

    self.myLine
        .append('path')
        .attr("class", function (line) {
            return "line line-multi-visit-" + (line.context.multiEnterExit ? 1 : 0)
        })
        .attr("d", function (line) {
            return line.valueLine(line.data);
        })
        .style('stroke-width', 1)
        .style('stroke', function (line) {
            return line.context.color;
        })
        .style('fill', 'none')

    ;

    if (!!events && events.length > 0) {
        events.forEach(function (e) {
            self.myLine.on(e.name, function (l, index) {
                e.callback(e.params, l, index)
            });
        })
    }

    // myLine.each(function (line) {
    //     let myEndPoints = [line.data[0], line.data[line.data.length -1]];
    //     debugger;
    //     d3.select(this).selectAll('.passing-gate').data(myEndPoints).enter()
    //         .append('circle')
    //         .attr('class', 'passing-gate')
    //         .attr('r', 2)
    //         .attr('cx', function (d) {
    //             return self.x(d.time);
    //         })
    //         .attr('cy', function (d) {
    //             return self.y(d.y);
    //         })
    //         .style('fill', function (d) {
    //             return d.mapPoint.getColor();
    //         })
    //     ;
    // });
};


Chart2D.prototype.getMyLines = function getMyLines() {
  return this.myLine;
};

Chart2D.prototype.highLightMultiVisits = function highLightMultiVisits (carCategory, campingBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    this.myLine.selectAll('.line')
        // .style('opacity', function (line) {
        //     if (carCategory == 'car-all') {
        //         return line.context.entranceCount > 2 ? 1 : 0;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return (line.context.entranceCount > 2 && line.context.carType == '2P') ? 1 : 0;
        //     }
        //
        //     return (line.context.entranceCount > 2 && line.context.carType != '2P') ? 1 : 0;
        //
        // })
        .style('visibility', function (line) {
            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    return line.context.entranceCount > 2 ? 'visible' : 'hidden';
                }
                else {
                    return line.context.entranceCount > 2 && line.context.camping == campingBehavior ? 'visible' : 'hidden';
                }
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    return (line.context.entranceCount > 2 && line.context.carType == '2P') ? 'visible' : 'hidden';
                }
                else {
                    return (line.context.entranceCount > 2 && line.context.carType == '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';

                }
            }
            // else if (carCategory == 'car-camping') {
            //     return (line.context.entranceCount > 2 && line.context.camping == true) ? 'visible' : 'hidden';
            // }
            // else if (carCategory == 'no-car-camping') {
            //     return (line.context.entranceCount > 2 && line.context.camping == false && line.context.carType != '2P') ? 'visible' : 'hidden';
            // }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    return (line.context.entranceCount > 2 && line.context.carType != '2P') ? 'visible' : 'hidden';
                }

                return (line.context.entranceCount > 2 && line.context.carType != '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
            }

            if (carCategory == 'all') {

                return (line.context.entranceCount > 2 && line.context.carType == carCategory) ? 'visible' : 'hidden';
            }

            return (line.context.entranceCount > 2 && line.context.carType == carCategory && line.context.camping == campingBehavior) ? 'visible' : 'hidden';

        })
    ;
};

Chart2D.prototype.highLightSingleVisit = function highLightSingleVisit (carCategory, campingBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    this.myLine.selectAll('.line')
        // .style('opacity', function (line) {
        //
        //     if (carCategory == 'car-all') {
        //         return line.context.entranceCount < 3 ?  1 : 0.01;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return (line.context.entranceCount < 3 && line.context.carType == '2P') ?  1 : 0.01;
        //     }
        //
        //     return (line.context.entranceCount < 3 && line.context.carType != '2P') ? 1 : 0.01;
        // })
        .style('visibility', function (line) {

            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    return line.context.entranceCount < 3 ?  'visible' : 'hidden';
                }

                return line.context.entranceCount < 3 && line.context.camping == campingBehavior ?  'visible' : 'hidden';
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    return (line.context.entranceCount < 3 && line.context.carType == '2P') ? 'visible' : 'hidden';
                }

                return (line.context.entranceCount < 3 && line.context.carType == '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
            }
            // else if (carCategory == 'car-camping') {
            //     return (line.context.entranceCount < 3 && line.context.camping == true) ? 'visible' : 'hidden';
            // }
            // else if (carCategory == 'car-no-camping') {
            //     return (line.context.entranceCount < 3 && line.context.camping == false && line.context.carType != '2P') ? 'visible' : 'hidden';
            // }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    return (line.context.entranceCount < 3 && line.context.carType != '2P') ? 'visible' : 'hidden';
                }

                return (line.context.entranceCount < 3 && line.context.carType != '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';

            }

            if (campingBehavior == 'all') {
                return (line.context.entranceCount < 3 && line.context.carType == carCategory) ? 'visible' : 'hidden';
            }

            return (line.context.entranceCount < 3 && line.context.carType == carCategory && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
        })
    ;
};

Chart2D.prototype.highLightNoExit = function highLightNoExit(carCategory, campingBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    this.myLine.selectAll('.line')
        // .style('opacity', function (line) {
        //
        //     if (carCategory == 'car-all') {
        //         return line.context.entranceCount < 2 ?  1 : 0.01;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return (line.context.entranceCount < 2 && line.context.carType == '2P') ?  1 : 0.01;
        //     }
        //
        //     return (line.context.entranceCount < 2 && line.context.carType != '2P') ? 1 : 0.01;
        // })
        .style('visibility', function (line) {

            if (carCategory == 'car-all') {
                if (campingBehavior == 'all') {
                    return line.context.entranceCount < 2 ?  'visible' : 'hidden';
                }
                return line.context.entranceCount < 2 && line.context.camping == campingBehavior ?  'visible' : 'hidden';
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    return (line.context.entranceCount < 2 && line.context.carType == '2P') ? 'visible' : 'hidden';
                }

                return (line.context.entranceCount < 2 && line.context.carType == '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
            }
            // else if (carCategory == 'car-camping') {
            //     return (line.context.entranceCount < 2 && line.context.camping == true) ? 'visible' : 'hidden';
            // }
            // else if (carCategory == 'car-no-camping') {
            //     return (line.context.entranceCount < 2 && line.context.camping == false && line.context.carType != '2P' ) ? 'visible' : 'hidden';
            // }
            else if (carCategory == 'car-visiting') {
                if (campingBehavior == 'all') {
                    return (line.context.entranceCount < 2 && line.context.carType != '2P') ? 'visible' : 'hidden';

                }

                return (line.context.entranceCount < 2 && line.context.carType != '2P' && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
            }


            if (campingBehavior == 'all') {
                return (line.context.entranceCount < 2 && line.context.carType == carCategory) ? 'visible' : 'hidden';
            }

            return (line.context.entranceCount < 2 && line.context.carType == carCategory && line.context.camping == campingBehavior) ? 'visible' : 'hidden';
        })
    ;
};

Chart2D.prototype.highLightAllTypesOfVisit = function highLightAllTypesOfVisit (carCategory, campingBehavior) {
    if (!carCategory) {
        carCategory = 'car-all';
    }

    this.myLine.selectAll('.line')
        // .style('opacity', function (line) {
        //     if (carCategory == 'car-all') {
        //         return 1;
        //     }
        //     else if (carCategory == 'car-internal') {
        //         return line.context.carType == '2P' ? 1 : 0.01;
        //     }
        //
        //     return  line.context.carType != '2P' ? 1 : 0.01;
        // })
        .style('visibility', function (line) {
            if (carCategory == 'car-all') {

                if (campingBehavior == 'all') {
                    return 'visible';
                }

                return line.context.camping == campingBehavior ? 'visible' : 'hidden';
            }
            else if (carCategory == 'car-internal') {
                if (campingBehavior == 'all') {
                    return line.context.carType == '2P' ? 'visible' : 'hidden';
                }

                return line.context.carType == '2P' && line.context.camping == campingBehavior ? 'visible' : 'hidden';
            }
            // else if (carCategory == 'car-camping') {
            //     return line.context.camping == true ? 'visible' : 'hidden';
            // }
            // else if (carCategory == 'car-no-camping') {
            //     return line.context.camping == false && line.context.carType != '2P' ? 'visible' : 'hidden';
            // }
            else if (carCategory == 'car-visiting') {

                if (campingBehavior == 'all') {
                    return line.context.carType != '2P' ? 'visible' : 'hidden';

                }
                return line.context.carType != '2P' && line.context.camping == campingBehavior ? 'visible' : 'hidden';
            }

            if (campingBehavior == 'all') {
                return  line.context.carType == carCategory ? 'visible' : 'hidden';

            }

            return  line.context.carType == carCategory && line.context.camping == campingBehavior ? 'visible' : 'hidden';
        })
    ;
};