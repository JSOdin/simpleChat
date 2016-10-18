var express = require('express'),
     app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config'),
    ConnectMongo= require('connect-mongo')(session),   // saves sessions to mongodb.
    mongoose = require('mongoose').connect(config.dbURL),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    logger = require('morgan');
    rooms = [];  // each chat room will be rep'd by an object

app.use(logger('dev'));
app.set('views', path.join(__dirname,'views'));
app.engine('html',require('hogan-express'));          //map html files to hogan engine
app.set('view engine','html');
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

var env = process.env.NODE_ENV || 'development';
if (env==='development'){
    // dev specific settings
    app.use(session({secret: config.sessionSecret}));   // sessions by server memory.
} else {
   // product specific settings
    app.use(session({
        secret: config.sessionSecret,
        store: new ConnectMongo({
            mongoose_connection:mongoose.connections[0],                       // start new instance of connectMongo. save sesions on DB.
            stringify: true                           // convert all values to strings then store them.
        })
        }
    ));
}

app.use(passport.initialize());

app.use(passport.session());

require('./auth/passportAuth')(passport,FacebookStrategy, config, mongoose);

require('./routes/routes')(express, app, passport,config, rooms);

/*app.listen(9000,function(){
   console.log("Chat app listening on port 9000");
    console.log('Mode: '+env);
});*/
app.set('port', process.env.PORT || '9000');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);

server.listen(app.get('port'), function(){
   console.log("Chatserver on port: "+app.get('port'));
});
