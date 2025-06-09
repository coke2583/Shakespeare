# Shakespeare Reader

A lightweight browser-based reader for Shakespeare's plays.

## Running locally

Open `index.html` in any modern browser or serve the folder with a static server:

```bash
npx http-server .
```

## Adding more plays

Place additional TEI Simple XML files in the `XML/` directory and add the
filename to the `plays` array inside `js/reader.js`.

## Bookmarking progress

Your reading position is automatically saved in the browser. The reader will
reopen the last play, act and scene you viewed and scroll to the same spot the
next time you visit.

