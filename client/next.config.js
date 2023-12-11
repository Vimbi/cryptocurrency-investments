/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

module.exports = {
	i18n,
	trailingSlash: true,
	reactStrictMode: false,
	images: {
		domains: ['farmdepo.storage.yandexcloud.net', 'nephritetrade.storage.yandexcloud.net']
	},
	webpack: config => {
		config.resolve.alias = {
			...config.resolve.alias,
			apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
		};

		return config;
	}
};
