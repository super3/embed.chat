const axios = require('axios');
const redis = require('./redis');

module.exports = async user => {
	try {
		return JSON.parse(await redis.get(`slack-profile:${user}`));
	} catch(err) {
		const { data: { profile } } = await axios.post('https://slack.com/api/users.profile.get', querystring.stringify({
			token: process.env.TOKEN,
			user
		}));

		await redis.set(`slack-profile:${user}`, JSON.stringify(profile));

		return profile;
	}
};
