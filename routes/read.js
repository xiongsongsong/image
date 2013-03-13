var DB = require('db');
var crypto = require('crypto');
var im = require('imagemagick');
var fs = require('fs');
var path = require('path');
var GridStore = DB.mongodb.GridStore;

var idRE = /^(?:(?:[a-z0-9]{24})(?:_origin)?)$/;
var isOriginRE = /^(?:[a-z0-9]{24})(?:_origin)?$/;


var filterParamRe = /\w:\w+/
var isNumber = /^[1-9][0-9]*$/;
var format = /^(?:jpg|jpeg|gif|png)$/;
var quality = /^(?:[1-9][0-9]?|100)$/;

var readProcess = [];

function int(s) {
    return parseInt(s, 10);
}

var validator = {
    w: {
        re: isNumber,
        map: int
    },
    h: {
        re: isNumber,
        map: int
    },
    f: {
        re: format
    },
    q: {
        re: quality,
        map: int
    }
}

exports.read = function (req, res) {

    if (!idRE.test(req.params[0])) {
        res.end();
        return;
    }

    var p = {};
    var sortParam = Object.create(null);
    if (req.params[1]) {
        req.params[1].split('/').forEach(function (item) {
            var _p = item.split(':');
            var o = validator[_p[0]];
            if (filterParamRe.test(item)) {
                if (o && o.re.test(_p[1])) {
                    p[_p[0]] = o.map ? o.map(_p[1]) : _p[1];
                }
            }
        })
        //排序，以确保不同参数位置，但相同参数值所得到的MD5值一致
        Object.keys(p).sort().forEach(function (k) {
            sortParam[k] = p[k];
        })
    }

    //将参数转换为MD5

    var id = req.params[0];

    var md5;
    var isNormal = Object.keys(sortParam).length === 0;

    if (!isNormal) {
        md5 = crypto.createHash('md5');
        md5.update(JSON.stringify(sortParam) + id);
        md5 = md5.digest('hex');
    }

    var grid = new DB.mongodb.Grid(DB.client, 'fs');

    grid.get(id, function (err, data) {
        if (!err) {
            //如果是普通请求（未加参数）
            if (isNormal) {
                updateLastAccessTime(id);
                res.end(data);
            } else {
                //首先尝试从数据库中读取图片
                grid.get(md5, function (err, copyData) {
                    if (!err) {
                        updateLastAccessTime(md5);
                        res.end(copyData)
                    }
                    //如果未找到，则开始生成图片
                    else {
                        if (readProcess.indexOf(md5) > -1) {
                            //发送正在处理中的提示图片
                            res.end('process..........');
                        } else {

                            readProcess.push(md5);

                            //如果本就请求的原图
                            if (id.indexOf('_origin') > 0) {
                                convertOrigin(data);
                            }
                            //否则获取原图再转换
                            else {
                                grid.get(id + '_origin', function (err, data) {
                                    convertOrigin(data);
                                });
                            }
                        }
                    }

                });
            }
        } else {
            res.end('Not Found');
        }
    });
    function convertOrigin(data) {
        if (!data) {
            console.log('Not Found md5 file');
            res.end();
            return;
        }
        var tempFileName = md5 + Date.now() + parseInt(Math.random() * 100000, 10);
        var fileName = path.join(__dirname, '..', 'temp', tempFileName);

        //开始拼装参数
        var param = {};

        param.srcPath = fileName + '[0]';
        if (sortParam.w)  param.width = sortParam.w;
        if (sortParam.h)  param.height = sortParam.h;
        param.dstPath = fileName + (sortParam.f ? '.' + sortParam.f : '.jpg');
        if (sortParam.q) {
            param.quality = (sortParam.q === 100 ? '1' : '0.' + (sortParam.q < 10 ? '0' + sortParam.q : sortParam.q))
        }

        if (!param.width && !param.height) param.width = param.height = '100%'

        var options = {
            chunk_size: 102400,
            metadata: {
                origin: req.params[0]
            }
        };

        fs.writeFile(fileName, data, function (err) {

            im.resize(param, function (err, stdout, stderr) {
                if (err) {
                    res.end('error');
                } else {
                    var point = readProcess.indexOf(md5);
                    if (point > -1) readProcess.splice(point, 1);

                    var gs = new GridStore(DB.dbServer, md5, md5, "w", options);
                    gs.writeFile(param.dstPath, function (err) {
                        updateLastAccessTime(md5);
                        res.sendfile(param.dstPath, function () {
                            fs.unlink(param.dstPath, function (err) {
                                if (err) {
                                    console.log('无法删除生成的缩略图')
                                } else {
                                    console.log('已经删除生成的缩略图');
                                }
                                fs.unlink(fileName, function (err) {
                                    if (err) {
                                        console.log('无法删除原图')
                                    } else {
                                        console.log('已经删除原图');
                                    }
                                })
                            });
                        });
                    });
                }
            });
        })
    }
}

//更新文件的最后访问时间
function updateLastAccessTime(id) {
    var collection = new DB.mongodb.Collection(DB.client, 'fs.files');
    collection.findAndModify({filename: id},
        [
            ['filename', 1]
        ],
        {
            $set: {
                "metadata.lastAccessTime": Date.now()
            }
        }, {
            new: true
        }
        , function (err, docs) {
            console.log(docs.metadata.lastAccessTime);
        })
}
