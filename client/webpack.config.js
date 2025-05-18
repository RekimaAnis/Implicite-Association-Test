const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const jsDir = path.resolve(__dirname, 'javascripts');
const jsFiles = glob.sync(path.join(jsDir, '**/*.js'));
const entries = jsFiles.reduce((obj, file) => {
  const relPath = path.relative(jsDir, file).replace(/\.js$/, '');
  obj[relPath] = file;
  return obj;
}, {});

const htmlDir = path.resolve(__dirname, 'html');
const htmlFiles = glob.sync(path.join(htmlDir, '**/*.html'));
const htmlPlugins = htmlFiles.map(file => {
  const relPath = path.relative(htmlDir, file).replace(/\.html$/, '');
  return new HtmlWebpackPlugin({
    template: file,
    filename: path.join('html', `${relPath}.html`),
    chunks: [relPath],  
  });
});

module.exports = {
  entry: entries,
  mode: 'production',
  output: {
    path:     path.resolve(__dirname, '../server/public'),
    filename: 'javascripts/[name].js',
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader','css-loader'] },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name:       '[name].[ext]',
            outputPath: 'images'
          }
        }]
      }
    ]
  },
  plugins: [
    ...htmlPlugins,

    new HtmlWebpackPlugin({
      template: "./html/index.html",
      filename: "./index.html",
      chunks: ['index']
    }),

    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'images'),
          to: 'images',
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(__dirname, 'css'),
          to: 'css',
          noErrorOnMissing: true,
        },
      ]
    }),

    new webpack.ProgressPlugin()
  ]
};
