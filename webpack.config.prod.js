const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const webpack = require("webpack")

module.exports = {
  debug: false,
  entry: "./src/client/index.js",
  output: {
    filename: "[name]-[hash:5].js",
    path: path.join(__dirname, "/dist/"),
    publicPath: "/",
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
        exclude: /node_modules/,
        loaders: [
          "style",
          "css?" + [
            "-autoprefixer",
            "-mergeRules",
            "modules",
            "importLoaders=1",
            "localIdentName=[folder]-[local]-[hash:base64:5]",
          ].join("&") + "!postcss",
        ],
      },
    ],
  },
  postcss(webpack) {
    return [
      require("postcss-import")({ addDependencyTo: webpack }),
      require("postcss-cssnext")(),
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      inject: "body",
      template: "src/client/index.ejs",
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.EnvironmentPlugin("NODE_ENV"),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    }),
  ],
}
