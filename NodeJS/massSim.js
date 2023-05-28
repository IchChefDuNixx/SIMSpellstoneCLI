const Combinatorics = require("js-combinatorics");
const fetch = require('isomorphic-fetch');
const fs = require("fs");

var MASSS = {};

(function () {
    MASSS.hero_hashes = ["gmQAA", "4!fAA", "QXvAA", "Yf0AA", "gn5AA", "ov!AA", "w3DBA", "4~IBA", "AIOBA", "IQTBA", "QYYBA", "YgdBA", "goiBA"]; // maxed legendary obtainable
    MASSS.curr_heroes = [];
    MASSS.mythic_hashes = ["aimhC", "NqrhC", "1UXjC", "NxKmC", "tTxnC", "wZhhC", "tb5sC"]; // maxed obtainable minus lev
    MASSS.curr_mythics = [];
    MASSS.offense_fixed = [];
    MASSS.offense_options = [];
    MASSS.defenses = [];

    MASSS.run_sims = function (offense_fixed = "", offense_options = [""], defenses = [""], use_tower = false, bges = "", numsims = 50, numDecks = 100, cross_sim = false) {
        MASSS.organize_offense(offense_fixed, offense_options);
        MASSS.organize_defenses(defenses);
        MASSS.set_sim_options(use_tower, bges, numsims, numDecks);
        MASSS.run_sim(cross_sim);
        // console.log(MASSS);
    }

    // turn most basic input hash into useful parts
    MASSS.organize_offense = function (offense_fixed, offense_options) {

        // handle string and array offenses
        const separateHashes = function (input, type) {
            if (!Array.isArray(input)) { // if not array...
                input = [input]; // make array
            }

            separateHero(input, type);
        };

        // expect array, string inputs
        const separateHero = function (input, type) {
            input.forEach((hash) => {
                const prefix = hash.substring(0, 5);

                if (MASSS.hero_hashes.indexOf(prefix) !== -1) { // if prefix is hero...          
                    if (MASSS.curr_heroes.indexOf(prefix) === -1) { // and if prefix is not in curr_heroes...
                        MASSS.curr_heroes.push(prefix); // add prefix
                    }
                    separateMythics(hash.slice(5), type); // Remove the prefix

                } else {
                    separateMythics(hash, type); // no hero in hash
                }
            })
        };

        // expect string, string inputs
        const separateMythics = function (input, type) {
            const split_input = input.match(/.{1,5}/g);

            split_input.forEach((split) => {
                if (type == "offense_fixed") {
                    MASSS[type].push(split);

                } else if (type == "offense_options") {
                    if (MASSS.mythic_hashes.indexOf(split) !== -1) { // if split is mythic...
                        if (MASSS.curr_mythics.indexOf(split) === -1) { // and if split is not in curr_mythics
                            MASSS.curr_mythics.push(split); // add split
                        }
                    } else {
                        MASSS[type].push(split); // push Units
                    }

                } else {
                    console.errors("wrong type in separateMythics()!");
                }


            })
        };

        offense_fixed ? separateHashes(offense_fixed, "offense_fixed") : "";
        offense_options ? separateHashes(offense_options, "offense_options") : "";
    };

    MASSS.organize_defenses = function (defenses) {
        if (!Array.isArray(defenses)) {
            defenses = [defenses];
        }
        MASSS.defenses = defenses;
    };

    MASSS.set_sim_options = function (use_tower, bges, numsims, numDecks) {
        MASSS.use_tower = use_tower;
        MASSS.bges = bges;
        MASSS.numsims = numsims;
        MASSS.hand = "a";
        MASSS.results = [];
        MASSS.numDecks = numDecks;
    };

    // can't multithread in here if app.js doesn't handle it
    MASSS.run_simOLD = function () {

        //     const mythicsFixed = MASSS.offense_fixed.filter(hash => MASSS.mythic_hashes.includes(hash)).length; // determine amount of fixed mythics

        //     let comb = new Combinatorics.Combination(MASSS.offense_options, 15 - MASSS.offense_fixed.length - (3 - mythicsFixed));

        //     let combMythics = new Combinatorics.Combination(MASSS.curr_mythics, 3 - mythicsFixed);



        //     let deck1;
        //     let deck2;

        //     function runBatch(startIndex) {
        //         const batchPromises = [];

        //         for (let i = startIndex; i < startIndex + MASSS.batchSize; i++) {
        //             if (i >= MASSS.numDecks) {
        //                 break; // Exit the loop if we have reached the total number of loops
        //             }

        //             deck1 = MASSS.curr_heroes[i % MASSS.curr_heroes.length] + MASSS.offense_fixed + comb.sample().join("") + combMythics.sample().join("");
        //             deck2 = MASSS.defenses[i % MASSS.defenses.length];
        //             console.log(i, deck1);

        //             const promise = fetch(`http://localhost:3000/sim?deck1=${deck1}&deck2=${deck2}&use_tower=${MASSS.use_tower}&bges=${MASSS.bges}&numsims=${MASSS.numsims}&hand=${MASSS.hand}`)
        //                 .then(response => response.text())
        //                 .then(data => {
        //                     console.log(i, deck1);
        //                     MASSS.results.push({
        //                         hash: deck1,
        //                         winrate: data.slice(31, 35)
        //                     });

        //                     if (MASSS.results.length % 100 === 0) {
        //                         console.log(MASSS.results.length);
        //                     }
        //                 })
        //                 .catch(error => {
        //                     console.error(error);
        //                 });

        //             batchPromises.push(promise);
        //         }

        //         return Promise.all(batchPromises).then(() => {
        //             if (startIndex + MASSS.batchSize < MASSS.numDecks) {
        //                 return runBatch(startIndex + MASSS.batchSize); // Recursively process the next batch
        //             }
        //         });
        //     }

        //     runBatch(0).then(() => {
        //         // Sort the results by winrate in descending order
        //         MASSS.results.sort((a, b) => b.winrate - a.winrate);

        //         // Extract the top 25 winrates
        //         // MASSS.top25 = MASSS.results.slice(0, 25);
        //         MASSS.top25 = MASSS.results;

        //         MASSS.top25.forEach(item => {
        //             console.log(`${item.hash} ${item.winrate}`);
        //         });
        //     });

        //     if (cross_sim) { MASSS.run_cross_sim(MASSS.top25) };
    };

    MASSS.run_sim = async function () {

        const mythicsFixed = MASSS.offense_fixed.filter(hash => MASSS.mythic_hashes.includes(hash)).length; // Determine the number of fixed mythics
        const comb = new Combinatorics.Combination(MASSS.offense_options, 15 - MASSS.offense_fixed.length - (3 - mythicsFixed));
        const combMythics = new Combinatorics.Combination(MASSS.curr_mythics, 3 - mythicsFixed);

        for (let i = 0; i < MASSS.numDecks; i++) {
            if (i > 0 && i % Math.floor(numDecks / 10) === 0) { console.log(i) } // log every 10% of progress

            let deck1 = MASSS.curr_heroes[i % MASSS.curr_heroes.length] + MASSS.offense_fixed + comb.sample().join("") + combMythics.sample().join("");
            let totalResult = 0; // for the current deck1
            let errors = 0;

            for (const deck2 of MASSS.defenses) {
                try {
                    // Simulation result: {"winrate":"0.3133","games":1500,"wins":470,"losses":1030,"draws":0,"error":"2.38%","tower?":true,"bges?":"508,520,540"}
                    const response = await fetch(`http://localhost:3000/sim?deck1=${deck1}&deck2=${deck2}&use_tower=${MASSS.use_tower}&bges=${MASSS.bges}&numsims=${MASSS.numsims}&hand=${MASSS.hand}`);
                    const data = await response.text();
                    const winrate = data.slice(31, 37);
                    totalResult += parseFloat(winrate);
                } catch (error) {
                    console.error(error);
                    errors++;
                }
            }

            let avgWinrate = (totalResult / MASSS.defenses.length).toFixed(2);
            MASSS.results.push({ "hash": deck1, "winrate": avgWinrate, "total": totalResult, "errors": errors });
        }

        // Sort the results by winrate in descending order
        MASSS.results.sort((a, b) => b.winrate - a.winrate);
        MASSS.top25 = MASSS.results.slice(0, 25);
        MASSS.top25.forEach(item => {
            console.log(`${item.hash} ${item.winrate} ${item.total} ${item.errors}`);
        });

        // continue with fine tuning
        if (cross_sim) { MASSS.run_cross_sim(MASSS.top25) }
    };

    MASSS.run_cross_sim = function (deckList) {
        console.log(deckList);
    };

    MASSS.get_challenge = function (sub_event = "", mode = "Clash Challenge", path = "C:\\Users\\Felix\\Desktop\\SIMSpellstoneCLI\\NodeJS\\135s.json") {
        let defenses;
        let bges;

        try {
            let data = fs.readFileSync(path, 'utf8');
            data = JSON.parse(data)[mode][sub_event];
            defenses = data["def"];
            bges = data["bges"];

            return [defenses, bges];

        } catch (err) {
            console.error(err);
        }
    };

})();;

fixed = "wZhhC";
offense = [
    "Yf0AAY4JyC9AvjC0dLnCxmpkHYgMzC~5VpC6IUyCKTlpCNxKmCQSRvC1UXjCtb5sCAx4xCTh6xCA95rC",
    "IQTBAaimhCtTxnC3CgsH1CqFFNqrhCcqioCCItvHUHbHJqHbHJF1NCFSgk9ISRYrHCItvHRFuSIiCf5I",
    "IQTBAr3pDF8KvFFgPnCFVjBBHSUlBFtGgDFsOJCFtRyAFsP0DFwW3CFNS~FFC7iAFgKEGFJPbDFlVphJ",
    "CcBBF1z5BFqFECFN!7CFAaQFFoonEF"
];

let [defenses, bges] = MASSS.get_challenge("Snowstorm");

let use_tower = true;
let numsims = 1500;
let numDecks = 1000;
let cross_sim = false;

MASSS.run_sims(fixed, offense, defenses, use_tower, bges, numsims, numDecks, cross_sim);

// SNOWSTORM RESULTS v1, with duplicates :/
// IQTBAwZhhCaimhCtTxnCY4JyC0dLnC~5VpC6IUyCQSRvCTh6xC3CgsHUHbHJgPnCFSUlBFsOJCFJPbDF 0.67
// IQTBAwZhhCtb5sCtTxnCAx4xCA95rC1CqFFqHbHJSgk9ISRYrHCItvHRFuSIiCf5ItGgDFlVphJ1z5BF 0.66
// IQTBAwZhhC1UXjCNqrhCY4JyC9AvjC0dLnCxmpkH6IUyCQSRvCAx4xCiCf5ItRyAFsP0DFJPbDFAaQFF 0.66
// IQTBAwZhhC1UXjCtTxnC9AvjCxmpkHAx4xCUHbHJSRYrHCItvHgPnCFsOJCFtRyAFC7iAFJPbDFCcBBF 0.65
// IQTBAwZhhCNxKmC1UXjC9AvjCxmpkH~5VpCKTlpCTh6xC3CgsHSRYrHsOJCFwW3CFC7iAFJPbDFlVphJ 0.65
// IQTBAwZhhCNxKmCaimhC9AvjCYgMzCA95rC3CgsH1CqFFCItvH8KvFFVjBBHgKEGFJPbDF1z5BFAaQFF 0.65
// IQTBAwZhhC1UXjCtTxnC9AvjCQSRvCTh6xCUHbHJF1NCFCItvHr3pDF8KvFFVjBBHsP0DFNS~FF1z5BF 0.64
// IQTBAwZhhCNxKmCaimhCYgMzC6IUyCA95rC1CqFFr3pDF8KvFFSUlBFtGgDFtRyAFwW3CFgKEGFlVphJ 0.64
// IQTBAwZhhC1UXjCaimhC0dLnCxmpkH6IUyCQSRvCTh6xCSgk9ISRYrHiCf5IwW3CFgKEGFCcBBFqFECF 0.64
// IQTBAwZhhCtTxnCNqrhCYgMzCKTlpCQSRvCcqioCCItvHSRYrHRFuSIr3pDF8KvFFsOJCFwW3CFgKEGF 0.63
// IQTBAwZhhCaimhCNqrhC0dLnCxmpkHqHbHJRFuSIiCf5I8KvFFgPnCFsP0DFC7iAFgKEGFCcBBFoonEF 0.63
// IQTBAwZhhC1UXjCNqrhCY4JyC9AvjC0dLnCxmpkH6IUyCQSRvCAx4xCiCf5ItRyAFsP0DFJPbDFAaQFF 0.63
// IQTBAwZhhC1UXjCtb5sCYgMzC~5VpCKTlpCQSRvCTh6xCCItvHF1NCFSRYrHNS~FFlVphJ1z5BFN!7CF 0.63
// IQTBAwZhhC1UXjCtb5sCYgMzC~5VpCKTlpCQSRvCTh6xCCItvHF1NCFSRYrHNS~FFlVphJ1z5BFN!7CF 0.63
// IQTBAwZhhC1UXjCaimhC0dLnC3CgsHF1NCFRFuSIiCf5IVjBBHtGgDFwW3CFCcBBF1z5BFN!7CFAaQFF 0.62
// IQTBAwZhhC1UXjCNqrhCY4JyC9AvjC0dLnCxmpkH6IUyCQSRvCAx4xCiCf5ItRyAFsP0DFJPbDFAaQFF 0.62
// IQTBAwZhhCtTxnCNqrhCYgMzCKTlpCQSRvCcqioCCItvHSRYrHRFuSIr3pDF8KvFFsOJCFwW3CFgKEGF 0.61
// IQTBAwZhhCaimhCtTxnCKTlpC3CgsH1CqFFcqioCRFuSIiCf5IVjBBHNS~FFlVphJCcBBF1z5BFqFECF 0.61
// IQTBAwZhhCtb5sCNqrhC9AvjC0dLnCxmpkHYgMzCAx4xCA95rC3CgsHgPnCFtGgDFNS~FFlVphJAaQFF 0.61
// IQTBAwZhhCNxKmCNqrhC~5VpC6IUyCKTlpCQSRvCCItvHF1NCFCItvHRFuSItGgDFtRyAFC7iAFJPbDF 0.61
// IQTBAwZhhCtTxnCNqrhC9AvjCxmpkH6IUyC3CgsHCItvHqHbHJCItvHSUlBFtGgDFJPbDFCcBBFAaQFF 0.60
// IQTBAwZhhCNxKmC1UXjC9AvjCxmpkH~5VpCKTlpCTh6xC3CgsHSRYrHsOJCFwW3CFC7iAFJPbDFlVphJ 0.60
// IQTBAwZhhCtb5sCaimhCY4JyCYgMzCqHbHJRFuSIr3pDF8KvFFgPnCFsP0DFwW3CFNS~FFCcBBFqFECF 0.60
// IQTBAwZhhCaimhCtTxnC0dLnC6IUyCKTlpC1CqFFcqioCUHbHJSgk9ISRYrHgPnCFsOJCFCcBBFAaQFF 0.60
// IQTBAwZhhCtb5sCtTxnC0dLnC6IUyCQSRvCTh6xCA95rCUHbHJF1NCFgPnCFSUlBFsOJCFJPbDFAaQFF 0.60