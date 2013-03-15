/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-7
 * Time: 上午10:02
 * To change this template use File | Settings | File Templates.
 */

define(function (rquire, exports, module) {

    exports.list = function (param, callback) {
        $.getJSON('/list', {}, function (data) {
            exports.data = data;
            if (callback) callback(data);
        })
    }

})