const Redis = require('ioredis');
const socketIo = require('socket.io');
const dogNames = require('dog-names');

const redis = new Redis();
const io = socketIo(3050);

const domains = {};

io.on('connection', socket => {
	socket.on('init', domain => {
		if (!(domain in domains))
			domains[domain] = new Set();

		domains[domain].add(socket);

		const name = dogNames.allRandom();

		socket.emit('name', name);

		socket.on('message', text => {
			for (const socket of domains[domain])
				socket.emit('message', {
					name,
					text
				});
		});
	});
});
