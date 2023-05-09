const parse = (str) => JSON.parse(str);
const stringify = (obj) => JSON.stringify(obj, null, 2);

module.exports = { parse, stringify };
