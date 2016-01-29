$(document).ready(function(){
	// WebSocket
	var socket = io.connect();

	// new message
	socket.on('chat', function (data) {
		var time = new Date(data.time);
		$('#content').append(
			$('<li></li>').append(
				// date-time
				$('<span>').text('[' +
					(time.getHours() < 10 ? '0' + time.getHours() : time.getHours())
					+ ':' +
					(time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
					+ '] '
				),
				// name
				$('<b>').text(typeof(data.name) != 'undefined' ? data.name + ': ' : ''),
				// text
				$('<span>').text(data.text))
		);
		// scroll down
		$('body').scrollTop($('body')[0].scrollHeight);
	});
	// send message
	function send(){
		var name = $('#name').val();
		var text = $('#text').val();
		// send message
		socket.emit('chat', { name: name, text: text });
		// clear text field
		$('#text').val('');

		// display the message
		var time = new Date();
		$('#content').append(
			$('<li></li>').append(
				// date-time
				$('<span>').text('[' +
					(time.getHours() < 10 ? '0' + time.getHours() : time.getHours())
					+ ':' +
					(time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
					+ '] '
				),
				// name
				$('<b>').text('YOU: '),
				// text
				$('<span>').text(text)
		));

	}
	// on-click event
	$('#send').click(send);
	// enter keypress event
	$('#text').keypress(function (e) {
		if (e.which == 13) {
			send();
		}
	});
	// join channel
	function join(){
		var room = $('#room').val();
		socket.emit('join', room);
		$('#content').append(
			$('<li></li>').append($('<span>').text('[Joining room ' + room + ']')));
	};
	$('#join').click(join);
});
