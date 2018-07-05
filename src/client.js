/* global document, location */
const fs = require('fs');
const io = require('socket.io-client');

document.addEventListener('DOMContentLoaded', () => {
	document.head.innerHTML += `<style>${
		fs.readFileSync(`${__dirname}/style.css`, 'utf8')
	}</style>`;

	const comments = fs.readFileSync(`${__dirname}/comments.svg`, 'utf8');

	document.body.innerHTML += `
		<div class='__embed_chat'>
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

	const socket = io('https://socket.embed.chat');

	const escapeHtml = unsafe => unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

	socket.emit('init', location.hostname);

	const $name = document.querySelector('.__embed_chat .chat .name');
	const $messages = document.querySelector('.__embed_chat .chat .messages');
	const $input = document.querySelector('.__embed_chat .chat input');
	const $chat = document.querySelector('.__embed_chat .chat');
	const $dot = document.querySelector('.__embed_chat .dot');
	const $x = document.querySelector('.__embed_chat .chat .x');

	socket.on('name', name => {
		$name.innerHTML = name;
	});

	socket.on('message', ({name, text}) => {
		$messages.innerHTML += `
			<li><strong>${name}</strong>: ${escapeHtml(text)}</li>
		`;

		$messages.scrollTop = $messages.scrollHeight;
	});

	$input.addEventListener('keyup', event => {
		if (event.keyCode === 13) {
			socket.emit('message', $input.value);
			$input.value = '';
		}
	});

	$dot.addEventListener('click', () => {
		$chat.style.display = 'block';
		$dot.style.display = 'none';

		$messages.scrollTop = $messages.scrollHeight;
	});

	$x.addEventListener('click', () => {
		$chat.style.display = 'none';
		$dot.style.display = 'block';
	});
});
