import { Configuration, RuleSetRule } from 'webpack';

import {
  InsertPos,
  extensionsRegex,
  ConfigModification
} from '@zero-scripts/core';

import { WebpackConfigOptions } from '../WebpackConfigOptions';

export class OneOfModification extends ConfigModification<
  Configuration,
  WebpackConfigOptions,
  RuleSetRule[]
> {
  public static readonly id: string = 'one-of';

  public readonly rules: {
    getRule: (options: WebpackConfigOptions) => RuleSetRule;
    position: InsertPos;
  }[] = [];

  public constructor() {
    super(
      c => c.module.rules,
      (rules, options) => {
        const oneOf: RuleSetRule[] = this.rules
          .sort((left, right) => {
            if (left.position < right.position) {
              return 1;
            }

            if (left.position > right.position) {
              return -1;
            }

            return 0;
          })
          .map(({ getRule }) => getRule(options))
          .filter(Boolean) as RuleSetRule[];

        return [
          ...(rules ? rules : []),
          {
            oneOf: [
              ...oneOf,
              {
                loader: require.resolve('file-loader'),
                exclude: [
                  extensionsRegex(options.moduleFileExtensions),
                  /\.html$/
                ],
                options: {
                  name: 'media/[name].[hash:8].[ext]'
                }
              }
            ]
          }
        ];
      },
      OneOfModification.id
    );
  }
}
