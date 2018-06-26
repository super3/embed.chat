document.addEventListener('DOMContentLoaded', () => {
	document.head.innerHTML += `
		<style>
			.chat, .chat * {
				margin: 0;
				padding: 0;
			}

			.chat {
				position: fixed;
				font-size: 17px;

				right: 25px;
				bottom: 0px;

				height: 400px;
				width: 300px;

				z-index: 1000;

				font-family: sans-serif;

				border: 1px solid #D8D8D8;
				border-radius: 5px;
				border-bottom-left-radius: 0px;
				border-bottom-right-radius: 0px;
			}

			.chat .messages {
				overflow-y: scroll;
				height: calc(90% - 40px);
				padding-top: 10px;
				padding-bottom: 10px;
				border-bottom: 1px solid #D8D8D8;
			}

			.sendbox {
				display: flex;
				padding: 10px 15px 10px 15px;
				background-color: #F7F7F7;
			}

			.chat .messages li {
				margin: 5px 15px 0px 15px;
				list-style-type: none;
			}

			.chat .name {
				background-color: #E9ECEF;
				padding: 10px;
				border: 1px solid #ced4da;
				border-right: 0px;
				border-radius: 5px;
				border-top-right-radius: 0px;
				border-bottom-right-radius: 0px;
			  position: relative;
				top: 1px;
			}

			.chat input {
				height: 10%;
				width:100%;

				border-radius: 5px;
				padding: 15px;
				border: 1px solid #ced4da;

				border-top-left-radius: 0px;
				border-bottom-left-radius: 0px;
			}

			.sendname {
				text-align: right;
				padding-top: 10px;
			}
		</style>
	`;

	document.body.innerHTML += `
		<div class='chat'>
			<ul class='messages'></ul>

			<div class='sendbox'>
				<div class='sendname'>
					<span class='name'></span>
				</div>

				<input placeholder="Type message here...">
			</div>
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

	const messages = document.querySelector('.chat .messages');

	socket.on('message', ({name, text}) => {
		messages.innerHTML += `
			<li><strong>${name}</strong>: ${escapeHtml(text)}</li>
		`;

		messages.scrollTop = messages.scrollHeight;
	});

	const input = window.input = document.querySelector('.chat input');

	input.addEventListener('keyup', event => {
		if (event.keyCode === 13) {
			socket.emit('message', input.value);
			input.value = '';
		}
	});
});
