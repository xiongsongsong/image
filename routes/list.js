/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-11
 * Time: 上午10:28
 * To change this template use File | Settings | File Templates.
 */


var DB = require('db');

exports.init = function (app) {
    app.get('/list', list);
}

function list(req, res) {
    var collection = new DB.mongodb.Collection(DB.client, 'fs.files');
    collection.find({_id: /^(?:[a-z0-9]{24})$/}, {_id: 1, length: 1, metadata: 1}).toArray(function (err, docs) {
        res.header('content-type', 'application/json;charset=utf-8');
        res.end(JSON.stringify({docs: docs}, undefined, '    '))
    });
}