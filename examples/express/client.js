var assert = require("assert");
var http = require("http");
var { v4: uuid } = require("uuid");

function fire() {
  const requestId = uuid();
  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
    headers: {
      "X-Request-Id": requestId,
    },
  };

  console.log(`Firing request: ${requestId}`);
  const req = http.request(options, (res) => {
    res.on("data", (d) => {
      assert.equal(d.toString(), requestId);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.end();
}

let n = 20;
while ((n -= 1)) {
  fire();
}
