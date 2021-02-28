var assert = require("assert");
var { DynamicEnvironment } = require("./index");

async function test(body) {
  try {
    await body();
    console.log("A-OK!!!");
  } catch (err) {
    console.error(err);
  }
}

test(async () => {
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

test(async () => {
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

test(async () => {
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
