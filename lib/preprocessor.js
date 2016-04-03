/**
 * @author Dimitri Harding
 */
'use strict';
var _ = require( 'underscore' );
var tokenizer = require( './lexTool.js' );
var fs = require( 'fs' );

// Regular Expressions
var REGEX_REPEAT_LINES = /^[\w].*\[x[0-9]]/gmi;
var REGEX_WRONG_LINES = /^[\w].*\[[0-9]x]/gmi;
var REGEX_TIMES = /x[0-9]/g;
var REGEX_WRONG_TIMES = /[0-9]x/g;
var REGEX_MUL = /\[x[0-9]]/g;
var red_flag = false;
var linesToRepeat;
var errors;
var preObject;
var countLin;
var countWord;
var tabledata;
/**
 * preprocessor() returns an extended source stream
 * based on multipliers
 *s
 * @param {String} data
 * @return {String} p_data
 */
var Preprocessor = function ( d, service ) {
	linesToRepeat = [];
	errors = [];
	preObject = {
		err: {
			errors: [],
			there_is: false
		},
		data: null
	};
	tabledata = tableData(d);
	linesToRepeat = d.match( REGEX_REPEAT_LINES ) || [];

	if ( linesToRepeat[ 0 ] == null ) {
		if ( d.match( REGEX_WRONG_LINES ) ) {
			errors = d.match( REGEX_WRONG_LINES ) || [];
			preObject.err.message = '[INCORRECT FORMAT] - multiplier should be before number [x0-9]';
			preObject.err.there_is = true;
			console.log( '[INCORRECT FORMAT] - multiplier should be before number [x0-9]' );
			var errString = '';
			errors.forEach( function ( error ) {
				console.log( '\n' + '------->' + error );
				errString = errString.concat( error + '\n\n' )
			} );
			preObject.err.errors = errString;
			red_flag = true;
			//process.exit( 1 );

		}
	}

	_.each( linesToRepeat, function ( lineToRepeat, index ) {
		d = d.replace( lineToRepeat, duplicate( lineToRepeat ) )
	} );

	// TODO: Call lexer or return data
	/**
	 * Write phase output to a file in out folder
	 */

	preObject.data = d;
	preObject.service = service;
	preObject.service.table.WordCount = tabledata.WordCount;
	preObject.service.table.Lines = tabledata.Lines;
	fs.writeFile( './out/phases/preprocess.txt', d, function ( err ) {
		if ( err ) {
			return console.log( err );
		}
	} );

	// TODO: Call lexer or return data
	if ( service === 'cli' ) {
		if ( red_flag ) {
			//process.exit(1);
		} else {
			tokenizer( d, service );
		}
	} else {
		return preObject;
	}
}

/**
 * preprocessor() returns repeation of line
 * based on multiplier
 *
 * @param {String} line
 * @return {String} lines
 */
function duplicate( line ) {
	var lines = '';
	var times = [];
	var str = '';
	var repeat = 0;

	times = line.match( REGEX_TIMES );
	repeat = parseInt( times[ 0 ].slice( 1 ) );
	str = line.replace( REGEX_MUL, '' );
	for ( var i = 0; i < repeat; i++ ) {
		lines = lines.concat( str + '\n' );
	}

	return lines;
}

function tableData( data ) {
	countLin = 0;
	countWord =0;
	var table = {};
	data.trim();
	data.split( '' ).forEach( function ( c ) {
		if ( c === ' ' || c === '\n' ) {
			countWord++;
		}
		if ( c === '\n' ) {
			countLin++;
		}
	} );
	table.WordCount = countWord;
	table.Lines = countLin;
	return table;
}

// Exporting module
module.exports = Preprocessor;
