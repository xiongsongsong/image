/*
 * GET home page.
 */

var DB = require('db');

exports.index = function (req, res) {
    var collection = new DB.mongodb.Collection(DB.client, 'fs.files');
    collection.find({}).toArray(function (err, docs) {
        res.render('index', { title: 'Express', docs: docs });
    });
};