# Dynamic variables inside Express.js application

Inside this directory you will find a server application, and a client one.

Server:

- Express.js application listening on port `3000`
- Remote REPL available when connecting to port `5001`
- When new HTTP requests are received, a middleware will force
  a request `id` into the request object either by reading it from
  `X-Request-Id` header, or by generating a new UUID on the spot
- When new HTTP requests are received, a middleware will add the current
  request object to the dynamic environment
- When new HTTP requests are received, a middleware will figure out the
  _tenant_ the request is coming from, and add that to the dynamic context
  request object to the dynamic environment
- Inside the request controller, we will do some _contextual_ logging, run
  a `setTimeout()` with a few seconds delay, do some more _contextual_ logging
  and ultimately send the request ID back to the client (Note: we never use
  Express.js `req` object here, but only the dynamic environment)
- We have a standard Express.js application that

Client:

- Generate a UUID
- Create a request and load the UUID as `X-Request-Id` header
- Fire that request to the Express.js application
- Wait for the response, and confirm the content of the response matches
  the UUID that we originally sent over
- Repeat all the above `20` times

To run the test, and confirm we can effectively interact with the dynamic
environment while the Express.js application is running, you will have to:

- Install the dependencies
- Start the server
- Start the client (you will now have 5 seconds, give or take to do the next
  step)
- Quickly connect to the server remote REPL, and tweak the dynamic environment

If at this point, the client application quits without throwing any errors, it
means it all went fine and that no _asynchronous_ context was lost / swapped
throughout the life-cycle of the HTTP request.

## Install dependencies

    npm ci

### Start the server

Open a new terminal and run:

    $ node server.js
    Express started on port 3000
    Remote REPL started on port 5001

### Start the client

Open a new terminal, and run:

    $ node client.js
    Firing request: c62c5835-42d9-4218-b1e1-ca87b7ebc945
    Firing request: 8f717ca6-1004-46c1-b4d3-30ff90dfbe2d
    Firing request: 4c30027d-2a52-43bf-8716-a40b1762037b
    Firing request: b52999f6-40b2-4163-9996-40b206c78408
    Firing request: 863fef03-d5fb-4e9e-b1d1-977da8a7cd8e
    Firing request: dbaeb581-5a9f-44b1-b733-ae538a2fc0a8
    Firing request: b1969f25-ab67-48c8-b91f-f6ed4f8ff301
    Firing request: bbb3f801-1293-405f-9f29-7afe958bc393
    Firing request: bcbdea1c-b34e-4542-8e87-4f85c640a249
    Firing request: 3486c284-e015-410b-b7dc-072928cffba1
    Firing request: 74d0753a-0fc0-46ba-b4ad-ece08043d1a9
    Firing request: c3139a49-083a-4b31-a3b0-9239d99f61df
    Firing request: e72e9d92-1afa-49d5-b642-4bc9e4a6d123
    Firing request: abd296e5-1764-459f-9b05-ef6b7dd508a7
    Firing request: 6de54f60-a51f-4070-a778-93da99968446
    Firing request: abd5c61d-efd7-4878-8ac7-ee320baf0747
    Firing request: 1ccd0c08-13e4-4403-b422-798be35d3095
    Firing request: db8d871f-35cc-4036-9092-0af5b373aa81
    Firing request: ca815611-0618-4230-9b26-b51b34c7cd44

Note: the following should now have been logged to the terminal in which the
server is running:

    [c62c5835-42d9-4218-b1e1-ca87b7ebc945] Received request -- current config { debug: false }
    [4c30027d-2a52-43bf-8716-a40b1762037b] Received request -- current config { debug: false }
    [8f717ca6-1004-46c1-b4d3-30ff90dfbe2d] Received request -- current config { debug: false }
    [863fef03-d5fb-4e9e-b1d1-977da8a7cd8e] Received request -- current config { debug: false }
    [dbaeb581-5a9f-44b1-b733-ae538a2fc0a8] Received request -- current config { debug: false }
    [b1969f25-ab67-48c8-b91f-f6ed4f8ff301] Received request -- current config { debug: false }
    [bbb3f801-1293-405f-9f29-7afe958bc393] Received request -- current config { debug: false }
    [bcbdea1c-b34e-4542-8e87-4f85c640a249] Received request -- current config { debug: false }
    [3486c284-e015-410b-b7dc-072928cffba1] Received request -- current config { debug: false }
    [74d0753a-0fc0-46ba-b4ad-ece08043d1a9] Received request -- current config { debug: false }
    [b52999f6-40b2-4163-9996-40b206c78408] Received request -- current config { debug: false }
    [c3139a49-083a-4b31-a3b0-9239d99f61df] Received request -- current config { debug: false }
    [abd296e5-1764-459f-9b05-ef6b7dd508a7] Received request -- current config { debug: false }
    [6de54f60-a51f-4070-a778-93da99968446] Received request -- current config { debug: false }
    [e72e9d92-1afa-49d5-b642-4bc9e4a6d123] Received request -- current config { debug: false }
    [1ccd0c08-13e4-4403-b422-798be35d3095] Received request -- current config { debug: false }
    [db8d871f-35cc-4036-9092-0af5b373aa81] Received request -- current config { debug: false }
    [ca815611-0618-4230-9b26-b51b34c7cd44] Received request -- current config { debug: false }
    [abd5c61d-efd7-4878-8ac7-ee320baf0747] Received request -- current config { debug: false }

### Remote REPL

(Quickly) open a new terminal, connect to server REPL, and change the dynamic
environment:

    $ nc localhost 5001 <<EOF
    var { env } = require('../..')
    env.set('config', { ...env.get('config'), debug: true })
    EOF

Wait a little longer for the `setTimeout` callbacks to be fired, and inside the
server's terminal you should then be able to see something like the following:

    [bcbdea1c-b34e-4542-8e87-4f85c640a249] Sending response -- current config { debug: true }
    [c3139a49-083a-4b31-a3b0-9239d99f61df] Sending response -- current config { debug: true }
    [b1969f25-ab67-48c8-b91f-f6ed4f8ff301] Sending response -- current config { debug: true }
    [c62c5835-42d9-4218-b1e1-ca87b7ebc945] Sending response -- current config { debug: true }
    [e72e9d92-1afa-49d5-b642-4bc9e4a6d123] Sending response -- current config { debug: true }
    [74d0753a-0fc0-46ba-b4ad-ece08043d1a9] Sending response -- current config { debug: true }
    [abd5c61d-efd7-4878-8ac7-ee320baf0747] Sending response -- current config { debug: true }
    [3486c284-e015-410b-b7dc-072928cffba1] Sending response -- current config { debug: true }
    [db8d871f-35cc-4036-9092-0af5b373aa81] Sending response -- current config { debug: true }
    [863fef03-d5fb-4e9e-b1d1-977da8a7cd8e] Sending response -- current config { debug: true }
    [ca815611-0618-4230-9b26-b51b34c7cd44] Sending response -- current config { debug: true }
    [abd296e5-1764-459f-9b05-ef6b7dd508a7] Sending response -- current config { debug: true }
    [8f717ca6-1004-46c1-b4d3-30ff90dfbe2d] Sending response -- current config { debug: true }
    [6de54f60-a51f-4070-a778-93da99968446] Sending response -- current config { debug: true }
    [dbaeb581-5a9f-44b1-b733-ae538a2fc0a8] Sending response -- current config { debug: true }
    [bbb3f801-1293-405f-9f29-7afe958bc393] Sending response -- current config { debug: true }
    [b52999f6-40b2-4163-9996-40b206c78408] Sending response -- current config { debug: true }
    [4c30027d-2a52-43bf-8716-a40b1762037b] Sending response -- current config { debug: true }
    [1ccd0c08-13e4-4403-b422-798be35d3095] Sending response -- current config { debug: true }

That `{ debug: true }` bit is a sign that were indeed able to _mutate_ the
application's dynamic environment from the outside, even for requests which
were already in flight.
