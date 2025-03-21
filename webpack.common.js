const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {

  entry: {

    app: './js/app.js',

  },
  plugins: [

    new HtmlWebpackPlugin({
      template: './template/index.html',
      title: 'Production',

    }),

  ],

  output: {

    filename: '[name].bundle.js',

    path: path.resolve(__dirname, 'dist'),

    clean: true,

  },

};
