'use strict';
const dest = './dist';
const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})]
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inlineSource: '.(js|css)$',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      }
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new MiniCssExtractPlugin(),
    {
      apply: compiler => {
        compiler.hooks.done.tap('AfterEmitPlugin', async () => {
          const source = fs.readFileSync('./dist/index.html', 'utf8');
          const p1 = source.substr(0, 50000);
          const p2 = source.substr(50000, 50000);
          const p3 = source.substr(100000);
          const jsonResult1 = JSON.stringify({ data: p1 });
          const jsonResult2 = JSON.stringify({ data: p2 });
          const jsonResult3 = JSON.stringify({ data: p3 });
          const code1 = jsonResult1.substr(8, jsonResult1.length - 8 - 1);
          const code2 = jsonResult2.substr(8, jsonResult2.length - 8 - 1);
          const code3 = jsonResult3.substr(8, jsonResult3.length - 8 - 1);
          fs.writeFileSync(
            './web-server/page.c',
            `
            const char page1[] = ${code1};
            const char page2[] = ${code2};
            const char page3[] = ${code3};
          `
          );
        });
      }
    }
  ]
};
