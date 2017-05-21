var Util = function Util () {

};

/**
 * Create byte array of a map, each pixel represents by 4 consecutive elements that stand for Red, Green, Blue and Alpha
 * @param width
 * @param height
 * @param referenceBitmapImagePath path to reference bitmap
 * @param callback callback function when image is loaded
 */
Util.createMapByteData = function createMapByteData (width, height, referenceBitmapImagePath, callback) {
    var canvas =  document.getElementById("myCanvas");
    // canvas.width = width;
    // canvas.height = height;

    var ctx = canvas.getContext('2d');
    var myImg = new Image();
    myImg.src = referenceBitmapImagePath;

    myImg.onload = function(){
        // context.drawImage(base_image, 100, 100);
        ctx.drawImage(myImg, 0, 0);

        callback(ctx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT).data);

    };
};

