const ExtractTextPlugin = require("extract-text-webpack-plugin")
const glob = require("glob")
const path = require("path")
const webpack = require("webpack")

module.exports = {
  debug: false,
  entry: "./src/client/index.js",
  output: {
    filename: "client.js",
    path: "./dist",
    publicPath: "/static/",
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss-loader"),
      },
      {
        test: /\.(png|jpg)$/,
        loader: "file-loader?name=images/[name].[ext]",
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: "file-loader?name=fonts/[name].[ext]",
      },
    ],
  },
  postcss(webpack) {
    return [
      require("postcss-import")({
        addDependencyTo: webpack,
        resolve(id, base) { // Manually add glob support: https://github.com/postcss/postcss-import/releases/tag/8.0.0
          return glob.sync(path.join(base, id))
        },
      }),
      require("postcss-custom-properties")(),
      require("postcss-custom-media")(),
      require("postcss-media-minmax")(),
    ]
  },
  plugins: [
    new ExtractTextPlugin("main.css", {
      allChunks: true,
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    }),
    new webpack.EnvironmentPlugin("NODE_ENV"),
  ],
}
