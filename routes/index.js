/*
 * GET home page.
 */

exports.init = function (app) {

    app.get('/', function (req, res) {
        res.render('index', { title: 'Express'});
    });

    //读取指定的文件
    app.get(/\/read\/(\w+)(?:\/)?(.*)?/, require('./read').read);

    app.post('/save', require('./save-psd').savePsd);

    //获取文件列表
    require('./list').init(app);


}
