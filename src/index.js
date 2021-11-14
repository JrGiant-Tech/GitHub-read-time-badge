#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline')
const striptags = require('striptags');
const ReadingTimeStream = require('reading-time/lib/stream');
const readingTimeStream = new ReadingTimeStream()
class ReadTimeBadge {

    fileToRead = ''

    constructor() {
        // Use minialist to allow for flags
    }

    async _setup() {
        const args = require('minimist')(process.argv)
        console.log(args['file'])

        this.fileToRead = args['file'] ? [args['file']] : args._.slice(this._getIndexOfFileName(args))[0]

    }
    async processLineByLine() {
        let stripTagsStream = striptags.init_streaming_mode();
        const fileStream = fs.createReadStream(this.fileToRead);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.
        this.lineArray = [];
        for await (const line of rl) {
            // Each line in input.txt will be successively available here as `line`.
            this.lineArray.push(line.replace(/\!\[Reading Time \d+ min read\]\(https:\/\/img\.shields\.io\/badge\/Read%20Time-\d+%20min%20read.*\)/, ""));
            const stripppedLine = stripTagsStream(line);
            readingTimeStream.write(stripppedLine);
        }
        readingTimeStream.end()
        // console.log("readingTimeStream.stats", readingTimeStream.stats)
        this.readingTimeStats = readingTimeStream.stats;

        // return {stats:readingTimeStream.stats, lineArray};
    }
    _getIndexOfFileName(args) {

        let index;
        for (let i = 0; i < args._.length; i++) {
            if (/\.md$/.test(args._[i])) {
                index = i;
                break;
            }

        }
        return index;
    }
    createBadge() {
        return new Promise((res, rej) => {
            const badgeUrl = `https://img.shields.io/badge/Read Time-${this.readingTimeStats.text}-informational`
            const badgeCode = `![Reading Time ${this.readingTimeStats.text}](${encodeURI(badgeUrl)})`
            this.lineArray.splice(1, 0, badgeCode);

            fs.writeFile(path.resolve(this.fileToRead), this.lineArray.join("\n"), 'utf-8', function (err) {
                if (err) rej(Error(err))
                console.log('Badge Added');
                res();
            });

        })


    }
}


// ToDo: add badge flag
(async function runner() {
    try {
        const readTimeBadge = new ReadTimeBadge();
        readTimeBadge._setup();
        await readTimeBadge.processLineByLine();
        await readTimeBadge.createBadge()

    } catch (error) {
        console.error(error);
    }

})()
