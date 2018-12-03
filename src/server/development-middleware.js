const path = require("path");
const webpack = require("webpack");
const webpackHotMiddleware = require("webpack-hot-middleware"); // eslint-disable-line node/no-unpublished-require
const webpackMiddleware = require("webpack-dev-middleware"); // eslint-disable-line node/no-unpublished-require

const config = require(path.join(__dirname, "../../webpack.config.dev.js"));

const compiler = webpack(config);
const dev = webpackMiddleware(compiler, {
  publicPath: config.output.publicPath,
  contentBase: "src",
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false
  }
});
const hot = webpackHotMiddleware(compiler);

module.exports = {
  dev,
  hot
};
