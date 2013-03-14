/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 13-3-14
 * Time: 下午5:10
 * To change this template use File | Settings | File Templates.
 */

define(function (require, exports, module) {

    var form = document.forms['upload'];

    var url = '/save';

    function upload() {

        var xhr = new XMLHttpRequest();

        var formData = new FormData(form);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                document.title = xhr.responseText;
            }
        };

        xhr.open('post', url);

        xhr.upload.addEventListener("progress", function (evt) {
            var percent = Math.round(evt.loaded * 100 / evt.total);
            document.title = percent;
        }, false);

        xhr.send(formData);

    }

    $('#upload-triggers').on('click', upload)

});