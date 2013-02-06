var DB = require('db');
var crypto = require('crypto');
var im = require('imagemagick');
var fs = require('fs');
var path = require('path');
var GridStore = DB.mongodb.GridStore;

//不使用\w，因为其包含 _ 等符号
var idRE = /^(?:(?:[a-z0-9]{24})(?:_origin)?|[a-z0-9]{32})$/;
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
        res.end('Fail Params');
        return;
    }

    var isOrigin = isOriginRE.test(req.params[0]);
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

    var md5;
    var isNormal = Object.keys(sortParam).length === 0;

    if (!isNormal) {
        md5 = crypto.createHash('md5');
        md5.update(JSON.stringify(sortParam));
        md5 = md5.digest('hex');
    }

    //查库

    var grid = new DB.mongodb.Grid(DB.client, 'fs');
    var id = req.params[0];


    grid.get(id, function (err, data) {
        if (!err) {
            //如果是普通请求（未加参数）
            if (isNormal) {
                res.end(data);
            } else {

                //首先尝试从数据库中读取图片
                grid.get(md5, function (err, copyData) {
                    if (!err) {
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
            return;
        }
        var tempFileName = md5 + Date.now() + parseInt(Math.random() * 100000, 10);
        var fileName = path.join(__dirname, '..', 'temp', tempFileName);

        //开始拼装参数
        var resizeParam = {};

        resizeParam.srcPath = fileName + '[0]';
        if (sortParam.w)  resizeParam.width = sortParam.w;
        if (sortParam.h)  resizeParam.height = sortParam.h;
        resizeParam.dstPath = fileName + (sortParam.f ? '.' + sortParam.f : '.jpg');
        if (sortParam.q) {
            resizeParam.quality = (sortParam.q === 100 ? 1 : '0.' + sortParam.q)
        }

        if (!resizeParam.width) {
            resizeParam.width = '100%';
        }
        if (!resizeParam.height) {
            resizeParam.height = '100%';
        }

        console.log(resizeParam);
        var options = {
            chunk_size: 102400,
            metadata: {

            }
        };

        fs.writeFile(fileName, data, function (err) {

            im.resize(resizeParam, function (err, stdout, stderr) {
                if (err) {
                    res.end('error');
                } else {
                    var point = readProcess.indexOf(md5);
                    if (point > -1) readProcess.splice(point, 1);

                    var gs = new GridStore(DB.dbServer, md5, md5, "w", options);
                    gs.writeFile(resizeParam.dstPath, function (err) {
                        res.sendfile(resizeParam.dstPath, function () {
                            fs.unlink(resizeParam.dstPath, function (err) {
                                if (err) {
                                    console.log('无法删除生成的缩略图')
                                } else {
                                    console.log('已经删除生成的缩略图');
                                }
                                fs.unlink(resizeParam.srcPath, function (err) {
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
