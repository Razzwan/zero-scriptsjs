import {
  Configuration,
  DefinePlugin,
  HotModuleReplacementPlugin
} from 'webpack';
import { WebpackConfigOptions } from './WebpackConfigOptions';
import ManifestPlugin from 'webpack-assets-manifest';
import { HotAcceptPlugin } from 'hot-accept-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';

export const createWebpackConfiguration = ({
  isDev,
  paths,
  additionalEntry,
  useSourceMap,
  moduleFileExtensions
}: WebpackConfigOptions): Configuration => ({
  mode: isDev ? 'development' : 'production',
  entry: [paths.indexJs, ...additionalEntry],
  devtool: isDev ? 'eval-source-map' : useSourceMap && 'source-map',
  output: {
    path: !isDev ? paths.build : undefined,
    filename: isDev ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
    chunkFilename: isDev
      ? 'js/[name].chunk.js'
      : 'js/[name].[contenthash:8].chunk.js'
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
});
