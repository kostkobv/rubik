var path = require('path');
var webpack = require('webpack');

module.exports = {

  debug: false,

  entry: {
    index: './src/index.js'
  },

  target: 'async-node',

  devtool: 'source-map',

  output: {
    path: './build',
    filename: '[name].js',
    library: 'rubik',
    libraryTarget: 'commonjs2',
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: true
      })
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
