var express = require("express");
var { v4: uuid } = require("uuid");
var { env } = require("../..");

var tenants = ["foo", "bar", "baz"];

env.set("config", { debug: false });

var app = express();

app.use((req, res, next) => {
  // Attach a unique ID to each request:
  // - If the X-Request-Id header is set, use that
  // - Otherwise generate a unique ID
  req.id = req.headers["x-request-id"] || uuid.v4();
  res.setHeader("X-Request-Id", req.id);
  next();
});

app.use(function (req, res, next) {
  env.set("request", req, next);
});

function tenant(req) {
  const hash = parseInt(req.id) || 0;
  return tenants[hash % tenants.length];
}

app.use(function (req, res, next) {
  env.set("tenant", tenant(req), next);
});

function logger(...args) {
  console.log(`[${env.get("request").headers["x-request-id"]}]`, ...args);
}

app.get("/", function (_, res) {
  logger("Received request -- current config", env.get("config"));
  setTimeout(() => {
    logger("Sending response -- current config", env.get("config"));
    res.send(env.get("request").headers["x-request-id"]);
  }, Math.random() * 1000 + 5000);
});

app.listen(3000);
console.log("Express started on port 3000");

global.require = require;

var net = require("net");
var repl = require("repl");

function createREPL(socket) {
  const remote = repl.start({
    prompt: "remote> ",
    input: socket,
    output: socket,
    useGlobal: true,
  });
}

net.createServer((...args) => createREPL(...args)).listen(5001, "localhost");
console.log("Remote REPL started on port 5001");
