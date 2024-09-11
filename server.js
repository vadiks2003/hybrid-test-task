// server.ts
var { createServer } = require("node:http");
var fs = require("node:fs");
var https = require("https");
function Init() {
  const hostname = `localhost`;
  const port = 3e3;
  const server = createServer(HandleRequests);
  function HandleRequests(req, res) {
    if (req.url == "/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      fs.readFile("./static-front-end/index.html", (err, data) => {
        if (err) return;
        res.end(data);
      });
    } else if (req.url == "/style.css") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/css");
      fs.readFile("./static-front-end/style.css", (err, data) => {
        if (err) return;
        res.end(data);
      });
    } else if (req.url?.startsWith("/api/rates")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      if (req.url.includes("?currency=")) {
        const key = req.url.slice(
          req.url.indexOf("=") + 1,
          req.url.length
        );
        if (key == "") {
          res.statusCode = 404;
          res.end(`"Empty query!"`);
        }
        const response = https.get(`https://api.coincap.io/v2/assets?search=${key}&limit=1`, (res2) => {
          let data = [];
          res2.on("data", (chunk) => {
            data.push(chunk);
          });
          res2.on("end", () => {
            let realResponse;
            try {
              realResponse = Buffer.concat(data).toString();
            } catch (err) {
              res.statusCode = 404;
              res.end(`"error! ${err}"`);
            }
            const objectResponse = JSON.parse(realResponse).data[0];
            if (objectResponse.id != key) {
              res.statusCode = 404;
              res.end(`"haven't found exact name, but found ${objectResponse.id} with dollar value of ${objectResponse.priceUsd}"`);
            } else {
              const usdPrice = JSON.stringify({ "USD": objectResponse.priceUsd });
              res.end(usdPrice);
            }
          });
        });
      }
    } else {
      res.statusCode = 400;
      res.setHeader("Content-Type", "text/plain");
      res.end("no such route.");
    }
  }
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}
module.exports = {
  init: Init
};
