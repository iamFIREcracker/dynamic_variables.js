# dynamic_variables.js

Global variables...with dynamic context.

From the original [write-up](https://matteolandi.net/plan.html#day-2021-02-28):

> Let's go back the definition that I gave earlier: _global_ variables, with
> _dynamic_ scope. I know that the first rule of global variables is: "thou
> shalt not use global variables", but it's just that _sometimes_ they appear
> to be right tool for the job, especially in the context of Web applications;
> think about the following use cases:
>
> - getting a hold of the currently logged in user
> - automatically adding the content of the `X-Request-Id` header to each log
>   trace
> - querying the _right_ database, based on the logged in user's tenant
>
> How would you implement these? Either you shove all this information into
> a context object, and pass it around, _everywhere_; or maybe you forget about
> all the bad things you read about global variables, and consciously and
> carefully agree to use them where it really matters, where it really makes
> a difference.

## Status

It _works_ but relies on `async_hooks`, a Node.js API still marked as
experimental; so feel free to use it, but carefully test as many asynchronous
code paths as possible and confirm the asynchronous context is not in any way
lost.

## API

### Dynamic environments

#### Creating a dynamic environment

The library automatically creates a dynamic environment for you, and makes it
available to the running Node.js instance through the `env` module export:

    var { env } = require('dynamic_variables.js');

Alternatively, if you don't feel like using a _shared_ dynamic environment, you
can create a private environment as follows:

    var { DynamicEnvironment } = require('dynamic_variables.js');

    var env1 = new DynamicEnvironment();

    var env2 = new DynamicEnvironment('a', 1);

#### Getting a binding

To get a binding (i.e. the value currently bound to a specific variable name)
you can use the `DynamicEnvironment.prototype.get` method:

    var env = new DynamicEnvironment('a', 1, 'b', 2)

    > env.get('a')
    1

    > env.get('b')
    2

    > env.get('c')
    Uncaught Error: Dynamic variable, unbound: 'c'
        at Bindings.get (repl:4:11)
        at DynamicEnvironment.get (repl:2:30)

    > env.get()
    Uncaught AssertionError [ERR_ASSERTION]: Dynamic variable name, invalid: undefined
        at Bindings.get (repl:2:3)
        at DynamicEnvironment.get (repl:2:30)
        at repl:1:5
        at Script.runInThisContext (vm.js:131:18)
        at REPLServer.defaultEval (repl.js:472:29)
        at bound (domain.js:430:14)
        at REPLServer.runBound [as eval] (domain.js:443:12)
        at REPLServer.onLine (repl.js:794:10)
        at REPLServer.emit (events.js:326:22)
        at REPLServer.EventEmitter.emit (domain.js:486:12) {
      generatedMessage: false,
      code: 'ERR_ASSERTION',
      actual: undefined,
      expected: true,
      operator: '=='
    }

#### Setting a new binding

Lastly, `DynamicEnvironment.prototype.set` can be used to set a new binding
that's going to persist across subsequent asynchronous operations as well:

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

### Dynamic variables

#### Creating a dynamic variables

Sometimes creating an environment is a bit too much especially if you plan to
store a single binding in it. You can create an instance of `DynamicVariable`
instead:

    var { DynamicVariable } = require('dynamic_variables.js');

    var x = new DynamicVariable();

    var y = new DynamicVariable(42);

#### Getting the current value

To get the value currently bound to the dynamic variable you can
use the `DynamicVariable.prototype.get` method:

    var x = new DynamicVariable(42)

    > x.get()
    42

#### Setting a new value

Lastly, `DynamicVariable.prototype.set` can be used to override the dynamic
variable's value, and make sure the new value persists across subsequent
asynchronous operations:

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

## Changelog

### 0.0.2:

- Exports `DynamicVariable` for creating a _private_ dynamic variable

### 0.0.1:

- Exports `env`, a dynamic environment shared with all the modules loaded in
  the current Node.js instance
- Exports `DynamicEnvironment` for creating a _private_ dynamic environment
