/*
 * GET home page.
 */

var DB = require('db');

exports.index = function (req, res) {
    var collection = new DB.mongodb.Collection(DB.client, 'fs.files');
    collection.find({_id: /^(?:[a-z0-9]{24})$/}).toArray(function (err, docs) {
        res.render('index', { title: 'Express', docs: docs });
    });
};