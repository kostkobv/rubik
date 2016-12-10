let modulePrototype;

modulePrototype = {

};

function createModuleInstance(config) {
  return Object.assign({}, modulePrototype, { config });
}

export default function init(config) {
  return createModuleInstance(config);
}
