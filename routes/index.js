module.exports = function ( io ) {
	var express = require( 'express' );
	var util = require( 'util' )
	var fs = require( 'fs' );
	var _ = require( 'underscore' );


	var startProcessing = require( '../lib/preprocessor.js' );
	var fileHistory = require( '../uploads/file-history.json' );
	var tokenizer = require( '../lib/lexTool.js' );
	var parser = require( '../lib/parserTool.js' );
	var sema = require( '../lib/semaTool.js' );
	var ir = require( '../lib/IRGeneration.js' );
	var List = require( '../util/linked-list.js' );
	var Optimizer = require( '../lib/Opti.js' );
	var opt = new Optimizer();

	var router = express.Router();
	io.on( 'connection', function ( socket ) {

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

		var preprocessObject;
		var lexObject;
		var semaObject;
		var parseObject;
		var irObject;
		var symbolTable;
		var optiObject;
		var codeGen;

		var service = {
			type: 'web',
			translate: 'off',
			table: '',
			table: {}
		}

		var symbolTableEmpty;
		var pervFile = '';
		/* GET home page. */
		router.get( '/', function ( req, res, next ) {
			res.render( 'index', {
				title: '-Music Compiler Magic-'
			} );
		} );

		/* POST client events. */
		router.post( '/events', function ( req, res, next ) {
			res.render( 'index', {
				title: '-Music Compiler Magic-'
			} );
		} );

		/* POST accept text or file and render home page with value*/
		router.post( '/', function ( req, res, next ) {
			var file = req.file;
			var text = req.body.text;
			var translate = req.body.translate;
			var opt1 = req.body.opt1;
			var opt2 = req.body.opt2;
			var share = req.body.share;



			util.log( 'Request recieved: method: ' + req.method + ' url: ' + req.url ); // this line logs just the method and url

			if ( typeof ( translate ) != 'undefined' ) {
				service.translate = translate;
			}


			if ( typeof ( opt1 ) != 'undefined' ) {
				service.opt1 = opt1;
			}

			if ( typeof ( opt2 ) != 'undefined' ) {
				service.opt2 = opt2;
			}

			if ( typeof ( translate ) != 'undefined' ) {
				service.translate = translate;
			}

			if ( typeof ( text ) != 'undefined' || typeof ( file ) != 'undefined' ) {

				if ( file ) {
					prevFile = file.path;
					compile( getFileData( prevFile ) );
				}

				if ( text ) {
					compile( text );
				}

				// Check if translate was selected and perform translation
				if ( translate === 'on' ) {
					params.text = irObject.data.ir
					ms_client.translate( params, function ( err, data ) {

						if ( data ) {
							irObject.data.ir = String( data )
							if ( allHasValue( symbolTable ) ) {
								socketShareEvent( share );
							}
							res.render( 'index', {
								title: '-Music Compiler Magic-',
								preprocessData: preprocessObject,
								lexData: lexObject,
								parseData: parseObject,
								semaData: semaObject,
								irData: irObject,
								symbolTableData: allHasValue( symbolTable ) ? symbolTable : symbolTableEmpty,
								optiData: optiObject
							} );
						}

						if ( err ) {}
					} );

				} else {
					// handle socket - first check if compilation was a success
					if ( allHasValue( symbolTable ) ) {
						socketShareEvent( share );
					}

					res.render( 'index', {
						title: 'Music Compiler Magic',
						preprocessData: preprocessObject,
						lexData: lexObject,
						parseData: parseObject,
						semaData: semaObject,
						irData: irObject,
						symbolTableData: allHasValue( symbolTable ) ? symbolTable : symbolTableEmpty,
						optiData: optiObject
					} );
				}
			}
			util.log( '[POST] - completed' );
		} );


		function compile( data ) {
			util.log( 'Compiler called' );
			createObjects()

			preprocessObject = startProcessing( data, service );

			util.log( 'Preprocess Phase' )
			updateSymbolTableData( preprocessObject.service.table )

			if ( preprocessObject.err.there_is  == false ) {
				lexObject = tokenizer( preprocessObject.data, preprocessObject.service );
				updateSymbolTableData( lexObject.service.table )
			} else {
				return;
			}
			util.log( 'Lexical Phase' )

			if ( lexObject.err.there_is  == false ) {
				parseObject = parser( lexObject.data, lexObject.service );
				updateSymbolTableData( parseObject.service.table )
			} else {
				return;
			}

			util.log( 'Sematic Phase' )
			if ( parseObject.err.there_is  == false ) {
				semaObject = sema( parseObject.data, parseObject.service );
				updateSymbolTableData( semaObject.service.table )
			} else {
				return;
			}

			util.log( 'IR Phase' )
			if ( semaObject.err.there_is  == false ) {
				irObject = ir( semaObject.data, semaObject.service );
			} else {
				return;
			}

			util.log( 'OPTI Phase' )
			if ( semaObject.err.there_is == false ) {
				optiObject = opt.Optimizer( irObject.data.ir,irObject.data.ir.length ,semaObject.service );
			} else {
				return;
			}
		}

		function socketShareEvent( shared ) {
			if ( typeof ( shared ) != 'undefined' ) {
				// get compressed file and send it
				util.log('Requesting share')
				socket.broadcast.emit( 'share', {
					trigger: 'modal',
					table: symbolTable,
					ir: irObject.data
				} )
			}

			socket.on('send file', function(){
				var filename = './out/code.txt'
				util.log('sending file')
				ss( socket ).emit( 'file', stream, {
					irCode: irObject.data,
					title: symbolTableData.Title
				} );
				fs.createReadStream( filename ).pipe( stream );
			})
		}

		/* getFileData
		 *
		 *
		 */
		function getFileData( filePath ) {
			var contents = fs.readFileSync( filePath, 'utf8' );
			return contents;
		}

		function updateSymbolTableData( table ) {
			symbolTable = table;
		}

		function allHasValue( obj ) {
			var result = true;
			_.each( obj, function ( val, key ) {
				if ( val === '' ) {
					result = false;
					return;
				}
			} )
			return result;
		}


		function removeFile() {
			fs.exists( pervFile, function ( exists ) {
				if ( exists ) {
					//Show in green
					console.log( 'File exists. Deleting now ...'.green );
					fs.unlink( prevFile );
				} else {
					//Show in red
					console.log( 'File not found, so not deleting.'.red );
				}
			} );
		}

		function createpreprocessObject() {
			return {
				err: {
					errors: []
				},
				data: ''
			};
		}

		function createlexObject() {
			return {
				err: {
					errors: []
				},
				data: new List()
			};
		}

		function createsemaObject() {
			return {
				err: {
					errors: []
				},
				data: ''
			};
		}

		function createparseObject() {
			return {
				err: {
					errors: []
				},
				data: ''
			};
		}

		function createirObject() {
			return {
				err: {
					errors: []
				},
				data: {
					ir: null,
					ir_ascii: {
						data: ''
					}
				}
			};
		}

		function createObjects() {
			preprocessObject = createpreprocessObject();
			lexObject = createlexObject();
			semaObject = createsemaObject();
			parseObject = createparseObject();
			irObject = createirObject();
			symbolTable = {
				Genre: 'Gospel',
				Title: '',
				Song_Struc: '',
				Lines: '',
				WordCount: ''
			}
			service.table = symbolTable;
		}
	} );
	return router;
}
