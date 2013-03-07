/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-7
 * Time: 上午10:01
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {

    var $pic = $('#pic');
    var $img = $('#img')
    var current = require('./read').current;

    exports.zoom = function (param) {
        var img = $img.find('img')[0];
        switch (param) {
            case 'actual-pixels':
                actualPixels($img.find('img')[0])
                break;
            case 'fit-screen':
                break;
        }
    }

    /*适应屏幕*/
    function actualPixels(ImgD) {
        var image = {
            width: current.width,
            height: current.height
        };
        //图片按比例缩放
        var iwidth = $pic.width();
        var iheight = $pic.height();
        if (image.width / image.height >= iwidth / iheight) {
            if (image.width > iwidth) {
                ImgD.width = iwidth;
                ImgD.height = (image.height * iwidth) / image.width;
            } else {
                ImgD.width = image.width;
                ImgD.height = image.height;
            }

            ImgD.alt = image.width + "×" + image.height;
        }
        else {
            if (image.height > iheight) {
                ImgD.height = iheight;
                ImgD.width = (image.width * iheight) / image.height;
            } else {
                ImgD.width = image.width;
                ImgD.height = image.height;
            }
            ImgD.alt = image.width + "×" + image.height;
        }
    }


})