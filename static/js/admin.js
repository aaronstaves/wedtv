function init() {

	var socket = io();

	socket.on('show image', function(msg){
		$('.preview_image').attr('src', msg);
	});

	socket.on('slideshow current speed', function(msg){
		var seconds = msg / 1000;
		$('#speed'+seconds).closest('.btn').button('toggle');
	});

	socket.on('update list', updateList);

	$('.photo_menu .fa-remove').on('click', function() {
		$('.photo_menu').hide('fast');
	});

	$('.photo_menu .fa-trash').click({ socket: socket }, trashPhoto);
	$('.photo_menu .fa-arrow-circle-up').click({ socket: socket }, prioritizePhoto);
	$('.speed .btn').click({ socket: socket }, changeSpeed);
}

function changeSpeed( e ) {
	var btn    = $(e.target).children('input');
	var socket = e.data.socket;
	socket.emit('update speed', btn.val());
}

function updateList (list){

		$('.image_list .row').empty();
		$.each( list, function(i, photo) {
			var html = '<div data-filename="'+photo.filename+'" class="admin_photo col-xs-3"><img src="images/tn/'+photo.filename+'" /></div>';
			$('.image_list .row').append(html);
		});
		$('.image_list_counter').html( list.length + ' images' );

		$('.admin_photo').on('click', photoClick);
}

function photoClick( e ) {
	var div = $(e.target).closest('div')
	var filename = div.data('filename');
	$('.photo_menu').show('fast');
	$('.photo_menu .filename').html( filename );
}

function trashPhoto( e ) {
	var socket = e.data.socket
	var filename = $('.photo_menu .filename').html();
	if ( confirm( "Are you sure you'd like to delete " + filename + " ?" ) ) {
		socket.emit('delete image', filename);
		$('.photo_menu').hide('fast');
	}
}

function prioritizePhoto( e ) {
	var socket = e.data.socket
	var filename = $('.photo_menu .filename').html();
	socket.emit('prioritize image', filename);
	$('.photo_menu').hide('fast');
}

$( document ).ready( init );

