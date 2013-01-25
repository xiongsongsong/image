var DB = require('db');
var filterParamRe = /\w:\w+/
var isNumber = /^[1-9][0-9]*$/;
var format = /^(?:jpg|jpeg|gif|png)$/;
var quality = /^(?:[1-9][0-9]?|100)$/;

var validator = {
    w: {
        re: isNumber,
        fn: function () {

        }
    }
}

exports.read = function (req, res) {

    var p = {};
    if (req.params[1]) {
        req.params[1].split('/').forEach(function (item) {
            var _p = item.split(':');
            if (filterParamRe.test(item)) {
                if (validator[_p[0]]) {
                    if (validator[_p[0]].re.test(_p[1])) p[_p[0]] = _p[1];
                }
            }
        })
        console.log(p);
    }

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