var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    sourceMapFilename: '[file].map'
  },
  //devtool: 'nosources-source-map',
  devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['.ts', '.js', '.css'],
    alias: {
      '@angular/core': path.resolve(__dirname, 'angular/core/index'),
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'awesome-typescript-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      __dirname
    ),
    new ExtractTextPlugin("[name].css"),
   /* new webpack.optimize.UglifyJsPlugin({
     compress: { warnings: false },
     output: {comments: false}
     })*/
  ]
};
