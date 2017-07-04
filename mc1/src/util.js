var Util = function Util () {

};

var TIME_RATIO = 500;

/**
 * Create byte array of a map, each pixel represents by 4 consecutive elements that stand for Red, Green, Blue and Alpha
 * @param width
 * @param height
 * @param referenceBitmapImagePath path to reference bitmap
 * @param callback callback function when image is loaded
 */
Util.createMapByteData = function createMapByteData (width, height, referenceBitmapImagePath, callback) {
    var canvas =  document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext('2d');
    var myImg = new Image();
    myImg.src = referenceBitmapImagePath;

    myImg.onload = function(){
        // context.drawImage(base_image, 100, 100);
        ctx.drawImage(myImg, 0, 0);

        callback(ctx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT).data);

    };
};


/**
 *
 * console.log(blendColors(
 [0, 0, 0, 0],
 [255, 255, 255, 0],
 [255, 0, 0, .5],
 [0, 255, 0, .5]
 ));
 *
 * @return {*}
 */
function blendColors() {
    var args = [].prototype.slice.call(arguments);
    var base = [0, 0, 0, 0];
    var mix;
    var added;
    while (added = args.shift()) {
        if (typeof added[3] === 'undefined') {
            added[3] = 1;
        }
        // check if both alpha channels exist.
        if (base[3] && added[3]) {
            mix = [0, 0, 0, 0];
            // alpha
            mix[3] = 1 - (1 - added[3]) * (1 - base[3]);
            // red
            mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3]));
            // green
            mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3]));
            // blue
            mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3]));

        } else if (added) {
            mix = added;
        } else {
            mix = base;
        }
        base = mix;
    }

    return mix;
}

function mergeTwoRGBs(base, added) {
    // Fast and easy way to combine (additive mode) two RGBA colors with JavaScript.
// [red, green, blue, alpha] based on these maximul values [255, 255, 255, 1].
//     var base = [69, 109, 160, 1];
//     var added = [61, 47, 82, 0.8];

    var mix = [];
    mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
    mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3])); // red
    mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3])); // green
    mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3])); // blue

// Will return [63, 59, 98, 1]

    return mix;
}

function hexToRgb(hex, alpha){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');

        return [(c>>16)&255,  (c>>8)&255, c&255, alpha];
        // return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
}


function rgbToHex(r, g, b) {

    var componentToHex = function (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getTimeInDayByMilliseconds(date) {
    return date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds() + date.getMilliseconds();
}

/**
 *
 * @param actualtime
 */
function convertToSimulationTime(actualtime) {
    return actualtime / TIME_RATIO;
}

function getTimeInDayBySeconds (dateTime) {
    return dateTime.getHours()*3600 + dateTime.getMinutes()*60 + dateTime.getSeconds();
}

function getTimeInDayByMinutes (dateTime) {
    return dateTime.getHours()*60 + dateTime.getMinutes() +  dateTime.getSeconds()/ 60;
}

function getTimeInDayByHours (dateTime) {
    return dateTime.getHours() + dateTime.getMinutes()/60 +  dateTime.getSeconds()/ 3600;
}

function formatDateTime(dateTime, formatTemplate) {
    var format = d3.timeFormat(!!formatTemplate ? formatTemplate : "%Y-%m-%d %H:%M:%S");

    return format(dateTime);
}

function formatDate(dateTime, formatTemplate) {
    var format = d3.timeFormat(!!formatTemplate ? formatTemplate : "%Y-%m-%d");

    return format(dateTime);
}

function getTimeInDayAsString (dateTime) {
    return dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + dateTime.getSeconds();
}

/**
 *
 * @param line: context params
 *
 * @param path: complete path
 * @return Array paths that tell the stop by
 */
function splitPathWithStopByGate(line, path) {
    let tmpPath = path;
    let preCPoint;
    let nextCPoint;
    let i=0;
    let smallPaths = [tmpPath[0]];

    let resultPaths = [];

    do {

        i++;
        if (i >= tmpPath.length) {
            if (smallPaths.length > 1) {
                resultPaths.push({context: line, path: smallPaths});
            }
            break;
        }

        preCPoint = smallPaths[smallPaths.length-1];
        nextCPoint = tmpPath[i];

        if (preCPoint.getGate() == nextCPoint.getGate()) {

            if (!nextCPoint.getMapPoint().isEntrance()) {
                if (smallPaths.length > 1) { // only create line if there are two points or above
                    resultPaths.push({context: line, path: smallPaths});

                }

                let delayPeriod = [preCPoint, nextCPoint];
                delayPeriod.sameLocation = true;
                resultPaths.push({context: line, path: delayPeriod});

                if (i >= tmpPath.length-1) {
                    break;
                }

                smallPaths = [nextCPoint];
            }
            else {
                // get out of park (two consecutive entrances
                i ++;
                smallPaths = [tmpPath[i]]; // reset
            }


        }
        else {
            smallPaths.push(nextCPoint);
        }


    }
    while (true);

    return resultPaths;
}

/**
 * Create tooltip for car point
 * @param carPoint
 * @return {string}
 */
function createGateTooltipHtml(carPoint) {
    let tb = "<table>" +
        "<tr><td>Gate</td><td>:</td><td><b>" + carPoint.getGate() + "</b></td></tr>" +
        "<tr><td>Time</td><td>:</td><td>" + carPoint.getFormattedTime() + "</td></tr>" +
        "</table>"
        ;

    return tb;
}

function renderVisitCount(count) {
    let tb = "<table>" +
            "<tr><td>Visit Count</td><td>:</td><td>" + count + "</td></tr>" +
            "</table>"
        ;

    return tb;
}

/**
 * Calculate days different between two dates. date1 > date2
 *
 * @param date1
 * @param date2
 * @return {number}
 */
function dayDiff(date1, date2) {

    let start = new Date(date2.getTime());
    let end = formatDate(date1.getTime());
    let count = 0;

    do {
        start.setDate(start.getDate() + 1);
        if (formatDate(start) == end) {
            count ++;
            break;
        }
        count ++;
    }
    while(true);

    return count;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isWeekend(dateTime) {
    return dateTime.getDay() == 0 || dateTime.getDay() == 6;
}