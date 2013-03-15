/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-7
 * Time: 上午10:08
 * 渲染图片
 */

define(function (require, exports, module) {

    var position = require('./position');

    exports.read = function (index) {

        var data = require('./data').data.docs;
        var obj = data[index];

        exports.current = obj;

        if (position.model === 'actual-pixels') {
            position.actualPixels();
        } else {
            position.fitScreen()
        }
    }
})