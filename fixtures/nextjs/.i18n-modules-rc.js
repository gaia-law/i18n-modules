const YAML = require('yaml');

module.exports = {
  // Optional, your keys will be relative to this folder, usually `./app` or `./client`.
  // Path must be either absolute or relative to the process.cwd() or `context` option passed to webpack.
  keysRoot: './',

  // Usually the same as the location in phraseapp.yml - the path to your dictionary folder or files
  // where [locale_code] is to be replaced with the language name.
  // Path must be either absolute or relative to the process.cwd() or `context` option passed to webpack.
  // Sync binary also uses this option to locate dictionaries.
  dictionaryPattern: './dictionaries/[locale_code].yml',

  dictionaryAdapter: {
    parse: (buffer) => {
      return YAML.parse(buffer.toString());
    },
    stringify: (obj) => {
      return YAML.stringify(obj);
    },
  }
};
