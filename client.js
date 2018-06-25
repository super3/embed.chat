document.addEventListener('DOMContentLoaded', () => {
	document.head.innerHTML += `
		<style>
			.chat, .chat * {
				margin: 0;
				padding: 0;
			}

			.chat {
				position: fixed;

				right: 25px;
				bottom: 0px;

				height: 400px;
				width: 300px;

				z-index: 1000;

				font-family: sans-serif;

				border: 1px solid #ddd;
				border-radius: 5px;
				border-bottom-left-radius: 0px;
				border-bottom-right-radius: 0px;
			}

			.chat .messages {
				overflow-y: scroll;
				height: 90%;
			}

			.chat .messages li {
				margin: 15px 15px 0px 15px;

				list-style-type: none;
			}

			.chat .name {
				width: 40%;
			}

			.chat input {
				height: 10%;
				width: 60%;
			}
		</style>
	`;

	document.body.innerHTML += `
		<div class='chat'>
			<ul class='messages'></ul>

			<span class='name'></span>
			<input placeholder="Hello, World!">
		</div>
	`;

	const socket = window.socket = io('http://localhost:3050');

	const escapeHtml = unsafe => unsafe
	   .replace(/&/g, "&amp;")
	   .replace(/</g, "&lt;")
	   .replace(/>/g, "&gt;")
	   .replace(/"/g, "&quot;")
	   .replace(/'/g, "&#039;");

	socket.emit('init', location.hostname);

	socket.on('name', name => {
		document.querySelector('.chat .name').innerHTML = name;
	});

	socket.on('message', ({name, text}) => {
		document.querySelector('.chat .messages').innerHTML += `
			<li><strong>${name}</strong>: ${escapeHtml(text)}</li>
		`;
	});

	socket.emit('message', 'Hello, world!');

	const input = window.input = document.querySelector('.chat input');

	input.addEventListener('keyup', event => {
		if (event.keyCode === 13) {
			socket.emit('message', input.value);
			input.value = '';
		}
	});
});
