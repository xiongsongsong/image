var DB = require('db');
var crypto = require('crypto');

var filterParamRe = /\w:\w+/
var isNumber = /^[1-9][0-9]*$/;
var format = /^(?:jpg|jpeg|gif|png)$/;
var quality = /^(?:[1-9][0-9]?|100)$/;

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

    var md5 = crypto.createHash('md5');
    md5.update(JSON.stringify(sortParam));
    md5 = md5.digest('hex');
    console.log(md5)






    var id = DB.mongodb.ObjectID(req.params[0]);
    var gs = new DB.mongodb.GridStore(DB.dbServer, id, "r");

    gs.open(function (err, gs) {
        if (!err) {
            gs.read(gs.length, function (err, data) {
                res.end(data);
            });
        } else {
            console.log(err)
            res.end('read error');
        }
    });
}