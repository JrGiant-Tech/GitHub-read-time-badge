import fs = require('fs');
import path = require('path');
import readline = require('readline');
import striptags = require('striptags');
import { readingTimeStream } from 'reading-time';
import { ReadTimeResults } from 'reading-time';
const rts = readingTimeStream()


class ReadTimeBadge {

    fileToRead: string;
    lineArray: string[];
    readingTimeStats: ReadTimeResults;

    async _setup() {
        // Use minialist to allow for flags
        const args = require('minimist')(process.argv)
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
            rts.write(stripppedLine);
        }
        rts.end()
        // console.log("readingTimeStream.stats", readingTimeStream.stats)
        this.readingTimeStats = rts.stats;

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
        return new Promise<void>((res, rej) => {
            const badgeUrl = `https://img.shields.io/badge/Read Time-${this.readingTimeStats.text}-informational`
            const badgeCode = `![Reading Time ${this.readingTimeStats.text}](${encodeURI(badgeUrl)})`
            this.lineArray.splice(1, 0, badgeCode);

            fs.writeFile(path.resolve(this.fileToRead), this.lineArray.join("\n"), 'utf-8', function (err) {
                if (err) rej(Error(err as any))
                console.log('Badge Added');
                res();
            });

        })


    }
}

module.exports = ReadTimeBadge

