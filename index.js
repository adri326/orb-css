const pack = require("./src/pack.js")
const path = require("path");
const fs = require("fs");

require("yargs")
  .command("pack <books...>", "Pack libraries together", (yargs) => {
    yargs.option("o", {
      alias: "output",
      type: "string"
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
  }).argv;
