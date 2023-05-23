// const Combinatorics = require("js-combinatorics");

// const a = "tTxnCFMLBFsOJCFSgk9IVgDEF9ZhhCsP0DFNMvlC9wsEFViVFFY4JyCYOtTBSRYrHNS~FFcqaFF";
// const b = "g57EF8KvFFRFuSI1CqFFYyfFFNxKmCCU0FFNS~FFViVFFQrDGFF1NCF1UXjCtb5sClVphJZSBFF";
// const c = "Ih5rBKTlpCAGrxCC7iAFlWxDCNqrhC84e3IaimhCgSLlCA2anCsZxDCYgMzCA95rCAYxDCgPnCF";

// function splitString(string) {
//     return string.match(/.{1,5}/g).map(substring => substring);
// }

// // Example usage:
// var inputHashes = a+b;
// var inventory = splitString(inputHashes);

// let comb = new Combinatorics.Combination(inventory, 15);
// // console.log(comb.length);
// // console.log(comb.sample().join(""));


// var deck1 = "AIOBAAMJCFgGgDFIiVFFw2JyCgTxnCIgDEFYLtTBQqaFFYLtTBwH0DFQLLBFwZhhCwwsEFYLvlCAS~FF";
// var deck2 = "AIOBAAMJCFgGgDFIiVFFw2JyCgTxnCIgDEFYLtTBQqaFFYLtTBwH0DFQLLBFwZhhCwwsEFYLvlCAS~FF";
// const use_tower = true;
// const bges = "164,165";
// const numsims = 1500;
// const hand = "a";

// for (var i = 0; i < 100; i++) {
//     (function(deck1) {
//         fetch(`http://localhost:3000/sim?deck1=${deck1}&deck2=${deck2}&use_tower=${use_tower}&bges=${bges}&numsims=${numsims}&hand=${hand}`)
//             .then(response => response.text())
//             .then(data => {
//                 // Process the data returned from the server
//                 console.log(deck1, data.slice(30, 35));
//             })
//             .catch(error => {
//                 // Handle any errors that occurred
//                 console.error(error);
//             });
//     })("AIOBA" + comb.sample().join(""));
// }

// const Combinatorics = require('js-combinatorics');
// const { Worker } = require('worker_threads');

// const a = 'tTxnCFMLBFsOJCFSgk9IVgDEF9ZhhCsP0DFNMvlC9wsEFViVFFY4JyCYOtTBSRYrHNS~FFcqaFF';
// const b = 'g57EF8KvFFRFuSI1CqFFYyfFFNxKmCCU0FFNS~FFViVFFQrDGFF1NCF1UXjCtb5sClVphJZSBFF';

// function splitString(string) {
//     return string.match(/.{1,5}/g).map(substring => substring);
// }

// const inputHashes = a + b;
// const inventory = splitString(inputHashes);
// const comb = new Combinatorics.Combination(inventory, 15);
// const deck2 = 'AIOBAAMJCFgGgDFIiVFFw2JyCgTxnCIgDEFYLtTBQqaFFYLtTBwH0DFQLLBFwZhhCwwsEFYLvlCAS~FF';
// const use_tower = true;
// const bges = '164,165';
// const numsims = 1;
// const hand = 'a';

// for (let i = 0; i < 1; i++) {
//     const deck1 = 'AIOBA' + comb.sample().join('');
//     const worker = fork(__filename, [], {
//         env: {
//             DECK1: deck1,
//             DECK2: deck2,
//             USE_TOWER: use_tower,
//             BGES: bges,
//             NUMSIMS: numsims,
//             HAND: hand
//         }
//     });

//     worker.on('message', message => {
//         console.log(message);
//     });

//     worker.on('error', error => {
//         console.error(error);
//     });

//     worker.on('exit', code => {
//         if (code !== 0) {
//             console.error(`Worker stopped with exit code ${code}`);
//         }
//     });
// }



var MASSS = {};

(function () {
    MASSS.hero_hashes = ["AIOBA"];
    MASSS.curr_heroes = [];
    MASSS.curr_fixed = [];
    MASSS.curr_options = [];
    MASSS.offense_fixed_size = 0;
    MASSS.offense_options_size = 0;


    // turn most basic input hash into useful parts
    MASSS.organize_input = function (offense_fixed, offense_options, defenses) {
        MASSS.offense_fixed_size = offense_fixed.length / 5;
        MASSS.offense_options_size = offense_options.length / 5;

        const separateHero = function (input, type) {
            const prefix = input.substring(0, 5);
            if (MASSS.hero_hashes.indexOf(prefix) !== -1) {
                MASSS.curr_heroes.push(prefix);
                MASSS[type] = input.slice(5); // Remove the prefix
                MASSS[type + "_size"]--;
            } else {
                MASSS[type] = input; // Assign input to MASSS[type]
            }
        };

        separateHero(offense_fixed, "offense_fixed");
        separateHero(offense_options, "offense_options");

        const isNotHeroHash = function (hash) {
            return MASSS.hero_hashes.indexOf(hash) === -1;
        };
    
        MASSS.curr_options = MASSS.offense_options.match(/.{1,5}/g).filter(isNotHeroHash);
        MASSS.curr_fixed = MASSS.offense_fixed.match(/.{1,5}/g).filter(isNotHeroHash);
    };

    MASSS.run_sims = function (offense_fixed, offense_options = "", defenses = [""]) {
        MASSS.organize_input(offense_fixed, offense_options, defenses);
        console.log(MASSS);
    }

})();;


MASSS.run_sims("AMJCFgGgDF", "AIOBAAMJCFgGgDFIiVFFw2JyCgTxnCIgDEFYLtTBQqaFFYLtTBwH0DFQLLBFwZhhCwwsEFYLvlCAS~FF");