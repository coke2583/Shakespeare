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

Your position within each play is saved in the browser. When you load the
reader you will always start at the play selection screen, but a **Resume
Reading** button lets you jump back to the play and line you last viewed.

