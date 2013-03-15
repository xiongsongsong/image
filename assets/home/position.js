/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-7
 * Time: 上午10:01
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {

    var $pic = $('#pic');
    var $img = $('#img');

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


    /*
     * 默认返回当前图片的高宽，
     * 否则根据index,返回指定图片等比后的高宽
     * */
    function getGeometric() {
        var current = require('./read').current;
        var image = {
            width: current.metadata.width,
            height: current.metadata.height
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

        return {
            w: w,
            h: h,
            top: ($pic.height() / 2 - h / 2),
            left: ($pic.width() / 2 - w / 2)
        }
    }

    /*
     适应屏幕
     * */
    function actualPixels() {
        $('#img img').remove();
        var obj = require('./read').current;
        var point = getGeometric();
        $('#img').append('<img src="' + '/read/' + obj._id + '/w:' + parseInt(point.w, 10) + '/h:' + parseInt(point.h, 10) + '">');
        var img = $img[0].getElementsByTagName('img')[0];
        img.removeAttribute('width')
        img.removeAttribute('height')
        $img.css({
            top: point.top,
            left: point.left
        });
    }

    /*实际大小*/
    function fitScreen() {
        $('#img img').remove();
        var img = $img[0].getElementsByTagName('img')[0];
        var current = require('./read').current;
        $('#img').append('<img src="' + '/read/' + current._id + '">');
        //当显示原始大小时，则使用原图的质量
        $img.css({
            top: -(current.metadata.height / 2 - $pic.height() / 2),
            left: -(current.metadata.width - $pic.width()) / 2
        })
    }

    $(window).on('resize', function () {
        if ($img.data('zoom')) {
            clearInterval($img.data('zoom'));
        }
        var cl = setTimeout(function () {
            if (exports.model === 'actual-pixels') {
                actualPixels();
            }
        }, 200);
        $img.data('zoom', cl);

    });

    (function () {
        var model = $('#control').find('a.checked').attr('data-zoom')
        if (model) exports.model = model;
    })();

    exports.getGeometric = getGeometric;
    exports.actualPixels = actualPixels;
    exports.fitScreen = fitScreen;

})