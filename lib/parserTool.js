/**
 * @author Dimitri Harding
 */
'use strict';
var LinkedList = require( '../util/linked-list.js' );
var AstBuilder = require( '../util/ast-builder.js' );
var sema = require( './semaTool' );
var fs = require( 'fs' );
var _ = require( 'underscore' )

var tokens = new LinkedList();
var ast = new AstBuilder();
var lookahead = new LinkedList();
var continueProcessing;
var catSet;

/*Constants*/
var REGEX_CAT_SANITIZER = /(\[|\]|:|[0-9])/g
var REGEX_TITLE_VERIFY = /^[\“|\"][^a-z]*[\"|\”]$/m
var REGEX_CAT_VERIFY = /^\[[a-z]*\:\]|\[[a-z]*\ [0-9]\:\]$/mi
var REGEX_PUNC_VERIFY = /\.|\!|\'|\?|\:|\.|\,/
var REGEX_SEN_START_CAP = /^[A-Z].*$/m
var REGEX_SEN_VERIFY = /^[A-Z]([a-z][A-Z]?).*$|^[A-Z]\'([a-z][A-Z]?).*$|^[A-Z]\ ([a-z][A-Z]?).*$/m
var CAT1 = 'Verse';
var CAT2 = 'Chorus';
var CAT3 = 'Bridge';
var err;
var parObject;
var red_flag;
var errors;

/**
 * paser(tokens)
 * Parses token stream and returns ast
 *
 * @param {string} tokens - the string to be parse
 * @return {JSON} ast - The parse tree that was generated
 */
function Parser( tokens, service ) {
	var token = {};
	err = {};
	red_flag = false;
	errors = [];
	parObject = {
		data: null,
		err: {there_is:false,errors:[]}
	};
	continueProcessing = true;
	catSet = false;
	lookahead = tokens.getFirst();

	while ( ( token = lookahead.node ) != null) {

		switch ( token.name ) {
		case 'TITLE':
			if ( parseTitle( token.value ) ) {
				ast.createDoc();
				ast.insertTitleNode( token.value )
				service.table.Title = token.value;
			} else {
				// TODO: Throw error about title
				continueProcessing = false;
				createError( '[SYNTAX ERROR]: ','\tThere should be a title for song' );
			}
			break;

		case 'CATEGORY':
			if ( parseCategory( token.value ) ) {
				ast.insertCategoryNode( sanitizeCategory( token.value ) )
				catSet = true;
			} else {
				// TODO: Throw error about category
				continueProcessing = false;
				createError('[SYNTAX ERROR]: ','\tThere should be a minimum of 3 sections of the song' );
				createError( '[SOLUTION]: ','\tDefine [Verse:], [Chorus:], and/or [Bridge:] within song');
			}
			break;

		case 'SENTENCE':
			if ( parseSentence( token.value ) && catSet) {
				ast.insertSentenceNode( token.value )
			}else {
				continueProcessing = false;
				createError( '[SYNTAX ERROR]: ','\tThere should be a minimum of 3 sections of the song, first one starting right after title');
				createError( '[SOLUTION]: ','\tDefine [Verse:], [Chorus:], and/or [Bridge:] within song');
			}
			break;

		case 'WORD':
			if ( parseWord( token.value ) ) {
				ast.insertWordNode( token.value )
			}
			break;

		case 'APOSTROPHE':
			if ( parsePunctuation( token.value ) ) {
				ast.insertPuncNode( token.value )
			}
			break;

		case 'QUESTION':
			if ( parsePunctuation( token.value ) ) {
				ast.insertPuncNode( token.value )
			}
			break;

		case 'EXCLAMATION':
			if ( parsePunctuation( token.value ) ) {
				ast.insertPuncNode( token.value )
			}
			break;

		case 'COMMA':
			if ( parsePunctuation( token.value ) ) {
				ast.insertPuncNode( token.value )
			}
			break;

		case 'COLON':
			if ( parsePunctuation( token.value ) ) {
				ast.insertPuncNode( token.value )
			}
			break;

		case 'FULLSTOP':
			if ( parsePunctuation( token.value ) ) {
				ast.insertPuncNode( token.value )
			}
			break;

		default:
			console.log( 'SYNTAX ERROR: Unexpected token -->' + token.name )
		}
		if(!continueProcessing){
			break;
		}

		nextToken()
	}

	/**
	 * Write phase output to a file in out folder
	 */
	fs.writeFile( './out/phases/parse.json', JSON.stringify( ast.getTree(), null, '\t' ), function ( err ) {
		if ( err ) {
			return console.log( err );
		} else {
			return; //console.log( 'Parse tree file created' );
		}
	} );

	/**
	 * nextToken
	 * Gets the next node from the token list
	 * and assigns it to the lookahead variable
	 *
	 * if next is undefined, assigns empty token object
	 */
	function nextToken() {
		if ( typeof ( lookahead.next ) !== 'undefined' ) {
			lookahead = lookahead.next
		} else {
			lookahead = {
				name: null,
				type: null
			};
		}
	}

	parObject.data = ast.getTree();
	parObject.err.errors = errors;
	parObject.service = service;
	if ( errors.length > 0 ) {
		parObject.err.there_is = true;
		parObject.err.string = renderErrors();
	}

	function renderErrors() {
		var errString = '';
		errors.forEach( function ( obj ) {
			errString = errString.concat( obj.type + obj.message + '\n' )
		} );
		return errString;
	}
	// TODO: Call Sema or return ast
	if ( service === 'cli' ) {
		if ( !continueProcessing ) {
			//process.exit(1);
		} else {
			sema( ast.getTree(), service );
		}
	} else {
		return parObject;
	}
}

/**
 * Checks if title is of the right format
 *
 * @param {string} title - Value to parse.
 * @return {Boolean}
 */
function parseTitle( title ) {
	// should be in all caps and surrounded in quotes
	// TODO: remember to check if it was in the first line
	if ( title.match( REGEX_TITLE_VERIFY ) ) {
		return true;
	} else {
		continueProcessing = false;
		createError('[SYNTAX ERROR] ','\tTitle of the song should be in ALL Caps and in quotes' );
		createError( '[SOLUTION] ' , title + ' --> ' + title.toUpperCase() );
		return false;
	}
}

/**
 * Checks if word is acceptable for this genre
 *
 * @param {string} wordVal - Value to parse.
 * @return {Boolean}
 * TODO
 */
function parseWord( wordVal ) {

	return true;
}

/**
 * Sentences should start with a capital letter
 *
 * @param {string} sentenceVal - Value to parse.
 * @return {Boolean}
 * TODO
 */
function parseSentence( sentenceVal ) {
	if ( sentenceVal.match( REGEX_SEN_VERIFY ) ) {
		return true;
	} else {
		continueProcessing = false;
		createError( '[SYNTAX ERROR]: ','\tSentence should start with capital letter ' + sentenceVal );
		return false;
	}
}

/**
 * Verify that token is actually a punctuation
 *
 * @param {string} punctuationVal - Value to parse.
 * @return {Boolean}
 * TODO
 */
function parsePunctuation( punctuationVal ) {
	if ( punctuationVal.match( REGEX_PUNC_VERIFY ) ) {
		return true;
	} else {
		continueProcessing = false;
		createError( '[SYNTAX ERROR]: ','\t Unidentified punc-token:' + punctuationVal );
		return false;
	}

}

/**
 * Remove [ , ] , numbers , and : from
 * category.
 *
 * @param {string} categoryToken - Value to parse.
 * @return {string} cat - parsed string
 * TODO
 */
function parseCategory( categoryVal ) {
	if ( categoryVal.match( REGEX_CAT_VERIFY ) ) {
		// If there is a match check the words
		if ( ( sanitizeCategory( categoryVal ) ) === CAT1 || ( sanitizeCategory( categoryVal ) ) === CAT2 || ( sanitizeCategory( categoryVal ) ) === CAT3 ) {
			return true;
		} else {
			continueProcessing = false;
			createError( '[SYNTAX ERROR]: ','\tCategory should be either Verse, Chorus or Bridge starting with a capital letter' );
		}
	} else {
		continueProcessing = false;
		createError( '[SYNTAX ERROR]: ','\tCategory should be in brackets and have a colon before the last bracket: NOT - ' + categoryVal );
		createError( '[SOLUTION] ','\t[Verse 1:], [Verse 2:] ... or [Chorus:] or [Bridge:]' );
	}
	return false;
}

function sanitizeCategory( c ) {
	var cat = c;
	cat = cat.replace( REGEX_CAT_SANITIZER, "" );
	return cat.trim();
}

function createError( type, msg ) {
	var errObj = {
		type: type,
		message: msg
	}
	console.log(type + msg);
	errors.push( errObj );
}

module.exports = Parser;
