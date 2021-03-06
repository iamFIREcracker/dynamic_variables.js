var assert = require("assert");
var { AsyncLocalStorage } = require("async_hooks");

var Bindings = function (kvpairs) {
  this.data = new Map(kvpairs);
};
Bindings.prototype.get = function (name) {
  assert.ok(name, `Dynamic variable name, invalid: ${name}`);
  if (!this.data.has(name)) {
    throw new Error(`Dynamic variable, unbound: '${name}'`);
  }
  return this.data.get(name);
};
Bindings.prototype.set = function (kvpairs) {
  return new Bindings([...this.data, ...kvpairs]);
};

function parseKVPairs(flatBindings) {
  assert.ok(
    flatBindings.length % 2 === 0,
    `Bindings arguments, expected even number of elements, but got: ${flatBindings.length}`
  );

  const kvpairs = [];
  for (var i = 0; i < flatBindings.length; i += 2) {
    kvpairs.push(flatBindings.slice(i, i + 2));
  }
  return kvpairs;
}

function parseDynamicEnvironmentSetArguments(args) {
  assert.ok(args, `Function arguments, invalid: ${args}`);
  assert.ok(
    args.length % 2 === 1,
    `Function arguments, expected odd number of elements, but got: ${args.length}`
  );

  const kvpairs = parseKVPairs(args.slice(0, args.length - 1));
  const body = args[args.length - 1];

  return [kvpairs, body];
}

var DynamicEnvironment = function (...flatBindings) {
  this.ctx = new AsyncLocalStorage();
  this.ctx.enterWith(new Bindings(parseKVPairs(flatBindings)));
};
DynamicEnvironment.prototype.get = function (name) {
  return this.ctx.getStore().get(name);
};
DynamicEnvironment.prototype.set = function (...args) {
  const [kvpairs, body] = parseDynamicEnvironmentSetArguments(args);
  const bindings = this.ctx.getStore().set(kvpairs);
  return this.ctx.run(bindings, body);
};

var DynamicVariable = function (value) {
  this.ctx = new AsyncLocalStorage();
  this.ctx.enterWith(value);
};
DynamicVariable.prototype.get = function () {
  return this.ctx.getStore();
};
DynamicVariable.prototype.set = function (value, body) {
  return this.ctx.run(value, body);
};

module.exports = {
  env: DynamicEnvironment(),
  DynamicEnvironment,
  DynamicVariable,
};
