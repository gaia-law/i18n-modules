const fs = require('fs');
const { validate } = require('schema-utils');
const pick = require('lodash/pick');
const { debug, getSortedObject, getCleanSeed, getTranslationModules } = require('../utils');
const pluginProperties = pick(
  require('../schema').properties,
  [
    'emitFile',
    'dictionaryAdapter',
  ],
);

const schema = {
  type: 'object',
  properties: {
    store: {
      description: 'A storage for updated files, for example an instance of Map',
      type: 'object',
      properties: {
        set: {
          description: 'A setter function for the store',
          instanceof: 'Function',
        },
      },
      required: ['set'],
    },

    ...pluginProperties,
  },
  required: ['store'],
  additionalProperties: false,
};

const getCode = (result) => (
  `module.exports = ${JSON.stringify(result)}`
);


const pitch = function() {
  const options = this.getOptions();
  validate(schema, options, { name: 'I18nModules replacement loader' });

  const { store, emitFile, dictionaryAdapter } = options;

  // Clear the results of the previous compilation so if this one fails
  // they don't pollute the output
  if (emitFile) store.delete(this.resourcePath);

  const source = fs.readFileSync(this.resourcePath);
  const modules = getTranslationModules(this._module);
  const parsedSource = dictionaryAdapter.parse(source);
  if (!modules) return getCode(parsedSource);

  const data = getCleanSeed(parsedSource);

  // Not deep sorting because modules are deep sorted and the dictionary is pre-sorted as well.
  const result = getSortedObject({ ...data, ...modules });
  if (emitFile) store.set(this.resourcePath, result);

  debug('replaced content of %s', this.resourcePath);
  return getCode(result);
};

module.exports = { pitch };
