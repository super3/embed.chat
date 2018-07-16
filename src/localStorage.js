const _localStorage = window.localStorage;

const prefix = '__embed_chat';

module.exports = {
	setItem(key, value) {
		_localStorage.setItem(`${prefix}:${key}`, value);
	},
	getItem(key) {
		return _localStorage.getItem(`${prefix}:${key}`);
	}
};
