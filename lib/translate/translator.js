/**
 * @author Dimitri Harding
 */
'use strict'
var MsTranslator = require( 'mstranslator' );
var params = {
	text: '',
	from: 'en',
	to: 'es'
};
// Second parameter to constructor (true) indicates that
// the token should be auto-generated.
var ms_client = new MsTranslator( {
	client_id: "music-compiler-101",
	client_secret: "j+sIzG50RJXIs9X2ZBWZjgJL/WlfS98IyUfRD/fUH0s="
}, true );
/**
 * Translate(from,to,text)
 * Use to translate data by utilizing MS Translator
 * If there is an error use nightwatch
 * else notify user that they should enable internet connection
 *
 * @param {string} from - The source language
 * @param {string} to - The target lanagauge
 * @param {string} text - The data to be translated
 * @return {return} translation - The translated data
 */
var Translate = function ( text, from, to ) {
	var ret;
	var translation = '';
	params.text = text;
	// params.from = from;
	// params.to = to;
	ms_client.translate( params, function ( err, data ) {

		if ( data ) {
			console.log( data );
			//return translation = data;
		}
	} );
}

module.exports = Translate;
