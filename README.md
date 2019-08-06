# Orb CSS

<div style="display: flex; align-items: center; justify-content: center;">

  ![Orb logo](logo.png)

</div>

Pack your CSS together in a single file to reduce the number of requests per page, while easily maintaining your CSS codebase.

With this script, you can import any number of CSS libraries, that are themselves split in so-called *books*, and pick which *book* you want to use.
Once this is done, simply run the script to *pack* all of these files into a single, minified CSS file.

Alternatively, this library set may be dynamically served and packed on-the-go.

## Installation

Clone this repository, then install its dependencies:

```sh
git clone https://github.com/adri326/orb-css
cd orb-css
npm i
```

## Usage

### Statically

Put in the `libs` directory the libraries that you wish to pack.

To pack files in a single, minified CSS file, run `node . pack <book_1> [book_2 [...]]`.
Each `book` may be as follows:

| Syntax | Description | Example |
| :---- | :---- | :---- |
| `library` | Select the entirety of a `library` | `default-material` |
| `library.book` | Only select `book` in `library` | `default-material.main` |
| `library.[book_1, book_2, ...]` | Select `book_1`, `book_2`, ... from `library` | `default-main.[main,colors,box,shadow]` |

A `-o` parameter may be provided to specify where the packed file should be written to.

**Example:**

```sh
node . pack "default-material.[main, colors, box, shadow]"
```

### Dynamically

The packer can be imported in your code with `require("orb-css/pack")`. It will expose a function, whose arguments are:

* `books`, an array of book selectors, their syntax is described in the *Statically* subsection.
* `params`, an object:
  * `params.caching`, a boolean; if set to `true` (default), minified, singular files will be saved to the `build/` directory.
    Note that the packed files are not cached themselves.

Alternatively, you may use this script as an Express middleware:

```js
const orb = require("orb-css/middleware");

app.use("/orb/:books", orb({
  cached: true
}));
```

The `:books` parameter is required. Requests made to this address should have their book selectors split by colons (`:`). It may be followed by a `.css` extension.

**Example:**

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>An example</title>

    <link rel="stylesheet" href="/orb/default-material.[main,colors,box].css">
  </head>
  <body dm-primary-color="red" dm-secondary-color="gray">
    <header class="dm-box-header" dm-background-color="secondary" dm-text-color="white" dm-size="big" dm-shadow="1">
      <h1>Just an example</h1>
    </header>
  </body>
</html>
```
