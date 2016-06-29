var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var glob = require('glob') // eslint-disable-line no-unused-vars
var path = require('path') // eslint-disable-line no-unused-vars
var webpack = require('webpack') // eslint-disable-line no-unused-vars

module.exports = {
  debug: true,
  entry: [
    'webpack-hot-middleware/client?reload=true',
    './src/client/index.js'
  ],
  output: {
    filename: '[name]-[hash].js',
    path: path.join(__dirname, '/dist/'),
    publicPath: '/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: [
          'style',
          'css?' + [
            '-autoprefixer',
            '-mergeRules',
            'modules',
            'importLoaders=1',
            'localIdentName=[folder]-[local]-[hash:base64:5]'
          ].join('&') + '!postcss'
        ]
      }
    ]
  },
  postcss: function (webpack) {
    return [
      require('postcss-import')({addDependencyTo: webpack}),
      require('postcss-cssnext')()
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: 'body',
      template: 'src/client/index.ejs'
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.EnvironmentPlugin([ 'NODE_ENV' ])
  ]
}
