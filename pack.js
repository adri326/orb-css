const path = require("path");
const fs = require("fs");
const less = require("less");
const minify = require("minify");

module.exports = async function pack(books, params = {}) {
  let {caching = true} = params;
  let files = new Set(); // set of files to read from

  if (caching && !fs.existsSync(path.resolve(__dirname, "build"))) {
    fs.mkdirSync(path.resolve(__dirname, "build"));
  }

  books.forEach(parse_book_request(files));

  let bucket = []; // Book bucket

  for (let file of files) {
    if (caching && is_cached(file)) {
      bucket.push(fs.readFileSync(to_cached_path(file), "utf8"));
    } else {
      let minified;

      if (path.extname(file).toLowerCase() === ".less") {
        let output = await less.render(fs.readFileSync(to_path(file), "utf8"), {
          filename: file
        });
        minified = minify.css(output.css);
      } else {
        minified = minify.css(fs.readFileSync(to_path(file), "utf8"));
      }

      if (caching) {
        if (!fs.existsSync(path.resolve(__dirname, "build", file.split(":")[0]))) {
          fs.mkdirSync(path.resolve(__dirname, "build", file.split(":")[0]));
        }
        fs.writeFileSync(to_cached_path(file), minified, "utf8");
      }

      bucket.push(minified);
    }
  }

  return bucket.join("");
}

function parse_book_request(files) {
  return (book) => {
    let split = book.split(".");
    let dir = path.join(path.resolve(__dirname, "libs"), split[0], "src");
    let lib = fs.readdirSync(dir);

    if (split[1]) {
      if (split[1].startsWith("[") && split[1].endsWith("]")) { // multiple book per library
        split[1].slice(1, -1)
          .split(",")
          .forEach((book) => {
            let match = lib.find((file) => file.replace(/\.(less|css)$/, "") === book.trim());
            if (!match) throw new Error(`No book called ${book} found in ${split[0]}`);

            files.add(`${split[0]}:${match}`);
          });
      } else { // only one book wanted
        let match = lib.find((file) => file.replace(/\.(less|css)$/, "") === split[1]);
        if (!match) throw new Error(`No book called ${split[1]} found in ${split[0]}`);

        files.add(`${split[0]}:${match}`);
      }
    } else { // no book specified: take them all
      lib.forEach((book) => files.add(`${split[0]}:${book}`));
    }
  };
}

function to_path(file) {
  let [lib, book] = file.split(":");
  return path.resolve(__dirname, "libs", lib, "src", book);
}

function to_cached_path(file) {
  let [lib, book] = file.split(":");
  return path.resolve(__dirname, "build", lib, path.parse(book).name + ".css");
}

function is_cached(file) {
  let [lib, book] = file.split(":");
  if (!fs.existsSync(path.resolve(__dirname, "build", lib))) return false;
  return fs.readdirSync(path.resolve(__dirname, "build", lib)).includes(path.parse(book).name + ".css");
}
