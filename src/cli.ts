#!/usr/bin/env node
const ReadTimeBadge = require("./index.js");

async function runner() {

    try {
        const readTimeBadge = new ReadTimeBadge();
        readTimeBadge._setup();
        await readTimeBadge.processLineByLine();
        await readTimeBadge.createBadge()

    } catch (error) {
        console.error(error);
    }

}
runner();