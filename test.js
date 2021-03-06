var assert = require("assert");
var { DynamicEnvironment, DynamicVariable } = require("./index");

async function test(name, body) {
  try {
    await body();
    console.log(`${name}: A-OK!!!`);
  } catch (err) {
    console.error(`${name}: OOOOOOPS`, err);
  }
}

test("env - simple rebind", async () => {
  var env = new DynamicEnvironment("x", 5);

  var foo = function () {
    return env.get("x");
  };

  var bar = function () {
    return env.set("x", 42, () => foo());
  };

  assert.equal(env.get("x"), 5);
  assert.equal(foo(), 5);
  assert.equal(await bar(), 42);
  assert.equal(env.get("x"), 5);
});

test("env - rebind with setTimeout", async () => {
  var env = new DynamicEnvironment("x", 5);

  var foo = function () {
    return env.get("x");
  };

  var bar = function () {
    return env.set("x", 42, () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(foo()), 2000);
      });
    });
  };

  assert.equal(env.get("x"), 5);
  assert.equal(foo(), 5);
  assert.equal(await bar(), 42);
  assert.equal(env.get("x"), 5);
});

test("env - multiple rebinds in parallel", async () => {
  var env = new DynamicEnvironment("x", 5);

  var foo = function () {
    return env.get("x");
  };

  var bar = function () {
    return env.set("x", 42, () => {
      return Promise.all([
        foo(),
        env.set(
          "x",
          52,
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(foo()), 1000);
            })
        ),
        env.set(
          "x",
          72,
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(foo()), 2000);
            })
        ),
      ]);
    });
  };

  assert.equal(env.get("x"), 5);
  assert.equal(foo(), 5);
  assert.deepEqual(await bar(), [42, 52, 72]);
  assert.equal(env.get("x"), 5);
});

test("var - simple rebind", async () => {
  var x = new DynamicVariable(5);

  var foo = function () {
    return x.get();
  };

  var bar = function () {
    return x.set(42, () => foo());
  };

  assert.equal(x.get(), 5);
  assert.equal(foo(), 5);
  assert.equal(await bar(), 42);
  assert.equal(x.get(), 5);
});

test("var - rebind with setTimeout", async () => {
  var x = new DynamicVariable(5);

  var foo = function () {
    return x.get();
  };

  var bar = function () {
    return x.set(42, () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(foo()), 2000);
      });
    });
  };

  assert.equal(x.get(), 5);
  assert.equal(foo(), 5);
  assert.equal(await bar(), 42);
  assert.equal(x.get(), 5);
});

test("var - multiple rebinds in parallel", async () => {
  var x = new DynamicVariable(5);

  var foo = function () {
    return x.get();
  };

  var bar = function () {
    return x.set(42, () => {
      return Promise.all([
        foo(),
        x.set(
          52,
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(foo()), 1000);
            })
        ),
        x.set(
          72,
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(foo()), 2000);
            })
        ),
      ]);
    });
  };

  assert.equal(x.get(), 5);
  assert.equal(foo(), 5);
  assert.deepEqual(await bar(), [42, 52, 72]);
  assert.equal(x.get(), 5);
});
