module.exports = {
  comments: false,
  plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
  presets: [
    [
      '@babel/preset-env',
      {
        include: [
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-nullish-coalescing-operator',
          '@babel/plugin-proposal-numeric-separator',
          '@babel/plugin-proposal-logical-assignment-operators',
        ],
        bugfixes: true,
        loose: true,
        modules: false,
        targets: '> 1%, not dead, not ie 11, not op_mini all',
      },
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
}
