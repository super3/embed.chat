const Redis = require('ioredis');
const socketIo = require('socket.io');
const dogNames = require('dog-names');

const pub = new Redis();
const sub = new Redis();

const messagesChannel = 'chat-messages';
const chatHistory = 'chat-history';

sub.subscribe(messagesChannel);

const io = socketIo(3050);

const domains = {};

io.on('connection', socket => {
	socket.on('init', async domain => {
		if (!(domains[domain] instanceof Set))
			domains[domain] = new Set();

		domains[domain].add(socket);

		const name = dogNames.allRandom();

		socket.emit('name', name);

		socket.on('message', async text => {
			await pub.publish(messagesChannel, JSON.stringify({
				message: {
					name,
					text
				},
				domain
			}));

			await redis.lpush(`${chatHistory}:${domain}`, JSON.stringify(message));
		});

		socket.on('disconnect', () => {
			domains[domain].delete(socket);
		});

		const rawMessages = await redis.lrange(`${chatHistory}:${domain}`, 0, -1);

		for (const rawMessage of rawMessages)
			socket.emit('message', JSON.parse(rawMessage));
	});
});

sub.on('message', (channel, rawMessage) => {
	const {message, domain} = JSON.parse(rawMessage);

	if (domains[domain] instanceof Set) {
		for (const socket of domains[domain])
			socket.emit('message', message);
	}
});
