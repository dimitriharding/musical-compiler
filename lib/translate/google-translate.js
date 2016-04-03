var webdriverio = require( 'webdriverio' );
//var selenium = require( 'selenium-standalone' );
var options = {
	desiredCapabilities: {
		browserName: 'chrome'
	}
};
var client = webdriverio.remote( options );
var GOOGLE = function ( data) {
	var translation;
	count = 0;
	client
		.init()
		.url( 'https://translate.google.com/#en/es/' )
		.setValue( '#source', data )
		.keys( 'Enter' )
		.pause( 1000 )
		.click( '#gt-submit')
		.pause( 1000 )
		.getText( '#result_box' ).then( function ( value ) {
			translation = value;
		} )
		.end();
	return translation;
};
module.exports = GOOGLE;
