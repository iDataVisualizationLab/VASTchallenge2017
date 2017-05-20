var Util = function Util () {

};

/**
 * Create byte array of a map, each pixel represents by 4 consecutive elements that stand for Red, Green, Blue and Alpha
 * @param width
 * @param height
 * @param referenceBitmapImagePath path to reference bitmap
 */
Util.createMapByteData = function createMapByteData (width, height, referenceBitmapImagePath) {
    var canvas =  document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext('2d');
    var myImg = new Image();
    myImg.src = referenceBitmapImagePath;
    ctx.drawImage(myImg, 0, 0);

    return ctx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT).data;
};

