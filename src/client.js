/* global document, location, localStorage */
const fs = require('fs');
const io = require('socket.io-client');

const localStorage = require('./localStorage');

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
					<input placeholder="Type message here...">
				</div>
			</div>
		</div>
	`;

	const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3050' : 'https://socket.embed.chat');

	const escapeHtml = unsafe => unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

	socket.emit('init',
		location.hostname,
		localStorage.getItem('new-visitor') !== 'false'
	);

	localStorage.setItem('new-visitor', 'false');

	const $messages = document.querySelector('.__embed_chat .chat .messages');
	const $input = document.querySelector('.__embed_chat .chat input');
	const $chat = document.querySelector('.__embed_chat .chat');
	const $dot = document.querySelector('.__embed_chat .dot');
	const $x = document.querySelector('.__embed_chat .chat .x');

	const userSettings = new Proxy({}, {
		get(target, key) {
			const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');

			return settings[key];
		},

		set(target, key, value) {
			const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');

			settings[key] = value;

			localStorage.setItem('userSettings', JSON.stringify(settings));
		},

		ownKeys() {
			const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');

			return Reflect.ownKeys(settings);
		},

		getOwnPropertyDescriptor() {
			return {
				enumerable: true,
				configurable: true
			};
		}
	});

	window.userSettings = userSettings;

	socket.on('name', name => {
		$input.placeholder = `${name}, type your message here...`;
	});

	socket.on('message', ({name, text}) => {
		$messages.innerHTML += `
			<li><strong>${escapeHtml(name)}</strong>: ${escapeHtml(text)}</li>
		`;

		$messages.scrollTop = $messages.scrollHeight;
	});

	for(const command of Object.keys(userSettings)) {
		socket.emit('message', `/${command} ${userSettings[command].join(' ')}`);
	}

	$input.addEventListener('keyup', event => {
		if (event.keyCode === 13) {
			const message = $input.value;

			if (message.slice(0, 1) === '/') {
				const parts = message.slice(1).split(' ');

				if (parts.length >= 2) {
					userSettings[parts[0]] = parts.slice(1);
				}
			}

			socket.emit('message', message);
			$input.value = '';
		}
	});

	$dot.addEventListener('click', () => {
		$chat.style.display = 'block';
		$dot.style.display = 'none';

		localStorage.setItem('chat-open', 'true');

		$messages.scrollTop = $messages.scrollHeight;
	});

	if (localStorage.getItem('chat-open') === 'true') {
		$chat.style.display = 'block';
		$dot.style.display = 'none';
	}

	$x.addEventListener('click', () => {
		$chat.style.display = 'none';
		$dot.style.display = 'block';

		localStorage.setItem('chat-open', 'false');
	});
});
