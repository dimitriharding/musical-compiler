var socket;
var client;
var heruko = 'https://music-compiler-magic.herokuapp.com/';
var localhost = 'http://localhost:3000/';
var url = window.location.href;
url = url + '';
var Decoder = new TextDecoder();
var tableData;
var irData;
var player;
var wavesurfer;

/**********************************************************************/
// connect client based on url
//client = url.includes( 'localhost' ) ? localhost : heruko;
socket = io.connect( heruko );


/* call will have object sent from client
 *
 */
socket.on( 'share', function ( call ) {
	setTimeout( function () {
		$( '#songTile' ).text( ' The name of the song is: ' + call.table.Title )
		$( '#sharedFile' ).openModal();
	}, 1000 );
	tableData = call.table;
	irData = call.ir;
} );

socket.on( 'file', function ( call ) {
	if ( call.file ) {
		var str = ab2str( call.buffer );
		console.log( tableData.Title );
		$( '#ir' ).text( str )
		$( '#try' ).text( tableData.Title )
		songSynthesis();
	}
} );

/*********************************************************************/
function requestFile() {
	console.log( '----> requesting file' );
	socket.emit( 'send file' );
}

// uint array to string
function ab2str( buf ) {
	return String.fromCharCode.apply( null, new Uint8Array( buf ) );
}

function expandAll() {
	$( ".collapsible-header" ).addClass( "active" );
	$( ".collapsible" ).collapsible( {
		accordion: false
	} );
}

function collapseAll() {
	$( ".collapsible-header" ).removeClass( function () {
		return "active";
	} );
	$( ".collapsible" ).collapsible( {
		accordion: true
	} );
	$( ".collapsible" ).collapsible( {
		accordion: false
	} );
}

function songSynthesis() {
	if ( 'speechSynthesis' in window ) {
		wavesurfer = WaveSurfer.create( {
			container: '#waveform',
			waveColor: 'violet',
			progressColor: 'purple',
			interact: false
		} );
		var timeOut = 1000;
		console.log( 'IR ---> Fired' );
		var text = $( '#ir' ).val();
		var title = $( '#titleData' ).html();
		if ( title !== undefined ) {
			title = title.toLowerCase();
		} else {
			title = tableData.Title.toLowerCase();
			text = irData.ir;
		}
		var msg = new SpeechSynthesisUtterance();
		var voices = window.speechSynthesis.getVoices();
		msg.voice = voices[ $( '#voices' ).val() ];
		msg.text = text;

		wavesurfer.on( 'ready', function () {
			wavesurfer.play();
		} );

		msg.onend = function ( e ) {
			console.log( 'Finished in ' + event.elapsedTime + ' seconds.' );
			setTimeout( function () {
				wavesurfer.empty();
				wavesurfer.stop();
			}, 2000 );
		};
		console.log( speechSynthesis );
		//do check here
		if ( title.indexOf( 'take me to the king' ) > -1 ) {
			wavesurfer.load( 'mp3/take_.mp3' );
			timeOut = 20000;
		} else if ( title.indexOf( 'break every chain' ) > -1 ) {
			wavesurfer.load( 'mp3/break_.mp3' );
			timeOut = 15000;
		} else {
			// some default
		}
		setTimeout( function () {
			speechSynthesis.speak( msg );
		}, timeOut );
	} else {
		$( '#support' ).openModal();
	}
}

function pauseSong() {
	var $icon = $( '#play-icon' )
	if ( 'speechSynthesis' in window ) {
		if ( speechSynthesis.paused == true || speechSynthesis.speaking == true ) {
			if ( $icon.text() == 'pause' ) {
				speechSynthesis.pause();
				wavesurfer.pause();
			}

			if ( $icon.text() == 'play_arrow' ) {
				speechSynthesis.resume();
				wavesurfer.play();
			}

			$icon.html( $icon.html() == "pause" ? "play_arrow" : "pause" );
		} else {
			Materialize.toast( 'There is no song to pause or play - please compile', 4000 );
		}
	}
}

function stopSong() {
	var $icon = $( '#play-icon' )
	if ( wavesurfer.isPlaying() ) {
		wavesurfer.empty();
		wavesurfer.stop();
	}
	if ( 'speechSynthesis' in window ) {
		if ( speechSynthesis.paused == true || speechSynthesis.speaking == true ) {
			speechSynthesis.cancel();
			wavesurfer.stop();
			$icon.html( "pause" );
			Materialize.toast( 'Song Stopped', 4000 );
		} else {
			Materialize.toast( 'There is no song playing to stop', 4000 );
		}
	}
}

function reloadPage() {
	location.reload( true );
}

function preprocessError() {
	var $p_Div = $( '#preprocessDiv' );
	$p_Div.addClass( 'red' )
	Materialize.toast( 'See errors in preprocess phase', 4000 );
}

function lexError() {
	var $l_Div = $( '#lexDiv' );
	$l_Div.addClass( 'red' )
	Materialize.toast( 'See errors in lex phase', 4000 );
}

function parseError() {
	var $p_Div = $( '#parseDiv' );
	$p_Div.addClass( 'red' )
	Materialize.toast( 'See errors in parse phase', 4000 );
}

function semaError() {
	var $s_Div = $( '#semaDiv' );
	$s_Div.addClass( 'red' )
	Materialize.toast( 'See errors in sematic phase', 4000 );
}

function someWaveForms() {
	function preload() {
		sound = loadSound( 'mp3/take.mp3' );
	}

	function setup() {
		var cnv = createCanvas( 100, 100 );
		cnv.mouseClicked( togglePlay );
		fft = new p5.FFT();
		sound.amp( 0.2 );
	}

	function draw() {
		background( 0 );

		var spectrum = fft.analyze();
		noStroke();
		fill( 0, 255, 0 ); // spectrum is green
		for ( var i = 0; i < spectrum.length; i++ ) {
			var x = map( i, 0, spectrum.length, 0, width );
			var h = -height + map( spectrum[ i ], 0, 255, height, 0 );
			rect( x, height, width / spectrum.length, h )
		}

		var waveform = fft.waveform();
		noFill();
		beginShape();
		stroke( 255, 0, 0 ); // waveform is red
		strokeWeight( 1 );
		for ( var i = 0; i < waveform.length; i++ ) {
			var x = map( i, 0, waveform.length, 0, width );
			var y = map( waveform[ i ], -1, 1, 0, height );
			vertex( x, y );
		}
		endShape();

		text( 'click to play/pause', 4, 10 );
	}

	// fade sound if mouse is over canvas
	function togglePlay() {
		if ( sound.isPlaying() ) {
			sound.pause();
		} else {
			sound.loop();
		}
	}

}
