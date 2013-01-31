/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-1-11
 * Time: 下午12:00
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var DB = require('db');
var path = require('path');
var im = require('imagemagick');
var GridStore = DB.mongodb.GridStore;
var ObjectID = DB.mongodb.ObjectID;

exports.savePsd = function (req, res) {

    res.header('Content-Type', 'text/html;charset=utf-8')
    if (!req.files.file) {
        res.end('你必须上传至少一个文件')
        return;
    }

    var files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];

    res.end('您上传了' + files.length + '个文件，服务器需要花费一些时间来处理，一般为几分钟以内。');

    //过滤掉后缀名不正确的文件
    files = files.filter(function (item) {
        return allowFile[ path.extname(item.name).substring(1).toLowerCase() ];
    });

    //存为数组以方便递归处理
    _savePsd(files, req, res);
};

var allowFile = {
    'jpg': 'image/jpg',
    'jpeg': 'image/jpg',
    'gif': 'image/gif',
    'png': 'image/png',
    'psd': 'image/psd'
};

//递归保存每个文件日志、文件实体和对应缩略图
function _savePsd(files, req, res) {

    var errorMsg = [];
    var pass = [];
    var tempFile = [];

    function save() {

        if (files.length < 1) {
            unlink(tempFile);
            return;
        }

        var cur = files.shift();

        tempFile.push(cur.path);

        var options = {
            chunk_size: 102400,
            metadata: { }
        };

        var fileId = new ObjectID();

        //检查是否为有效图片
        im.identify(['-format', '%wx%hx%m', cur.path + '[0]'], function (err, output) {
            if (!err) {

                output = output.trim().split('x');

                cur.width = parseInt(output[0], 10);
                cur.height = parseInt(output[1], 10);
                //文件的真实格式
                cur.format = output[2].toLowerCase();

                //如果不是允许的类型
                if (!allowFile[cur.format]) {
                    save();
                    return;
                }

                options.metadata.originName = cur.name.substring(0, cur.name.lastIndexOf('.') + 1) + cur.format;
                options.content_type = allowFile[cur.format];

                options.metadata.width = cur.width;
                options.metadata.height = cur.height;

                //保存原始文件
                var gs = new GridStore(DB.dbServer, fileId, fileId.toString() + '_origin', "w", options);
                gs.writeFile(cur.path, function (err) {
                    if (!err) {
                        convertAndSaveJPG(cur, options);
                    } else {
                        console.log('PSD保存失败');
                        save();
                    }
                });
            } else {
                console.log(err);
                save();
            }
        });
    }

    function convertAndSaveJPG(cur, options) {
        var fileId = new ObjectID();
        var jpgPath = path.join(path.dirname(cur.path), fileId + '.jpg');
        options.content_type = 'image/jpeg';
        try {
            im.convert([cur.path + '[0]', '-quality', '0.8', jpgPath], function (err) {
                if (!err) {
                    tempFile.push(jpgPath);
                    var gs = new GridStore(DB.dbServer, fileId, fileId.toString(), "w", options);
                    gs.writeFile(jpgPath, function (err) {
                        if (!err) {
                            cur.path = jpgPath;
                        } else {
                            console.log('无法保存jpg' + fileId + Date.now());
                        }
                        save();
                    });
                } else {
                    console.log(cur.name + '转换到jpg失败', err);
                    save();
                }
            });
        } catch (e) {
            console.log(e);
            save();
        }
    }

    save();

}


/*
 该方法并不能完全解决问题
 此处应该使用定时程序，来做处理
 */
function unlink(list) {
    /*var cur = list.shift();
     fs.unlink(cur, function (err) {
     if (!err) {
     console.log(cur + '\t already unlink');
     } else {
     console.log('unlink fail', err);
     }
     if (list.length > 0) unlink(list);
     })*/
}

