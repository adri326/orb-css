#! /usr/bin/node

const pack = require("./pack.js")
const path = require("path");
const fs = require("fs");

require("yargs")
  .command("pack <books...>", "Pack libraries together", (yargs) => {
    yargs.option("o", {
      alias: "output",
      type: "string"
    }).option("no-caching", {
      type: "boolean",
      description: "Disables the caching system"
    })
  }, async (argv) => {
    let packed = await pack(argv.books);
    let output = path.resolve(process.cwd(), argv.o || "build/" + argv.books.join("_") + ".css");

    if (!fs.existsSync(path.dirname(output))) {
      fs.mkdirSync(path.dirname(output));
    } else if (!fs.lstatSync(path.dirname(output)).isDirectory()) {
      throw new Error("Output folder already exists as a file");
    }

    fs.writeFileSync(output, packed);
  })
  .command("clear-cache", "Clears the cache", () => {}, (argv) => {
    if (!fs.existsSync(path.resolve(__dirname, "build"))) return;

    clear_directory(path.resolve(__dirname, "build"));
  }).argv;

function clear_directory(directory) {
  let files = fs.readdirSync(directory);

  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var file_path = path.join(directory, '/', files[i]);
      if (fs.lstatSync(file_path).isFile()) {
        fs.unlinkSync(file_path);
      } else {
        clear_directory(file_path);
        fs.rmdirSync(file_path);
      }
    }
  }
};
