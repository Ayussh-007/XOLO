const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
config.resolver = {
  ...resolver,
  assetExts: [...resolver.assetExts, 'bin', 'db', 'onnx', 'gguf'],
  sourceExts: [...resolver.sourceExts, 'svg'],
};

module.exports = config;
