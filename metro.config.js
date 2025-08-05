const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts } = defaultConfig.resolver;

const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    assetExts: [...assetExts, 'mp3'],
  },
};

module.exports = config;
