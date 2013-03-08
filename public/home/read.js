/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-7
 * Time: 上午10:08
 * To change this template use File | Settings | File Templates.
 */
define(function (require, exports, module) {

    var data = require('./data').data;

    var img = $('#img img')[0];
    img.width = data[0].width;
    img.height = data[0].height;
    img.src = data[0].src;

    exports.current = data[0];


})