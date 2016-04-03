/**
 * @author Andre Hutchinson
 */
var path = require( 'path' );
var fs = require( 'fs' );
var ObjGen = require( path.resolve( './lib', 'ttaObjectGen.js' ) );
var translator = require( path.resolve( './lib', 'translate', 'google-translate.js' ) );
var Optimizer = require( './Opti.js' );
var opt = new Optimizer();
var err = {};
var red_flag = false;
var errors = [];
var pass = false;
function print(X){process.stdout.write('\n'); process.stdout.write(X); process.stdout.write('\n')};

function irgeneration( ast, service ) {
	//myLyricsBuffer: used to hold the contents of the ast i.e. the lyrics
	var myLyricsBuffer = "";
	//symbolFlag: This flag is triggered if there is a symbol at the end of a line in order to determine if a comma should be placed there or not
	//symbolFlag, tmpGlobalCount, tmpBodyIte, tmpIte:: captures the location of the last word in a line
	var symbolFlag, tmpGlobalCount, tmpBodyIte, tmpIte;
	var lyrics = [];
	var count = 0;
	var lWord = "";

	for ( var globalCount = 0; globalCount < Object.keys( ast.children[ 1 ].children ).length; globalCount++ ) {
		for ( var bodyIte = 0; bodyIte < Object.keys( ast.children[ 1 ].children[ globalCount ].children ).length; bodyIte++ ) {
			lyrics[ count ] = "";
			for ( var ite = 0; ite < Object.keys( ast.children[ 1 ].children[ globalCount ].children[ bodyIte ].children ).length; ite++ ) {
				lyrics[ count ] += ast.children[ 1 ].children[ globalCount ].children[ bodyIte ].children[ ite ].value;
				//tracks the value of the variables in order to check symbols presence on the last word+
				tmpGlobalCount = globalCount;
				tmpBodyIte = bodyIte;
				tmpIte = ite;
				//tracks the value of the variables in order to check symbols presence on the last word-

				//add spaces between words+
				if ( ite < Object.keys( ast.children[ 1 ].children[ globalCount ].children[ bodyIte ].children ).length - 1 ) {
					lyrics[ count ] += " ";
				}
				//add spaces between words-
			}

			lWord = "";
			lWord = ast.children[ 1 ].children[ tmpGlobalCount ].children[ tmpBodyIte ].children[ tmpIte ].value;
			var indx = lWord.length - 1;
			lWord = "";
			if ( ast.children[ 1 ].children[ tmpGlobalCount ].children[ tmpBodyIte ].children[ tmpIte ].value[ indx ] === "." ) {
				symbolFlag = 1;
			};
			if ( ast.children[ 1 ].children[ tmpGlobalCount ].children[ tmpBodyIte ].children[ tmpIte ].value[ indx ] === ";" ) {
				symbolFlag = 1;
			};
			if ( ast.children[ 1 ].children[ tmpGlobalCount ].children[ tmpBodyIte ].children[ tmpIte ].value[ indx ] === "?" ) {
				symbolFlag = 1;
			};
			if ( ast.children[ 1 ].children[ tmpGlobalCount ].children[ tmpBodyIte ].children[ tmpIte ].value[ indx ] === "," ) {
				symbolFlag = 1;
			};
			if ( ast.children[ 1 ].children[ tmpGlobalCount ].children[ tmpBodyIte ].children[ tmpIte ].value[ indx ] === "!" ) {
				symbolFlag = 1;
			};
			//Checking for symbols at the end of each line-

			//Does the line need a comma or not+
			if ( symbolFlag === 1 ) {
				symbolFlag = 0;
				lyrics[ count ] += " ";
			} else {
				lyrics[ count ] += ", ";
			}
			count++;
			//Does the line need a comma or not-
		}
	}
	myLyricsBuffer = "";
	for ( var i = 0; i < lyrics.length; i++ ) {
		myLyricsBuffer += lyrics[ i ] + '\n';
	}

	var errObject = {
			errs: [
	]
		}
		//sends lyrics to file ir.txt+
	fs.writeFileSync( './out/phases/ir.txt', myLyricsBuffer);
		//sends lyrics to file ir.txt-

	//sends lyrics ascii to file ir_ascii.txt+[possibly redundant code]
	var buf = new Buffer( myLyricsBuffer.length );
	for ( var i = 0; i < myLyricsBuffer.length; i++ ) {
		buf[ i ] = myLyricsBuffer.charCodeAt( i );
	}
	//sends lyrics ascii to file ir_ascii.txt++[possibly redundant code]
	var ascii = "";
	for ( var i = 0; i < myLyricsBuffer.length; i++ ) {
		ascii += parseInt(myLyricsBuffer.charCodeAt( i ));
	}
	//Optimizer call
	opt.Optimizer(myLyricsBuffer,myLyricsBuffer.length,service);

	fs.writeFile( './out/phases/ir_ascii.txt', ascii, function ( err ) {
		pass = true;
		if ( err ) {
			return console.log( err );
		} else {
			if ( service === 'cli' ) {
				if ( !pass ) {
					//process.exit(1);
				} else {
					ObjGen( lyrics, service );
					//opt.Optimizer(buf,myLyricsBuffer.length);
				}
			}
		}
	} )
	//sends lyrics ascii to file ir_ascii.txt+[possibly redundant code]
	return {
		err: errObject,
		data: {
			"ir": myLyricsBuffer,
			"ir_ascii": ascii
		}
	};
}


// Exporting ir module+
module.exports = irgeneration;
// Exporting ir module-
