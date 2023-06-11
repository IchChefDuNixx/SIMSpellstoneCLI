const Combinatorics = require("js-combinatorics");
const Table = require("cli-table3");
const fs = require("fs");
const sim = require("C:\\Users\\Felix\\Desktop\\SIMSpellstoneCLI\\dist\\simulator_stripped.js");

var MASSS = {};

(function () {
    MASSS.hero_hashes = new Set(["gmQAA", "4!fAA", "QXvAA", "Yf0AA", "gn5AA", "ov!AA", "w3DBA", "4~IBA", "AIOBA", "IQTBA", "QYYBA", "YgdBA", "goiBA"]); // maxed legendary obtainable
    // maxed obtainable minus lev with most leg/+10 rune variations
    MASSS.mythic_hashes = new Set(["wZhhC", "9ZhhC", "6ahhC", "4hmhC", "FimhC", "aimhC", "3imhC", "AqrhC", "NqrhC", "1qrhC", "oUXjC", "1UXjC", "jXXjC", "hcXjC", "AxKmC", "NxKmC", "oyKmC", "gTxnC", "tTxnC", "bbxnC", "gb5sC", "tb5sC", "Xe5sC", "Xj5sC"]);

    MASSS.set_sim_options = function (input_options = {}) {
        // defaults
        MASSS.hero_options = [];
        MASSS.mythic_options = [];
        MASSS.offense_fixed = [];
        MASSS.offense_options = [];
        MASSS.defenses = [];
        MASSS.results = [];
        MASSS.maxMythics = 3;
        MASSS.hand = "a";

        // override defaults only if value is given
        MASSS = Object.assign(MASSS, input_options);


        // setup
        MASSS.organize_offense();
        MASSS.organize_defenses();
        MASSS.get_combinations();

        console.log(MASSS);
    };

    // turn most basic input hash into useful parts
    MASSS.organize_offense = function () {

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

                if (MASSS.hero_hashes.has(prefix)) { // if prefix is hero...          
                    if (MASSS.hero_options.indexOf(prefix) === -1) { // and if prefix is not in hero_options...
                        MASSS.hero_options.push(prefix); // add prefix
                    }
                    // TODO: test and possibly revert the "if"
                    if (hash.length > 5) {
                        separateMythics(hash.slice(5), type); // Remove the prefix
                    }
                } else {
                    separateMythics(hash, type); // no hero in hash
                }
            })
        };

        // expect string, string inputs
        const separateMythics = function (input, type) {
            // workaround for naming conflict with offense_fixed
            temp_input = input;
            MASSS[type] = [];
            const split_input = temp_input.match(/.{1,5}/g);

            split_input.forEach((split) => {
                if (type == "offense_fixed") {
                    MASSS[type].push(split);
                } else if (type == "offense_options") {
                    if (MASSS.mythic_hashes.has(split)) { // if split is mythic...
                        if (MASSS.mythic_options.indexOf(split) === -1) { // and if split is not in mythic_options
                            MASSS.mythic_options.push(split); // add split
                        }
                    } else {
                        MASSS[type].push(split); // push Units
                    }
                }
            })
        };

        MASSS.offense_fixed ? separateHashes(MASSS.offense_fixed, "offense_fixed") : "";
        MASSS.offense_options ? separateHashes(MASSS.offense_options, "offense_options") : "";
    };

    MASSS.organize_defenses = function () {
        if (!Array.isArray(MASSS.defenses)) {
            if (typeof MASSS.defenses == "string")
                MASSS.defenses = [MASSS.defenses];
        }
    };

    MASSS.get_combinations = function () {
        const mythicsFixed = MASSS.offense_fixed.filter(hash => MASSS.mythic_hashes.has(hash)).length; // Determine the number of fixed mythics

        // should handle maxMythics > mythicsFixed because mythic cards are already in offense_fixed
        const combMythicsLength = Math.max(MASSS.maxMythics - mythicsFixed, 0);
        const combLength = 15 - MASSS.offense_fixed.length - combMythicsLength;

        // Generate combinations with the updated maximum length
        const combMythics = new Combinatorics.Combination(MASSS.mythic_options, combMythicsLength);
        const comb = new Combinatorics.Combination(MASSS.offense_options, combLength);

        MASSS.comb = comb;
        MASSS.combMythics = combMythics;
    };

    MASSS.get_topK = function (K = 25) {
        // Sort the results by winrate in descending order
        MASSS.results.sort((a, b) => b.winrate - a.winrate);
        MASSS.topK = MASSS.results.slice(0, K);

        console.log("Hash / respective winrate:");
        MASSS.topK.forEach(item => {
            console.log(`${item.hash} ${item.winrate}`);
        });

        return MASSS.get_hash_from_challenge(MASSS.topK);
    };

    MASSS.run_samplingSim = function () {

        let l = BigInt(MASSS.numDeckSamples) * BigInt(MASSS.defenses.length);
        console.log("TODO:", l);

        for (let i = 0; i < MASSS.numDeckSamples; i++) {
            if (i > 0 && i % Math.floor(MASSS.numDeckSamples / 10) === 0) { console.log(i) } // log every 10% of progress

            let deck1 = MASSS.hero_options[i % MASSS.hero_options.length] + MASSS.offense_fixed.join("") + MASSS.comb.sample().join("") + MASSS.combMythics.sample().join("");
            let totalResult = 0; // for the current deck1

            for (const deck2 of MASSS.defenses) {
                const result = sim.startsim(deck1, deck2, MASSS.use_tower, MASSS.bges, MASSS.numSims);
                const winrate = parseFloat(result.winrate);
                totalResult += winrate;
            }

            let avgWinrate = (totalResult / MASSS.defenses.length).toFixed(2);
            MASSS.results.push({ "hash": deck1, "winrate": avgWinrate });
        }

        return MASSS.get_topK(25);
    };

    MASSS.run_completeSim = function () {

        const defenses_length = BigInt(MASSS.defenses.length);
        const total = BigInt(MASSS.hero_options.length) * MASSS.combMythics.length * MASSS.comb.length * defenses_length;
        let l = total;
        console.log("TODO:", l);

        for (const curr_hero of MASSS.hero_options) {
            for (const mythic_options of MASSS.combMythics) {
                for (const curr_sample of MASSS.comb) {
                    MASSS.time_estimate(l, defenses_length, Date.now());

                    let offense = curr_hero + MASSS.offense_fixed.join("") + mythic_options.join("") + curr_sample.join("");
                    let totalResult = 0;
                    for (const defense of MASSS.defenses) {

                        const result = sim.startsim(offense, defense, MASSS.use_tower, MASSS.bges, MASSS.numSims);
                        const winrate = parseFloat(result.winrate);
                        totalResult += winrate;
                    }

                    let avgWinrate = (totalResult / MASSS.defenses.length).toFixed(2);
                    MASSS.results.push({ "hash": offense, "winrate": avgWinrate });

                    l -= defenses_length;
                }
            }
        }

        return MASSS.get_topK(25);
    };

    MASSS.run_crossSim = async function (deckList) {
        const N = deckList.length;
        let isObjecList = false;
        let isStringList = false;

        // Initialize n x n results matrix
        var results = new Array(N);
        for (var i = 0; i < N; i++) {
            results[i] = new Array(N);
        }

        // Check for right input types
        if (Array.isArray(deckList)) {
            if (deckList.length > 0) {
                const firstElement = deckList[0];
                if (typeof firstElement === "string") {
                    isStringList = true;
                } else if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
                    isObjecList = true;
                } else {
                    console.error("first element is not a string or object")
                }
            } else {
                console.error("input is empty")
            }
        } else {
            console.error("input is not a list")
        }

        // Populate results matrix
        for (var i = 0; i < N; i++) {
            if (i > 0 && i % Math.floor(N / 10) === 0) { console.log(i) } // log every 10% of progress
            for (var j = 0; j < N; j++) {

                let deck1 = "";
                let deck2 = "";
                if (isObjecList) {
                    deck1 = deckList[i].hash;
                    deck2 = deckList[j].hash;
                } else if (isStringList) {
                    deck1 = deckList[i];
                    deck2 = deckList[j];
                } else {
                    console.error("wrong type in list");
                    return;
                }
                try {
                    const result = sim.startsim(deck1, deck2, MASSS.use_tower, MASSS.bges, MASSS.numSims);
                    results[i][j] = parseFloat(result.winrate);
                } catch (error) {
                    console.error(error);
                }
            }
        }

        // Make Pretty table
        const table = new Table({
            chars: {
                'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
                'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
                'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
                'right': '', 'right-mid': '', 'middle': ''
            }
        });
        results.forEach(row => table.push(row));
        console.log(table.toString());
    };

    MASSS.run_defSim = function () {
        // TODO: a lot
        console.log(MASSS);

        const comb = new Combinatorics.Combination(def_options, 4);
        let l = comb.length;
        for (const curr_sample of comb) {
            const curr_def = def_fixed + curr_sample.join("");
            let totalResult = 0;
            for (const attacker of attackers) {
                const result = sim.startsim(attacker, curr_def, MASSS.use_tower, MASSS.bges, MASSS.numSims);
                totalResult += parseFloat(result.winrate);
            }
            let avgWinrate = (totalResult / attackers.length);
            MASSS.results.push({ "hash": curr_def, "winrate": 1 - avgWinrate });
            console.log(curr_def, 1 - avgWinrate)
            console.log(--l);
        }

        // Maybe this is wrong here? didn't check KekW
        return MASSS.get_topK(25);
    };

    // TODO: input list of champs, run sim (off/def?) with 15 copies each
    MASSS.run_spamSim = function () {

    };

    // Why is this called challenge again?
    MASSS.get_hash_from_challenge = function (resultList, topK = Number.MAX_SAFE_INTEGER) {
        const hashList = [];
        const limit = Math.min(resultList.length, topK);
        for (let i = 0; i < limit; i++) {
            hashList.push(resultList[i].hash);
        }
        return hashList;
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

    MASSS.time_estimate = function (sims_left, batch_size, new_time) {
        sims_left = Number(sims_left);
        batch_size = Number(batch_size);
        // new_time = Number(new_time);

        if (MASSS.curr_time) {
            const avgTimeMS = (new_time - MASSS.curr_time) / batch_size;
            const timeRequired = (sims_left * avgTimeMS / 1000 / 60 / 60).toFixed(2); // convert ms to h
            console.log(sims_left, timeRequired + "h");
        }
        MASSS.curr_time = new_time;
    };

})();;


const offense_fixed = "tRyAFQ5VDFtGgDFt6kFFSUlBFCU0FFaimhCNqrhC9ZhhC";
const offense_options = [
    "goiBA",
    "w3DBA",
    "gmQAA",
    "YgdBAZCoAFqUGBFJPbDF6IUyCn5XCFB9FFF1Z3AFCd0BFsOJCF5~SCFVgDEFViVFF"
];
// TODO: seems to overwrite card options, only accepts very last string

const [defenses, bges] = MASSS.get_challenge("Vanishing");
// defenses = [
//     "goiBAVhyAFl1gDFHFRBF1eEEF9UYCFaimhCNqrhC9ZhhC1rR4H1rR4H1rR4HdsR4HdsR4HdsR4HjvR4H",
//     "goiBAVhyAFVlWDFl1gDFizlBFlO~QI1eEEFaimhCNqrhC9ZhhC1rR4H1rR4HdsR4HdsR4HyJqDJyJqDJ",
//     "goiBAVhyAFVlWDFl1gDFNe~QIRpWSIizlBF6zGBFOsYCFh7GFFlplFFaimhCNqrhC9ZhhCC6ekG1rR4H",
//     "w3DBAiDHBFlLZCFVlWDFl1gDFizlBFduEEF5RwSIBKWSIthlFFaimhCNqrhC9ZhhC6YYUG6YYUGyJqDJ",
//     "goiBAZubDF1DZCFVlWDFl1gDFizlBF8tJCF1eEEFVFfhJaimhCNqrhC9ZhhC1rR4HdsR4HtQD!IPKqDJ",
//     "goiBABSoAFiDHBFZubDFVhyAF8tJCF9LeCF5RwSItW~DF9lgDFvjlBFN0fhJNRWFF3imhCtTxnC1qrhC",
//     "goiBAiDHBFZubDFVhyAFVlWDFl1gDFizlBFUZbFFtr0BFVv!QIl~DEFBjvSIVKlFFaimhCNqrhC9ZhhC",
//     "YgdBABSoAFmJHBFZubDF5d~BFVlWDFizlBFt7TCFovyEFMO1DFRBCFFh7GFF6C1FF3imhC9ZhhC6YYUG",
//     "w3DBABSoAFiDHBFZubDFizlBF3sTCF4IWDF5rGFF9ZlFFaimhC6ahhC4nqXGid~bG1rR4HdsR4HdsR4H",
//     "goiBAZubDFVhyAFY1gDF8tJCFgYWDF6jlBFSkGBF9ZlFFaimhCNqrhC9ZhhCte2DCte2DCtLTqCtLTqC",
// ];
// const bges = "";
const attackers = [""];

const sim_options = {
    "offense_fixed": offense_fixed,
    "offense_options": offense_options,
    "defenses": defenses,
    "bges": bges,
    "attackers": attackers,
    "def_fixed": "",
    "def_options": "",
    "use_tower": true,
    "numSims": 1,
    "numDeckSamples": 1000
}

MASSS.set_sim_options(sim_options);
// const x = MASSS.run_samplingSim();
const x = MASSS.run_completeSim();
MASSS.run_crossSim(x);