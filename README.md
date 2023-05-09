@gaia-law/i18n-modules
============

CSS Modules for i18n. A webpack plugin that brings support for a modular approach to dictionaries. Especially useful for tools such as [Phraseapp](https://phrase.com). Pairs well with [react-polyglot](https://github.com/flashfixapp/react-polyglot).

## Usage:

### Setup
In your webpack config:
```javascript
const I18nModules = require('@gaia-law/i18n-modules');
//...
plugins: [
  new I18nModules(),
],
```

Create an options RC file in your project's root named `.i18n-modules-rc.js` with this example content:
```javascript
module.exports = {
  // Optional, your keys will be relative to this folder, usually `./app` or `./client`.
  // Path must be either absolute or relative to the process.cwd() or `context` option passed to webpack.
  keysRoot: './',
  // Optional, how you will be naming your translation modules,
  // similar to name.module.css, or in this case name.translations.json
  moduleEnding: '.translations.json',

  // Usually the same as the location in phraseapp.yml - the path to your dictionary folder or files
  // where [locale_code] is to be replaced with the language name.
  // Path must be either absolute or relative to the process.cwd() or `context` option passed to webpack.
  // Sync binary also uses this option to locate dictionaries.
  dictionaryPattern: './dictionaries/[locale_code].json',

  // Optional, signals that the original dictionary is to be updated at the end of modules bundling, defaults to `true`.
  // Set this to `false` when you don't need to update the original dictionary
  // and only wish to use bundled translations, for example for SSR bundle build.
  emitFile: true,

  // Optional, a function to customize how unique module IDs are generated
  // Arguments are:
  //  keysRoot: string, same as above but rebased to be absolute
  //  moduleEnding: string, same as above
  //  filePath: string, an absolute path to the translations module file
  // Must return a stable unique string
  getId: (keysRoot, moduleEnding, filePath) => idString,
  
  // Optional, an object to customize the format dictionarys are kept in
  // Defaults to JSON representation
  dictionaryAdapter: {
    parse: (buffer) => someObj,
    stringify: (obj) => someStr,
  }
};
```

If you don't expect to use the CLI (see below), then instead of creating an RC file you
can simply pass an options object as an argument to the plugin. Passed options will be
merged with those in the RC file if present and the defaults. This way you can also
override RC options by passing extra options directly.

### Loader alone

In case you don't need to bundle or update original dictionaries and only need the part
that remaps module paths, you can use the module loader directly. In webpack config use it
as any other loader:

```javascript
const { loader: i18nLoader } = require('@gaia-law/i18n-modules');
//...
module: {
  rules: [
    {
      test: /\.translations\.json/,
      use: [{
        loader: i18nLoader,
        options: {
          // keysRoot, moduleEnding, getId: same as for the plugin
        },
      }],
    },
  ]
}
```

### Working with modules
Create a translations module `myfile.translations.json`:
```json
{
  "de-DE": {
    "content": {
      "totally": {
        "necessary": {
          "nesting": "Majestätischer Inhalt"
        }
      }
    },
    "title": "Unglaublicher Titel"
  },
  "en-US": {
    "content": {
      "totally": {
        "necessary": {
          "nesting": "Majestic content"
        }
      }
    },
    "title": "Amazing title"
  }
}
```
You need to pay attention to the language names in your modules,
the plugin only validates that they match a certain pattern, but not the values.

Import translations:
```javascript
import lang from './myfile.translations';

// Instead of string paths use object lookup
t(lang.title);

// Nesting is fully supported
t(lang.content.totally.necessary.nesting);
```

When importing your translation modules all of the values will be remapped to lookup strings for your main dictionary.

### Referencing bundled modules
Load your main dictionary like usual:
```javascript
import dictionary from '../dictionaries/de-DE';
// Pass the dictionary to your translations library, e.g. i18n-polyglot.
```

The dictionary will contain it's original content and the generated modules.

## Options:

 - `keysRoot` (optional) - the keys will be generated relative to this folder. Use this to make generated keys shorter by excluding static parts of the path, e.g. if all your translations are in `./frontend/app/components` pass that as the `keysRoot`. Defaults to `'./'`.
 - `moduleEnding` (optional) - the ending that will be used for the translation modules. You can't use `:` symbol in file names for these files. It's an OS limitation for MacOS and Windows anyway, but \*nix users should be aware. Defaults to `'.translations.json'`
 - `dictionaryPattern` (required) - the path to your dictionary folder or files. Use `[locale_code]` placeholder to get current language name injected into the file name. Try not to name your dictionaries in such a way where part of the name might be confused for a language name. For example this might break the build `./dicts/gr-EAT.[locale_code].json`
 - `emitFile` (optional) - determines if the bundled dictionary needs to also be stored on the disk. Set to `false` when you prefer to use `@gaia-law/i18n-modules` binary to update original dictionaries or don't intend to store module build results anywhere. Defaults to `true`.

## CLI:

This package comes with a CLI because you might need a way to sync updates from Phraseapp or translations hosting service back into your modules and a simple way to build all languages from modules at once. To use this CLI you must create an RC configuration file.

 - `npx @gaia-law/i18n-modules build` will build all dictionaries from modules
 - `npx @gaia-law/i18n-modules update` will update all modules from dictionaries. This will not create any new module files from dictionary as this is likely a result of a typo.
 - `npx @gaia-law/i18n-modules clean` will remove all generated modules from dictionaries

### env:

We support `I18N_MODULES_CONTEXT` env variable to set current working directory to something else. It works similarly to webpack's `context` option. When set both plugin and `@gaia-law/i18n-modules` binary will look for the RC file relative to that context folder. In addition when running the `@gaia-law/i18n-modules` binary all relative file paths in the RC file will be relative to that context. `I18N_MODULES_CONTEXT` itself accepts paths relative to current working directory, e.g. one could set `I18N_MODULES_CONTEXT=./frontend/app` and it would work.

### An example with Phraseapp CLI:

 - `npx @gaia-law/i18n-modules build && phraseapp push` will push all generated modules to phraseapp
 - `phraseapp pull && npx @gaia-law/i18n-modules update` will update all modules with changes from phraseapp

`i18n-modules` is also added to your npm env. You could add this to your package.json:
```json
"scripts": {
  "lang:push": "i18n-modules build && phraseapp push",
  "lang:pull": "phraseapp pull && i18n-modules update",
  "lang:clean": "i18n-modules clean",
  "lang:sync": "npm run lang:push && npm run lang:pull",
}
```

## NextJS users

NextJS builds in dev mode incrementally. That means with default config you will always have merge conflicts in the dictionaries folder. To avoid this only emit full dictionaries during full build.

This is an example implementation of `next.config.js` that achieves this:

```javascript
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const I18nModules = require('@gaia-law/i18n-modules');


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
```


## Debugging

This module uses [debug](https://github.com/visionmedia/debug) internally with label `i18n_modules`. To debug use DEBUG=i18n_modules in your env: `DEBUG=i18n_modules npx webpack`.
