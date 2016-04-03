$( function () {
	if ( 'speechSynthesis' in window ) {
		speechSynthesis.onvoiceschanged = function () {
			var $voicelist = $( '#voices' );

			if ( $voicelist.find( 'option' ).length == 0 ) {
				speechSynthesis.getVoices().forEach( function ( voice, index ) {
					console.log( voice );
					var $option = $( '<option>' )
						.val( index )
						.html( voice.name + ( voice.default ? ' (default)' : '' ) );

					$voicelist.append( $option );
				} );

				$voicelist.material_select();
			}
		}
	}
} );
