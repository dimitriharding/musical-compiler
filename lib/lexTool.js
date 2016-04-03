/**
 * @author Dimitri Harding & Sheyinka Harry
 */
'use strict';
var _ = require( 'underscore' );
var List = require( '../util/linked-list.js' );
var tokens = new List();
var parser = require( './parserTool.js' );
var fs = require( 'fs' );

var err;
var red_flag;
var errors;
var lexObj;

/* Regex Expressions */
var REGEX_LINE = /(.+)/gmi // matches a line except whitespaces
var REGEX_CATAGORY = /^(\[.+\])/mi // matches a category
var REGEX_TITLE = /^(“|").+$/mi // matches title
var REGEX_SPACE = /\s/ //matches whitespaces
var REGEX_WORD = /\w+/i // matches any word
var REGEX_WORD_WITH_APOS = /\w+'\w+/i // matches any word with apostrophe
var REGEX_SENTENCE = /([a-z ].+)/i // matches any sentence
var REGEX_WORD_WITH_Q = /“\w+|\w+”|\w+"|"\w+/i
var REGEX_WORD_PUNC = /\w+\!|\w+\?|\w+\.|\w+\-|\“\w+|\w+\”|\w+\"|\"\w+|\w+\'|\w+\:|\:\w+/gmi //matches any word with punctuations

/**
 * tokenize(str)
 * extracts semantically useful tokens from a string containing English-language sentences
 *
 * @param {String} the string to tokenize
 * @return {LinkedList} contains extracted tokens
 */
var Tokenizer = function ( buffer, service ) {
	var lines = [];
	var count = 0;
	var countLin = 0;
	var countWord = 0;
	var prev = 0;
	var overview = []
	err = {
		errors: [],
		there_is: false
	};
	red_flag = false;
	errors = [];
	lexObj = {
		data: new List(),
		err: {
			errors: [],
			there_is: false
		}
	};

	buffer.trim();
	buffer.split( '' ).forEach( function ( c ) {
		var temp = count;
		if ( c === ' ' || c === '\n' ) {
			overview.push( {
				'word': buffer.substring( prev, count ),
				'pos': {
					'start': prev,
					'end': temp - 1,
					'line': countLin
				}
			} );
			prev = count;
			prev += 1;
			countWord++;
		} else {}

		if ( c === '\n' ) {
			countLin++;
		}
		count++;
	} );

	// check if there was any matches found and throw an error if not
	if ( ( lines = buffer.match( REGEX_LINE ) ) != [] ) {
		var wordCount = 0;
		// process each line and generate token stream
		_.each( lines, function ( lineToProcess, index ) {
			var token = {};
			//Checks if line is title
			if ( isTitle( lineToProcess ) ) {
				// insert title token in parse tree
				token = processTitle( lineToProcess );
				tokens.insert( token );

				var words = [];
				words = getWords( lineToProcess.trim() );
				//loops through words
				_.each( words, function ( wordToProcess, index ) {
					var token = {};
					if ( isWord( wordToProcess ) ) {
						// insert word token in parse tree
						token = processWord( wordToProcess, overview[ wordCount ] );
						tokens.insert( token );

						wordCount++;
					} else {
						// throws error if word not found
						console.log( 'LEXER: Unknown character\/s: - word' + wordToProcess )
						err.errors.push( 'LEXER: Unknown character\/s: - word' + wordToProcess )
						return;
					}
				} );

				// TODO: Get words and punc if any and insert in tokens
			}
			// else check if line is category
			else if ( isCategory( lineToProcess ) ) {
				// insert category token in parse tree
				token = processCategory( lineToProcess, overview[ wordCount ] )
				tokens.insert( token );
			}
			// else check if line is a sentence
			else if ( isSentence( lineToProcess ) ) {
				// insert sentence token in parse tree
				token = processSentence( lineToProcess, overview[ wordCount ] );
				tokens.insert( token );

				var words = [];
				words = getWords( lineToProcess.trim() );
				//loops through words
				_.each( words, function ( wordToProcess, index ) {
					var token = {};
					if ( isWord( wordToProcess ) ) {
						// insert word token in parse tree
						token = processWord( wordToProcess, overview[ wordCount ] );
						tokens.insert( token );
						//checks if word has punctuation in it and inserts in parse tree
						if ( hasPunctuation( wordToProcess ) ) {
							token = processPunctuation( wordToProcess, overview[ wordCount ] );
							tokens.insert( token );
						}

						wordCount++;
					} else {
						// throws error if word not found
						console.log( 'LEXER: Unknown character\/s: - word' + wordToProcess + ' @ ' + JSON.stringify( overview[ wordCount ].pos, null, ' ' ) )
						err.errors.push( 'LEXER: Unknown character\/s: - word' + wordToProcess + ' @ ' + JSON.stringify( overview[ wordCount ].pos, null, ' ' ) )
						err.there_is = true;
						return;
					}
				} );

			}
			// finally throws error
			else {
				console.log( 'LEXER: Unknown character\/s: - line ' + lineToProcess )
				err.errors.push( 'LEXER: Unknown character\/s: - line ' + lineToProcess )
				err.there_is = true;
			}
		} );

	} else {
		console.log( 'LEXER: No data to be tokenized' )
		err.errors.push( 'LEXER: No data to be tokenized' )
		err.there_is = true;
	}

	/**
	 * Write phase output to a file in out folder
	 */
	lexObj.data = tokens;
	lexObj.err = err;
	lexObj.err.string = renderErrors();
	lexObj.err = err;
	lexObj.service = service;
	if ( lexObj.err.errors.length > 0 ) {
		lexObj.err.there_is = true;
	}

	function renderErrors() {
		var errString = '';
		lexObj.err.errors.forEach( function ( obj ) {
			errString = errString.concat( obj + '\n\n' )
		} );
		return errString;
	}

	fs.writeFile( './out/phases/lex.json', tokens.getStream(), function ( err ) {
		if ( err ) {
			return console.log( err );
		} else {
			return; //console.log( 'Lex file created' );
		}
	} );

	// TODO: Call Paser or return tokens
	if ( service === 'cli' ) {
		if ( red_flag ) {
			//process.exit(1);
		} else {
			parser( tokens, service );
		}
	} else {
		return lexObj;
	}
}

/**
 * processTitle(str)
 * creates token object for title
 *
 * @param {String} the string to tokenize
 * @return {token} contains properties of token
 */
function processTitle( line ) {
	var tok = {
		name: 'TITLE',
		value: line.trim(),
		//pos: buf.indexOf(line)
	}
	return tok;
}

/**
 * processCategory(str)
 * creates token object for category
 *
 * @param {String} the string to tokenize
 * @return {token} contains properties of token
 */
function processCategory( line ) {
	var tok = {
		name: 'CATEGORY',
		value: line.trim(),
		//pos: line.index()
	}
	return tok;
}

/**
 * processSentence(str)
 * creates token object for sentence
 *
 * @param {String} the string to tokenize
 * @return {token} contains properties of token
 */
function processSentence( line ) {
	var tok = {
		name: 'SENTENCE',
		value: line.trim(),
		//pos: line.index()
	}
	return tok;
}

/**
 * processWord(str)
 * creates token object for words
 *
 * @param {String} the string to tokenize
 * @return {token} contains properties of token
 */
function processWord( word, Obj ) {

	var tok = {
		name: 'WORD',
		value: word.trim(),
		pos: Obj.pos
	}
	return tok;
}

/**
 * processPunctuation(str)
 * creates token object for words
 *
 * @param {String} the string to tokenize
 * @return {token} contains properties of token
 */
function processPunctuation( word ) {
	word.trim();
	var tok;
	word.split( '' ).forEach( function ( x ) {
		if ( x === "." ) {
			tok = {
				name: 'FULLSTOP',
				value: x
			}
		}

		if ( x === ':' ) {
			tok = {
				name: 'COLON',
				value: x,
			}
		}

		if ( x === '!' ) {
			tok = {
				name: 'EXCLAMATION',
				value: x,
			}
		}

		if ( x === '?' ) {
			tok = {
				name: 'QUESTION',
				value: x,
			}
		}

		if ( x === ',' ) {
			tok = {
				name: 'COMMA',
				value: x,
			}
		}

		if ( x === "'" ) {
			tok = {
				name: 'APOSTROPHE',
				value: x,
				//pos: word.index()
			}
		}

	} );
	return tok;
}

/**
 * getWords(str)
 * creates an array of words from string
 *
 * @param {String} the string to be split in words
 * @return {Array} contains words from string
 */
function getWords( sentence ) {
	return sentence.split( REGEX_SPACE );
}

/**
 * isTitle(str)
 * checks if string matches regex for title
 *
 * @param {String} the string to test
 * @return {Boolean} if it matches or not
 */
function isTitle( str ) {
	return str.match( REGEX_TITLE );
}

/**
 * isCategory(str)
 * checks if string matches regex for title
 *
 * @param {String} the string to test
 * @return {Boolean} if it matches or not
 */
function isCategory( str ) {
	return str.match( REGEX_CATAGORY );
}

/**
 * isSentence(str)
 * checks if string matches regex for sentence
 *
 * @param {String} the string to test
 * @return {Boolean} if it matches or not
 */
function isSentence( str ) {
	return str.match( REGEX_SENTENCE )
}

/**
 * isWord(str)
 * checks if string matches regex for word
 *
 * @param {String} the string to test
 * @return {Boolean} if it matches or not
 */
function isWord( str ) {
	return str.match( REGEX_WORD ) || str.match( REGEX_WORD_WITH_APOS || str.match( REGEX_WORD_WITH_Q ) )
}

/**
 * hasPunctuation(str)
 * checks if string matches regex for word
 *
 * @param {String} the string to test
 * @return {Boolean} if it matches or not
 */
function hasPunctuation( str ) {
	return str.match( REGEX_WORD_PUNC )

}

// Exporting module
module.exports = Tokenizer;
