import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import _HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HtmlWebpackPlugin = _HtmlWebpackPlugin as any;

import { WebpackConfig } from '@zero-scripts/config.webpack';
import {
  AbstractExtension,
  AbstractPreset,
  InsertPos,
  ReadOptions
} from '@zero-scripts/core';

import { WebpackSpaExtensionOptions } from './WebpackSpaExtensionOptions';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FriendlyErrorsPlugin = require('@artemir/friendly-errors-webpack-plugin');

@ReadOptions(WebpackSpaExtensionOptions, 'extension.webpack-spa')
export class WebpackSpaExtension<
  TParentExtensionOptions extends WebpackSpaExtensionOptions = WebpackSpaExtensionOptions
> extends AbstractExtension<TParentExtensionOptions> {
  public activate(preset: AbstractPreset): void {
    preset
      .getInstance(WebpackConfig)
      .insertPlugin(({ isDev }) =>
        !isDev ? new CleanWebpackPlugin() : undefined
      )
      .insertPlugin(({ isDev, paths }) =>
        !isDev
          ? new CopyWebpackPlugin([
              {
                from: paths.publicPath,
                to: paths.build,
                ignore: [paths.indexHtml]
              }
            ])
          : undefined
      )
      .insertPlugin(({ isDev, paths }) =>
        isDev
          ? new FriendlyErrorsPlugin({
              compilationSuccessInfo: {
                messages: [
                  'Your application is available at http://localhost:8080'
                ],
                notes: [
                  'The development build is not optimized',
                  'To create a production build, run `build` script'
                ]
              }
            })
          : new FriendlyErrorsPlugin({
              compilationSuccessInfo: {
                messages: [
                  `Your application successfully built and available at ${paths.build
                    .split(path.sep)
                    .pop()} folder`
                ]
              }
            })
      )
      .insertPlugin(
        ({ isDev, paths }) =>
          new HtmlWebpackPlugin({
            inject: true,
            template: paths.indexHtml,
            minify: !isDev
              ? {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true
                }
              : false
          }),
        InsertPos.Start
      )
      .insertPlugin(
        () =>
          new ScriptExtHtmlWebpackPlugin({
            module: /.*.m?js/gm
          })
      );
  }
}
