const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path'); // eslint-disable-line no-unused-vars
const prodConfig = require('./webpack.config.prod.js');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: [prodConfig.entry],
	output: prodConfig.output,
	module: prodConfig.module,
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/client/index.ejs',
		}),
		new webpack.EnvironmentPlugin(['NODE_ENV']),
	],
};
