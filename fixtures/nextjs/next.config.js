const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const I18nModules = require('../../lib/plugin');


const getConfig = (phase) => {
  const nextConfig = {
    webpack: (config) => {
      config.plugins.push(
        new I18nModules({ emitFile: phase !== PHASE_DEVELOPMENT_SERVER }),
      );
      return config;
    },
  };

  return nextConfig;
};

module.exports = getConfig;
