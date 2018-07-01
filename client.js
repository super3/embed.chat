/* global document, window, location, io */

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

				display:none;
			}

			.chat .messages {
				overflow-y: scroll;
				height: calc(90% - 65px);
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

			.dot {
				height: 60px;
				width: 60px;
				background-color: #1972F5;
				border-radius: 50%;
				display: inline-block;

				position: fixed;
				right: 24px;
				bottom: 20px;

				box-shadow: 3px 3px 20px #ccc;
			}

			.dot img {
				display: block;
				filter: invert(100%);
				height: 35px;
				width: 35px;
				margin: auto;
				margin-top: 11px;
			}

			.x {
				height: 20px;
				background-color: #F7F7F7;
				border-bottom: 1px solid #D8D8D8;
				padding: 0px 10px 3px 3px;
				text-align: right;
			}
		</style>
	`;

	document.body.innerHTML += `
		<span class="dot">
			<img src="comments.svg" />
		</span>

		<div class='chat'>
			<div class='x'>x</div>

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
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

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

	const chat = document.querySelector('.chat');
	const dot = document.querySelector('.dot');

	dot.addEventListener('click', () => {
		chat.style.display = 'block';
		dot.style.display = 'none';
	});

	const x = document.querySelector('.chat .x');

	x.addEventListener('click', () => {
		chat.style.display = 'none';
		dot.style.display = 'block';
	});
});
