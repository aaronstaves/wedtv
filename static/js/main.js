function init() {

	var socket = io();

	$('.main_image_wrapper img').load(function() {
		$('.main_image_wrapper img').toggleClass('transparent');
	});

	socket.on('show image', function(msg){
		var hidden = $('.main_image_wrapper .transparent');
		hidden.attr('src', msg);
	});
}


$( document ).ready( init );

