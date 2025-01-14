const data = require("C:\\Users\\Felix\\Desktop\\SIMSpellstoneCLI\\dist\\data.min.js");
Object.keys(data).forEach(key => {
	eval(`global.${key} = data.${key}`);
    // console.log(key);
});
var echo = "";

// Convert skills to 1.0 version
for (var skillID in SKILL_DATA) {
	var skillInfo = SKILL_DATA[skillID];
	if (skillID === 'flurry') {
		skillInfo.type = 'flurry';
	} else if (['turnStart', 'onAttack', 'onDamaged', 'turnEnd'].indexOf(skillInfo.type) >= 0) {
		skillInfo.type = 'passive';
	}
}
// Create REVERSE_FUSIONS
var REVERSE_FUSIONS = {};
for (var id in FUSIONS) {
	var fusion = FUSIONS[id];
	REVERSE_FUSIONS[fusion] = id;
}; "use strict";

if (typeof String.prototype.format !== 'function') {
	String.prototype.format = function () {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] !== 'undefined' ?
				args[number] :
				match;
		});
	};
}

if (typeof Object.assign !== 'function') {
	Object.assign = function (target) {
		'use strict';
		if (target == null) {
			throw new TypeError('Cannot convert undefined or null to object');
		}

		target = Object(target);
		for (var index = 1; index < arguments.length; index++) {
			var source = arguments[index];
			if (source != null) {
				for (var key in source) {
					if (Object.prototype.hasOwnProperty.call(source, key)) {
						target[key] = source[key];
					}
				}
			}
		}
		return target;
	};
}

function parseInt(value) {
	return value >> 0;
}


/* Inspired by https://davidwalsh.name/javascript-debounce-function */
Function.prototype.debounce = function (wait) {
	var func = this;
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			func.apply(context, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};
Function.prototype.throttle = (function () {
	return function (wait) {
		var func = this;
		var timeout;
		var fired = false;
		return function () {
			var context = this,
				args = arguments;
			if (timeout) {
				fired = false;
			} else {
				func.apply(context, args);
				fired = true;
				var later = function () {
					timeout = null;
					func.apply(context, args);
				};
				timeout = setTimeout(later, wait);
			}
		};
	};
}());

var matchTimer = {
	// Time elapsed
	elapsed: function elapsed() {
		var end = (this.timeStop || Date.now());
		return this.elapsedSeconds(this.timeStart, end);
	},
	timeSince: function timeSince(start) {
		return this.elapsedSeconds(start, Date.now());
	},
	elapsedSeconds: function elapsedSeconds(start, end) {
		return ((end - start) / 1000).toFixed(3);
	},
	batchElapsed: function batchElapsed(start) {
		return this.timeSince(start || this.batchStarted);
	},
	startBatch: function startBatch() {
		this.batchStarted = Date.now();
	},
	stop: function stopTimer() {
		this.timeStop = Date.now();
	},
	reset: function resetTimer() {
		this.timeStart = Date.now();
		this.timeStop = 0;
	}
};

function shuffle(list) {
	var i = list.length,
		j, tempi, tempj;
	if (i == 0) return false;
	while (--i) {
		j = ~~(Math.random() * (i + 1));
		tempi = list[i];
		tempj = list[j];
		list[i] = tempj;
		list[j] = tempi;
	}
}

function initializeCard(card, p, newKey) {
	card.owner = p;
	card.timer = card.cost;
	// Setup status effects
	applyDefaultStatuses(card);
	card.health_left = card.health;
	card.key = newKey;
	if (!card.reusableSkills) card.resetTimers();
}

function copy_deck(original_deck) {
	var new_deck = {};
	new_deck.commander = original_deck.commander;
	new_deck.deck = copy_card_list(original_deck.deck);
	return new_deck;
}

function getDeckCards(original_deck, owner) {
	var new_deck = {};
	new_deck.commander = getCardByID(original_deck.commander);
	new_deck.deck = [];
	var list = original_deck.deck;
	var battlegrounds = SIMULATOR.battlegrounds.onCreate.filter(function (bge) {
		return !((owner === 'player' && bge.enemy_only) || (owner === 'cpu' && bge.ally_only));
	});
	for (var i = 0, len = list.length; i < len; i++) {
		new_deck.deck.push(get_card_apply_battlegrounds(list[i], battlegrounds));
	}
	return new_deck;
}

function copy_card_list(original_card_list) {
	var new_card_list = [];
	for (var key = 0, len = original_card_list.length; key < len; key++) {
		new_card_list[key] = original_card_list[key];
	}
	return new_card_list;
}

var defaultStatusValues = {
	// Attack Modifiers
	attack_berserk: 0,
	attack_valor: 0,
	attack_rally: 0,
	attack_weaken: 0,
	attack_corroded: 0,
	corrosion_timer: 0,
	// Mark
	mark_target: 0,
	// Other Statuses
	// Numeric-Statuses
	attackIncreasePrevention: 0,
	barrier_ice: 0,
	corroded: 0,
	enfeebled: 0,
	enraged: 0,
	envenomed: 0,
	heartseeker: 0,
	imbued: 0,
	invigorated: 0,
	invisible: 0,
	nullified: 0,
	poisoned: 0,
	protected: 0,
	scorched: 0,
	warded: 0,
	// Boolean-Status
	confused: false,
	jammed: false,
	jammedSelf: false,
	silenced: false,
	bash_triggered: false,
	dualstrike_triggered: false,
	ondeath_triggered: false,
	reanimated: false
};

function applyDefaultStatuses(card) {
	// reset invigorate
	card.health -= card.invigorated;
	card.removeImbue();
	card.enhanced = {};
	for (var status in defaultStatusValues) {
		card[status] = defaultStatusValues[status];
	}
}

var CardPrototype;
var makeUnit = (function () {
	function modifySkillsPreRune(new_card, original_skills, skillModifiers, isToken) {
		new_card.highlighted = [];
		for (var i = 0; i < skillModifiers.length; i++) {
			var skillModifier = skillModifiers[i];
			if (skillModifier.modifierType === "statChange" && !isToken) {
				for (var j = 0; j < skillModifier.effects.length; j++) {
					var statChange = skillModifier.effects[j];
					if (new_card.isInFaction(statChange.y) && new_card.isTargetRarity(statChange.rarity) && new_card.isTargetDelay(statChange.delay)) {
						Object.keys(statChange).forEach(function (stat) {
							new_card[stat] = statChange[stat];
						});
					}
				}
			}
		}
	}

	function modifySkillsPostRune(new_card, original_skills, skillModifiers, isToken) {
		new_card.highlighted = [];
		for (var i = 0; i < skillModifiers.length; i++) {
			var skillModifier = skillModifiers[i];
			if (skillModifier.modifierType === "evolve_skill") {
				for (var j = 0; j < skillModifier.effects.length; j++) {
					var evolution = skillModifier.effects[j];
					for (var key in original_skills) {
						var skill = original_skills[key];
						if (skill.id === evolution.id && skill.all == evolution.all && new_card.isTargetRarity(evolution.rarity) && new_card.isTargetDelay(evolution.delay)) {
							skill = copy_skill(skill);
							skill.id = evolution.s;
							skill.boosted = true;
							original_skills[key] = skill;
							new_card.highlighted.push(skill.id);
						}
					}
				}
			} else if (skillModifier.modifierType === "add_skill") {
				for (var j = 0; j < skillModifier.effects.length; j++) {
					var addedSkill = skillModifier.effects[j];
					if (new_card.isInFaction(addedSkill.y) && new_card.isTargetRarity(addedSkill.rarity) && new_card.isTargetDelay(addedSkill.delay)) {
						var new_skill = {};
						new_skill.id = addedSkill.id;
						new_skill.x = addedSkill.x || 0;
						if (addedSkill.mult) {
							if (addedSkill.base) {
								var base = getStatBeforeRunes(new_card, addedSkill.base);
								new_skill.x += Math.ceil(addedSkill.mult * base);
							} else {
								new_skill.mult = addedSkill.mult;
							}
						}
						new_skill.z = addedSkill.z;
						new_skill.c = addedSkill.c;
						new_skill.s = addedSkill.s;
						new_skill.all = addedSkill.all;
						if (addedSkill.card) new_skill.card = addedSkill.card;
						if (addedSkill.level) new_skill.level = addedSkill.level;
						new_skill.boosted = true;
						if (addedSkill.mult && addedSkill.base && new_skill.x == 0) continue;
						original_skills.push(new_skill);
						new_card.highlighted.push(new_skill.id);
					}
				}
			} else if (skillModifier.modifierType === "scale_attributes" && !isToken) {
				for (var j = 0; j < skillModifier.effects.length; j++) {
					var scaling = skillModifier.effects[j];
					if (new_card.isInFaction(scaling.y) && new_card.isTargetRarity(scaling.rarity) && new_card.isTargetDelay(scaling.delay)) {
						var mult = scaling.mult;
						var plusAttack = Math.ceil(new_card.attack * mult);
						new_card.attack += plusAttack;
						new_card.highlighted.push('attack');
						var plusHealth = Math.ceil(new_card.health * mult);
						new_card.health += plusHealth;
						new_card.highlighted.push('health');
						scaleSkills(new_card, original_skills, mult);
					}
				}
			} else if (skillModifier.modifierType === "scale_stat" && !isToken) {
				for (var j = 0; j < skillModifier.effects.length; j++) {
					var scaling = skillModifier.effects[j];
					if (new_card.isInFaction(scaling.y) && new_card.isTargetRarity(scaling.rarity && new_card.isTargetDelay(scaling.delay))) {
						new_card[skillModifier.scaledStat] += Math.ceil(getStatBeforeRunes(new_card, scaling.base) * scaling.mult);
						new_card.highlighted.push(skillModifier.scaledStat);
					}
				}
			}
		}
	}

	function getStatBeforeRunes(card, statBase) {
		return getCardByID({ id: card.id, level: card.level })[statBase];
	}

	function scaleSkills(new_card, skillList, mult) {
		for (var key in skillList) {
			var skill = skillList[key];
			if (skill.x) {
				skill = copy_skill(skill);
				skill.x += Math.ceil(skill.x * mult);
				skill.boosted = true;
				skillList[key] = skill;
				new_card.highlighted.push(skill.id);
			}
		}
	}

	CardPrototype = {
		p: null,
		health_left: 0,
		timer: 0,
		key: undefined,

		//Card ID is ...
		isCommander: function () {
			return (this.card_type == "1");
		},

		isAssault: function () {
			return (this.card_type == "2");
		},

		isTower: function () {
			return false;
		},

		isTrap: function () {
			return (this.card_type == "3");
		},

		// Alive
		// -.health_left > 0
		isAlive: function () {
			return (this.health_left > 0);
		},

		// Alive
		// -.health_left > 0
		isDamaged: function () {
			return (this.health_left < this.health);
		},

		// Active
		// - timer = 0
		isActive: function () {
			return (this.timer == 0);
		},

		// Active Next Turn
		// - timer <=1
		isActiveNextTurn: function () {
			return (this.timer <= 1);
		},

		// Inactive
		// - timer >=1
		isInactive: function () {
			return this.timer >= 1;
		},

		// Unjammed
		isUnjammed: function () {
			return !(this.jammed);
		},

		// Unsilenced
		isUnsilenced: function () {
			return !(this.silenced);
		},

		imbue: function (skill) {
			if (!this.imbued) {
				this.imbued = {};
			}
			var imbued = this.imbued;

			var imbueSkillsKey;
			var skillID = skill.id;
			var skillType = SKILL_DATA[skillID].type;
			switch (skillType) {
				case 'toggle':
					this[skillID] = true;
					this.imbued[skillID] = 1;
					return;

				case 'passive':
					this[skillID] += parseInt(skill.x);
					this.imbued[skillID] = (this.imbued[skillID] || 0) + skill.x;
					return;

				case 'flurry':
					if (!this.flurry) {
						this.flurry = skill;
						this.flurry.countdown = 0;
						this.imbued.flurry = true;
					}
					return;

				case 'onDeath':
					imbueSkillsKey = 'onDeathSkills';
					break;

				case 'earlyActivation':
					imbueSkillsKey = 'earlyActivationSkills';
					break;

				case 'activation':
				default:
					imbueSkillsKey = 'skill';
					break;
			}

			// Mark the first added skill index
			if (imbued[imbueSkillsKey] === undefined) {
				var original = this[imbueSkillsKey];
				imbued[imbueSkillsKey] = original.length;
				this[imbueSkillsKey] = original.slice();
			}
			this[imbueSkillsKey].push(skill);
		},

		scorch: function (amount) {
			var scorched = this.scorched;
			if (!scorched) {
				this.scorched = {
					amount: amount,
					timer: 2
				};
			} else {
				scorched.amount += amount;
				scorched.timer = 2;
			}
		},

		removeImbue: function () {
			var imbue = this.imbued;
			if (imbue) {
				for (var key in imbue) {
					var imbuement = imbue[key];
					if (key === "skill" || key === "earlyActivationSkills" || key === "onDeathSkills") {
						this[key] = this[key].slice(0, imbuement);
					} else {
						this[key] -= imbuement;
					}
				}
				this.imbued = 0;
			}
		},

		// Has at least one Enhanceable Activation Skill
		// - strike, protect, enfeeble, rally, repair, supply, siege, heal, weaken (unless they have on play/death/attacked/kill)
		hasSkill: function (s, all) {
			var target_skills;
			var skillType = SKILL_DATA[s].type;
			switch (skillType) {
				case 'toggle':
				case 'passive':
				case 'flurry':
					return this[s];
					break;

				case 'onDeath':
					target_skills = this.onDeathSkills;
					break;

				case 'earlyActivation':
					target_skills = this.earlyActivationSkills;
					break;

				case 'activation':
				default:
					target_skills = this.skill;
					break;
			}
			for (var key in target_skills) {
				var skill = target_skills[key];
				if (skill.id !== s) continue;
				if (typeof all !== "undefined" && (skill.all || 0) != all) continue;
				return true;
			}
			return false;
		},

		// Has Attack power
		// - attack > 0
		hasAttack: function () {
			return (this.adjustedAttack() > 0);
		},

		attackPlusBuffs: function () {
			return (this.attack + this.attack_rally + this.attack_berserk + this.attack_valor);
		},

		adjustedAttack: function () {
			return (this.attack + this.attack_rally + this.attack_berserk + this.attack_valor - this.attack_weaken - this.attack_corroded);
		},

		permanentAttack: function () {
			return (this.attack + this.attack_berserk + this.attack_valor);
		},

		hasNegativeStatus: function () {
			// Poison, Hex, Burn, Freeze, Venom, Weaken, Silence and Confuse
			return this.poisoned ||
				this.enfeebled ||
				this.scorched ||
				this.jammed ||
				this.envenomed ||
				this.attack_weaken ||
				this.silenced ||
				this.confused;
		},

		// Filters by faction
		isInFaction: function (faction) {
			if (faction === undefined) return 1;
			var factions = faction.split(',');
			if (factions.length <= 1) {
				if (this.type == faction) return 1;
				if (this.sub_type.indexOf(faction.toString()) >= 0) return 1;
				return 0;
			} else {
				for (var i = 0; i < factions.length; i++) {
					if (!this.isInFaction(factions[i])) {
						return 0;
					}
				}
				return 1;
			}
		},

		isTargetRarity: function (rarity) {
			return (rarity === undefined ? true : this.rarity === Number(rarity));
		},

		isTargetDelay: function (delay) {
			return (delay === undefined ? true : delay.indexOf(this.cost) >= 0);
		},

		resetTimers: function () {
			for (var i = 0, len = this.skillTimers.length; i < len; i++) {
				this.skillTimers[i].countdown = 0;
			}
		},

		addRunes: function (runes) {
			addRunes(this, runes);
		}
	};
	for (var id in SKILL_DATA) {
		var type = SKILL_DATA[id].type;
		if (type === "passive") {
			CardPrototype[id] = 0;
		} else if (type === "toggle") {
			CardPrototype[id] = false;
		}
	}
	applyDefaultStatuses(CardPrototype);

	return (function (original_card, unit_level, runes, skillModifiers, skillMult, isToken) {
		if (!unit_level) unit_level = 1;
		var card = Object.create(CardPrototype);

		card.id = original_card.id;
		card.name = original_card.name;
		card.attack = original_card.attack;
		card.health = original_card.health;
		card.maxLevel = original_card.maxLevel;
		card.level = ((unit_level > card.maxLevel) ? card.maxLevel : unit_level);
		card.cost = original_card.cost || 0;
		card.rarity = original_card.rarity;
		card.card_type = original_card.card_type;
		card.type = original_card.type;
		card.sub_type = original_card.sub_type || [];
		card.set = original_card.set;
		var original_skills = original_card.skill;
		if (card.level > 1) {
			var upgrade;
			for (var key in original_card.upgrades) {
				upgrade = original_card.upgrades[key];
				// Upgrade levels only contain attack/health/delay if they changed at that level.
				if (upgrade.cost !== undefined) card.cost = upgrade.cost;
				if (upgrade.health !== undefined) card.health = upgrade.health;
				if (upgrade.attack !== undefined) card.attack = upgrade.attack;
				if (upgrade.desc !== undefined) card.desc = upgrade.desc;
				if (upgrade.skill.length > 0) original_skills = upgrade.skill;
				if (key == card.level) break;
			}
		}

		card.base_health = card.health;

		original_skills = original_skills.slice();

		if (skillModifiers && skillModifiers.length) {
			modifySkillsPreRune(card, original_skills, skillModifiers, isToken);
		}

		if (runes) {
			card.addRunes(runes);
			var runeMult = 1;
			if (skillModifiers) {
				skillModifiers.forEach(function (skillModifier) {
					if (skillModifier.modifierType === "runeMultiplier") {
						skillModifier.effects.forEach(function (effect) {
							if (card.isInFaction(effect.y)) {
								runeMult = parseInt(effect.mult);
							}
						});
					}
				});
			}
			addRunesToSkills(original_skills, runes, runeMult);
		} else {
			card.runes = [];
		}

		// Apply BGEs
		if (skillModifiers && skillModifiers.length) {
			modifySkillsPostRune(card, original_skills, skillModifiers, isToken);
		}

		if (skillMult) {
			scaleSkills(card, original_skills, skillMult);
		}

		copySkills(card, original_skills);

		return card;
	});
}());


var getEnhancement = function (card, s, base) {
	var enhancements = card.enhanced;
	var e = { x: 0, mult: 0 }; // Default value
	var enhanced = (enhancements ? (enhancements[s] || e) : e);
	enhanced = Math.ceil(base * enhanced.mult) + enhanced.x;
	return enhanced;
};

var adjustAttackIncrease = function (card, originalIncrease) {
	if (card.attackIncreasePrevention) {
		var adjustment = Math.min(card.attackIncreasePrevention, originalIncrease);
		card.attackIncreasePrevention -= adjustment;
		if (SIMULATOR.config.debug) { echo += '<u>(' + adjustment + ' attack increase prevented by weaken, ' + card.attackIncreasePrevention + ' prevention remains)</u><br/>' }
		return originalIncrease - adjustment;
	} else {
		return originalIncrease;
	}
}

var getSkillMult = function (skill, target, defaultBase) {
	var mult = skill.mult;
	if (mult) {
		var base = skill.base || defaultBase || 'health';
		return Math.ceil(mult * target[base]);
	} else {
		return 0;
	}
};

var isImbued = function (card, skillID, i) {
	var imbueSkillsKey;
	var skillType = SKILL_DATA[skillID].type;
	switch (skillType) {
		case 'flurry':
		case 'toggle':
			return card.imbued[skillID];

		case 'passive':
			return (card[skillID] === card.imbued[skillID]);

		case 'onDeath':
			imbueSkillsKey = 'onDeathSkills';
			break;

		case 'earlyActivation':
			imbueSkillsKey = 'earlyActivationSkills';
			break;

		case 'activation':
		default:
			imbueSkillsKey = 'skill';
			break;
	}


	// Mark the first added skill index
	if (card.imbued[imbueSkillsKey] !== undefined) {
		return (i >= card.imbued[imbueSkillsKey]);
	} else {
		return false;
	}
};

var addRunes = function (card, runes) {
	if (!card.runes) card.runes = [];
	for (var i = 0, len = runes.length; i < len; i++) {
		var runeID = runes[i].id;
		var statBoost = getRune(runeID).stat_boost;
		card.runes.push({
			id: runeID,
			stat_boost: statBoost
		});

		for (var key in statBoost) {
			var boost = statBoost[key];
			if (key == "skill") {
				// Will be handled later
			} else {
				if (isNaN(boost)) {
					boost = Math.max(Math.ceil(card[key] * boost.mult), (boost.min_bonus || 1));
				}
				card[key] += parseInt(boost);
			}
		}
	}
};

function addRunesToSkills(skills, runes, runeMult) {
	if (!runes) return;
	for (var i = 0, len = runes.length; i < len; i++) {
		var runeID = runes[i].id;
		var statBoost = getRune(runeID).stat_boost;
		for (var key in statBoost) {
			var boost = statBoost[key];
			if (key == "skill") {
				var skillID = boost.id;
				var amount = boost.x;
				var mult = boost.mult;
				for (var s = 0; s < skills.length; s++) {
					var skill = skills[s];
					if (skill.id == skillID && (skill.all || 0) == (boost.all || 0)) {
						skill = copy_skill(skill);
						if (!amount && mult) amount = Math.ceil(skill.x * mult);
						if (boost.min_bonus) amount = Math.max(amount, boost.min_bonus);
						if (amount) skill.x += (parseInt(amount) * runeMult);
						if (boost.c) skill.c -= Math.min(skill.c, (parseInt(boost.c) * runeMult));
						skill.boosted = true;
						skills[s] = skill;
						break;
					}
				}
			}
		}
	}
}

var getRune = function (rune_id) {
	return RUNES[rune_id] || { stat_boost: {} };
};

var canUseRune = function (card, runeID) {
	var rune = getRune(runeID);

	var statBoost = rune.stat_boost;
	if (rune.faction_req) {
		if (!card.isInFaction(rune.faction_req)) {
			return false;
		}
	}
	for (var key in statBoost) {
		if (key == "skill") {
			var skill = statBoost[key];
			var all = (skill.all ? 1 : 0);
			if (!card.hasSkill(skill.id, all)) return false;
		}
	}
	return true;
};

function MakeSkillModifier(name, effect) {
	return {
		name: name,
		modifierType: effect.effect_type,
		effects: [effect]
	};
}

function MakeStatScalar(name, effect) {
	return {
		name: name,
		modifierType: "scale_stat",
		scaledStat: effect.effect_type.replace("scale_", ""),
		effects: [effect]
	};
}

var MakeOnPlayBGE = (function () {
	var OnPlayBGE = function (name, effect) {
		this.p = null;
		this.name = name;
		this.effect = effect;
		this.runes = [];
	};

	OnPlayBGE.prototype = {
		onCardPlayed: function (card) {
			SIMULATOR.onPlaySkills[this.effect.id](this, card, this.effect);
		},

		//Card ID is ...
		isCommander: function () {
			return false;
		},

		isAssault: function () {
			return false;
		}

	};

	return (function (name, effects) {
		return new OnPlayBGE(name, effects);
	});
}());

var MakeTrap = (function () {
	var Trap = function (name, trap_card) {
		this.name = name;
		this.id = trap_card.id;
		this.base = trap_card.base;
		this.mult = trap_card.mult;
		this.target_deck = trap_card.target_deck;
		this.y = trap_card.y;
	};

	Trap.prototype = {
		onCardPlayed: function (card, p_deck, o_deck) {
			var deck = (this.target_deck === "opponent" ? o_deck : p_deck);
			if (card.isInFaction(this.y)) {

				var targets = [];
				for (var t = 0; t < deck.length; t++) {
					var card = deck[t];
					if (!card.trap) {
						targets.push(card);
					}
				}

				if (targets.length) {
					// Create a trap card
					var trapLevel = Math.ceil(card[this.base] * this.mult);
					var trapInfo = makeUnitInfo(this.id, trapLevel);
					var trap = getCardByID(trapInfo);

					// Shuffle the trap into opponent's deck
					var index = (~~(Math.random() * targets.length));
					targets[index].trap = trap;

					if (SIMULATOR.config.debug) {
						echo += this.name + ' inserts ' + debug_name(trap) + ' into the opposing deck.<br/>';
					}
				}
			}
		}
	};

	return (function (name, effects) {
		return new Trap(name, effects);
	});
}());

var getBattlegrounds = function (simConfig) {

	// Set up battleground effects, if any
	var battlegrounds = {
		onCreate: [],
		onTurn: [],
		onCardPlayed: []
	};
	addBgesFromList(battlegrounds, simConfig.getbattleground);
	addBgesFromList(battlegrounds, simConfig.selfbges, 'player');
	addBgesFromList(battlegrounds, simConfig.enemybges, 'cpu');
	addMapBGEs(battlegrounds, simConfig.mapbges, 'player');

	if (simConfig.campaignID) {
		addMissionBGE(battlegrounds, simConfig.campaignID, simConfig.missionLevel);
	} else if (simConfig.raidID) {
		addRaidBGE(battlegrounds, simConfig.raidID, simConfig.raidLevel);
	}
	return battlegrounds;
};

function addBgesFromList(battlegrounds, battlegroundsToAdd, player) {
	if (!battlegroundsToAdd) return null;
	var selected = battlegroundsToAdd.split(",");
	for (var i = 0; i < selected.length; i++) {
		var id = selected[i];
		var battleground = BATTLEGROUNDS[id];
		addBgeFromList(battlegrounds, battleground, player);
	}
}

function addMissionBGE(battlegrounds, campaignID, missionLevel) {
	var campaign = CAMPAIGNS[campaignID];
	if (campaign) {
		var id = campaign.battleground_id;
		if (id) {
			var battleground = BATTLEGROUNDS[id];
			missionLevel = Number(missionLevel) - 1; // Convert to 0-based
			if (!battleground.starting_level || Number(battleground.starting_level) <= missionLevel) {
				if (battleground.scale_with_level) {
					battleground = JSON.parse(JSON.stringify(battleground));
					var levelsToScale = missionLevel - Number(battleground.starting_level);
					for (var i = 0; i < battleground.effect.length; i++) {
						var effect = battleground.effect[i];
						effect.mult = effect.base_mult + effect.mult * levelsToScale;
					}
				}
				addBgeFromList(battlegrounds, battleground, 'cpu');
			}
		}
	}
}

function addRaidBGE(battlegrounds, raidID, raidLevel) {
	var bge_id = RAIDS[raidID].bge;
	if (bge_id) {
		var battleground = BATTLEGROUNDS[bge_id];
		if (battleground && Number(raidLevel) >= Number(battleground.starting_level)) {
			var enemy_only = battleground.enemy_only;

			for (var j = 0; j < battleground.effect.length; j++) {
				var effect = battleground.effect[j];
				var effect_type = effect.effect_type;
				if (effect_type === "skill") {
					if (battleground.scale_with_level) {
						var mult = battleground.scale_with_level * (raidLevel - battleground.starting_level + 1);
					} else {
						var mult = 1;
					}
					var bge = MakeBattleground(battleground.name, effect, mult);
					bge.enemy_only = enemy_only;
					battlegrounds.onTurn.push(bge);
				} else if (["evolve_skill", "add_skill", "scale_attributes", "statChange", "runeMultiplier"].indexOf(effect_Type) >= 0) {
					var bge = MakeSkillModifier(battleground.name, effect);
					bge.enemy_only = enemy_only;
					battlegrounds.onCreate.push(bge);
				} else if (["scale_attack", "scale_health"].indexOf(effect_Type) >= 0) {
					var bge = MakeStatScalar(battleground.name, effect);
					bge.enemy_only = enemy_only;
					battlegrounds.onCreate.push(bge);
				} else if (effect_type === "trap_card") {
					var bge = MakeTrap(battleground.name, effect);
					bge.enemy_only = enemy_only;
					battlegrounds.onCardPlayed.push(bge);
				}
			}
		}
	}
}

function addMapBGEs(battlegrounds, mapbges, player) {
	if (!mapbges) return null;
	var selected = mapbges.split(",");
	for (var i = 0; i < selected.length; i++) {
		var parts = selected[i].split("-");
		var location = parts[0];
		var index = parts[1];
		var value = parts[2];
		var mapBGE = Object.keys(MAP_BATTLEGROUNDS).filter(function (id) {
			return MAP_BATTLEGROUNDS[id].location_id == location;
		})[0];
		mapBGE = MAP_BATTLEGROUNDS[mapBGE];
		var battleground = mapBGE.effects[index].upgrades[value];
		addBgeFromList(battlegrounds, battleground, player);
	}
}

function addBgeFromList(battlegrounds, battleground, player) {
	for (var j = 0; j < battleground.effect.length; j++) {
		var effect = battleground.effect[j];
		var effect_type = effect.effect_type;
		if (effect_type === "skill") {
			var bge = MakeBattleground(battleground.name, effect);
			if (player === 'player') bge.ally_only = true;
			if (player === 'cpu') bge.enemy_only = true;
			battlegrounds.onTurn.push(bge);
		} else if (["evolve_skill", "add_skill", "scale_attributes", "statChange", "runeMultiplier"].indexOf(effect_type) >= 0) {
			var bge = MakeSkillModifier(battleground.name, effect);
			if (player === 'player') bge.ally_only = true;
			if (player === 'cpu') bge.enemy_only = true;
			battlegrounds.onCreate.push(bge);
		} else if (["scale_attack", "scale_health"].indexOf(effect_type) >= 0) {
			var bge = MakeStatScalar(battleground.name, effect);
			if (player === 'player') bge.ally_only = true;
			if (player === 'cpu') bge.enemy_only = true;
			battlegrounds.onCreate.push(bge);
		} else if (effect_type === "trap_card") {
			var bge = MakeTrap(battleground.name, effect);
			if (player === 'player') bge.ally_only = true;
			if (player === 'cpu') bge.enemy_only = true;
			battlegrounds.onCardPlayed.push(bge);
		} else if (effect_type === "on_play") {
			var bge = MakeOnPlayBGE(battleground.name, effect.effect);
			bge.attacker = effect.attacker;
			bge.defender = effect.defender;
			bge.first_play = effect.first_play;
			if (player === 'player') bge.ally_only = true;
			if (player === 'cpu') bge.enemy_only = true;
			battlegrounds.onCardPlayed.push(bge);
		}
	}
}

var MakeBattleground = (function () {
	var Battleground = function (name, original_skills, mult) {
		this.name = name;
		copySkills(this, [original_skills], mult);
	};

	Battleground.prototype = {
		p: null,
		name: null,
		runes: [],

		//Card ID is ...
		isCommander: function () {
			return false;
		},

		isAssault: function () {
			return false;
		},

		resetTimers: function () {
			for (var i = 0, len = this.skillTimers.length; i < len; i++) {
				this.skillTimers[i].countdown = 0;
			}
		}
	};

	return (function (name, skill, mult) {
		return new Battleground(name, skill, mult);
	});
}());

function copySkills(new_card, original_skills, mult) {
	new_card.skill = [];
	new_card.earlyActivationSkills = [];
	new_card.onDeathSkills = [];
	var skillTimers = [];
	var reusable = true;
	for (var key in original_skills) {
		var newSkill = original_skills[key];
		var copySkill = copy_skill(newSkill);
		if (newSkill.c) {
			setSkill(new_card, copySkill);
			skillTimers.push(copySkill);
			reusable = false;
		} else if (mult) {
			copySkill.x = Math.ceil(copySkill.x * mult);
			setSkill(new_card, copySkill);
		} else { // If skill has no timer, we can use the same instance
			setSkill(new_card, copySkill);
		}
	}
	new_card.reusableSkills = reusable;
	new_card.skillTimers = skillTimers;
}

function setSkill(new_card, skill) {
	// These skills could have multiple instances
	var skillID = skill.id;
	var skillType = SKILL_DATA[skillID].type;
	switch (skillType) {
		case 'toggle':
			new_card[skillID] = true;
			return;

		case 'passive':
			new_card[skill.id] = (new_card[skill.id] | 0) + skill.x;
			break;

		case 'flurry':
			new_card[skill.id] = skill;
			break;

		case 'onDeath':
			new_card.onDeathSkills.push(skill);
			break;

		case 'earlyActivation':
			new_card.earlyActivationSkills.push(skill);
			break;

		case 'activation':
		default:
			new_card.skill.push(skill);
			break;
	}
}

function copy_skill(original_skill) {
	var new_skill = {};
	new_skill.id = original_skill.id;
	new_skill.x = original_skill.x || 0;
	new_skill.mult = original_skill.mult;
	new_skill.on_delay_mult = original_skill.on_delay_mult;
	new_skill.all = original_skill.all;
	new_skill.y = original_skill.y;
	new_skill.z = original_skill.z;
	new_skill.c = original_skill.c;
	new_skill.s = original_skill.s;
	new_skill.ignore_nullify = original_skill.ignore_nullify;
	new_skill.card = original_skill.card;
	new_skill.level = original_skill.level;
	return new_skill;
}

//Debug functions

// Output formatted name of card
function debug_name(card, hideStats) {
	if (card.owner == 'cpu') {
		var tag = 'i';
	} else {
		var tag = 'b';
	}
	var output = '<' + tag + '>';
	output += card.name;
	if (card.runes.length) output += "*";
	if (card.maxLevel > 1) output += '{' + card.level + '/' + card.maxLevel + '}';
	if (card.key !== undefined) output += ' (' + card.key + ')';
	output += '</' + tag + '>';
	if (!hideStats) {
		output += '<u>';
		if (card.isCommander()) {
			output += ' [';
			if (card.health_left !== undefined) output += card.health_left;
			else output += card.health;
			output += ' HP]';
		} else if (card.isAssault()) {
			output += ' [';
			var atk = card.adjustedAttack();
			if (isNaN(atk) || atk == undefined) atk = card.attack;
			output += atk;
			output += '/';
			if (card.health_left !== undefined) output += card.health_left;
			else output += card.health;
			output += '/';
			if (card.timer !== undefined) output += card.timer;
			else output += card.cost;
			output += ']';
		}
		output += '</u>';
	}

	return output;
}

function debug_find_skill(target, s) {
	var skill;
	if (!target[s]) {
		skill = target.skill.concat(target.earlyActivationSkills);
		for (var i in skill) {
			if (skill[i].id == s) {
				skill = copy_skill(skill[i]);
				break
			}
		}
	} else {
		skill = { id: s, x: target[s] };
	}
	return debug_skill(target, skill);
}

function debug_skill(target, skill) {
	var output = convertName(skill.id);
	if (skill.all) output += ' all';
	if (skill.y) output += ' ' + factions.names[skill.y];
	if (skill.s) output += ' ' + convertName(skill.s);
	if (skill.c) output += ' every ' + skill.c + ' turns';
	else if (skill.x) output += ' ' + (skill.x + getEnhancement(target, skill.id, skill.x));
	return output;
}

function convertName(skillID) {
	var skillData = SKILL_DATA[skillID];
	return (skillData ? skillData.name : skillID);
}

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
}

// Used to determine how to hash runeIDs
var maxRuneID = 1000;

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
}

function base64_to_unitInfo(base64) {

	var dec = base64_to_decimal(base64);

	var runeID = dec % maxRuneID;
	dec = (dec - runeID) / maxRuneID;

	var level = dec % 7;
	dec = (dec - level++) / 7;
	var fusion = dec % 3;
	dec = (dec - fusion) / 3;
	var unitID = dec;

	if (noFusionInHash[unitID]) {
		level += fusion * 7;
	} else if (fusion > 0) {
		unitID = Number(fusion + '' + unitID);
	}

	var unit_info = makeUnitInfo(unitID, level);
	if (runeID > 0) {
		unit_info.runes.push({
			id: runeID + 5000
		});
	}

	return unit_info;
}

function decimal_to_base64(dec, len) {
	var base64 = '';
	//while (dec > 0) {
	for (var i = 0; i < len; i++) {
		var part = dec % 64;
		base64 += base64chars[part]; // + base64;
		dec = (dec - part) / 64;
	}
	return base64;
}

function base64_to_decimal(base64) {
	var dec = 0;
	var orig = dec;
	for (var i = base64.length - 1; i >= 0; i--) {
		dec *= 64;
		var part = base64chars.indexOf(base64[i]);
		dec += part;
	}
	return dec;
}

function runeID_to_decimal(runeID) {
	if (runeID == 0) return 0;
	runeID = parseInt(runeID) % 5000;
	var runeLevel = runeID % 10;
	var runeType = (runeID - runeLevel) / 10;
	runeID = (runeType * 5) + runeLevel - 1; // Make level 0-based
	runeID = (runeType * 5) + runeLevel - 1; // Make level 0-based
	return runeID;
}

function base64_to_runeID(base64) {
	var dec1 = base64chars.indexOf(base64[0]);
	var dec2 = base64chars.indexOf(base64[1]) * 64;
	var runeID = dec1 + dec2;
	return decimal_to_runeID(runeID);
}

function decimal_to_runeID(decimal) {
	var runeLevel = decimal % 5;
	var runeType = (decimal - runeLevel) / 5;
	if (runeType == 0) return 0;
	var runeID = (runeType * 10) + runeLevel + 5001; // Make level 0-based
	return runeID;
}

function numberToBase64(decimal) {
	var char1 = base64chars[Math.floor(decimal / 64)];
	var char2 = base64chars[decimal % 64];
	return char1 + char2;
}

function base64ToNumber(base64) {
	var dec1 = base64chars.indexOf(base64[0]) * 64;
	var dec2 = base64chars.indexOf(base64[1]);
	return dec1 + dec2;
}

//Returns hash built from deck array
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
}

function areEqual(unitInfo1, unitInfo2) {
	if ((!unitInfo1) != (!unitInfo2)) return false; // Silly null-check
	var hash1 = unitInfo_to_base64(unitInfo1);
	var hash2 = unitInfo_to_base64(unitInfo2);
	return (hash1 == hash2);
}

//Returns deck array built from hash
function hash_decode(hash) {

	var current_deck = { deck: [] };
	var unitInfo;
	var indexes;
	var entryLength = 5;
	if (hash.indexOf(indexDelimiter) > 0) {
		// Ignore indices for now
		indexes = hash.substr(hash.indexOf(indexDelimiter) + 1).match(/.{1,2}/g);
		hash = hash.substr(0, hash.indexOf(indexDelimiter));
	}
	var unitidx = 0;
	for (var i = 0; i < hash.length; i += entryLength) {
		// Make sure we have valid characters
		var unitHash = hash.substr(i, entryLength);
		unitInfo = base64_to_unitInfo(unitHash);
		if (unitidx > 0 && indexes) unitInfo.index = base64ToNumber(indexes[unitidx - 1]); // Skip commander

		if (unitInfo) {
			if (loadCard(unitInfo.id)) {
				// Repeat previous card multiple times
				if (!current_deck.commander && is_commander(unitInfo.id)) {
					current_deck.commander = unitInfo;
					unitidx++;
					// Add to deck
				} else {
					current_deck.deck.push(unitInfo);
					unitidx++;
				}
			} else {
				console.log("Could not decode '" + unitHash + "' (" + unitInfo.id + ")");
			}
		}
	}

	// Default commander to Elaria Captain if none found
	if (!current_deck.commander) {
		current_deck.commander = elariaCaptain;
	}

	return current_deck;
}


function createEmptyDeck() {
	return {
		deck: [],
		commander: elariaCaptain
	}
}

// Load mission deck
function load_deck_mission(id, level) {
	var missionInfo = MISSIONS[id];
	if (missionInfo) {
		return load_preset_deck(missionInfo, level, 6);
	} else {
		return 0;
	}
}

function load_deck_raid(id, level, maxedAt) {
	if (!maxedAt) maxedAt = 25;
	var raidInfo = RAIDS[id];
	if (raidInfo) {
		var newRaidInfo = {
			commander: raidInfo.commander,
			deck: raidInfo.deck.card
		};
		return load_preset_deck(newRaidInfo, level, Number(raidInfo.upgradeLevels));
	} else {
		return 0;
	}
}

var DoNotFuse = ["8005", "8006", "8007", "8008", "8009", "8010"];

function load_preset_deck(deckInfo, level, upgradeLevels) {

	var maxedAt = upgradeLevels + 1;
	if (!level) level = maxedAt;

	var current_deck = [];
	current_deck.deck = [];
	var commanderInfo = getPresetCommander(deckInfo, level);
	var commander = getPresetUnit(commanderInfo, level, maxedAt); // Set commander to max level
	if (commanderInfo.possibilities) {
		commander.randomInfo = { possibilities: commanderInfo.possibilities, level: level, maxedAt: maxedAt };
	}
	current_deck.commander = commander;
	var presetDeck = deckInfo.deck;

	var deck = current_deck.deck;
	for (var current_key in presetDeck) {
		var unitInfo = presetDeck[current_key];
		var unit = getPresetUnit(unitInfo, level, maxedAt);
		if (unit) {
			deck.push(unit);
		}
	}

	var maxUpgradePoints = getMaxUpgradePoints(deck);
	var upgradePoints = getUpgradePoints(level, maxedAt, maxUpgradePoints);
	if (level > 1 && level < maxedAt) {
		var canFuse = deck.slice();
		while (upgradePoints > 0 && canFuse.length > 0) {
			var index = Math.floor(Math.random() * canFuse.length);
			if (upgradeCard(canFuse[index])) {
				upgradePoints--;
			} else {
				canFuse.splice(index, 1);
			}
		}
	}

	return current_deck;
}

function update_preset_deck(deck) {

	var randomizationInfo = deck.commander.randomInfo;
	if (randomizationInfo) {
		var possibilities = randomizationInfo.possibilities;
		var newCommander = ~~(Math.random() * possibilities.length);
		var unit = getPresetUnit(possibilities[newCommander], randomizationInfo.level, randomizationInfo.maxedAt);
		unit.randomInfo = randomizationInfo;
		deck.commander = unit;
	}

	var cpu_cards = deck.deck;
	for (var i = 0, len = cpu_cards.length; i < len; i++) {
		var unit = cpu_cards[i];
		var randomizationInfo = unit.randomInfo;
		if (randomizationInfo) {
			unit = getPresetUnit(randomizationInfo.unitInfo, randomizationInfo.level, randomizationInfo.maxedAt);
			unit.randomInfo = randomizationInfo;
			cpu_cards[i] = unit;
		}
	}
	return getDeckCards(deck, 'cpu');
}

function getPresetCommander(deckInfo, level) {
	level = parseInt(level);
	var commander = deckInfo.commander;
	if (commander.card) {
		var possibilities = [];
		for (var i = 0; i < commander.card.length; i++) {
			var card = commander.card[i];
			var minLevel = parseInt(card.min_mastery_level) || 0;
			var maxedAt = parseInt(card.max_mastery_level) || 999;
			if (level >= minLevel && level <= maxedAt) {
				possibilities.push(card);
			}
		}
		var chosen = ~~(Math.random() * possibilities.length);
		commander = possibilities[chosen];
		commander.possibilities = possibilities;
	}
	return commander;
}

function getUpgradePoints(level, maxedAt, maxUpgradePoints) {
	var percentCompvare;
	if (maxedAt == 7) {
		percentCompvare = (level - 1) / (maxedAt - 1);
	} else {
		percentCompvare = (level / maxedAt);
	}
	var points = Math.ceil(maxUpgradePoints * percentCompvare);
	return points;
}

function getMaxUpgradePoints(deck) {
	var maxUpgradePoints = 0;
	for (var i = 0; i < deck.length; i++) {
		var unit = deck[i];
		var card = getCardByID(unit);
		var maxFusions = getMaxFusions(card);
		var maxLevel = card.maxLevel;
		maxUpgradePoints += ((maxFusions + 1) * maxLevel - 1);
	}
	return maxUpgradePoints;
}

function getMaxFusions(unit) {
	var id = baseFusion(unit);
	var fusion = -1;
	while (typeof id !== "undefined") {
		fusion++;
		id = FUSIONS[id];
	}
	return fusion;
}

function baseFusion(unit) {
	var baseID = unit.id;
	var id;
	do {
		id = baseID;
		baseID = REVERSE_FUSIONS[id];
	} while (typeof baseID !== "undefined");
	return id;
}

function getPresetUnit(unitInfo, level, maxedAt) {
	level = parseInt(level);
	if (unitInfo.mastery_level && level < parseInt(unitInfo.mastery_level)) return null;
	if (unitInfo.remove_mastery_level && level >= parseInt(unitInfo.remove_mastery_level)) return null;

	var cardID = unitInfo.id;
	var random = false;
	if (!cardID) {
		cardID = getRandomCard(unitInfo);
		random = true;
	}
	var unitLevel = (unitInfo.level || 1);

	if (level >= maxedAt) {
		unitLevel = CARDS[cardID].maxLevel;
		if (canFuse(cardID)) {
			cardID = fuseCard(cardID);
		}
	} else if (level > 1 && is_commander(cardID)) {
		var maxUpgrades = CARDS[cardID].maxLevel - 1;
		var upgradesPerLevel = maxUpgrades / (maxedAt - 1);
		var levelsFromBase = level - 1;
		unitLevel = Math.ceil(upgradesPerLevel * levelsFromBase);
	}

	var unit = makeUnitInfo(cardID, unitLevel);

	if (random) {
		unit.randomInfo = { unitInfo: unitInfo, level: level, maxedAt: maxedAt };
	}
	return unit;
}

function getRandomCard(unitInfo) {
	var possibilities = [];
	for (var id in CARDS) {
		if (REVERSE_FUSIONS[id]) continue;
		var card = CARDS[id];
		if (card.card_type == '1') {
			continue;
		}
		if (unitInfo.max_rarity && Number(unitInfo.max_rarity) < Number(card.rarity) ||
			unitInfo.min_rarity && Number(unitInfo.min_rarity) > Number(card.rarity)) {
			continue;
		}
		if (unitInfo.type && !(unitInfo.type == card.type || card.sub_type.indexOf(unitInfo.type.toString()) >= 0)) {
			continue;
		}
		if (unitInfo.set) {
			var sets = unitInfo.set.split(",");
			if (sets.indexOf(card.set) < 0) {
				continue;
			}
		}
		possibilities.push(id);
	}
	var chosen = ~~(Math.random() * possibilities.length);
	return possibilities[chosen];
}

function upgradeCard(unitInfo) {
	var maxLevel = CARDS[unitInfo.id].maxLevel;
	if (unitInfo.level === maxLevel) {
		if (canFuse(unitInfo.id)) {
			unitInfo.id = fuseCard(unitInfo.id, 1);
			unitInfo.level = 1;
		} else {
			return false;
		}
	} else {
		unitInfo.level++;
	}
	return true;
}

function canFuse(cardID) {
	if (DoNotFuse.indexOf(cardID) > -1) {
		return false;
	} else if (is_commander(cardID)) {
		return false;
	} else if (FUSIONS[cardID]) {
		return true;
	}
	return false;
}

function fuseCard(cardID, fusion) {
	if (DoNotFuse.indexOf(cardID) == -1) {
		// Fuse X number of times
		if (fusion) {
			for (var i = 0; i < fusion; i++) {
				cardID = doFuseCard(cardID);
			}
			// Max fusion
		} else {
			while (true) {
				var fused = doFuseCard(cardID);
				if (cardID === fused) {
					break;
				}
				cardID = fused;
			}
		}
	}
	return cardID;
}

function doFuseCard(cardID) {
	var fused = FUSIONS[cardID];
	if (fused) {
		return fused;
	} else {
		return cardID;
	}
}

var reverseFusions;

function getFusion(cardID) {
	var fusion = 0,
		base;

	if (!reverseFusions) getReverseFusions();

	do {
		base = reverseFusions[cardID];
		fusion++;
	} while (base);
	return fusion;
}

function getReverseFusions() {
	reverseFusions = {};
	for (var key in FUSIONS) {
		reverseFusions[FUSIONS[key]] = key;
	}
}

// Output card array
var get_card_apply_battlegrounds = function (id, battlegrounds, isToken) {
	battlegrounds = battlegrounds || SIMULATOR.battlegrounds.onCreate;
	return getCardByID(id, battlegrounds, null, isToken);
};

function get_skills(id, level) {
	var card = loadCard(id);
	var skills = card.skill;
	if (level > 1) {
		var upgrade;
		for (var key in card.upgrades) {
			upgrade = card.upgrades[key];
			if (upgrade.skill.length > 0) skills = upgrade.skill;
			if (key == level) break;
		}
	}
	return skills;
}

function getCardByID(unit, skillModifiers, skillMult, isToken) {

	var current_card = loadCard(unit.id);

	// Not a valid card
	if (!current_card) {
		console.log(unit.id + " not found");
		current_card = {};
		current_card.id = unit.id;
		current_card.level = unit.level;
		current_card.name = undefined;
		current_card.health = undefined;
		current_card.skill = [];
		return current_card;
	} else {
		// Add empty skill array to prevent skill condition-checking errors
		if (!current_card.skill) {
			current_card.skill = [];
		}
		var card = makeUnit(current_card, unit.level, unit.runes, skillModifiers, skillMult, isToken);

		if (unit.priority) card.priority = unit.priority;
		return card;
	}
}

function get_slim_card_by_id(unit, getDetails) {

	var current_card = loadCard(unit.id);
	var new_card = {};
	if (current_card.card_type == "1") {
		new_card.isCommander = function () { return true; };
		new_card.isAssault = function () { return false; };
	} else {
		new_card.isCommander = function () { return false; };
		new_card.isAssault = function () { return true; };
	}
	// Not a valid card
	if (!current_card) {
		new_card.id = undefined;
		new_card.name = undefined;
		new_card.card_type = undefined;
		new_card.set = undefined;
		new_card.type = undefined;
		new_card.sub_type = [];
		new_card.level = undefined;
		new_card.maxLevel = undefined;
		if (getSkills) new_card.skill = [];
	} else {
		new_card.id = current_card.id;
		new_card.name = current_card.name;
		new_card.rarity = current_card.rarity;
		new_card.maxLevel = current_card.maxLevel;
		if (unit.level) {
			new_card.level = unit.level;
			if (new_card.level > new_card.maxLevel) new_card.level = new_card.maxLevel;
		} else new_card.level = 1;
		if (getDetails) {
			new_card.attack = current_card.attack;
			new_card.health = current_card.health;
			new_card.cost = current_card.cost;
			new_card.set = current_card.set;
			new_card.card_type = current_card.card_type;
			new_card.type = current_card.type;
			new_card.sub_type = current_card.sub_type || [];
			new_card.skill = current_card.skill;
			if (new_card.level > 1) {
				for (var key in current_card.upgrades) {
					var upgrade = current_card.upgrades[key];
					if (upgrade.cost !== undefined) new_card.cost = upgrade.cost;
					if (upgrade.health !== undefined) new_card.health = upgrade.health;
					if (upgrade.attack !== undefined) new_card.attack = upgrade.attack;
					if (upgrade.desc !== undefined) new_card.desc = upgrade.desc;
					if (upgrade.skill.length > 0) new_card.skill = upgrade.skill;
					if (key == new_card.level) break;
				}
			}

			var runes = unit.runes;
			if (runes) {
				new_card.skill = new_card.skill.slice();
				addRunes(new_card, runes);
				addRunesToSkills(new_card.skill, runes);
			}
		}
	}

	return new_card;
}

function loadCard(id) {
	var card = CARDS[id];
	return card;
}

function getCardInfo(unit) {
	var id = unit.id;
	var level = unit.level;

	var original = CARDS[id];

	var card = Object.assign({}, original);
	if (level > 1) {
		if (level > 1) {
			for (var key in original.upgrades) {
				var upgrade = original.upgrades[key];
				if (upgrade.cost !== undefined) card.cost = upgrade.cost;
				if (upgrade.health !== undefined) card.health = upgrade.health;
				if (upgrade.attack !== undefined) card.attack = upgrade.attack;
				if (upgrade.desc !== undefined) card.desc = upgrade.desc;
				if (upgrade.skill.length > 0) card.skill = upgrade.skill;
				if (key == level) break;
			}
		}
	}
	card.level = level;
	card.maxLevel = original.maxLevel;
	return card;
}

// Output card name
function get_card_name_by_id(id) {
	var card = loadCard(id);
	if (!card) return 0;
	else return card.name;
}

function is_commander(id) {
	var card = loadCard(id);
	return (card && card.card_type == '1');
}

function is_assault(id) {
	var card = loadCard(id);
	return (card && card.card_type == '2');
}

function is_trap(id) {
	var card = loadCard(id);
	return (card && card.card_type == '3');
}

var makeUnitKey = function (unit) {
	var unitKey = unit.id + "_" + unit.level;
	if (unit.runes && unit.runes.length) {
		unitKey += "_" + unit.runes[0].id;
	}
	return unitKey;
};

function makeUnitInfo(id, level, runes) {
	var unit = {
		id: Number(id),
		level: Number(level),
		runes: []
	};
	if (runes) unit.runes = runes;
	return unit;
}

var elariaCaptain = makeUnitInfo(202, 1);

function getRarity(rarity) {
	return rarityStrings[rarity];
}

// Global arrays
var rarityStrings = [
	"",
	"Common",
	"Rare",
	"Epic",
	"Legendary",
	"Mythic"
];

var factions = {
	names: {
		0: 'Factionless',
		1: 'Aether',
		2: 'Chaos',
		3: 'Wyld',
		4: 'Frog',
		5: 'Elemental',
		6: 'Angel',
		7: 'Undead',
		8: 'Void',
		9: 'Dragon',
		10: 'Avian',
		11: 'Goblin',
		12: 'Seafolk',
		13: 'Insect',
		14: 'Bear',
		15: 'Token',
		16: 'Mecha',
		17: 'Knight',

		999: 'Tower'
	},
	IDs: {
		Factionless: 0,
		Aether: 1,
		Chaos: 2,
		Wyld: 3,
		Frog: 4,
		Elemental: 5,
		Angel: 6,
		Undead: 7,
		Void: 8,
		Dragon: 9,
		Avian: 10,
		Goblin: 11,
		Seafolk: 12,
		Insect: 13,
		Bear: 14,
		Token: 15,
		Mecha: 16,
		Knight: 17,

		Tower: 999
	}
};
; "use strict";

var SIM_CONTROLLER = (function () {

	function getConfiguration() {
		// var debug = false;
		// var logPlaysOnly = debug && false;
		// if (logPlaysOnly) debug = false;
		// var showAnimations = false;

		// if ($('#auto_mode').length) {
		//     var auto_mode = $('#auto_mode').is(':checked');
		//     SIMULATOR.userControlled = !auto_mode;
		// }

		// Not currently in UI - attacker's first card has +1 delay
		// var tournament = false;

		// var missionID = $('#mission').val();
		// var simsToRun = 1000;

		return {
			// enemybges: BATTLEGROUNDS ? getSelectedBattlegrounds("enemy-") : '',
			getbattleground: SIMULATOR.bges,
			// selfbges: BATTLEGROUNDS ? getSelectedBattlegrounds("self-") : '',
			// mapbges: BATTLEGROUNDS ? (missionID ? getSelectedMapBattlegrounds() : "") : '',

			playerDeck: SIMULATOR.deck1,
			// playerOrdered: false,
			// playerExactOrdered: false,

			cpuDeck: SIMULATOR.deck2,
			// cpuOrdered: false,
			// cpuExactOrdered: false,

			// surge: false,

			siegeMode: SIMULATOR.use_tower,
			towerType: 501,
			towerLevel: 18,

			// campaignID: $('#campaign').val(),
			// missionID: missionID,
			// missionLevel: "0",
			// raidID: $('#raid').val(),
			// raidLevel: "0",

			// showAnimations: showAnimations,
			simsToRun: SIMULATOR.numsims,
			// tournament: tournament,

			// debug: debug,
			// logPlaysOnly: logPlaysOnly,
			// massDebug: false,
			// findFirstWin: false,
			// findFirstLoss: false,
		};
	}

	// Loops through all simulations
	// - keeps track of number of simulations and outputs status
	function debug_end(result) {

		var result = SIM_CONTROLLER.processSimResult();

		SIMULATOR.simsLeft = 0;
		matchTimer.stop();


		var msg;
		var points = "";
		if (SIMULATOR.config.cpuDeck) {
			points = " (" + SIMULATOR.calculatePoints() + " points)";
		}
		if (result == 'draw') {
			msg = '<br><h1>DRAW' + points + '</h1><br>';
		} else if (result) {
			msg = '<br><h1>WIN' + points + '</h1><br>';
		} else {
			msg = '<br><h1>LOSS' + points + '</h1><br>';
		}

		if (echo) {
			outputTurns(echo, true);
		}

		showUI();

		if (SIM_CONTROLLER.end_sims_callback) SIM_CONTROLLER.end_sims_callback();
	}

	return {
		getConfiguration: getConfiguration,
		debug_end: debug_end,

		end_sims_callback: null,
		stop_sims_callback: null
	};
})();; "use strict";

(function () {
	// Initialize simulation loop - runs once per simulation session
	SIM_CONTROLLER.startsim = function (deck1 = "A8iiAgPYrH", deck2 = "A8iiAgPYrH", use_tower = false, bges = "", numsims = 987) {
		SIMULATOR.deck1 = deck1;
		SIMULATOR.deck2 = deck2;
		SIMULATOR.use_tower = use_tower;
		SIMULATOR.bges = bges;
		SIMULATOR.numsims = numsims;

		SIMULATOR.total_turns = 0;
		matchTimer.reset();
		echo = '';
		SIMULATOR.games = 0;
		run_sims_batch = 0;

		var simConfig = SIM_CONTROLLER.getConfiguration();
		SIMULATOR.simsLeft = simConfig.simsToRun;
		SIMULATOR.config = simConfig;

		// Set up battleground effects, if any
		SIMULATOR.battlegrounds = getBattlegrounds(simConfig);

		SIMULATOR.setupDecks();

		SIMULATOR.wins = 0;
		SIMULATOR.losses = 0;
		SIMULATOR.draws = 0;
		SIMULATOR.points = 0;

		// liveSim
		SIMULATOR.bestHand = {};
		SIMULATOR.firstPick;

		while (SIMULATOR.numsims--) {
			run_sim();
		}

		var errorMargin = marginOfError(SIMULATOR.wins, SIMULATOR.games);
		var winRate = (SIMULATOR.wins / SIMULATOR.games).toFixed(4);

		return {
			"winrate": winRate,
			"games": SIMULATOR.games,
			"wins": SIMULATOR.wins,
			"losses": SIMULATOR.losses,
			"draws": SIMULATOR.draws,
			"error": errorMargin,
			// "total_turns": SIMULATOR.total_turns,
			// "total_points": SIMULATOR.points,
			"tower?": SIMULATOR.use_tower,
			"bges?": SIMULATOR.bges,
			"liveSim": SIMULATOR.bestHand
		};
	};

	// Interrupt simulations
	SIM_CONTROLLER.stopsim = function () {
		matchTimer.stop();
		var elapse = matchTimer.elapsed();
		var simpersec = SIMULATOR.games / elapse;
		simpersec = simpersec.toFixed(2);
		SIMULATOR.simulating = false;

		// Stop the recursion
		if (SIMULATOR.current_timeout) clearTimeout(SIMULATOR.current_timeout);

		if (SIM_CONTROLLER.stop_sims_callback) SIM_CONTROLLER.stop_sims_callback();
	};

	// Initializes a single simulation - runs once before each individual simulation
	// - needs to reset the decks and fields before each simulation
	var seedtest = 0;
	function run_sim(skipResults) {
		if (seedtest) {
			Math.seedrandom(seedtest++);
		}
		if (!SIMULATOR.simulate()) return false;
		if (!skipResults) SIM_CONTROLLER.processSimResult();
	}

	SIM_CONTROLLER.processSimResult = function () {
		var simConfig = SIMULATOR.config;

		var result;
		if (!SIMULATOR.field.player.commander.isAlive()) {
			result = false;
		}
		else if (!SIMULATOR.field.cpu.commander.isAlive()) {
			result = true;
		}
		else {
			result = 'draw';
		}

		if (run_sims_batch > 0) {
			if (SIMULATOR.simsLeft > 0) SIMULATOR.simsLeft--;
			run_sims_count++;
		}

		// Increment wins/losses/games
		// liveSim
		if (result == 'draw') {
			SIMULATOR.draws++;
		  
			// if (!SIMULATOR.bestHand[SIMULATOR.firstPick]) {
			//   SIMULATOR.bestHand[SIMULATOR.firstPick] = {};
			// }
		  
			if (!SIMULATOR.bestHand[SIMULATOR.firstPick].draws) {
			  SIMULATOR.bestHand[SIMULATOR.firstPick].draws = 0;
			}
		  
			SIMULATOR.bestHand[SIMULATOR.firstPick].draws++;
		  } else if (result) {
			SIMULATOR.wins++;
		  
			// if (!SIMULATOR.bestHand[SIMULATOR.firstPick]) {
			//   SIMULATOR.bestHand[SIMULATOR.firstPick] = {};
			// }
		  
			if (!SIMULATOR.bestHand[SIMULATOR.firstPick].wins) {
			  SIMULATOR.bestHand[SIMULATOR.firstPick].wins = 0;
			}
		  
			SIMULATOR.bestHand[SIMULATOR.firstPick].wins++;
		  } else {
			SIMULATOR.losses++;
		  
			// if (!SIMULATOR.bestHand[SIMULATOR.firstPick]) {
			//   SIMULATOR.bestHand[SIMULATOR.firstPick] = {};
			// }
		  
			if (!SIMULATOR.bestHand[SIMULATOR.firstPick].losses) {
			  SIMULATOR.bestHand[SIMULATOR.firstPick].losses = 0;
			}
		  
			SIMULATOR.bestHand[SIMULATOR.firstPick].losses++;
		  }
		  
		SIMULATOR.points += SIMULATOR.calculatePoints();
		SIMULATOR.games++;

		// Increment total turn count
		SIMULATOR.total_turns += SIMULATOR.simulation_turns;
	};

	// Global variables used by single-threaded simulator
	var run_sims_count = 0;
	var run_sims_batch = 0;
})();; var SIMULATOR = {};
module.exports = SIM_CONTROLLER;

(function () {
	"use strict";

	// Play card
	function play_card(card, p, turn, quiet) {
		var field_p_assaults = field[p].assaults;

		// Not a valid card
		if (!card.id) return 0;

		var newKey = field_p_assaults.length;
		initializeCard(card, p, newKey);
		card.played = true;

		if (card.isAssault()) {
			field_p_assaults[newKey] = card;
		}

		if ((simConfig.debug || simConfig.logPlaysOnly) && !quiet) echo += debug_name(field[p].commander) + ' plays ' + debug_name(card) + '<br>';

		if (card.isTrap()) {
			doEarlyActivationSkills(card);
			activation_skills(card);
		} else {
			// Activate trap/onPlay battlegrounds
			for (var i = 0; i < battlegrounds.onCardPlayed.length; i++) {
				var battleground = battlegrounds.onCardPlayed[i];
				var o = (p === 'player' ? 'cpu' : 'player');

				if (battleground.defender) {
					if (!simConfig.surge && p != 'cpu') continue;
					if (simConfig.surge && p != 'player') continue;
					battleground.owner = o;
				} else if (battleground.attacker) {
					if (!simConfig.surge && p != 'player') continue;
					if (simConfig.surge && p != 'cpu') continue;
					battleground.owner = p;
				} else {
					if (battleground.enemy_only && p != 'cpu') continue;
					if (battleground.ally_only && p != 'player') continue;
					battleground.owner = p;
				}

				if (turn > 1 && battleground.first_play) {
					continue;
				}

				battleground.onCardPlayed(card, deck[p].deck, deck[o].deck);
			}
		}
		if (simConfig.showAnimations) {
			drawField(field, null, null, turn);
		}
	}

	// Dead cards are removed from both fields. Cards on both fields all shift over to the left if there are any gaps.
	function remove_dead() {
		remove_dead_cards('player');
		remove_dead_cards('cpu');
	}

	// Shift over to the left if there are any gaps.
	function remove_dead_cards(p) {
		var units = field[p].assaults;
		// Find first dead unit (don't need to update the keys of any units before this one)
		for (var key = 0, len = units.length; key < len; key++) {
			var current_assault = units[key];
			// Starting at the first dead unit, start shifting.
			if (!current_assault.isAlive()) {
				if (simConfig.debug) echo += debug_name(current_assault) + ' <strong>is removed from field</strong><br>';
				var newkey = key;	// Store the new key value for the next alive unit
				for (key++; key < len; key++) {
					current_assault = units[key];
					// If this unit is dead, don't update newkey, we still need to fill that slot
					if (!current_assault.isAlive()) {
						if (simConfig.debug) echo += debug_name(current_assault) + ' <strong>is removed from field</strong><br>';
					}
					// If this unit is alive, set its key to newkey, and then update newkey to be the next slot
					else {
						current_assault['key'] = newkey;
						units[newkey] = current_assault;
						newkey++;
					}
				}
				// We are done shifting slots, so set the length of the array (to get rid of the extra indices on the end)
				// and break out of the for-loop.
				units.length = newkey;
				break;
			}
		}
	}

	// Picks one target by random
	function choose_random_target(targets) {
		var targetIndex = ~~(Math.random() * targets.length);
		return [targets[targetIndex]];
	}

	function get_o(card) {
		if (card.owner === 'cpu') return 'player';
		if (card.owner === 'player') return 'cpu';
	}

	function getAlliedUnits(card, field) {
		return field[card.owner].assaults;
	}

	function getEnemyUnits(card, field) {
		if (card.owner === 'cpu') return field['player'].assaults;
		if (card.owner === 'player') return field['cpu'].assaults;
	}

	// Deal damage to card
	// and keep track of cards that have died this turn
	function do_damage(source, target, damage, shatter, logFn) {
		if (damage >= target.health_left) {
			target.health_left = 0;
		} else {
			target.health_left -= damage;
		}

		if (simConfig.debug) logFn(source, target, damage);

		if (shatter) {
			iceshatter(target);
		}
		if (!target.isAlive() && source) {
			doOnDeathSkills(target, source);
		}
	}

	// Deal damage to card
	// and keep track of cards that have died this turn
	function do_attack_damage(source, target, damage, logFn) {
		if (damage >= target.health_left) {
			target.health_left = 0;
		} else {
			target.health_left -= damage;
		}

		if (simConfig.debug) logFn(source, target, damage);

		// Silence
		// - Target must have taken damage
		// - Target must be an assault
		if (source.silence && target.isAssault() && damage > 0 && !source.silenced) {
			target.silenced = true;
			// Remove passive statuses for this turn
			target.invisible = 0;
			target.warded = 0;
			if (simConfig.debug) echo += debug_name(source) + ' inflicts silence on ' + debug_name(target) + '<br>';
		}

		if (!target.isAlive() && source) {
			doOnDeathSkills(target, source);
		}
	}

	function iceshatter(src_card) {
		// Bug 27391 - If Barrier is partially reduced before being completely depleted, Iceshatter still deals full damage
		var amount = src_card.barrier_ice;
		//if (amount > src_card.barrier_ice) amount = src_card.barrier_ice;
		var o = get_o(src_card);
		var field_o = field[o];
		var target = field_o.assaults[src_card.key];
		if (!target || !target.isAlive()) target = field_o.commander;

		do_damage(src_card, target, amount, null, function (source, target, amount) {
			echo += debug_name(source) + "'s barrier shatters and hits " + debug_name(target) + ' for ' + amount + ' damage';
			echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
		});
	}

	function getActivatedSkill(skillMap, skillId) {
		return (skillMap[skillId] || notImplemented);
	}

	function notImplemented(src_card, skill) {
		if (simConfig.debug) {
			var skillName = (SKILL_DATA[skill.id] ? SKILL_DATA[skill.id].name : skill.id);
			echo += debug_name(src_card) + ' attempts to use ' + skillName + ' (' + skill.id + '), but it is not implemented.<br>';
		}

		return 0;
	}

	// Empower, Legion, and Fervor all activate at the beginning of the turn, after commander
	function doEarlyActivations(field_p) {
		var field_p_assaults = field_p.assaults;
		for (var unit_key = 0, unit_len = field_p_assaults.length; unit_key < unit_len; unit_key++) {
			var current_unit = field_p_assaults[unit_key];

			if (current_unit.isAlive() && current_unit.isActive() && current_unit.isUnjammed()) {

				// Check for Dualstrike
				var dualstrike = current_unit.flurry;
				if (dualstrike && dualstrike.countdown === 0) {
					// Dual-strike does not activate if unit has 0 attack (or is silenced)
					if (current_unit.hasAttack() && !current_unit.silenced) {
						dualstrike.countdown = dualstrike.c;
						current_unit.dualstrike_triggered = true;
					}
				}

				doEarlyActivationSkills(current_unit);
			}
		}
	}

	function doEarlyActivationSkills(source_card) {

		var skills = source_card.earlyActivationSkills;
		var len = skills.length;
		if (len === 0) return;

		if (source_card.silenced) {
			if (simConfig.debug) echo += debug_name(source_card) + " is silenced and cannot use skills</br>";
			return;
		}

		var dualstrike = source_card.dualstrike_triggered;
		if (simConfig.debug && dualstrike) {
			// var main attack loop deal with resetting timer
			echo += debug_name(source_card) + ' activates dualstrike<br>';
		}

		var activations = (dualstrike ? 2 : 1);
		var isAlive = makeLivenessCheck(source_card);
		for (var a = 0; a < activations; a++) {
			for (var i = 0; i < len && isAlive(); i++) {
				var skill = skills[i];
				if (!skill.countdown) {
					var skillFn = getActivatedSkill(earlyActivationSkills, skill.id);
					var affected = skillFn(source_card, skill);
					if (skill.c && affected > 0) {
						skill.countdown = skill.c;
					}

					if (simConfig.showAnimations) {
						drawField(field, null, null, turn, source_card);
					}
				}
			}
		}
	}

	function alwaysTrue() {
		return true;
	}
	function makeLivenessCheck(maybeUnit) {
		if (maybeUnit.isAlive) {
			return maybeUnit.isAlive.bind(maybeUnit);
		} else {
			return alwaysTrue;
		}
	}

	function doOnDeathSkills(dying, killer) {
		if (dying.ondeath_triggered) return; // Check to make sure we don't trigger this twice

		if (!dying.silenced) {
			var skills = dying.onDeathSkills;
			var len = skills.length;
			if (len === 0) return;

			if (len > 1 && !dying.reanimated) {
				for (var i = 0; i < len; i++) {
					var skill = skills[i];
					if (skill.id === "reanimate") {
						// Do reanimate first, then the rest on the next "real" death (reanimate won't trigger again)
						onDeathSkills[skill.id](dying, killer, skill);
						if (simConfig.showAnimations) {
							drawField(field, null, null, turn, dying);
						}
						return;
					}
				}
			}

			for (var i = 0; i < len; i++) {
				var skill = skills[i];
				onDeathSkills[skill.id](dying, killer, skill);

				if (simConfig.showAnimations) {
					drawField(field, null, null, turn, dying);
				}
			}
		}

		dying.ondeath_triggered = true;
	}

	var passiveSkills = ['backlash', 'counter', 'counterburn', 'counterpoison', 'armored', 'evade', 'stasis'];
	function requiresActiveTurn(skillName) {
		return passiveSkills.indexOf(skillName) === -1;
	}

	function backlash(attacker, defender) {
		if (attacker.isAssault() && defender.isAlive()) {
			var baseDamage = defender.backlash;
			var enhancement = getEnhancement(defender, 'backlash', baseDamage);
			doCounterDamage(attacker, defender, 'Backlash', baseDamage, enhancement, true);
		}
	}

	function checkShroud(unit) {
		if (unit.isActive() && unit.isUnjammed()) {
			return 0;
		} else if (unit.silenced) {
			return 0;
		} else {
			return (unit.stasis || 0);
		}
	}

	var activationSkills = {

		burnself: function burnself(src_card, skill) {
			var scorch = skill.x;

			if (!src_card.scorched) {
				src_card.scorched = {
					amount: scorch,
					timer: 2
				};
			} else {
				src_card.scorched.amount += scorch;
				src_card.scorched.timer = 2;
			}
			if (simConfig.debug) echo += debug_name(src_card) + ' inflicts scorch(' + scorch + ') on itself<br>';

			return 1;
		},
		// Scorch
		// - cone-shaped scorch
		scorchbreath: function scorchbreath(src_card, skill) {
			return activationSkills.burn(src_card, skill);
		},
		// Scorch
		// - Target must be an assault
		burn: function burn(src_card, skill) {

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets;
			switch (skill.id) {
				case 'scorchbreath':
					var startKey = Math.max(0, src_card.key - 1);
					var endKey = Math.min(enemyUnits.length, src_card.key + 2);
					targets = enemyUnits.slice(startKey, endKey);
					break;
				case 'burnself':
					targets = [src_card];
					break;
				default:
					targets = enemyUnits.slice(src_card.key, src_card.key + 1);
					break;
			}
			if (!targets.length) return 0;

			var scorch = skill.x;
			var enhanced = getEnhancement(src_card, 'burn', scorch);
			scorch += enhanced;

			for (var i = 0; i < targets.length; i++) {
				var target = targets[i];

				if (!target.scorched) {
					target.scorched = {
						amount: scorch,
						timer: 2
					};
				} else {
					target.scorched.amount += scorch;
					target.scorched.timer = 2;
				}
				if (simConfig.debug) echo += debug_name(src_card) + ' inflicts scorch(' + scorch + ') on ' + debug_name(target) + '<br>';
			}

			return true;
		},

		confuse: function confuse(src_card, skill) {

			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets = [];

			for (var key = 0, len = enemyUnits.length; key < len; key++) {
				var target = enemyUnits[key];
				if (target.isAlive()
					&& (all || (target.isActiveNextTurn() && !target.confused && target.isUnjammed()))) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) {
				return 0;
			}

			// Check All
			if (!all) targets = choose_random_target(targets);

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' confuses ' + debug_name(target) + ' but it is invisible!<br>';
					if (target.backlash) { backlash(src_card, target); }
					continue;
				}

				affected++;

				target.confused = true;
				if (simConfig.debug) echo += debug_name(src_card) + ' confuses ' + debug_name(target) + '<br>';

				if (target.backlash) {
					backlash(src_card, target);
				}
			}

			return affected;
		},

		// Protect (Barrier)
		// - Can target specific faction
		// - Targets allied assaults
		// - Can be enhanced
		protect_ice: function (src_card, skill) {
			return activationSkills.protect(src_card, skill, "barrier_ice");
		},
		protect_seafolk: function (src_card, skill) {
			return activationSkills.protect(src_card, skill, null, null, true);
		},
		evadebarrier: function (src_card, skill) {
			return activationSkills.protect(src_card, skill, "invisible", function (target, amount) {
				return ' and imbues it with invisible ' + amount;
			});
		},
		protect: function (src_card, skill, additional, additionalDebug, onlyOnDelay) {

			var faction = skill.y;
			var rarity = skill.z;

			var alliedUnits = getAlliedUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
					&& (!onlyOnDelay || !target.isActive())) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			var all = skill.all;
			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var protect = (skill.x || 0);
			var enhanced = getEnhancement(src_card, skill.id, protect);
			protect += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' protects ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				var protect_amt = protect;
				var mult = skill.mult;
				if (mult) {
					if (!target.isActive()) {
						mult += (skill.on_delay_mult || 0);
					}
					protect_amt += Math.ceil(target.base_health * mult);
				}

				target.protected += protect_amt;
				if (additional) {
					target[additional] = (target[additional] || 0) + protect_amt;
				}
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' barriers ' + debug_name(target) + ' by ' + protect_amt;
					if (typeof additionalDebug === "function") {
						echo += additionalDebug(target, protect_amt);
					}
					echo += '<br>';
				}
			}

			return affected;
		},


		// - Targets allied assaults
		magicfield: function (src_card, skill) {

			var alliedUnits = getAlliedUnits(src_card, field);

			var protect = (skill.x || 0);
			var enhanced = getEnhancement(src_card, skill.id, protect);
			protect += enhanced;

			var affected = 0;

			var left_ally = src_card.key - 1;
			var right_ally = src_card.key + 1;
			for (var key = left_ally; key <= right_ally; key++) {
				var target = alliedUnits[key];
				if (!target || target.isAlive()) continue;

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' activates anti-magic field, protecting ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				var protect_amt = protect;
				// Adjacent allies only get half
				if (target != src_card) protect_amt = Math.ceil(protect_amt / 2);

				target.protected += protect_amt;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' activates anti-magic field, protecting ' + debug_name(target) + ' by ' + protect_amt;
					echo += '<br>';
				}
			}

			return affected;
		},

		// Wing Guard
		// - Targets self and leftmost ally
		wingward: function (src_card, skill) {

			var alliedUnits = getAlliedUnits(src_card, field);

			// Targets self and first ally from the left
			var targets = [];
			for (var key = 0; key < alliedUnits.length; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target != src_card) {
					targets.push(key);
					break;
				}
			}
			targets.push(src_card.key);

			var wingward = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, wingward);
			wingward += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' wing guards ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				target.protected += wingward;
				var invisBoost = Math.ceil(wingward / 2);
				target.invisible += invisBoost;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' wing guards ' + debug_name(target) +
						', protecting it by ' + wingward +
						' and imbuing it with invisible ' + invisBoost;
					echo += '<br>';
				}
			}

			return affected;
		},

		invigorate: function (src_card, skill) {
			activationSkills.heal(src_card, skill, true);
		},
		// Heal
		// - Can target specific faction
		// - Targets allied damaged assaults
		// - Can be enhanced
		heal: function (src_card, skill, invigorate) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var alliedUnits = getAlliedUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
					&& (all || target.isDamaged()
						|| (invigorate && (!target.invigorated)))) {
					targets.push(key);
				}

			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var heal = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, heal);
			heal += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' ' + skill.id + 's ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				var heal_amt = heal + getSkillMult(skill, target);

				var additionalMaxHealth = 0;
				if (invigorate) {
					// add invigorated if necessary
					if (!target.invigorated) {
						target.invigorated = 0;
					}

					// invigorate does not stack
					additionalMaxHealth = Math.max(0, heal_amt - target.invigorated);
					target.health += additionalMaxHealth;
					target.invigorated += additionalMaxHealth;
				}

				var missingHealth = target.health - target.health_left;
				if (heal_amt > missingHealth) {
					heal_amt = missingHealth;
				}
				target.health_left += heal_amt;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' heals ' + debug_name(target) + ' by ' + heal_amt;
					if (additionalMaxHealth) echo += ' and increases its max health by ' + additionalMaxHealth;
					echo += '<br>';
				}
			}

			return affected;
		},

		// Strike (Bolt)
		// - Can target specific faction
		// - Targets enemy assaults
		// - Can be evaded
		// - Must calculate enfeeble/protect
		// - Can be enhanced
		poisonstrike: function (src_card, skill, poison) {
			return activationSkills.strike(src_card, skill, true);
		},
		strike: function (src_card, skill, poison) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = enemyUnits.length; key < len; key++) {
				var target = enemyUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var strike = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, strike);
			strike += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' bolts ' + debug_name(target) + ' but it is invisible!<br>';
					if (target.backlash) { backlash(src_card, target); }
					continue;
				}

				affected++;

				var strike_damage = strike;

				// Check Protect/Enfeeble
				var damageInfo = modifySkillDamage(target, strike_damage);
				strike_damage = damageInfo.damage;
				var shatter = damageInfo.shatter;

				var poisonDamage = 0;
				if (strike_damage > 0 && poison && target.isAlive()) {
					if (strike > target['poisoned']) {
						poisonDamage = strike;
						target['poisoned'] = poisonDamage;
					}
				}

				do_damage(src_card, target, strike_damage, shatter, function (source, target, amount) {
					echo += '<u>(Strike: +' + skill.x;
					if (enhanced) echo += ' Enhance: +' + enhanced;
					echo += damageInfo.echo;
					echo += ') = ' + amount + ' damage</u><br>';
					echo += debug_name(source) + ' bolts ' + debug_name(target) + ' for ' + amount + ' damage';
					if (!target.isAlive()) {
						echo += ' and it dies';
					} else if (poisonDamage) {
						echo += ' and inflicts poison(' + poisonDamage + ') on it';
					}
					echo += '<br>';
				});

				if (target.backlash) {
					backlash(src_card, target);
				}
			}

			// Bolt always resets counter, even if it was evaded
			return true;
		},

		// Intensify
		// - Can target specific faction
		// - Targets poisoned/scorched enemy assaults
		// - Can be evaded
		// - Can be enhanced
		intensify: function (src_card, skill, poison) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = enemyUnits.length; key < len; key++) {
				var target = enemyUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
					&& (target.scorched || target.poisoned)) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var intensify = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, intensify);
			intensify += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				var intensifiedFields = (target.scorched ? "scorch" : "");
				intensifiedFields += (target.poisoned ? (intensifiedFields ? " and poison" : "poison") : "");

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' intensifies ' + intensifiedFields + ' on ' + debug_name(target) + ' but it is invisible!<br>';
					if (target.backlash) { backlash(src_card, target); }
					continue;
				}

				affected++;

				if (target.scorched) {
					target.scorched.amount += intensify;
				}
				if (target.poisoned) {
					target.poisoned += intensify;
				}

				if (simConfig.debug) echo += debug_name(src_card) + ' intensifies ' + intensifiedFields + ' on ' + debug_name(target) + ' by ' + intensify + '<br>';

				if (target.backlash) {
					backlash(src_card, target);
				}
			}

			return affected;
		},

		// Ignite
		// - Can target specific faction
		// - Targets enemy assaults
		// - Can be evaded
		// - Can be enhanced
		ignite: function (src_card, skill, poison) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = enemyUnits.length; key < len; key++) {
				var target = enemyUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var ignite = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, ignite);
			ignite += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' ignites ' + debug_name(target) + ' but it is invisible!<br>';
					if (target.backlash) { backlash(src_card, target); }
					continue;
				}

				affected++;

				target.scorch(ignite);
				if (simConfig.debug) echo += debug_name(src_card) + ' ignites(' + ignite + ') ' + debug_name(target) + '<br>';

				if (target.backlash) {
					backlash(src_card, target);
				}
			}

			return affected;
		},

		// Jam (Freeze)
		// - Has cooldown timer (only fires every x turns)
		// - Can target specific faction
		// - Targets active_next_turn, unjammed enemy assaults
		// - Can be evaded
		// - If evaded, cooldown timer is not reset (tries again next turn)
		jamself: function jamself(src_card, skill) {

			src_card.jammed = true;
			src_card.jammedSelf = true;
			if (simConfig.debug) echo += debug_name(src_card) + ' freezes itself<br>';

			return 1;
		},
		jam: function jam(src_card, skill) {

			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets = [];

			for (var key = 0, len = enemyUnits.length; key < len; key++) {
				var target = enemyUnits[key];
				if (target.isAlive()
					&& (all || (target.isActiveNextTurn() && target.isUnjammed()))) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) {
				return 0;
			}

			// Check All
			if (!all) targets = choose_random_target(targets);

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' freezes ' + debug_name(target) + ' but it is invisible!<br>';
					if (target.backlash) { backlash(src_card, target); }
					continue;
				}

				affected++;

				target.jammed = true;
				if (simConfig.debug) echo += debug_name(src_card) + ' freezes ' + debug_name(target) + '<br>';

				if (target.backlash) {
					backlash(src_card, target);
				}
			}

			return affected;
		},

		// Frostbreath
		// - Targets opposing enemy unit and any adjacent enemy units
		// - Can be evaded
		// - Must calculate enfeeble/protect
		// - Can be enhanced
		frost: function (src_card, skill) {

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets = [];

			var i = src_card.key - 1;
			var end = i + 2;
			for (; i <= end; i++) {
				var target = enemyUnits[i];
				if (target && target.isAlive()) {
					targets.push(i);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			var frost = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, frost);
			frost += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' breathes frost at ' + debug_name(target) + ' but it is invisible!<br>';
					if (target.backlash) { backlash(src_card, target); }
					continue;
				}

				affected++;

				var frost_damage = frost;

				// Check Protect/Enfeeble
				// Check Protect/Enfeeble
				var damageInfo = modifySkillDamage(target, frost_damage);
				frost_damage = damageInfo.damage;
				var shatter = damageInfo.shatter;

				do_damage(src_card, target, frost_damage, shatter, function (source, target, amount) {
					echo += '<u>(Frostbreath: +' + skill.x;
					if (enhanced) echo += ' Enhance: +' + enhanced;
					echo += damageInfo.echo;
					echo += ') = ' + amount + ' damage</u><br>';
					echo += debug_name(source) + ' breathes frost at ' + debug_name(target) + ' for ' + amount + ' damage';
					echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
				});

				if (target.backlash) {
					backlash(src_card, target);
				}
			}

			return affected;
		},

		heartseeker: function (src_card, skill) {

			var heartseeker = skill.x;

			var target = getEnemyUnits(src_card, field)[src_card.key];

			// No Targets
			if (!target) return 0;

			var enhanced = getEnhancement(src_card, skill.id, heartseeker);
			heartseeker += enhanced;

			target.heartseeker += heartseeker;
			if (simConfig.debug) echo += debug_name(src_card) + ' inflicts heartseeker ' + heartseeker + ' on ' + debug_name(target) + '<br>';

			return 1;
		},
		// Enfeeble (Hex)
		// - Can target specific faction
		// - Targets enemy assaults
		// - Can be evaded
		// - Can be enhanced
		enfeeblebge: function (src_card, skill) {
			// Alias for enfeeble
			return activationSkills.enfeeble(src_card, skill, true);
		},
		enfeeble: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = enemyUnits.length; key < len; key++) {
				var target = enemyUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var enfeeble = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, enfeeble);
			enfeeble += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' hexes ' + debug_name(target) + ' but it is invisible!<br>';
					if (target.backlash) { backlash(src_card, target); }
					continue;
				}

				affected++;

				target['enfeebled'] += enfeeble;
				if (simConfig.debug) echo += debug_name(src_card) + ' hexes ' + debug_name(target) + ' by ' + enfeeble + '<br>';

				if (target.backlash) {
					backlash(src_card, target);
				}
			}

			return affected;
		},

		// Weaken
		// - Can target specific faction
		// - Targets active_next_turn, unjammed, enemy assaults with attack > 0
		// - Can be evaded
		// - Can be enhanced
		// - Does not trigger backlash
		weakenself: function (src_card, skill) {
			return activationSkills.weaken(src_card, skill);
		},
		weakenbge: function (src_card, skill) {
			// Alias for weaken
			return activationSkills.weaken(src_card, skill);
		},
		weaken: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;

			var potentialTargets;
			switch (skill.id) {
				case 'weakenself':
					potentialTargets = getAlliedUnits(src_card, field);
					break;
				default:
					potentialTargets = getEnemyUnits(src_card, field);
					break;
			}

			var all = skill.all;

			var targets = [];
			var getTargets = function (include0Strength, includeInactive) {
				for (var key = 0, len = potentialTargets.length; key < len; key++) {
					var target = potentialTargets[key];
					if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
						&& (all || (!target.isTower() && (includeInactive || target.isActiveNextTurn()) && (include0Strength || target.hasAttack())))) {
						targets.push(key);
					}
				}
			};
			getTargets(false, false);
			// Only target 0-strength units if there are no 1+ strength units left
			if (!targets.length) {
				getTargets(true, false);
			}
			// Target cards on delay (not active next turn) otherwise
			if (!targets.length) {
				getTargets(true, true);
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var weaken = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, weaken);
			weaken += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = potentialTargets[targets[key]];

				// Check Evade
				if (target.invisible) {
					target.invisible--;
					if (simConfig.debug) echo += debug_name(src_card) + ' weakens ' + debug_name(target) + ' but it is invisible!<br>';
					continue;
				}

				affected++;

				target.attack_weaken += weaken;
				target.attackIncreasePrevention += weaken;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' weakens ' + debug_name(target) + ' by ' + weaken + '<br>';
				}
			}

			// Weaken always resets counter, even if it was evaded
			return true;
		},

		// Enrage
		// - Can target specific faction
		// - Targets allied assaults
		// - Can be enhanced
		enrage: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var alliedUnits = getAlliedUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var enrage = (skill.x || 0);
			var enhanced = getEnhancement(src_card, skill.id, enrage);
			enrage += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];
				var amount = enrage;

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' enrages ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				if (skill.mult) {
					amount = Math.ceil(skill.mult * target.base_health);
				}

				target.enraged += amount;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' enrages ' + debug_name(target) + ' by ' + amount + '<br>';
				}
			}

			return affected;
		},

		// Vampirism
		// - Reduced by Barrier, Ward, and Shroud
		// - Not blocked by Invisibility 
		// - Does not trigger Backlash
		// This is a pseudo-activation-skill: it is not triggered
		// in the same loop as the rest, and activates even
		// when the unit is frozen or on cooldown
		vampirism: function vampirism(sourceCard, enemyAssaults) {
			var target = enemyAssaults[sourceCard.key];

			if (target && target.isAlive() && !sourceCard.silenced) {
				var vampirism = sourceCard.vampirism;
				var damageInfo = modifySkillDamage(target, vampirism, { enfeeble: true, venom: true });
				var damageDealt = damageInfo.damage;

				do_damage(sourceCard, target, damageDealt, damageInfo.shatter, function (source, target, amount) {
					echo += '<u>(Vampirism: +' + vampirism;
					echo += damageInfo.echo;
					echo += ') = ' + amount + ' damage</u><br>';
					echo += debug_name(source) + ' activates vampirism, dealing ' + amount + ' damage to ' + debug_name(target);
					echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
				});

				if (damageDealt > 0) {
					var healthMissing = sourceCard.health - sourceCard.health_left;
					var healing = Math.min(sourceCard.vampirism, healthMissing);
					if (echo && healing) echo += debug_name(sourceCard) + ' recovers ' + healing + ' health from vampirism<br />';
					sourceCard.health_left += healing;
				}

				if (simConfig.showAnimations) {
					drawField(field, null, null, turn, sourceCard);
				}
			}
		}
	};

	var earlyActivationSkills = {

		// - Targets allied assaults
		cleanse: function (src_card, skill, invigorate) {

			var all = skill.all;

			var alliedUnits = getAlliedUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && (all || target.hasNegativeStatus())) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' cleanses ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				target.poisoned = 0;
				target.enfeebled = 0;
				target.scorched = 0;
				target.jammed = false;
				target.envenomed = 0;
				target.attack_weaken = 0;
				target.silenced = false;
				target.confused = false;

				if (simConfig.debug) {
					echo += debug_name(src_card) + ' cleanses ' + debug_name(target);
					echo += '<br>';
				}
			}

			return affected;
		},

		// Rally
		// - Targets self
		// - Can be enhanced
		// - Cannot be nullified
		enlarge: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var alliedUnits = getAlliedUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
					&& (all || (target.isUnjammed() && target.isActive()))) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var rally = (skill.x || 0);
			var enhanced = getEnhancement(src_card, skill.id, rally);
			rally += enhanced;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];

				var rally_amt = rally + getSkillMult(skill, target, 'attack');
				rally_amt = adjustAttackIncrease(target, rally_amt);

				target.attack_rally += rally_amt;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' enlarges ' + debug_name(target) + ' by ' + rally_amt + '<br>';
				}
			}

			return true;
		},

		// Rally
		// - Can target specific faction
		// - Targets allied unjammed, active assaults
		// - Can be enhanced
		rally: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var alliedUnits = getAlliedUnits(src_card, field);

			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];

				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
					&& (all || (target.isActive() && target.isUnjammed()))) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var rally = (skill.x || 0);
			var enhanced = getEnhancement(src_card, skill.id, rally);
			rally += enhanced;

			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {

				var target = alliedUnits[targets[key]];

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' empowers ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}


				affected++;

				var rally_amt = rally + getSkillMult(skill, target, 'attack');
				rally_amt = adjustAttackIncrease(target, rally_amt);

				target.attack_rally += rally_amt;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' empowers ' + debug_name(target) + ' by ' + rally_amt + '<br>';
				}
			}

			return affected;
		},

		// Legion
		// - Targets specific faction
		// - Targets allied adjacent unjammed, active assaults
		// - Can be enhanced?
		radiance: function (src_card, skill) {

			var alliedUnits = getAlliedUnits(src_card, field);

			var rally = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, rally);
			rally += enhanced;

			var faction = skill.y;
			var rarity = skill.z;

			var target_key = src_card.key - 1;
			var len = target_key + 2;
			if (target_key < 0) target_key += 2;

			while (target_key <= len) {
				// Check left
				var target = alliedUnits[target_key];
				if (target && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					// Check Nullify
					if (target.nullified && !skill.ignore_nullify) {
						target.nullified--;
						if (simConfig.debug) echo += debug_name(src_card) + ' activates ' + skill.id + ', empowering ' + debug_name(target) + ' but it is nullified!<br>';
					} else {
						var protectAmount = Math.ceil(rally * 0.5);
						var rally_amt = adjustAttackIncrease(target, rally);
						target.attack_rally += rally_amt;
						target.protected += protectAmount;
						if (simConfig.debug) {
							if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
							echo += debug_name(src_card) + ' activates ' + skill.id +
								', empowering ' + debug_name(target) + ' by ' + rally_amt +
								' and protecting it by ' + protectAmount + '<br>';
						}
					}
				}
				target_key += 2;
			}

			return true;
		},
		legion: function (src_card, skill) {

			var alliedUnits = getAlliedUnits(src_card, field);

			var rally = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, rally);
			rally += enhanced;

			var faction = skill.y;
			var rarity = skill.z;

			var target_key = src_card.key - 1;
			var len = target_key + 2;
			if (target_key < 0) target_key += 2;

			var affected = 0;

			while (target_key <= len) {
				// Check left
				var target = alliedUnits[target_key];
				if (target && target.isActive() && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					// Check Nullify
					if (target.nullified && !skill.ignore_nullify) {
						target.nullified--;
						if (simConfig.debug) echo += debug_name(src_card) + ' activates ' + skill.id + ', empowering ' + debug_name(target) + ' but it is nullified!<br>';
					} else {
						affected++;
						var rally_amt = adjustAttackIncrease(target, rally);
						target.attack_rally += rally_amt;
						if (simConfig.debug) {
							if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
							echo += debug_name(src_card) + ' activates ' + skill.id + ', empowering ' + debug_name(target) + ' by ' + rally_amt + '<br>';
						}
					}
				}
				target_key += 2;
			}

			return affected;
		},

		// Fervor
		// - Targets self for each adjacent assault in specific faction
		// - Can be enhanced?
		fervor: function (src_card, skill) {

			var alliedUnits = getAlliedUnits(src_card, field);

			var rally = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, rally);
			rally += enhanced;

			var faction = skill.y;
			var rarity = skill.z;

			var fervorAmount = 0;

			var target_key = src_card.key - 1;
			var len = target_key + 2;
			if (target_key < 0) target_key += 2;

			while (target_key <= len) {
				var target = alliedUnits[target_key];
				if (target && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					fervorAmount += rally;
				}
				target_key += 2;
			}

			if (fervorAmount) {
				fervorAmount = adjustAttackIncrease(src_card, fervorAmount);
				src_card.attack_rally += fervorAmount;
				if (simConfig.debug) {
					if (enhanced) echo += '<u>(Enhance: +' + enhanced + ')</u><br>';
					echo += debug_name(src_card) + ' activates fervor for ' + fervorAmount + '<br>';
				}
				return 1;
			} else {
				return 0;
			}
		},

		// Barrage (Barrage X => X Bolt 1)
		// - Can target specific faction
		// - Targets enemy assaults
		// - Can be evaded
		// - Must calculate enfeeble/protect
		// - Can be enhanced
		// - Does not trigger backlash
		barrage: function (src_card, skill) {

			var barrages = skill.x;
			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var enhanced = getEnhancement(src_card, skill.id, barrages);
			barrages += enhanced;

			var affected = 0;

			for (var i = 0; i < barrages; i++) {
				var targets = [];
				for (var key = 0, len = enemyUnits.length; key < len; key++) {
					var target = enemyUnits[key];
					if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
						targets.push(key);
					}
				}

				// No Targets
				if (!targets.length) return affected;

				// Check All
				if (!all) {
					targets = choose_random_target(targets);
				}

				var strike = 1;
				for (var key = 0, len = targets.length; key < len; key++) {
					var target = enemyUnits[targets[key]];

					// Check Evade
					if (target.invisible) {
						target.invisible--;
						if (simConfig.debug) echo += debug_name(src_card) + ' throws a bomb at ' + debug_name(target) + ' but it is invisible!<br>';
						continue;
					}

					affected++;

					var strike_damage = strike;

					// Check Protect/Enfeeble
					var damageInfo = modifySkillDamage(target, strike_damage, { enfeeble: true, venom: true });
					strike_damage = damageInfo.damage;
					var shatter = damageInfo.shatter;

					do_damage(src_card, target, strike_damage, shatter, function (source, target, amount) {
						echo += '<u>(Barrage: +1';
						echo += damageInfo.echo;
						echo += ') = ' + amount + ' damage</u><br>';
						echo += debug_name(source) + ' throws a bomb at ' + debug_name(target) + ' for ' + amount + ' damage';
						echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
					});
				}
			}

			return affected;
		},

		// Enhance
		// - Can target specific faction
		// - Targets allied, units
		// - Target must be active this turn (for activation skills only)
		// - Target must not be frozen (for activation skills only)
		// - Target must have specific "enhanceable skill"
		enhance: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;
			var s = skill.s;
			var all = skill.all;

			var alliedUnits = getAlliedUnits(src_card, field);
			var require_active_turn = requiresActiveTurn(s);
			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
					&& (all || !require_active_turn || (target.isActive() && target.isUnjammed()))
					&& (all || target.hasSkill(s))) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) {
				return 0;
			}

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var x = (skill.x || 0);
			var mult = skill.mult;
			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' enhances ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				if (!target.hasSkill(s)) {
					continue;
				}

				var enhancements = target.enhanced;
				enhancements[s] = enhancements[s] || { x: 0, mult: 0 };
				if (x > 0) {
					if (simConfig.debug) echo += debug_name(src_card) + ' enhances ' + debug_find_skill(target, s) + ' of ' + debug_name(target, false) + ' by ' + x + '<br>';
					enhancements[s].x += x;
				} else if (mult > 0) {
					if (simConfig.debug) echo += debug_name(src_card) + ' enhances ' + debug_find_skill(target, s) + ' of ' + debug_name(target, false) + ' by ' + (mult * 100) + '%<br>';
					enhancements[s].mult += mult;
				}
			}

			return affected;
		},

		// Enhance
		// - Can target specific faction
		// - Targets allied, units
		// - Target must be active this turn (for activation skills only)
		// - Target must not be frozen (for activation skills only)
		// - Target must have specific "enhanceable skill" ("all" versions aren't counted)
		imbue: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;
			var s = skill['s'];
			var all = skill.all;

			var alliedUnits = getAlliedUnits(src_card, field);
			var require_active_turn = requiresActiveTurn(s);
			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)
					&& (all || !require_active_turn || (target.isActive() && target.isUnjammed()))) {
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) {
				return 0;
			}

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var x = (skill.x || 0);
			var skill = {
				id: s,
				x: x
			};
			var affected = 0;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = alliedUnits[targets[key]];

				// Check Nullify
				if (target.nullified && !skill.ignore_nullify) {
					target.nullified--;
					if (simConfig.debug) echo += debug_name(src_card) + ' imbues ' + debug_name(target) + ' but it is nullified!<br>';
					continue;
				}

				affected++;

				if (target.hasSkill(s)) {
					var enhancements = target.enhanced;
					enhancements[s] = enhancements[s] || { x: 0, mult: 0 };
					if (simConfig.debug) echo += debug_name(src_card) + ' imbues ' + debug_name(target, false) + ' existing ' + debug_find_skill(target, s) + ' by ' + x + '<br>';
					enhancements[s].x += x;
				} else {
					target.imbue(skill);
					if (simConfig.debug) echo += debug_name(src_card) + ' imbues ' + debug_name(target, false) + ' with ' + debug_skill(target, skill) + '<br>';
				}
			}

			return affected;
		},

		mark: function (src_card, skill) {

			var faction = skill.y;
			var rarity = skill.z;
			var all = skill.all;

			var enemyUnits = getEnemyUnits(src_card, field);

			var markTarget = src_card.mark_target;
			var targets = [];
			for (var key = 0, len = enemyUnits.length; key < len; key++) {
				var target = enemyUnits[key];
				if (target.isAlive() && target.isInFaction(faction) && target.isTargetRarity(rarity)) {
					// Can only mark one target
					if (target.uid === markTarget) {
						targets = [key];
						break;
					}
					targets.push(key);
				}
			}

			// No Targets
			if (!targets.length) return 0;

			// Check All
			if (!all) {
				targets = choose_random_target(targets);
			}

			var mark = skill.x;
			var enhanced = getEnhancement(src_card, skill.id, mark);
			mark += enhanced;

			for (var key = 0, len = targets.length; key < len; key++) {
				var target = enemyUnits[targets[key]];

				target.enfeebled += mark;
				src_card.mark_target = target.uid;

				if (simConfig.debug) echo += debug_name(src_card) + ' marks ' + debug_name(target) + ' by ' + mark + '<br>';

				// Set countdown so Mark can't trigger twice on dual-strike turn
				skill.countdown = 1;
			}

			return true;
		}
	};

	var onPlaySkills = {

		ambush: function (src_card, target, skill) {

			var damage = (skill.x || 0) + getSkillMult(skill, target);

			do_damage(src_card, target, damage, null, function (source, target, amount) {
				echo += debug_name(source) + ' ambushes ' + debug_name(target) + ' for ' + amount + ' damage';
				echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
			});

			return 1;
		},

		slow: function (src_card, target, skill) {

			var slow = skill.x + getSkillMult(skill, target);

			target.timer += slow;

			if (simConfig.debug) {
				echo += debug_name(src_card) + ' slows ' + debug_name(target) + ' by ' + slow + '<br>';
			}

			return 1;
		}
	};

	var onDeathSkills = {
		unearth: function (dying, killer, skill) {

			// Only nontoken creatures can use unearth
			if (dying.isToken) {
				return;
			}

			// Get base card
			var unearthedUnit = makeUnitInfo((skill.card || dying.id), (skill.level || skill.x));
			var unearthedCard = get_card_apply_battlegrounds(unearthedUnit, null, true);
			unearthedCard.isToken = true;

			var mult = skill.mult;
			if (mult) {
				// Unearthed card has scaled stats based on original card
				unearthedCard.attack = Math.ceil(dying.attack * mult);
				unearthedCard.health = Math.ceil(dying.health * mult);
			}

			play_card(unearthedCard, dying.owner, true);

			setPassiveStatus(unearthedCard, 'evade', 'invisible');
			setPassiveStatus(unearthedCard, 'absorb', 'warded');

			if (simConfig.debug) {
				echo += debug_name(unearthedCard) + ' is unearthed</br>';
			}

			return 1;
		},

		reanimate: function (dying, killer, skill) {

			// Only trigger once
			if (dying.reanimated) {
				return 0;
			}

			applyDefaultStatuses(dying);
			dying.health_left = skill.x;
			dying.reanimated = true;
			// TODO: Change art

			if (simConfig.debug) {
				echo += ' and is reanimated</br>';
			}

			return 1;
		}
	};

	var onAttackSkills = {
		swarm: function (attacker, defender) {
			var alliedUnits = getAlliedUnits(attacker, field);

			var targets = [];
			for (var key = 0, len = alliedUnits.length; key < len; key++) {
				var target = alliedUnits[key];
				if (target.isAlive() && target.isActive() && !target.isTower()) {
					var adjustedAttack = target.adjustedAttack();
					if (!weakest || adjustedAttack < weakest) {
						targets = [target];
						weakest = adjustedAttack;
					} else if (adjustedAttack === weakest) {
						targets.push(target);
					}
				}
			}

			if (!targets.length) {
				return 0;
			}

			var swarm = attacker.swarm;
			var enhanced = getEnhancement(attacker, 'swarm', swarm);
			swarm += enhanced;

			var weakest = choose_random_target(targets)[0];
			weakest.attack_berserk += swarm;

			if (simConfig.debug) {
				echo += debug_name(attacker) + ' activates swarm, boosting the attack of ' + debug_name(attacker) + ' by ' + swarm + '</br>';
			}

			return 1;
		}
	};

	// Activation Skills
	// - Must traverse through skills from top to bottom
	function activation_skills(src_card) {

		if (src_card.silenced) {
			if (simConfig.debug) echo += debug_name(src_card) + " is silenced and cannot use skills</br>";
			return;
		}

		var skills = src_card.skill;

		var isAlive = makeLivenessCheck(src_card);
		for (var i = 0, len = skills.length; i < len && isAlive(); i++) {
			var skill = skills[i];

			if (skill.countdown) {
				continue;
			}

			// Delegate to skill function
			var skillFn = getActivatedSkill(activationSkills, skill.id);
			var affected = skillFn(src_card, skill);

			if (skill.c && affected) {
				skill.countdown = skill.c;
			}

			if (simConfig.showAnimations) {
				drawField(field, null, null, turn, src_card);
			}
		}
	}

	function initializeBattle() {

		SIMULATOR.simulation_turns = 0;

		// Set up empty decks
		deck = {
			cpu: {
				deck: []
			},
			player: {
				deck: []
			}
		};

		// Set up empty field
		var field = {
			cpu: {
				assaults: []
			},
			player: {
				assaults: []
			}
		};
		SIMULATOR.field = field;

		// Load player deck
		deck['player'] = copy_deck(simConfig.cache_player_deck_cards);

		// Load enemy deck
		if (simConfig.missionID && simConfig.missionLevel > 1 && simConfig.missionLevel < 7) {
			var cache_cpu_deck = load_deck_mission(simConfig.missionID, simConfig.missionLevel);
			simConfig.cache_cpu_deck_cards = getDeckCards(cache_cpu_deck, 'cpu');
		} else if (simConfig.raidID) {
			var cache_cpu_deck = load_deck_raid(simConfig.raidID, simConfig.raidLevel);
			simConfig.cache_cpu_deck_cards = getDeckCards(cache_cpu_deck, 'cpu');
		}
		deck['cpu'] = copy_deck(simConfig.cache_cpu_deck_cards);

		// Set up deck order priority reference
		if (simConfig.playerOrdered && !simConfig.playerExactOrdered) deck.player.ordered = copy_card_list(deck.player.deck);
		if (simConfig.cpuOrdered && !simConfig.cpuExactOrdered) deck.cpu.ordered = copy_card_list(deck.cpu.deck);

		deck.player.chooseCard = (SIMULATOR.userControlled ? chooseCardUserManually  // User_controlled mode has the player choose a card manually
			: simConfig.playerOrdered ? chooseCardOrdered           // Ordered mode tries to pick the card closest to the specified ordering
				: chooseCardRandomly);                     // Player AI falls back on picking a random card

		deck.cpu.chooseCard = (simConfig.cpuOrdered ? chooseCardOrdered           // Ordered mode tries to pick the card closest to the specified ordering
			: simConfig.pvpAI ? chooseCardByPoints                // PvP defenders have a special algorithm for determining which card to play
				: simConfig.cpuExactOrdered ? chooseCardRandomly       // If deck is not shuffled, but we're not playing "ordered mode", pick a random card from hand
					: chooseFirstCard);                         // If none of the other options are true, this is the standard PvE AI and it just picks the first card in hand
	}

	// Simulate one game
	function simulate() {
		simulating = true;

		initializeBattle();

		// Shuffle decks
		if (simConfig.playerExactOrdered) {
			if (!simConfig.playerOrdered) {
				deck.player.shuffleHand = true;
			}
		} else {
			shuffle(deck.player.deck);
		}
		if (simConfig.cpuExactOrdered) {
			if (!simConfig.cpuOrdered) {
				deck.cpu.shuffleHand = true;
			}
		} else {
			shuffle(deck.cpu.deck);
		}

		setupField(field);

		if (simConfig.siegeMode) {
			var towerBGE = BATTLEGROUNDS[simConfig.towerType];
			var tower = towerBGE.effect[simConfig.towerLevel];
			if (tower) {
				tower = makeUnitInfo(tower.id, tower.level);
				var towerCard = get_card_apply_battlegrounds(tower);
				var uid = 150;
				towerCard.uid = uid;
				field.uids[uid] = towerCard;
				towerCard.isTower = function () { return true; };
				play_card(towerCard, 'cpu', -1, true);
			}
		}

		return performTurns(0);
	}

	function setupDecks() {
		// Cache decks where possible
		// Load player deck
		var cache_player_deck;
		if (simConfig.playerDeck) {
			cache_player_deck = hash_decode(simConfig.playerDeck);
		} else {
			cache_player_deck = createEmptyDeck();
		}
		simConfig.cache_player_deck_cards = getDeckCards(cache_player_deck, 'player');

		// Load enemy deck
		var pvpAI = true;
		var cache_cpu_deck;
		if (simConfig.cpuDeck) {
			cache_cpu_deck = hash_decode(simConfig.cpuDeck);
			if (simConfig.missionID) pvpAI = false;
		} else if (simConfig.missionID) {
			cache_cpu_deck = load_deck_mission(simConfig.missionID, simConfig.missionLevel);
			pvpAI = false;    // PvE decks do not use "Smart AI"
		} else if (simConfig.raidID) {
			cache_cpu_deck = load_deck_raid(simConfig.raidID, simConfig.raidLevel);
			pvpAI = false;    // PvE decks do not use "Smart AI"
		} else {
			cache_cpu_deck = createEmptyDeck();
		}
		simConfig.pvpAI = pvpAI;
		simConfig.cache_cpu_deck_cards = getDeckCards(cache_cpu_deck, 'cpu');
	}

	function setupField(field) {
		// Initialize Commander on the fields and set uids
		var uids = field.uids = {};
		['player', 'cpu'].forEach(function (player) {
			var pDeck = deck[player];
			var cards = pDeck.deck;
			var uidBase = (player === 'player' ? 1 : 101);
			for (var i = 0; i < cards.length; i++) {
				var uid = uidBase + i;
				var card = cards[i];
				card.owner = player;
				card.played = false;
				card.uid = uid;
				uids[uid] = card;
			}

			var commander = pDeck.commander;
			commander.owner = player;
			commander.health_left = commander.health;
			if (!commander.reusableSkills) commander.resetTimers();

			var uid = (player === 'player' ? -1 : -2);
			commander.uid = uid;
			uids[uid] = commander;
			field[player].commander = commander;
		});
	}

	function onCardChosen(turn, drawCards) {
		clearFrames();
		performTurns(turn, drawCards);
	}

	function performTurns(turn, drawCards) {
		var done = performTurnsInner(turn, drawCards);
		if (done && SIMULATOR.userControlled) {
			SIM_CONTROLLER.debug_end();
		}
		return done;
	}

	function performTurnsInner(turn, drawCards) {
		// Set up players
		var first_player, second_player;
		if (simConfig.surge) {
			first_player = 'cpu';
			second_player = 'player';
		} else {
			first_player = 'player';
			second_player = 'cpu';
		}

		if (turn > 0) {
			// Retry this turn - don't bother doing setup all over again
			if (!performTurn(turn, field, first_player, second_player, drawCards)) {
				// Try this turn again
				return false;
			}
			if (!field.player.commander.isAlive() || !field.cpu.commander.isAlive()) {
				simulating = false;
				return true;
			}
		}

		turn++;
		// Continue simulation
		for (; turn <= maxTurns + 1; turn++) {
			if (turn == maxTurns + 1) {
				// Ended in draw
				simulating = false;
				return true;
			}

			var setup = setup_turn(turn, first_player, second_player, field);

			if (!performTurn(turn, field, first_player, second_player, true)) {
				// Try this turn again
				return false;
			} else if (!field.player.commander.isAlive() || !field.cpu.commander.isAlive()) {
				simulating = false;
				if (simConfig.debug) echo += '<u>Turn ' + turn + ' ends</u><br><br></div>';
				return true;
			}
		}
		simulating = false;
		return true;
	}

	function performTurn(turn, field, first_player, second_player, drawCards) {
		if (turn % 2) {
			var p = first_player;
			var o = second_player;
		} else {
			var p = second_player;
			var o = first_player;
		}

		SIMULATOR.closeDiv = false;
		if (!choose_card(p, turn, drawCards)) {
			return false;
		} else {
			play_turn(p, o, field, turn);
			return true;
		}
	}

	function debugDraw(commander, deck, i) {
		var card = deck[i];
		if (card) {
			return commander + ' draws ' + debug_name(card, true) + '<br/>';
		} else {
			return '';
		}
	}

	function setup_turn(turn, first_player, second_player, field) {
		simulation_turns = turn;

		SIMULATOR.choice = undefined;

		if (turn % 2) {
			var p = first_player;
			var o = second_player;
		} else {
			var p = second_player;
			var o = first_player;
		}

		if (simConfig.debug) {
			var commander_p = debug_name(field[p]['commander']);
			var deck_p = deck[p].deck;
			echo += '<div id="turn_"' + turn + ' class="turn-info"><hr/><br/><u>Turn ' + turn + ' begins for ' + commander_p + '</u><br>';

			if (turn <= 2) {
				echo += debugDraw(commander_p, deck_p, 0);
				echo += debugDraw(commander_p, deck_p, 1);
			}
			echo += debugDraw(commander_p, deck_p, 2);
		}

		var field_p = field[p];
		var field_o = field[o];
		var field_p_assaults = field_p.assaults;
		var field_o_assaults = field_o.assaults;

		// countdown any skills with timers
		doCountDowns(field_p.commander);

		// Count down timer on your field
		// Remove from your field: Enfeeble, Protect
		for (var i = 0, len = field_p_assaults.length; i < len; i++) {
			var current_assault = field_p_assaults[i];

			if (current_assault.timer > 0) {
				if (turn !== 3 || !simConfig.tournament) {
					current_assault.timer--;
					if (simConfig.debug) echo += debug_name(current_assault) + ' reduces its timer<br>';
				}
			}

			// Check valor
			if (current_assault.valor && !current_assault.silenced) {
				var enemy = field_o_assaults[i];
				if (enemy && current_assault.adjustedAttack() < enemy.adjustedAttack() && enemy.hasAttack()) {
					var valor = adjustAttackIncrease(current_assault, current_assault.valor);
					current_assault.attack_valor += valor;
					if (simConfig.debug) echo += debug_name(current_assault) + ' activates valor, boosting its attack by ' + valor + '<br/>';
				} else if (simConfig.debug) {
					echo += debug_name(current_assault) + ' activates valor but ';
					if (!enemy) {
						echo += 'there is no opposing enemy.<br/>';
					} else {
						echo += 'enemy is not strong enough.<br/>';
					}
				}
			}

			current_assault.enfeebled = 0;
			current_assault.enraged = 0;
			current_assault.invisible = 0;
			current_assault.protected = 0;
			current_assault.barrier_ice = 0;
			current_assault.warded = 0;
			current_assault.enhanced = {};
			current_assault.removeImbue();

			// countdown any skills with timers
			doCountDowns(current_assault);
		}
	}

	function choose_card(p, turn, drawCards) {

		var deck_p = deck[p];
		var deck_p_deck = deck_p.deck;
		var deck_p_ordered = deck_p['ordered'];

		if (deck_p_deck[0]) {
			// Deck not empty yet
			var card_picked = 0;

			if (deck_p_deck.length == 1) {
				card_picked = chooseFirstCard(p, deck_p_deck, deck_p_ordered, turn, drawCards);
			} else {
				for (var i = 0; i < deck_p_deck.length; i++) {
					var card = deck_p_deck[i];
					if (card.trap) {
						play_card(card.trap, p, turn);
						card.trap = false;
					}
					if (i === 2) break;
				}
				card_picked = deck_p.chooseCard(p, deck_p_deck, deck_p_ordered, turn, drawCards);
			}

			if (card_picked < 0) return false;

			play_card(deck_p_deck[card_picked], p, turn);

			// liveSim
			// TODO: turn === 0, arena mode
			if (turn === 1) {

				const cardName = deck_p_deck[card_picked]?.name;
				if (cardName) {
					if (!SIMULATOR.bestHand[cardName]) {
						SIMULATOR.bestHand[cardName] = { num: 0 };
					}
					SIMULATOR.bestHand[cardName].num++;
					SIMULATOR.firstPick = cardName;
				}
			}

			removeFromDeck(deck_p_deck, card_picked);
		}
		return true;
	}

	function removeFromDeck(deck, index) {
		var key = index;
		var len = deck.length - 1;
		while (key < len) {
			deck[key] = deck[++key];
		}
		deck.length = key;

	}

	function chooseCardUserManually(p, shuffledDeck, orderedDeck, turn, drawCards) {
		// Prepare 3-card hand
		var hand = shuffledDeck.slice(0, 3);
		SIMULATOR.closeDiv = true;
		var cardsInHand = [];
		var drawableHand = [];
		for (var handIdx = 0, hand_len = hand.length; handIdx < hand_len; handIdx++) {
			var card = hand[handIdx];
			var text = handIdx + ": " + card['name'];
			if (card.maxLevel > 1) text += '{' + card.level + '/' + card.maxLevel + '}';
			cardsInHand.push(text);
			drawableHand.push(card);
		}
		if (drawCards) {
			outputTurns(echo);
			drawField(field, drawableHand, onCardChosen, turn);
		}
		if (SIMULATOR.choice === undefined) {
			return -1;

		} else {
			var card_picked = SIMULATOR.choice;
			if (!card_picked) card_picked = 0;
			return card_picked;
		}
	}

	function chooseCardOrdered(p, shuffledDeck, orderedDeck, turn, drawCards) {
		// If deck isn't shuffled, just play the first card
		if (typeof orderedDeck === "undefined") {
			return 0;
		}

		// Prepare 3-card hand
		var hand = shuffledDeck.slice(0, 3);

		// Play highest priority card
		var played = false;
		for (var orderIdx = 0, deck_len = orderedDeck.length; orderIdx < deck_len; orderIdx++) {
			var desiredCard = orderedDeck[orderIdx];

			// Get advanced priority
			var priority_id = desiredCard.priority;

			var samePriority = -1;
			var cardInHand;
			for (var handIdx = 0, hand_len = hand.length; handIdx < hand_len; handIdx++) {
				cardInHand = hand[handIdx];
				var b_priority = cardInHand.priority;

				// If this is the exact card at this spot
				if (areEqual(desiredCard, cardInHand)) {
					played = true;
					break;
				}
				// Compare advanced priority field
				else if (priority_id > 0) {
					if (priority_id == b_priority) {
						samePriority = handIdx;
					}
				}
			}
			// If we didnt' find exact card, but found one of the same priority, pick that one
			if (!played && samePriority >= 0) {
				played = true;
				handIdx = samePriority;
				cardInHand = hand[handIdx];
			}
			// If we found the desired card, play it, otherwise move on to the next desired card
			if (played) {
				for (var len = orderedDeck.length - 1; orderIdx < len; orderIdx++) {
					orderedDeck[orderIdx] = orderedDeck[orderIdx + 1];
				}
				orderedDeck.length = orderIdx;
				return handIdx;
			}
		}
		return -1;
	}

	function chooseCardRandomly(p, shuffledDeck, orderedDeck, turn, drawCards) {
		// Prepare 3-card hand
		var hand = shuffledDeck.slice(0, 3);

		var card_picked = (~~(Math.random() * hand.length));
		return card_picked;
	}

	function chooseCardByPoints(p, shuffledDeck, orderedDeck, turn, drawCards) {
		// Prepare 3-card hand
		var hand = shuffledDeck.slice(0, 3);

		// Play card in hand with most upgrade points (first card is picked in the case of ties)
		var card_picked = -1;
		var bestRank = -1;
		for (var i = 0; i < hand.length; i++) {
			var card = hand[i];
			var rank = getCardRanking(card);
			if (rank > bestRank) {
				bestRank = rank;
				card_picked = i;
			}
		}
		return card_picked;
	}

	function chooseFirstCard(p, shuffledDeck, orderedDeck, turn, drawCards) {
		return 0;
	}

	function getCardRanking(card) {
		var cardID = card.id.toString();
		if (card.maxLevel < 10) {
			// Each rarity level is worth 6 points
			var rarity = parseInt(card.rarity) * 6;
			// Each fusion is worth half of a rarity
			var fusion = (cardID.length > 4 ? parseInt(cardID[0]) : 0) * 3;
			// Subtract a point for every missing upgrade level
			var level = parseInt(card.level) - parseInt(card.maxLevel);
			return rarity + fusion + level;
		} else {
			var rarity = parseInt(card.rarity) * 5;
			var level = card.level;
			// Was 5 - may need to reconfirm
			return rarity + 6 + level;
		}
	}

	function play_turn(p, o, field, turn) {

		var field_p = field[p];
		var field_p_commander = field_p['commander'];
		var field_p_assaults = field_p['assaults'];

		var field_o = field[o];
		var field_o_commander = field_o['commander'];
		var field_o_assaults = field_o['assaults'];

		// Activate battleground effects
		for (var i = 0; i < battlegrounds.onTurn.length; i++) {
			var battleground = battlegrounds.onTurn[i];
			if (battleground.enemy_only && p !== 'cpu') continue;
			if (battleground.ally_only && p !== 'player') continue;
			battleground.owner = p;
			doEarlyActivationSkills(battleground);
			activation_skills(battleground);
		}

		// Do Commander Early Activation Skills
		doEarlyActivationSkills(field_p.commander);

		// Set invisibile/ward/shrouded after enhance has had a chance to fire
		for (var key = 0, len = field_p_assaults.length; key < len; key++) {
			var current_assault = field_p_assaults[key];
			if (!current_assault.silenced) {
				setPassiveStatus(current_assault, 'evade', 'invisible');
				setPassiveStatus(current_assault, 'absorb', 'warded');
			}
		}

		// Do Unit Early Activation Skills
		doEarlyActivations(field_p);

		// Commander
		// - activation skills after units do early activation skills
		activation_skills(field_p_commander);

		// Assaults
		for (var key = 0, len = field_p_assaults.length; key < len; key++) {

			var current_assault = field_p_assaults[key];

			if (!current_assault.isAlive()) {
				continue;
			}

			// Check Timer
			if (!current_assault.isActive()) {
				// Activate vampirism if on cooldown
				if (current_assault.vampirism) {
					activationSkills.vampirism(current_assault, field_o_assaults);
				}
				if (simConfig.debug) echo += debug_name(current_assault) + ' is not active yet<br>';
				continue;
			}

			// Check jammed ("frozen")
			if (current_assault['jammed']) {
				// Activate vampirism if frozen
				if (current_assault.vampirism) {
					activationSkills.vampirism(current_assault, field_o_assaults);
				}
				if (simConfig.debug) echo += debug_name(current_assault) + ' is frozen and cannot attack<br>';
				continue;
			}

			var activations = 1;
			if (current_assault.dualstrike_triggered) {
				activations++;
				if (simConfig.debug) echo += debug_name(current_assault) + ' activates dualstrike<br>';
			}

			for (; activations > 0; activations--) {
				if (current_assault.vampirism) {
					activationSkills.vampirism(current_assault, field_o_assaults);
				}

				// Activation skills
				activation_skills(current_assault);

				// See if unit died from Backlash/Iceshatter
				if (!current_assault.isAlive()) {
					continue;
				}

				// Check attack
				// - check rally and weaken
				if (!current_assault.hasAttack()) {
					if (simConfig.debug && current_assault.permanentAttack() > 0) echo += debug_name(current_assault) + ' is weakened and cannot attack<br>';
					continue;
				}

				var opposingUnit;
				if (current_assault.confused) {
					var adjacentAllies = [
						field_p_assaults[current_assault.key - 1],
						field_p_assaults[current_assault.key + 1]
					].filter(function (it) { return it && it.isAlive(); });
					opposingUnit = (adjacentAllies.length
						? choose_random_target(adjacentAllies)[0]
						: false);
				} else {
					opposingUnit = field_o_assaults[current_assault.key];
				}

				doAttack(current_assault, opposingUnit, field_o_assaults, field_o_commander);

				// WINNING CONDITION
				if (!field_o_commander.isAlive() || !field_p_commander.isAlive()) {
					return;
				}

				// If died from counter, make sure dualstrike doesn't do make it swing again!
				if (!current_assault.isAlive()) {
					// This assault is already dead and can't do anything!
					break;
				}

			} // -- END ACTIVATIONS --

			// -- END ATTACK SEQUENCE --
		}
		// End of Assaults

		// Remove from your field: Chaos, Jam, Enfeeble, Rally, Weaken, Enhance, Nullify
		// Process Scorch, Poison, and Corrosion
		processDOTs(field_p_assaults);

		// Dead cards are removed from both fields. Cards on both fields all shift over to the left if there are any gaps.
		remove_dead();

		if (simConfig.debug) echo += '<u>Turn ' + turn + ' ends</u><br><br></div>';
	}

	function setPassiveStatus(assault, skillName, statusName) {
		var statusValue = 0;

		if (assault[skillName]) {
			statusValue = assault[skillName];
			var enhanced = getEnhancement(assault, skillName, statusValue);
			statusValue += enhanced;
		}

		assault[statusName] = statusValue;
	}

	function modifySkillDamage(target, damage, exclusions) {
		// Check Protect/Enfeeble
		exclusions = (exclusions || {});
		// Note: Venom is currently included in enfeeble
		var enfeeble = (exclusions.enfeeble ? 0 : (target.enfeebled || 0));
		var envenomed = (exclusions.venom ? 0 : (target.envenomed || 0));
		var shrouded = (exclusions.stasis ? 0 : checkShroud(target));
		var protect = (exclusions.protect ? 0 : (target.protected || 0));
		var warded = (exclusions.ward ? 0 : (target.warded || 0));

		damage += enfeeble + envenomed;
		var shatter = false;
		if (warded) {
			damage -= applyDamageReduction(target, 'warded', damage);
		}
		if (protect) {
			damage -= applyDamageReduction(target, 'protected', damage);
			if (target.protected == 0) {
				shatter = target.barrier_ice;
			}
		}
		if (shrouded) {
			shrouded += getEnhancement(target, 'stasis', shrouded);
			damage -= shrouded;
		}

		var echo = '';
		if (simConfig.debug) {
			if (enfeeble) echo += ' Enfeeble: +' + enfeeble;
			if (envenomed) echo += ' Venom: +' + envenomed;
			if (shrouded) echo += ' Shroud: -' + shrouded;
			if (protect) echo += ' Barrier: -' + protect;
			if (warded) echo += ' Ward: -' + warded;
		}

		if (damage < 0) {
			damage = 0;
		}

		return {
			damage: damage,
			shatter: shatter,
			echo: echo
		};
	}

	function applyDamageReduction(target, statusName, damage) {
		var statusValue = target[statusName];
		if (damage >= statusValue) {
			target[statusName] = 0;
			return statusValue;
		} else {
			target[statusName] -= damage;
			return damage;
		}
	}

	function doCountDowns(unit) {
		doSkillCountDowns(unit, unit.skill);
		doSkillCountDowns(unit, unit.earlyActivationSkills);

		var dualStrike = unit.flurry;
		if (dualStrike && dualStrike.countdown) {
			dualStrike.countdown--;

			if (simConfig.debug) {
				if (dualStrike.countdown) {
					echo += debug_name(unit) + ' charges  dualstrike (ready in ' + dualStrike.countdown + ' turns)<br/>';
				} else {
					echo += debug_name(unit) + ' readies dualstrike<br/>';
				}
			}
		}
	}

	function doSkillCountDowns(unit, skills) {
		for (var i = 0, len = skills.length; i < len; i++) {
			var skill = skills[i];
			if (skill.countdown) {
				skill.countdown--;
				if (simConfig.debug) {
					if (skill.countdown) {
						echo += debug_name(unit) + ' charges ' + convertName(skill.id) + ' (ready in ' + skill.countdown + ' turns)<br/>';
					} else {
						echo += debug_name(unit) + ' readies ' + convertName(skill.id) + '<br/>';
					}
				}
			}
		}
	}

	function processDOTs(field_p_assaults) {

		for (var key = 0, len = field_p_assaults.length; key < len; key++) {
			var current_assault = field_p_assaults[key];

			if (!current_assault.isAlive()) {
				continue;
			}

			// Make sure jam-self doesn't wear off at end of turn it was applied
			if (current_assault.jammedSelf) {
				current_assault.jammedSelf = false;
			} else {
				current_assault.jammed = false;
			}
			current_assault.confused = false;
			current_assault.attack_rally = 0;
			current_assault.attack_weaken = 0;
			current_assault.attackIncreasePrevention = 0;
			current_assault.nullified = 0;
			current_assault.dualstrike_triggered = false;
			current_assault.bash_triggered = false;

			// Regenerate
			if (current_assault.regenerate && current_assault.isDamaged() && !current_assault.silenced) {

				var regen_health = current_assault.regenerate;
				var enhanced = getEnhancement(current_assault, 'regenerate', regen_health);
				regen_health += enhanced;
				var healthMissing = current_assault.health - current_assault.health_left;
				if (regen_health >= healthMissing) {
					regen_health = healthMissing;
				}

				current_assault.health_left += regen_health;
				if (simConfig.debug) echo += debug_name(current_assault) + ' regenerates ' + regen_health + ' health<br>';
			}

			// Poison
			var amount = current_assault.poisoned;
			if (amount) {
				var warded = current_assault.warded;
				if (warded) {
					amount -= applyDamageReduction(current_assault, 'warded', amount);
				}
				do_damage(null, current_assault, amount, null, function (source, target, amount) {
					echo += debug_name(target) + ' takes ' + amount;
					if (warded) echo += ' (Poison: +' + current_assault.poisoned + ' Ward: -' + warded + ')';
					echo += ' poison damage';
					echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
				});
			}

			// Venom
			var amount = current_assault.envenomed;
			if (amount) {
				var warded = current_assault.warded;
				if (warded) {
					amount -= applyDamageReduction(current_assault, 'warded', amount);
				}
				do_damage(null, current_assault, amount, null, function (source, target, amount) {
					echo += debug_name(target) + ' takes ' + amount;
					if (warded) echo += ' (Venom: +' + current_assault.envenomed + ' Ward: -' + warded + ')';
					echo += ' venom damage';
					echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
				});
			}

			// Scorch
			var scorch = current_assault.scorched;
			if (scorch) {
				amount = scorch.amount;
				var warded = current_assault.warded;
				if (warded) {
					amount -= applyDamageReduction(current_assault, 'warded', amount);
				}
				do_damage(null, current_assault, amount, null, function (source, target, amount) {
					echo += debug_name(target) + ' takes ' + amount;
					if (warded) echo += ' (Scorch: +' + scorch.amount + ' Ward: -' + warded + ')';
					echo += ' scorch damage';
					if (!target.isAlive()) echo += ' and it dies';
					else if (!target.scorched) echo += ' and scorch wears off';
					echo += '<br>';
				});

				if (scorch['timer'] > 1) {
					scorch['timer']--;
				} else {
					current_assault['scorched'] = 0;
				}
			}

			// Corrosion
			var corroded = current_assault.corroded;
			if (corroded) {
				corroded.timer--;
				// TODO: Is this a bug in the game?
				if (corroded.timer < 0) {
					current_assault.corroded = false;
					current_assault.attack_corroded = 0;
					if (simConfig.debug) {
						echo += debug_name(current_assault) + ' recovers from corrosion<br>';
					}
				} else {
					var corrosion = corroded.amount;
					current_assault.attack_corroded = corrosion;
					if (simConfig.debug) {
						echo += debug_name(current_assault) + ' loses ' + corrosion + ' attack to corrosion<br>';
					}
				}
			}

			if (!current_assault.isAlive()) {
				doOnDeathSkills(current_assault, null);
			}

			if (current_assault.silenced) {
				current_assault.silenced = false;
				// Now that silence is wearing off, re-enable these skills
				setPassiveStatus(current_assault, 'evade', 'invisible');
				setPassiveStatus(current_assault, 'absorb', 'warded');
			}
		}
	}

	function doAttack(current_assault, originalTarget, field_o_assaults, field_o_commander) {
		var target = originalTarget
		// -- START ATTACK SEQUENCE --
		if (!target) {
			if (current_assault.confused) {
				// no target and confused, doesn't attack enemy commander
				return
			}
			target = field_o_commander;
		} else if (!target.isAlive()) {
			if (current_assault.confused && originalTarget.owner === current_assault.owner) {
				// shouldn't reach this anymore (switches DS target or doesn't attack non-existing target)
				if (simConfig.debug) echo += debug_name(current_assault) + ' is confused and attacks ' + debug_name(target) + ', but it is already dead<br>';
				// If a confused unit killed an adjacent ally, don't target enemy/commander on subsequent hits of same turn
				return
			}
			target = field_o_commander;
		} else if (!current_assault.confused) {
			// Check for taunt; if unit has taunt, attacks directed at it can't be "taunted" elsewhere
			var taunted = false;
			if (!target.taunt) {
				// Check left first, then right
				var adjacent = field_o_assaults[target.key - 1];
				if (adjacent && adjacent.taunt) {
					target = adjacent;
					taunted = true;
				} else {
					var adjacent = field_o_assaults[target.key + 1];
					if (adjacent && adjacent.taunt) {
						target = adjacent;
						taunted = true;
					}
				}
			}
			if (taunted && simConfig.debug) echo += debug_name(target) + ' taunts ' + debug_name(current_assault);
		}

		// -- CALCULATE DAMAGE --
		var damage = current_assault.adjustedAttack(); // Get base damage + rally/weaken

		// Bash
		var bash = 0;
		if (!current_assault.bash_triggered && !current_assault.silenced) {
			bash = current_assault.bash;
			current_assault.bash_triggered = true;
		}
		damage += bash;

		// Enfeeble
		var enfeeble = target.enfeebled;
		damage += enfeeble;

		// Venom
		var envenomed = target.envenomed;
		damage += envenomed;

		// Heartseeker
		var heartseeker = target.heartseeker;
		damage += heartseeker;

		if (simConfig.debug) {
			echo += '<u>(Attack: +' + current_assault.attack;
			if (current_assault.attack_berserk) echo += ' Berserk: +' + current_assault.attack_berserk;
			if (current_assault.attack_valor) echo += ' Valor: +' + current_assault.attack_valor;
			if (current_assault.attack_rally) echo += ' Rally: +' + current_assault.attack_rally;
			if (bash) echo += ' Bash: +' + bash;
			if (current_assault.attack_weaken) echo += ' Weaken: -' + current_assault.attack_weaken;
			if (current_assault.attack_corroded) echo += ' Corrosion: -' + current_assault.attack_corroded;
			if (enfeeble) echo += ' Enfeeble: +' + enfeeble;
			if (envenomed) echo += ' Venom: +' + envenomed;
			if (heartseeker) echo += ' Heartseeker: +' + heartseeker;
		}

		// Pierce
		// var pierce = current_assault['skill']['pierce'];
		var pierce = current_assault.pierce;
		if (pierce) {
			var enhanced = getEnhancement(current_assault, 'pierce', pierce);
			pierce += enhanced;
		} else {
			pierce = 0;
		}

		// Damage reduction
		var protect = target.protected;
		var shatter = false;
		var armor = (target.silenced ? 0 : target.armored);
		var shrouded = (target.silenced ? 0 : checkShroud(target));
		// Barrier is applied BEFORE Armor
		if (protect) {
			if (simConfig.debug) {
				echo += ' Barrier: -' + protect;
			}
			// Remove pierce from Barrier
			if (pierce) {
				if (pierce >= protect) {
					if (simConfig.debug) echo += ' Pierce: +' + protect;
					pierce -= protect;
					protect = 0;
					target.protected = 0;
				} else {
					if (simConfig.debug) echo += ' Pierce: +' + pierce;
					protect -= pierce;
					target.protected -= pierce;
					// Bug 27415 - Pierce does NOT reduce potential Iceshatter damage unless protect is completely removed by it
					//target.barrier_ice -= pierce;
					pierce = 0;
				}
			}
			if (protect) {
				if (damage >= protect) {
					shatter = target.barrier_ice;
					damage -= protect;
					target.protected = 0;
				} else {
					target.protected -= damage;
					damage = 0;
				}
			}
		}
		if (shrouded) {
			shrouded += getEnhancement(target, 'stasis', shrouded);
			if (simConfig.debug) {
				echo += ' Shroud: -' + shrouded;
			}
			// Remove pierce from Shroud
			if (pierce) {
				if (pierce > shrouded) {
					if (simConfig.debug) echo += ' Pierce: +' + shrouded;
					shrouded = 0;
				} else {
					if (simConfig.debug) echo += ' Pierce: +' + pierce;
					shrouded -= pierce;
				}
			}
			damage -= shrouded;
		}
		if (armor) {
			armor += getEnhancement(target, 'armored', armor);
			if (simConfig.debug) {
				echo += ' Armor: -' + armor;
			}
			// Remove pierce from Armor
			if (pierce) {
				if (pierce > armor) {
					if (simConfig.debug) echo += ' Pierce: +' + armor;
					armor = 0;
				} else {
					if (simConfig.debug) echo += ' Pierce: +' + pierce;
					armor -= pierce;
				}
			}
			damage -= armor;
		}

		if (damage < 0) damage = 0;

		if (simConfig.debug) echo += ') = ' + damage + ' damage</u><br>';

		// -- END OF CALCULATE DAMAGE --

		// Deal damage to target
		do_attack_damage(current_assault, target, damage, function (source, target, amount) {
			echo += debug_name(source)
			if (source.confused) echo += ' is confused ' + (target.owner === current_assault.owner ? ' and ' : ' but ')
			echo += ' attacks ' + debug_name(target) + ' for ' + amount + ' damage';
			echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
		});

		if (simConfig.showAnimations) {
			drawField(field, null, null, turn, current_assault);
		}

		// WINNING CONDITION
		if (!field_o_commander.isAlive()) {
			return;
		}

		// Damage-dependent Status Inflictions
		if (damage > 0 && target.isAssault() && target.isAlive() && !current_assault.silenced) {
			// Poison
			// - Target must have taken damage
			// - Target must be an assault
			// - Target must not be already poisoned of that level
			if (current_assault.poison) {
				var poison = current_assault.poison;
				var enhanced = getEnhancement(current_assault, 'poison', poison);
				poison += enhanced;
				if (poison > target.poisoned) {
					target.poisoned = poison;
					if (simConfig.debug) echo += debug_name(current_assault) + ' inflicts poison(' + poison + ') on ' + debug_name(target) + '<br>';
				}
			}

			// Venom
			// - Target must have taken damage
			// - Target must be an assault
			// - Sets poisioned to greater of target's current poisioned or new poison
			// - Sets envenomed to greater of target's current envenomed or new venom
			if (current_assault.venom) {
				var venom = current_assault.venom;
				var enhanced = getEnhancement(current_assault, 'venom', venom);
				venom += enhanced;

				if (venom > target.envenomed) {
					target.envenomed = venom;
					if (simConfig.debug) echo += debug_name(current_assault) + ' inflicts venom(' + venom + ') on ' + debug_name(target) + '<br>';
				}
			}

			// Nullify
			// - Attacker must have taken damage
			// - Target must be an assault
			if (current_assault.nullify) {
				var nullify = current_assault.nullify;
				var enhanced = getEnhancement(current_assault, 'nullify', nullify);
				nullify += enhanced;
				target.nullified += nullify;
				if (simConfig.debug) echo += debug_name(current_assault) + ' inflicts nullify(' + nullify + ') on ' + debug_name(target) + '<br>';
			}

			// Daze
			// - Target must have taken damage
			// - Target must be an assault
			if (current_assault.daze) {

				var dazed = current_assault.daze;
				var enhanced = getEnhancement(current_assault, 'daze', dazed);
				dazed += enhanced;

				target.attack_weaken += dazed;
				if (simConfig.debug) echo += debug_name(current_assault) + ' dazed ' + debug_name(target) + ' for ' + dazed + '<br>';
			}
		}

		if (shatter) {
			iceshatter(target);
		}

		if (damage > 0 && current_assault.isAlive()) {
			// Leech
			// - Must have dealt damage
			// - Cannot leech more than damage dealt
			// - Cannot leech more health than damage sustained
			// - Leecher must not be already dead
			// - Leecher must not be at full health
			// - Increases attack too during Invigorate battleground effect
			if (!current_assault.silenced) {
				if (current_assault.leech && current_assault.isDamaged()) {

					var leech_health = current_assault.leech;
					var enhanced = getEnhancement(current_assault, 'leech', leech_health);
					leech_health += enhanced;
					var healthMissing = current_assault.health - current_assault.health_left;
					if (leech_health >= healthMissing) {
						leech_health = healthMissing;
					}

					current_assault.health_left += leech_health;
					if (simConfig.debug) echo += debug_name(current_assault) + ' siphons ' + leech_health + ' health<br>';
				}

				if (current_assault.reinforce) {
					var reinforce = current_assault.reinforce;
					var enhanced = getEnhancement(current_assault, 'reinforce', reinforce);
					reinforce += enhanced;

					current_assault.protected += reinforce;
					if (simConfig.debug) echo += debug_name(current_assault) + ' reinforces itself with barrier ' + reinforce + '<br>';
				}

				// Devour
				// - Must have done some damage to an assault unit
				if (current_assault.devour) {

					var devour = current_assault.devour;
					var enhanced = getEnhancement(current_assault, 'devour', devour);
					devour += enhanced;
					devour = adjustAttackIncrease(current_assault, devour);

					current_assault.attack_berserk += devour;

					var healing = Math.min(devour, current_assault.health - current_assault.health_left);
					if (healing) {
						current_assault.health_left += healing;
					}

					if (simConfig.debug) {
						echo += debug_name(current_assault) + ' activates devour, gaining ' + devour + ' attack';
						if (healing) echo += ' and healing ' + healing + ' health';
						echo += '<br>';
					}
				}
			}

			// Counter
			// - Target must have received some amount of damage
			// - Attacker must not be already dead
			if (target.counter) {

				var counterBase = 0 + target.counter;
				var counterEnhancement = getEnhancement(target, 'counter', counterBase);

				doCounterDamage(current_assault, target, 'Vengance', counterBase, counterEnhancement, false);
			}

			// Counterburn
			// - Target must have received some amount of damage
			if (target.counterburn) {
				var scorch = target.counterburn || 0;
				var enhanced = getEnhancement(target, 'counterburn', scorch);
				scorch += enhanced;
				if (!current_assault.scorched) {
					current_assault.scorched = { 'amount': scorch, 'timer': 2 };
				} else {
					current_assault.scorched.amount += scorch;
					current_assault.scorched.timer = 2;
				}
				if (simConfig.debug) echo += debug_name(target) + ' inflicts counterburn(' + scorch + ') on ' + debug_name(current_assault) + '<br>';
			}

			// Counterpoison
			// - Target must have received some amount of damage
			if (target.counterpoison) {
				var poison = target.counterpoison || 0;
				var enhanced = getEnhancement(target, 'counterpoison', poison);
				poison += enhanced;

				if (poison > current_assault.poisoned) {
					current_assault.poisoned = poison;
					if (simConfig.debug) echo += debug_name(target) + ' inflicts counterpoison(' + poison + ') on ' + debug_name(current_assault) + '<br>';
				}
			}

			var enraged = target.enraged;
			if (enraged > 0) {
				enraged = adjustAttackIncrease(target, enraged);
				if (target.isAlive()) {
					target.attack_berserk += enraged;
					if (simConfig.debug) echo += debug_name(target) + " is enraged and gains " + enraged + " attack!</br>";
				}
			}
			// Fury
			// - Target must have received some amount of damage
			if (target.fury) {
				var fury = adjustAttackIncrease(target, target.fury);

				if (target.isAlive()) {
					target.attack_berserk += fury;
					if (simConfig.debug) {
						echo += debug_name(target) + ' activates fury and gains ' + fury + ' attack<br>';
					}
				}

				doCounterDamage(current_assault, target, 'Fury', fury, 0, false);
			}
		}

		if (damage > 0 && !current_assault.silenced) {
			if (current_assault.isAlive()) {
				// Berserk
				// - Must have done some damage to an assault unit
				if (current_assault.berserk) {

					var berserk = current_assault.berserk;
					var enhanced = getEnhancement(current_assault, 'berserk', berserk);
					berserk += enhanced;
					berserk = adjustAttackIncrease(current_assault, berserk);

					current_assault.attack_berserk += berserk;
					if (simConfig.debug) echo += debug_name(current_assault) + ' activates berserk and gains ' + berserk + ' attack<br>';
				}
			}

			// Swarm
			// - Must have done some damage to an assault unit
			if (current_assault.swarm) {
				onAttackSkills.swarm(current_assault, target);
			}
		}

		// -- CHECK STATUS INFLICTION --

		// Corrosion
		// - Target must have received some amount of damage
		if (damage > 0 && target.corrosive) {
			var corrosion = target.corrosive || 0;
			var enhanced = getEnhancement(target, 'corrosive', corrosion);
			corrosion += enhanced;
			if (current_assault.corroded) {
				current_assault.corroded.amount += corrosion;
				current_assault.corroded.timer = 2;
			} else {
				current_assault.corroded = { amount: corrosion, timer: 2 };
			}
			if (simConfig.debug) echo += debug_name(target) + ' inflicts corrosion(' + corrosion + ') on ' + debug_name(current_assault) + '<br>';
			current_assault.attack_corroded = current_assault.corroded.amount;
			if (simConfig.debug) {
				echo += debug_name(current_assault) + ' loses ' + corrosion + ' attack to corrosion<br>';
			}
		}

		if (!current_assault.isAlive()) {
			doOnDeathSkills(current_assault, target);
		}

		if (simConfig.showAnimations) {
			drawField(field, null, null, turn, current_assault);
		}
		// -- END OF STATUS INFLICTION --
	}

	function doCounterDamage(attacker, defender, counterType, counterBase, counterEnhancement, excludeVenom) {

		var counterDamage = counterBase + counterEnhancement;

		// Protect
		var damageInfo = modifySkillDamage(attacker, counterDamage, { enfeeble: true, venom: excludeVenom });
		counterDamage = damageInfo.damage;
		var shatter = damageInfo.shatter;

		if (simConfig.debug) {
			echo += '<u>(' + counterType + ': +' + counterBase;
			if (counterEnhancement) echo += ' Enhance: +' + counterEnhancement;
			echo += damageInfo.echo;
			echo += ') = ' + counterDamage + ' damage</u><br>';
		}

		do_damage(defender, attacker, counterDamage, null, function (source, target, amount) {
			echo += debug_name(target) + ' takes ' + amount + ' ' + counterType.toLowerCase() + ' damage';
			echo += (!target.isAlive() ? ' and it dies' : '') + '<br>';
		});
	}

	function calculatePoints(forceWin) {
		var uids = field.uids;
		var healthStats = {
			player: {
				total: 0,
				taken: 0
			},
			cpu: {
				total: 0,
				taken: 0
			}
		};

		for (var i in uids) {
			var unit = uids[i];
			var stats = healthStats[unit.owner];
			if (stats) {
				stats.total += unit.health;
				if (unit.played || unit.isCommander()) {
					stats.taken += (unit.health - unit.health_left);
				}
			}
		}
		healthStats.player.percent = healthStats.player.taken / healthStats.player.total;
		healthStats.cpu.percent = healthStats.cpu.taken / healthStats.cpu.total;

		var commander_o = field.cpu.commander;
		if (simConfig.cpuDeck) {
			if (commander_o.isAlive() && !forceWin) {
				// 0-25 points, based on percentage of damage dealt to enemy
				var points = Math.floor(healthStats.cpu.percent * 25);
			} else {
				// 115-130 points, based on percentage of damage taken
				var points = 130 - Math.floor(healthStats.player.percent * 15);
			}
		} else {
			if (commander_o.isAlive() && !forceWin) {
				var points = Math.floor(healthStats.cpu.percent / 0.02);
				points = Math.max(5, points);
			} else {
				var points = 200 - Math.floor(healthStats.player.percent / 0.02);
			}
		}
		return points;
	}

	var deck = {};
	var field = {};
	var battlegrounds;
	var simulation_turns = 0;
	var simulating = false;
	var userControlled = false;
	var turn = 0;
	var totalDeckHealth = 0;
	var totalCpuDeckHealth = 0;
	var maxTurns = 100;
	var simConfig = {};

	// public functions
	SIMULATOR.simulate = simulate;
	SIMULATOR.onPlaySkills = onPlaySkills;
	SIMULATOR.calculatePoints = calculatePoints;
	// public variables
	Object.defineProperties(SIMULATOR, {
		setupDecks: {
			get: function () {
				return setupDecks;
			},
			set: function (value) {
				setupDecks = value;
			}
		},
		setupField: {
			get: function () {
				return setupField;
			},
			set: function (value) {
				setupField = value;
			}
		},
		config: {
			get: function () {
				return simConfig;
			},
			set: function (value) {
				simConfig = value;
			}
		},
		deck: {
			get: function () {
				return deck;
			},
			set: function (value) {
				deck = value;
			}
		},
		field: {
			get: function () {
				return field;
			},
			set: function (value) {
				field = value;
			}
		},
		battlegrounds: {
			get: function () {
				return battlegrounds;
			},
			set: function (value) {
				battlegrounds = value;
			}
		},
		simulation_turns: {
			get: function () {
				return simulation_turns;
			},
			set: function (value) {
				simulation_turns = value;
			}
		},
		simulating: {
			get: function () {
				return simulating;
			},
			set: function (value) {
				simulating = value;
			}
		},
		totalDeckHealth: {
			get: function () {
				return totalDeckHealth;
			},
			set: function (value) {
				totalDeckHealth = value;
			}
		},
		totalCpuDeckHealth: {
			get: function () {
				return totalCpuDeckHealth;
			},
			set: function (value) {
				totalCpuDeckHealth = value;
			}
		},
		userControlled: {
			get: function () {
				return userControlled;
			},
			set: function (value) {
				userControlled = value;
			}
		}
	});
})();

function setSimStatus(simStatusMsg, elapse, simsPerSec) {
	if (elapse && simsPerSec) {
		var games = SIMULATOR.games;
		var totalSims = games + SIMULATOR.simsLeft;
		var percentComplete = (games * 100 / totalSims).toFixed("2") + "%";
		var progress = ('(' + games + '/' + totalSims + ') ' + percentComplete);
	}

}

function getSelectedBattlegrounds(prefix) {
	prefix = (prefix || "");
	var selectedBattlegrounds = [];
	var bgCheckBoxes = document.getElementsByName(prefix + "battleground");
	for (var i = 0; i < bgCheckBoxes.length; i++) {
		var checkbox = bgCheckBoxes[i];
		if (checkbox && checkbox.checked) {
			selectedBattlegrounds.push(checkbox.value);
		}
	}
	selectedBattlegrounds = selectedBattlegrounds.join();
	return selectedBattlegrounds;
}

// http://onlinestatbook.com/2/estimation/proportion_ci.html
function marginOfError(wins, games) {
	if (games <= 1) return 1;

	var p = wins / games;
	var N = games;
	var stdErr = Math.sqrt((p * (1 - p)) / N);
	var Z95 = 1.96;
	return (((stdErr * Z95) + 0.5 / N) * 100).toFixed(2) + "%";
}