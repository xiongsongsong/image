/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-7
 * Time: 下午2:01
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {
    1
    $('#control').on('click', 'a', function (ev) {
        var $this = $(ev.target);
        require('./position').zoom($this.attr('data-zoom'));
    })

});