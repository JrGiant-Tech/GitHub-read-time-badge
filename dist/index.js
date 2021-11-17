"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const striptags = require("striptags");
const reading_time_1 = require("reading-time");
const rts = reading_time_1.readingTimeStream();
class ReadTimeBadge {
    _setup() {
        return __awaiter(this, void 0, void 0, function* () {
            const args = require('minimist')(process.argv);
            this.fileToRead = args['file'] ? [args['file']] : args._.slice(this._getIndexOfFileName(args))[0];
        });
    }
    processLineByLine() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let stripTagsStream = striptags.init_streaming_mode();
            const fileStream = fs.createReadStream(this.fileToRead);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            this.lineArray = [];
            try {
                for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), !rl_1_1.done;) {
                    const line = rl_1_1.value;
                    this.lineArray.push(line.replace(/\!\[Reading Time \d+ min read\]\(https:\/\/img\.shields\.io\/badge\/Read%20Time-\d+%20min%20read.*\)/, ""));
                    const stripppedLine = stripTagsStream(line);
                    rts.write(stripppedLine);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) yield _a.call(rl_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            rts.end();
            this.readingTimeStats = rts.stats;
        });
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
            const badgeUrl = `https://img.shields.io/badge/Read Time-${this.readingTimeStats.text}-informational`;
            const badgeCode = `![Reading Time ${this.readingTimeStats.text}](${encodeURI(badgeUrl)})`;
            this.lineArray.splice(1, 0, badgeCode);
            fs.writeFile(path.resolve(this.fileToRead), this.lineArray.join("\n"), 'utf-8', function (err) {
                if (err)
                    rej(Error(err));
                console.log('Badge Added');
                res();
            });
        });
    }
}
module.exports = ReadTimeBadge;
//# sourceMappingURL=index.js.map