/* global document, location */
const fs = require('fs');
const io = require('socket.io-client');

document.addEventListener('DOMContentLoaded', () => {
	document.head.innerHTML += `<style>${
		fs.readFileSync(`${__dirname}/style.css`, 'utf8')
	}</style>`;

	const comments = fs.readFileSync(`${__dirname}/comments.svg`, 'utf8');

	document.body.innerHTML += `
		<div class='__embed.chat'>
			<span class="dot">
				${comments}
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
		</div>
	`;

	const socket = io('http://localhost:3050');

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

	const input = document.querySelector('.chat input');

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
