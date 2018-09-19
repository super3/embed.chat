const axios = require('axios');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const pub = require('./pub');
const sub = require('./sub');
const redis = require('./redis');
const getSlackProfile = require('./getSlackProfile');

const messagesChannel = 'chat-messages';
const chatHistory = 'chat-history';
const messagesCounter = 'chat-counter:messages';
const domainsSet = 'chat-domains';
const chattersCounter = 'chat-chatters';
const pageViewsCounter = 'chat-views';
const liveChattersCounter = 'chat-live';

sub.subscribe(messagesChannel);

const slackHandler = new Koa();

slackHandler.use(bodyParser());

slackHandler.use(async ctx => {
	if (typeof ctx.request.body.challenge === 'string') {
		ctx.body = ctx.request.body.challenge;

		return;
	}

	const {event} = ctx.request.body;

	if (event.type === 'message' && event.subtype !== 'bot_message') {
		const domain = 'embed.chat';

		const profile = await getSlackProfile(event.user);

		const message = {
			origin: 'slack',
			name: profile.display_name || profile.real_name,
			text: event.text
		};

		await pub.publish(messagesChannel, JSON.stringify({
			message,
			domain
		}));

		await redis.lpush(`${chatHistory}:${domain}`, JSON.stringify(message));

		await redis.incr(messagesCounter);
	}

	ctx.body = '';
});

module.exports = slackHandler;
