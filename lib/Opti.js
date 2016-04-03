/**
 *@author Megan Hutchinson
 */
var fs = require( 'fs' );
var bytes = require( 'bytes' );
var huff = require( '../util/huffman.js' );
var huffman = "";
var encoded = "";
var binary = "";

var Optimizer = function () {
	var optiObject = {
		data: {
			binary: ""
		}
	};
	self = this;
	var m = "";

	//Removes 91 and 93
	self.Optimizer = function ( buf, count, service ) {
		var opt1;
		//by default use opti1 check if others are selected

		if ( typeof ( service.opt1 ) != 'undefined' && typeof ( service.opt2 ) != 'undefined' ) {
			opt1 = remove();
			compress( opt1 );
			optiObject.data.string = '\t Removed brackets and compressed file'

		} else if ( typeof ( service.opt1 ) != 'undefined' && typeof ( service.opt2 ) === 'undefined' ) {
			opt1 = remove();
			optiObject.data.string = '\t Removed brackets'
		} else if ( typeof ( service.opt2 ) != 'undefined' && typeof ( service.opt1 ) === 'undefined' ) {
			compress( buf );
			optiObject.data.string = '\t Compressed file'
		} else {
			//DO Default
			optiObject.data.string = '\t Removed brackets - Default optimization'
			opt1 = remove();
		}

		function remove() {
			for ( var i = 0; i < count; i++ ) {
				if ( buf[ i ] === '91' ) {
					buf[ i ] = '';
				}
				if ( buf[ i ] === '93' ) {
					buf[ i ] = '';
				}
				//Stores the Ascii code without 91 and 93
				m += buf[ i ];
				//Compresses the Ascii code generated
			}
			return m;
		}

		function compress( text ) {
			huffman = '';
			huffman = huff.treeFromText( text );
			encoded = huffman.encode( text );
		}

		//Creates a binary file

		//Creates a binary file
		//It writes the binary file
		fs.writeFile( './out/opti.bin', binary, function ( err ) {
			if ( err ) {
				return console.log( err );
			}
		} );
		//Creates a file which only has 91 and 93 removed
		fs.writeFile( './out/opti.txt', m, function ( err ) {
			if ( err ) {
				return console.log( err );
			}
		} );
		//Creates a file that is compressed
		fs.writeFile( './out/code.txt', encoded, function ( err ) {
			if ( err ) {
				return console.log( err );
			}
		} );
		// if ( typeof ( service.opt2 ) != 'undefined' ) {
		// 	var beforeSize = getFilesizeInBytes('./out/phases/ir.txt');
		// 	var afterSize = getFilesizeInBytes('./out/code.txt');
		// 	console.log(beforeSize+'-->');
		// 	optiObject.data.fileSize.before = bytes(beforeSize);
		// 	optiObject.data.fileSize.after = bytes(beforeSize);
		// }

		binConvert();
		return optiObject;

	}

	function getFilesizeInBytes( filename ) {
		var stats = fs.statSync( filename )
		var fileSizeInBytes = stats[ "size" ]
		return fileSizeInBytes
	}

	function getFileData( filePath ) {
		var contents = fs.readFileSync( filePath, 'utf8' );
		return contents;
	}

	function binConvert() {
		var binVert = getFileData( './out/phases/ir_ascii.txt' );
		for ( var i = 0; i < binVert.length; i++ ) {
			var a = binVert.charCodeAt( i ).toString( 2 );
			a = new Array( 9 - a.length ).join( '0' ) + a;
			binary += a + ' ';
		}
		optiObject.data.binary = binary;
	}
}

/*
 *Exports module
 */
module.exports = Optimizer;
