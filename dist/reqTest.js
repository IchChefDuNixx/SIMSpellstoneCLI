MASSS = {};
MASSS.hero_hashes = new Set(["gmQAA", "4!fAA", "QXvAA", "Yf0AA", "gn5AA", "ov!AA", "w3DBA", "4~IBA", "AIOBA", "IQTBA", "QYYBA", "YgdBA", "goiBA"]); // maxed legendary obtainable
// maxed obtainable minus lev with most leg/+10 rune variations
MASSS.mythic_hashes = new Set(["wZhhC", "9ZhhC", "6ahhC", "4hmhC", "FimhC", "aimhC", "3imhC", "AqrhC", "NqrhC", "1qrhC", "oUXjC", "1UXjC", "jXXjC", "hcXjC", "AxKmC", "NxKmC", "oyKmC", "gTxnC", "tTxnC", "bbxnC", "gb5sC", "tb5sC", "Xe5sC", "Xj5sC"]);

const sim_options = {
    "offense_fixed": "offense_fixed",
    "offense_options": "offense_options",
    "defenses": "defenses",
    "bges": "bges",
    "use_tower": true,
    "numSims": 10,
    "numDeckSamples": 1000,
    "cross_sim": true
};

const MASSS = Object.assign(MASSS, sim_options);
console.log(merged);
