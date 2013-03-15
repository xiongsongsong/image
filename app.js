/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 80);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: path.join(__dirname, 'temp') }));
    app.use(app.router);
    app.use(require('stylus').middleware(path.join(__dirname, 'assets')));
    app.use(express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

require('./routes/index').init(app);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
