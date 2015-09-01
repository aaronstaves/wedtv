function init() {

	var socket = io();

	socket.on('show image', function(msg){
		//var img = $('div.main_image').css('background-image', 'url('+msg+')');
		$('.main_image').attr('src', msg);
		console.log('showing ' + msg );
	});
}


$( document ).ready( init );

