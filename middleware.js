const path = require("path");
const pack = require("./pack.js");

module.exports = function middleware(params = {}) {
  let {caching = true} = params;

  return function(req, res, next) {
    let books_raw = req.params.books;
    if (!books_raw) throw new Error("books parameter was not set");

    if (books_raw.endsWith(".css")) books_raw = books_raw.slice(0, -4);

    let books = books_raw.split(":").filter(Boolean);

    pack(books).then((packed) => {
      res.setHeader("Content-Type", "text/css");
      res.status(200);
      res.send(packed);
    }).catch((err) => {
      res.writeHead(400, {
        "Content-Type": "text/plain"
      });
      res.write(err.toString());
      res.end();
    }).catch((err) => console.error(err));
  }
}
