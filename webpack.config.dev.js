const HtmlWebpackPlugin = require("html-webpack-plugin")
const glob = require("glob") // eslint-disable-line no-unused-vars
const path = require("path") // eslint-disable-line no-unused-vars
const webpack = require("webpack") // eslint-disable-line no-unused-vars

module.exports = {
  debug: true,
  entry: [
    "webpack-hot-middleware/client?reload=true",
    "./src/client/index.js",
  ],
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
        test: /codemirror\.css$/,
        exclude: /node_modules/,
        loader: "style-loader!css-loader",
      },
      {
        test: /\.css$/,
        exclude: [
          /node_modules/,
          /codemirror\.css$/,
        ],
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
  ],
}
