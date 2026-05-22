'use strict';

module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript'
  ],
  plugins: [
    "@babel/plugin-transform-class-properties",
    "transform-inline-environment-variables",
    '@vue/babel-plugin-jsx'
  ]
}
