'use strict';

const log = require('../../lib/log')('action_getImage');

const getImage = async(url) => {
	try {
		const response = await fetch(url, {
			headers: {
				Accept: 'image/*,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.5'
			}
		});

		if (!response.ok) {
			throw new Error(`Image request failed with status ${response.status}`);
		}

		return Buffer.from(await response.arrayBuffer()).toString('base64');
	} catch (error) {
		log.error('Error!!', error);
		throw error;
	}
};

module.exports = getImage;
