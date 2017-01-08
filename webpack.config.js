var path = require('path');
var webpack = require('webpack');

module.exports = {

  debug: false,

  entry: {
    index: './src/index.js'
  },

  target: 'web',

  devtool: 'source-map',

  output: {
    path: './build',
    filename: '[name].js',
    libraryTarget: 'var',
    library: 'rubik',
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: true
      }),
      new webpack.optimize.DedupePlugin()
    ]
  },

  resolve: {
    modulesDirectories: [
      'node_modules',
      'src/lib'
    ]
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, './src')
        ],
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }

}
