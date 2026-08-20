'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
	{
		ignores: ['node_modules/**', 'docs/**', 'log/**']
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'commonjs',
			globals: globals.node
		},
		rules: {
			...js.configs.recommended.rules,
			indent: ['error', 'tab', {SwitchCase: 1}],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			radix: 'error',
			'no-console': 'warn',
			'no-unused-vars': ['error', {vars: 'all', args: 'after-used'}]
		}
	}
];
