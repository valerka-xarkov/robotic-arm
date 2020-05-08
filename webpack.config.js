'use strict';
const dest = './dist';
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
console.log(path.resolve(__dirname, dest));
module.exports = {
  entry: ['./src/ts/main.ts', './src/css/index.css'],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        use: 'base64-inline-loader?limit=1000&name=[name].[ext]'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.css', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, dest)
  },
  mode: 'development',
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin()
  ]
};
