/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-7
 * Time: 下午2:01
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {
    $('#control').on('click', 'a', function (ev) {
        var $this = $(ev.target);
        var $img = $('#img');
        $img.addClass('anim');
        setTimeout(function () {
            $img.removeClass('anim');
        }, 200);
        require('./position').zoom($this.attr('data-zoom'));

        $this.addClass('checked')
        $this.siblings().removeClass('checked')
    })

});