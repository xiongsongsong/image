/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-8
 * Time: 下午2:50
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {


    /*
     * 渲染每个LI
     * */

    function render(data) {
        var docs = data.docs;
        var tpl = '';
        for (var i = 0; i < docs.length; i++) {
            var obj = docs[i];
            tpl += '<a data-index="' + i + '" data-id="' + obj._id + '" style="background-image:url(/read/' + obj._id + '/w:50)"></a>';
        }
        return tpl;
    }

    require('./data').list({}, function (docs) {
        $('#file-container div.file').html(render(docs))
        require('./read').read(0);
    });


    $('#file-container').on('click', 'a', function (ev) {
        var $this = $(ev.currentTarget);
        var index = parseInt($this.attr('data-index'), 10);
        $this.addClass('checked').siblings().removeClass('checked');
        //读取图片
        require('./read').read(index);

    })

})