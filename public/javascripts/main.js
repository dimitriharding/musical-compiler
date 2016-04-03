$( document ).ready( function () {

	var images = [ '/love_music.png', '/background_headphones.png', '/soul.png' ];

	$( 'body' ).css( {
		'background-image': 'url(/images' + images[ Math.floor( Math.random() * images.length ) ] + ')'
	} );

	console.log( "ready!" );
	var bgImage = $( 'body' ).css( 'background-image' ).replace( /^url|[\(\)].*\/|\.png"\)$/g, '' );

	if ( bgImage === 'background_headphones' || bgImage === 'soul' ) {
		$( 'label' ).css('color', '#ffc107' );
		$( 'body' ).css('background-color', '#4dd0e1');
	} else {
		$( 'label' ).removeClass( 'blue darken-4' );
		$( 'body' ).removeClass( 'cyan lighten-2' );
	}

	$( '.modal-trigger' ).leanModal();

	$( "#formLyrics" ).submit( function ( event ) {
		var $file = $( '#inputFile' );
		var $text = $( '#txtLyrics' );
		var $fileWrapper = $( '#fileWrapper' );
		if ( $file.val().length <= 0 && $text.val().length <= 0 ) {
			event.preventDefault();
			Materialize.toast( 'Upload a file or paste lyrics to commence compilation', 4000 );
		} else if ( $file.val().length >= 3 && $text.val().length >= 3 ) {
			event.preventDefault();
			$file.val( '' );
			$text.val( '' );
			$fileWrapper.val( '' );
			Materialize.toast( 'Use one option or the other, not both at the same time', 4000 );
		}

	} );
} );
