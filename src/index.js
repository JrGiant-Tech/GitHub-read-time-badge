#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline')
const striptags = require('striptags');
const ReadingTimeStream = require('reading-time/lib/stream');
const readingTimeStream = new ReadingTimeStream()


async function processLineByLine(fileName) {
    const fileStream = fs.createReadStream(fileName);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        const stripppedLine = stripTagsStream(line);
        readingTimeStream.write(stripppedLine);
    }
    readingTimeStream.end()
    // console.log("readingTimeStream.stats", readingTimeStream.stats)
    return readingTimeStream.stats;
}
// Use minialist to allow for flags
const args = require('minimist')(process.argv)

let index;
for (let i = 0; i < args._.length; i++) {
    if (/\.md$/.test(args._[i])) {
        index = i;
        break;
    }

}

// ToDo: add badge flag
let [fileToRead] = args['file'] ? [args['file']] : args._.slice(index)
let stripTagsStream = striptags.init_streaming_mode();
(async function runner() {
    const results = await processLineByLine(fileToRead);

    console.log(results)
})()
