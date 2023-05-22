const express = require('express');
const app = express();
const http = require('http');
const Table = require('cli-table');


// Set CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Import your functions from hashServer.js and simServer.js
const hash_encode = require("C:\\Users\\Felix\\Desktop\\SIMSpellstoneCLI\\NodeJS\\hasher.js");
const sim = require("C:\\Users\\Felix\\Desktop\\SIMSpellstoneCLI\\dist\\simulator_stripped.js");

// Set up the Express routes
app.get("/hash", (req, res) => {
    const hashable = JSON.parse(req.query.hashable);

    if (!hashable) {
        res.status(200).send('Simulation result: No Input');
        return;
    }

    try {
        const result = hash_encode(hashable);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(`Error executing script: ${err}`);
    }
});

app.get("/sim", (req, res) => {
    const deck1 = req.query.deck1;
    const deck2 = req.query.deck2;
    const use_tower = req.query.use_tower === 'true'; // Convert to boolean
    const bges = req.query.bges;
    const numsims = parseInt(req.query.numsims) || 999; // Convert to number, default to 999 if not provided
    const hand = req.query.hand;

    try {
        const result = sim.startsim(deck1, deck2, use_tower, bges, numsims);
        if (result.liveSim) {
            var liveSim = result.liveSim;
            delete result.liveSim;

            // Formatting the table
            const table = new Table({
                chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
                    , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
                    , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
                    , 'right': '' , 'right-mid': '' , 'middle': '' },
                style: {
                    'padding-left': 0,'padding-right': 0,
                }
            });
            
            // custom header
            table.push([""]);
            table.push(["First Drop  ", "Winrate  ", "Samples"]);

            // actual content of table
            // Step 1: Convert object to array of key-value pairs
            const entries = Object.entries(liveSim);

            // Step 2: Sort the array by the key
            entries.sort((a, b) => a[0].localeCompare(b[0]));

            for (const [key, value] of entries) {
                if (hand.includes(key)) {
                    const number = value.num;
                    const wins = value.wins;
                    table.push([key + "  ", (wins/number).toFixed(2), number]);
                }
            }

            res.status(200).send(`Simulation result: ${JSON.stringify(result)}\n${table.toString()}`);
        } else {
            res.status(200).send(`Simulation result: ${JSON.stringify(result)}`);
        };
    } catch (err) {
        res.status(500).send(`Error executing script: ${err}`);
    }
});

// Start the combined server
const server = http.createServer(app);
const port = 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
