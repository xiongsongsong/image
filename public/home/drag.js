/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-6
 * Time: 下午2:03
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {

    var $img = $('#img');
    var $document = $(document);
    var position = require('./position');

    var x, y, left, top, _left, _top;

    $img.on('mousedown', function (ev) {
        if (ev.button > 1 || position.model === 'actual-pixels') return;
        x = ev.screenX;
        y = ev.screenY;
        left = parseInt($img.css('left'), 10);
        top = parseInt($img.css('top'), 10);
        move();
        $document.on('mouseup', mouseUp);
    })

    function dragStart(ev) {
        ev.preventDefault()
    }


    function move() {
        console.log('绑定事件');
        $(document).on('mousemove', moveStart);
        $document.on('dragstart', dragStart);
    }

    function moveStart(ev) {
        console.log('拖动中');
        $img.css({
            left: left + (ev.screenX - x) + 'px',
            top: top + (ev.screenY - y) + 'px'
        })
    }

    function mouseUp() {
        console.log('释放')
        $(document).off('mousemove', moveStart)
        $(document).off('mouseup', mouseUp)
        $document.off('dragstart', dragStart);
    }

})