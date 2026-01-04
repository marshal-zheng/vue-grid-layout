const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const ESLintPlugin = require('eslint-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const chalk = require('chalk');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      'vue-grid-layout.min': './lib/cjs.ts',
    },
    output: {
      filename: '[name].js',
      sourceMapFilename: '[name].js.map',
      devtoolModuleFilenameTemplate: '../[resource-path]',
      library: 'VueGridLayout',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'build', 'web'),
    },
    devServer: {
      hot: true,
      open: 'example/index.html',
      client: {
        overlay: {
          warnings: false,
          errors: true,
        }
      },
      devMiddleware: {
        writeToDisk: true,
      },
      static: {
        directory: '.',
      },
      watchFiles: {
        options: {
          ignored: ['**/node_modules/**', '**/.git/**', '**/build/**', '**/perf/**']
        }
      }
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/build/**', '**/perf/**'],
      aggregateTimeout: 300,
      poll: false
    },
    externals: {
      vue: {
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue',
        root: 'Vue'
      },
      pinia: {
        commonjs: 'pinia',
        commonjs2: 'pinia',
        amd: 'pinia',
        root: 'Pinia'
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: 'babel-loader',
          },
          exclude: /node_modules/,
        },
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new VueLoaderPlugin(),
      process.env.ANALYZE && new BundleAnalyzerPlugin(),
      new webpack.EnvironmentPlugin({
        DRAGGABLE_DEBUG: !isProduction,
        NODE_ENV: isProduction ? 'production' : 'development'
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ESLintPlugin({
        extensions: ['js', 'vue', 'ts', 'tsx'],
      }),
      new ProgressBarPlugin({
        format: `  build [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
        clear: false,
      }),
      {
        apply: (compiler) => {
          compiler.hooks.done.tap('DonePlugin', () => {
          });
        },
      },
      new ForkTsCheckerWebpackPlugin(),
      new LodashModuleReplacementPlugin({
        paths: true,
        shorthands: true,
        collections: true
      })
    ].filter(Boolean),
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin({
        terserOptions: {
          format: {
            comments: false, // 删除注释
          },
          compress: {
            drop_console: true, // 删除console.log
          },
        },
        extractComments: false, // 不将注释提取到单独的文件
      })].filter(() => isProduction)
    },
    stats: {
      errorDetails: true,
      colors: true,
      hash: false,
      version: true,
      timings: false,
      assets: isProduction,
      chunks: isProduction,
      modules: isProduction,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      warnings: true,
    }
  }
};