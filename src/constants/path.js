'use strict';
const {resolve} = require('path');

const root = resolve(__dirname, '../../');

module.exports = {
	root,
	src: resolve(root, 'src'),
	mocks: resolve(root, 'mocks')
};
