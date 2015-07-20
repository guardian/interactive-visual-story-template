var Ractive = require('ractive');

var data = {
	url: 'http://gu.com/example',
	sharetext: 'Social share text'
};

module.exports = Ractive.extend({
	isolated: false,
	data: data,
	template: require('./socialButtons.html')
});
