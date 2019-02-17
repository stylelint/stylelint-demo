const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/client/index.js",
  output: {
    filename: "[name]-[hash:5].js",
    path: path.join(__dirname, "/dist/"),
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              localIdentName: "[folder]-[local]-[hash:base64:5]"
            }
          },
          "postcss-loader"
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      inject: "body",
      template: "src/client/index.ejs"
    }),
    new webpack.EnvironmentPlugin("NODE_ENV")
  ]
};
