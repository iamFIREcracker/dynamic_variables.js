var assert = require("assert");
var { AsyncLocalStorage } = require("async_hooks");

var Bindings = function (kvpairs) {
  this.data = new Map(kvpairs);
};
Bindings.prototype.get = function (name) {
  if (!this.has(name)) {
    throw new Error(`Dynamic variable, unbound: '${name.toString()}'`);
  }
  return this.data.get(name);
};
Bindings.prototype.has = function (name) {
  assert.ok(name, `Dynamic variable name, invalid: ${name.toString()}`);
  return this.data.has(name);
};
Bindings.prototype.set = function (key, value) {
  return this.data.set(key, value);
};
Bindings.prototype[Symbol.iterator] = function () {
  return this.data[Symbol.iterator]();
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

var DynamicEnvironment = function (...flatBindings) {
  this.globalFrame = new Bindings(parseKVPairs(flatBindings));
  this.dynamicFrames = new AsyncLocalStorage();
};
DynamicEnvironment.prototype.get = function (name) {
  return this.findBindingFrameOrGlobal(name).get(name);
};
DynamicEnvironment.prototype.findBindingFrameOrGlobal = function (name) {
  let frame;
  for (let each of this.dynamicFrames.getStore() || []) {
    if (each.has(name)) {
      frame = each;
      break;
    }
  }
  return frame || this.globalFrame;
};
DynamicEnvironment.prototype.set = function (...args) {
  const updatesExistingFrames = args.length % 2 === 0;
  if (updatesExistingFrames) {
    for (let [key, value] of parseKVPairs(args)) {
      this.findBindingFrameOrGlobal(key).set(key, value);
    }
  } else {
    const kvpairs = parseKVPairs(args.slice(0, args.length - 1));
    const body = args[args.length - 1];
    const bindings = new Bindings(kvpairs);
    return this.dynamicFrames.run(
      [bindings, ...(this.dynamicFrames.getStore() || [])],
      body
    );
  }
};
DynamicEnvironment.prototype[Symbol.iterator] = function () {
  const bindings = new Map(this.globalFrame);
  for (let frame of (this.dynamicFrames.getStore() || []).reverse()) {
    for (let [key, value] of frame) {
      bindings.set(key, value);
    }
  }
  return bindings[Symbol.iterator]();
};

var privateVariableSymbol = Symbol("privateVariable");

var DynamicVariable = function (value) {
  this.env = new DynamicEnvironment(privateVariableSymbol, value);
};
DynamicVariable.prototype.get = function () {
  return this.env.get(privateVariableSymbol);
};
DynamicVariable.prototype.set = function (...args) {
  return this.env.set(privateVariableSymbol, ...args);
};

module.exports = {
  env: new DynamicEnvironment(),
  DynamicEnvironment,
  DynamicVariable,
};
