var express = require( 'express' );
var path = require( 'path' );
var favicon = require( 'serve-favicon' );
var logger = require( 'morgan' );
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );
var multer = require( 'multer' );
var fs = require('fs');
require( 'dotenv' ).load();

var app = express();
io = require( 'socket.io' )();
app.io = io;

var routes = require( './routes/index' )( io );
var users = require( './routes/users' );

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'jade' );

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.text() );
app.use( bodyParser.urlencoded( {
	extended: false
} ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( multer( {
	dest: './uploads/'
} ).single( 'file' ) );

// Make io accessible to our router
app.use( function ( req, res, next ) {
	next();
} );

app.use( '/', routes );
app.use( '/users', users );

// catch 404 and forward to error handler
app.use( function ( req, res, next ) {
	var err = new Error( 'Not Found - Try reloading' );
	err.status = 404;
	next( err );
} );

// error handlers

// development error handler
// will print stacktrace
if ( app.get( 'env' ) === 'development' ) {
	app.use( function ( err, req, res, next ) {
		res.status( err.status || 500 );
		res.render( 'error', {
			message: err.message,
			error: err
		} );
	} );
}

// production error handler
// no stacktraces leaked to user
app.use( function ( err, req, res, next ) {
	res.status( err.status || 500 );
	res.render( 'error', {
		message: 'Try Reloading....',//err.message,
		error: {}
	} );
} );

// start listen with socket.io
app.io.on( 'connection', function ( socket ) {
	console.log( 'a user connected' );
	socket.on( 'send file', function () {
		var filename = './out/phases/ir.txt'
		console.log('--> Sending file');
		fs.readFile(filename, function(err, buf){
        socket.emit('file', { file: true, buffer: buf });
    });
	} )
	socket.on( 'disconnect', function () {
		console.log( 'user disconnected' );
	} )
} );


module.exports = app;
