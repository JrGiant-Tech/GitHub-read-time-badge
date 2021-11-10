const path = require('path');
const fs = require('fs');
const readline = require('readline')
const striptags = require('striptags');
const ReadingTimeStream = require('reading-time/lib/stream');
const readingTimeStream = new ReadingTimeStream()
// console.dir(readingTimeStream)

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

let [fileToRead] = process.argv.slice(process.argv.indexOf(__filename) + 1)
let stripTagsStream = striptags.init_streaming_mode();
(async function runner(params) {
    const results = await processLineByLine(fileToRead);
    console.log(results)
})()
