const CARDS = require("C:\\Users\\Felix\\Desktop\\SIMSpellstone\\scripts\\data\\cards.js");
const FUSIONS = require("C:\\Users\\Felix\\Desktop\\SIMSpellstone\\scripts\\data\\fusions.js");

const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Parse the URL to get the parameters
    const urlParams = new URL(req.url, `http://${hostname}:${port}`).searchParams;
    const hashable = JSON.parse(urlParams.get("hashable"));

    // == empty or len 0
    if (!hashable) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Simulation result: No Input`);
        return;
    }

    try {
        const result = hash_encode(hashable);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(result);
    } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Error executing script: ${port}:${err}`);
        return;
    }
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

var maxRuneID = 1000;

function hash_encode(deck) {

    var current_hash = [];
    var has_priorities = false;
    var has_indexes = false;
    var indexes = [];

    if (deck.commander) {
        current_hash.push(unitInfo_to_base64(deck.commander));
    }
    for (var k in deck.deck) {
        var current_card = deck.deck[k];
        if (current_card.priority) {
            has_priorities = true;
        }
        if (current_card.index) {
            indexes.push(numberToBase64(current_card.index));
            has_indexes = true;
        }
        current_hash.push(unitInfo_to_base64(current_card));
    }

    if (has_priorities) {
        var priorities = priorityDelimiter;
        for (var k in deck.deck) {
            var current_card = deck.deck[k];
            if (current_card.priority) {
                priorities += current_card.priority;
            } else {
                priorities += '0';
            }
        }
        current_hash.push(priorities);
    }

    if (has_indexes) {
        indexes = indexDelimiter + indexes.join('');
        current_hash.push(indexes);
    }

    current_hash = current_hash.join("");

    return current_hash;
};

var base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!~";
var runeDelimiter = "/";
var indexDelimiter = '-';
var priorityDelimiter = '|';

var noFusionInHash = {};
for (var id in CARDS) {
    if (id < 10000) {
        var fusion = FUSIONS[id];
        if (!fusion || Number(fusion) < 10000) {
            noFusionInHash[id] = true;
        }
    }
};

function unitInfo_to_base64(unit_info) {

    var baseID = parseInt(unit_info.id);
    var level = (parseInt(unit_info.level) - 1);

    if (noFusionInHash[baseID]) {
        var fusion = Math.floor(level / 7);
        var level = level % 7;
    } else {
        var fusion = Math.floor(baseID / 10000);
        baseID %= 10000;
    }

    var runeID = 0;
    if (unit_info.runes.length) {
        runeID = parseInt(unit_info.runes[0].id);
        runeID %= 5000; // Runes IDs are all in the range of 5001 - 5500
    }

    var priority = (unit_info.priority || 0);

    var dec = baseID;
    dec = dec * 3 + fusion;
    dec = dec * 7 + level;
    dec = dec * maxRuneID + runeID;

    return decimal_to_base64(dec, 5);
};

function parseInt(value) {
    return value >> 0;
};

function decimal_to_base64(dec, len) {
    var base64 = '';
    //while (dec > 0) {
    for (var i = 0; i < len; i++) {
        var part = dec % 64;
        base64 += base64chars[part]; // + base64;
        dec = (dec - part) / 64;
    }
    return base64;
};

function numberToBase64(decimal) {
    var char1 = base64chars[Math.floor(decimal / 64)];
    var char2 = base64chars[decimal % 64];
    return char1 + char2;
};