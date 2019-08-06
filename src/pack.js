const path = require("path");
const fs = require("fs");
const less = require("less");
const minify = require("minify");

module.exports = async function pack(books) {
  let files = new Set(); // set of files to read from

  books.forEach((book) => {
    let split = book.split(".");
    let dir = path.join(path.resolve(process.cwd(), "./libs"), split[0], "src");
    let lib = fs.readdirSync(dir);

    if (split[1]) {
      if (split[1].startsWith("[") && split[1].endsWith("]")) { // multiple book per library
        split[1].slice(1, -1)
          .split(",")
          .forEach((book) => {
            let match = lib.find((file) => file.replace(/\.(less|css)$/, "") === book.trim());
            if (!match) throw new Error(`No book called ${book} found in ${split[0]}`);

            files.add(path.join(dir, match));
          });
      } else { // only one book wanted
        let match = lib.find((file) => file.replace(/\.(less|css)$/, "") === split[1]);
        if (!match) throw new Error(`No book called ${split[1]} found in ${split[0]}`);

        files.add(path.join(dir, match));
      }
    } else { // no book specified: take them all
      lib.forEach((book) => files.add(path.join(dir, book)));
    }
  });

  let bucket = []; // Book bucket

  for (let file of files) {
    if (path.extname(file).toLowerCase() === ".less") {
      let output = await less.render(fs.readFileSync(file, "utf8"), {
        filename: file
      });

      bucket.push(output.css);
    } else {
      bucket.push(fs.readFileSync(file, "utf8"));
    }
  }

  bucket = bucket.map((book) => minify.css(book));

  return bucket.join("");
}
