/* global describe, it */
const assert = require('assert');
const io = require('socket.io-client');
const server = require('../server');

const socket = io('http://localhost:3050');

describe('Server', () => {
	it('should send stats', async () => {
		socket.emit('subscribe-stats');

		await new Promise(resolve => socket.once('stats', resolve));
		await new Promise(resolve => socket.once('stats', resolve));
	});

	let name;

	it('should allocate name', async () => {
		socket.emit('init', 'localhost', true);

		name = await new Promise(resolve => socket.once('name', resolve));
	});

	it('should reject bad custom name', async () => {
		name = 'j';

		socket.emit('message', `/name ${name}`);

		await new Promise((resolve, reject) => {
			socket.once('name', reject);
			setTimeout(resolve, 1000);
		})
	});

	it('should relay custom name', async () => {
		name = 'john';

		socket.emit('message', `/name ${name}`);

		assert.deepEqual(
			await new Promise(resolve =>
					socket.once('name', name => resolve(name))
			), name
		);
	});

	it('should relay message', async () => {
		socket.emit('message', 'Hello, World!');

		assert.deepEqual(
			await new Promise(resolve => socket.once('message', resolve)),
			{
				name,
				text: 'Hello, World!'
			}
		);
	});

	it('should disconnect', () => {
		socket.emit('disconnect');
	});
});
