/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-6
 * Time: 下午2:03
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {

    var $img = $('#img');

    var x, y, left, top, _left, _top;

    $img.on('mousedown', function (ev) {
        x = ev.screenX;
        y = ev.screenY;
        left = parseInt($img.css('left'), 10);
        top = parseInt($img.css('top'), 10);
        move();
    })

    $(document).on('dragstart', function (ev) {
        ev.preventDefault()
    })

    function move() {
        $(document).on('mousemove', dragStart)
    }

    function dragStart(ev) {
        $img.css({
            left: left + (ev.screenX - x) + 'px',
            top: top + (ev.screenY - y) + 'px'
        })
    }

    $(document).on('mouseup', function () {
        $(document).off('mousemove', dragStart)
    })

})