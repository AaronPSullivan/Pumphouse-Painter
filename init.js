if (window.addEventListener) {
	window.addEventListener('load', function() { init(); });
}


$(window).load(function() {
	
	$( "html" ).removeClass( "loading" ); // Loading animation
});



//window.addEventListener('resize', function() { init(); }); // clear and resize the canvas