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
    var img = $img.find('img')[0];
    var current = require('./read').current;

    exports.zoom = function (param) {
        switch (param) {
            case 'actual-pixels':
                exports.model = param;
                actualPixels();
                break;
            case 'fit-screen':
                if (exports.model === 'fit-screen') return;
                exports.model = param;
                fitScreen();
                break;
        }
    }

    /*适应屏幕大小*/
    function actualPixels() {
        var image = {
            width: current.width,
            height: current.height
        };
        //图片按比例缩放
        var currentW = $pic.width();
        var currentH = $pic.height();
        var w, h;
        if (image.width / image.height >= currentW / currentH) {
            if (image.width > currentW) {
                w = currentW;
                h = (image.height * currentW) / image.width;
            } else {
                w = image.width;
                h = image.height;
            }
        }
        else {
            if (image.height > currentH) {
                h = currentH;
                w = (image.width * currentH) / image.height;
            } else {
                w = image.width;
                h = image.height;
            }
        }
        img.width = w;
        img.height = h;
        $img.css({
            top: ($pic.height() / 2 - h / 2),
            left: ($pic.width() / 2 - w / 2)
        })
    }

    /*实际大小*/
    function fitScreen() {
        img.width = current.width;
        img.height = current.height;
        $img.css({
            top: -(current.height / 2 - $pic.height() / 2),
            left: -(current.width - $pic.width()) / 2
        })
    }

    $(window).on('resize', function () {
        if (exports.model === 'actual-pixels') {
            actualPixels();
        }
    })

})