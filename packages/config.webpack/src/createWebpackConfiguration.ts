import { HotAcceptPlugin } from 'hot-accept-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import {
  Configuration,
  DefinePlugin,
  HotModuleReplacementPlugin
} from 'webpack';
import ManifestPlugin from 'webpack-assets-manifest';

import { ExtractOptionsFromOptionsContainer } from '@zero-scripts/core';

import { WebpackConfigOptions } from './WebpackConfigOptions';

export function createWebpackConfiguration({
  isDev,
  paths,
  additionalEntry,
  useSourceMap,
  moduleFileExtensions
}: ExtractOptionsFromOptionsContainer<WebpackConfigOptions>): Configuration {
  return {
    mode: isDev ? 'development' : 'production',
    entry: [paths.indexJs, ...additionalEntry],
    devtool: isDev ? 'eval-source-map' : useSourceMap && 'source-map',
    output: {
      path: !isDev ? paths.build : undefined,
      filename: isDev ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
      chunkFilename: isDev
        ? 'js/[name].chunk.js'
        : 'js/[name].[contenthash:8].chunk.js',
      devtoolModuleFilenameTemplate: !isDev
        ? info =>
            path
              .relative(paths.src, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
    },
    bail: !isDev,
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          cache: true,
          sourceMap: useSourceMap
        })
      ],
      splitChunks: {
        chunks: 'all'
      },
      runtimeChunk: true
    },
    resolve: {
      modules: ['node_modules'],
      extensions: moduleFileExtensions
    },
    module: {
      strictExportPresence: true,
      rules: []
    },
    plugins: [
      new DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }
      }),
      new ManifestPlugin({
        output: 'asset-manifest.json'
      })
    ].concat(
      isDev
        ? [
            new HotModuleReplacementPlugin(),
            new HotAcceptPlugin({
              test: path.basename(paths.indexJs)
            })
          ]
        : []
    ),
    node: {
      module: 'empty',
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    },
    stats: 'errors-only'
  };
}
