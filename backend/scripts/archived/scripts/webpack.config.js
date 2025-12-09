const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      'bcrypt': 'commonjs bcrypt',
      'class-transformer': 'commonjs class-transformer',
      'class-validator': 'commonjs class-validator',
      '@nestjs/microservices': 'commonjs @nestjs/microservices',
      '@nestjs/websockets/socket-module': 'commonjs @nestjs/websockets/socket-module',
      'cache-manager': 'commonjs cache-manager',
    },
    output: {
      ...options.output,
    },
    module: {
      rules: [
        ...options.module.rules,
        {
          test: /\.html$/,
          loader: 'ignore-loader',
        },
      ],
    },
    plugins: [
      ...options.plugins,
      new CopyWebpackPlugin({
        patterns: [
          { from: 'package.json', to: 'package.json' },
        ],
      }),
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@mapbox/node-pre-gyp',
            'mock-aws-s3',
            'aws-sdk',
            'nock',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};
