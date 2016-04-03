/**
 * @author Dimitri Harding
 */
'use strict';



var traverse = require( 'traverse' );
var Stack = require( '../util/stack.js' );
var ir = require( './IRGeneration.js' );
var fs = require( 'fs' );
var _ = require( 'underscore' );
var traverse = require( 'traverse' );
var spellchecker = require( 'spellchecker' );
spellcheckerLoadCus()

var pass;
var songStructure;
var structureVerification;
var spellCheckVerification;
var capitalizedCheckVerification;
var curseCheckVerification;
var semaObj;
/* Constants */
var A = 'VerseNode';
var B = 'ChorusNode';
var C = 'BridgeNode';
var S1 = [ A, A, B, B ];
var S2 = [ A, B, A ];
var S3 = [ A, A, A, A ];
var S4 = [ A, B, C, B, A ];
var S5 = [ A, B, A, B, C, B ];
var S6 = [ A, B, A, C, A, B, A ];
var S7 = [ B, A, B, A, C, B, B ];
var SONG_STRUCTURES = [ S1, S2, S3, S4, S5, S6, S7 ];

/**
 * sema(ast)
 * Perform sematical analysis on parse tree
 *
 * @param {json} ast - The parse tree from the lex phase
 * @return {json} ast - The parse that was verified
 */
function Sema( ast, service ) {
	//Create a initialize variables function
	semaObj = {
		data: null,
		err: {
			errors: [],
			there_is: false
		}
	};
	songStructure = [];
	structureVerification = false;
	spellCheckVerification = false;
	capitalizedCheckVerification = false;
	curseCheckVerification = false;
	pass = false;
	songStructure = findChildrenType( ast, 'CategoryNode' );

	wordsSpellChecker( ast );
	checkStructure( songStructure );
	checkCaps( ast );
	checkCurse( ast );
	if ( structureVerification && spellCheckVerification && capitalizedCheckVerification && curseCheckVerification ) {
		service.table.Song_Struc = songStructure;
		pass = true;
	}

	semaObj.data = ast;
	semaObj.service = service;
	semaObj.service.string = renderTble();
	if ( semaObj.err.errors.length > 0 ) {
		semaObj.err.there_is = true;
		semaObj.err.string = renderErrors();
	}

	if ( service === 'cli' ) {
		if ( !pass ) {
			console.log( semaObj.err.errors );
		} else {
			// this is only called when the command line is used
			ir( ast, service );
		}
	}

	// This returns semaObject to web service and IR is call from within that
	return semaObj;

	function renderErrors() {
		var errString = '';
		semaObj.err.errors.forEach( function ( obj ) {
			errString = errString.concat( obj.type + '\n' + obj.message + '\n\n' )
		} );
		return errString;
	}

	function renderTble() {
		var tableString = '';
		_.each( service.table, function ( val, key ) {
			tableString = tableString.concat( key + '\t\t' + val + '\n\n' )
		} );
		return tableString;
	}
}

/**
 * checkStructure
 * Checks if the structure of the song is the accepted order
 *
 * Lyric Structures
 * AABB, ABA, AAAA, ABCBA, ABABCB, ABACABA
 *
 * Exception - Chorus at the start
 * BABACBB
 *
 * @return {boolean} correctStruc - The state of the structure
 */

function checkStructure( songStructure ) {
	var expected;
	var pass = false;

	expected = createStack( SONG_STRUCTURES );
	while ( !expected.isEmpty() ) {
		if ( _.isEqual( expected.peek(), songStructure ) ) {
			pass = true;
			break;
		}
		expected.pop();
	}

	if ( pass ) {
		structureVerification = true;

	} else {
		createError( '[SEMATIC - STRUCTURE CHECK]: ', 'Song structure is invalid\n' + '[SOLUTION]: ' + 'A: Verse B: Chorus C: Bridge \nAccepted: BABACBB | AABB | ABA | AAAA | ABCBA | ABABCB | BABABCB | ABACABA' + '\nActual: ' + songStructure.toString().replace( ',', '' ) )
		console.log( '[Semantic ERROR]: ' + 'Song structure is invalid' );
		console.log( '[SOLUTION]: ' + '\nA: Verse \nB: Chorus \nC: Bridge\nAccepted: BABACBB | AABB | ABA | AAAA | ABCBA | ABABCB | BABABCB | ABACABA' );
	}
}

function checkCaps( json ) {
	var caps = getFileData( './resources/dictionary/caps.txt' )
	var capWords = [];
	var listOfWords = findWords( json );
	var flag = 0;
	caps.trim();
	capWords = caps.split( '\n' );

	_.each( listOfWords, function ( word ) {
		_.each( capWords, function ( capWord ) {
			if ( word.toLowerCase() === capWord.toLowerCase() ) {
				if ( word !== capWord ) {
					createError( '[SEMATIC - CAPITALIZED ERRO]', 'This should be capitalized a word --> ' + word )
					flag++;
				}
			}
		} );
	} );
	if ( flag === 0 ) {
		capitalizedCheckVerification = true;
	}
}

function checkCurse( json ) {
	var curse = getFileData( './resources/dictionary/curse.txt' )
	var curseWords = [];
	var listOfWords = findWords( json );
	var flag = 0;
	curse.trim();
	curseWords = curse.split( '\n' );

	_.each( listOfWords, function ( word ) {
		_.each( curseWords, function ( curWord ) {
			if ( word.toLowerCase() === curWord.toLowerCase() ) {
				createError( '[SEMATIC - Forbidden]', 'This should not be apart of lyrics --> ' + word )
				flag++;
			}
		} );
	} );
	if ( flag === 0 ) {
		curseCheckVerification = true;
	}
}

function wordsSpellChecker( json ) {
	var listOfWords = findWords( json );
	var flag = 0;
	var corrections;
	_.each( listOfWords, function ( word ) {
		word = cleanWord( word );
		corrections = [];
		if ( spellchecker.isMisspelled( word ) ) {
			// Add word to error object
			corrections = spellchecker.getCorrectionsForMisspelling( word );
			createError( '[SEMATIC - SPELL CHECK]', 'Misspelled word -->' + word )
			if ( corrections.length > 0 ) {
				_.each( corrections, function ( correct ) {
					createError( '\t[SEMATIC - SPELL CORRECTION]', 'Possible correction for ' + word + ' could be ' + correct )
				} );
			}
			flag++;
		}
	} );
	if ( flag === 0 ) {
		spellCheckVerification = true;
	}
}

function findWords( json ) {
	var results = [];
	if ( json.children[ 1 ].children ) {
		json.children[ 1 ].children.forEach( function ( child ) {
			child.children.forEach( function ( child ) {
				child.children.forEach( function ( child ) {
					if ( child.type === 'WordNode' ) {
						results.push( child.value );
					}
				} );
			} );
		} );
	}
	return results;
}

function getLeafNodes( leafNodes, obj ) {
	if ( obj.children ) {
		obj.children.forEach( function ( child ) {
			getLeafNodes( leafNodes, child )
		} );
	} else {
		leafNodes.push( obj );
	}
}

function findChildrenType( json, type ) {
	var results;
	if ( json.children ) {
		json.children.forEach( function ( child ) {
			if ( child.type === type ) {
				results = child.children.map( function ( leafNode ) {
					return leafNode.type;
				} );
			}
		} );
	}
	return results;
}

function createError( type, msg ) {
	var errObj = {
		type: type,
		message: msg
	}
	semaObj.err.errors.push( errObj );
}

function spellcheckerLoadCus() {
	var cusWords = [];
	var custom = getFileData( './resources/dictionary/custom.txt' )
	custom.trim();
	cusWords = custom.split( '\n' );
	_.each( cusWords, function ( word ) {
		spellchecker.add( word )
	} );
}

function createStack( struc ) {
	var stack = new Stack();
	struc.forEach( function ( ele ) {
		stack.push( ele );
	} )
	return stack;
}

function getFileData( filePath ) {
	var contents = fs.readFileSync( filePath, 'utf8' );
	return contents;
}

function cleanWord( word ) {
	//check if work has punc at the end and remove it
	var punc = '';
	var PUNC = /\.|\!|\'|\?|\:|\.|\,/
	punc = word.slice( -1 );
	if ( punc.match( PUNC ) ) {
		word = word.replace( punc, '' );
	}
	return word;
}

module.exports = Sema;
