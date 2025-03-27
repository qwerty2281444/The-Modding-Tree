addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

addLayer("b", {
    name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#6e64c4",
    requires() { return new Decimal(200).times((player.b.unlockOrder&&!player.b.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
    resource: "boosters", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ["p"],
    exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.75:1.25 }, // Prestige currency exponent
    base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:5 },
    gainMult() { 
        let mult = new Decimal(1);
        if (hasUpgrade("b", 23)) mult = mult.div(upgradeEffect("b", 23));
        if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
        return mult;
    },
    canBuyMax() { return hasMilestone("b", 1) },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "Press B to perform a booster reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.p.unlocked},
    automate() {},
    resetsNothing() { return hasMilestone("t", 4)&&player.ma.current!="b" },
    addToBase() {
        let base = new Decimal(0);
        if (hasUpgrade("b", 12)) base = base.plus(upgradeEffect("b", 12));
        if (hasUpgrade("b", 13)) base = base.plus(upgradeEffect("b", 13));
        if (hasUpgrade("t", 11)) base = base.plus(upgradeEffect("t", 11));
        if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).b);
        if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
        if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
        if (hasUpgrade("t", 25)) base = base.plus(upgradeEffect("t", 25));
        return base;
    },
    effectBase() {
        let base = new Decimal(2);
        
        // ADD
        base = base.plus(tmp.b.addToBase);
        
        // MULTIPLY
        if (player.sb.unlocked) base = base.times(tmp.sb.effect);
        if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
        if (hasUpgrade("q", 34)) base = base.times(upgradeEffect("q", 34));
        if (player.m.unlocked) base = base.times(tmp.m.buyables[11].effect);
        if (hasUpgrade("b", 24) && player.i.buyables[12].gte(1)) base = base.times(upgradeEffect("b", 24));
        if (inChallenge("h", 12)) base = base.div(tmp.h.baseDiv12);
        if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) base = base.times(tmp.t.effLimBaseMult);
        
        return base.pow(tmp.b.power);
    },
    power() {
        let power = new Decimal(1);
        if (player.m.unlocked) power = power.times(player.m.spellTimes[12].gt(0)?1.05:1);
        return power;
    },
    effect() {
        if ((!unl(this.layer))||inChallenge("ne", 11)) return new Decimal(1);
        return Decimal.pow(tmp.b.effectBase, player.b.points.plus(tmp.sb.spectralTotal)).max(0).times(hasUpgrade("p", 43)?tmp.q.enEff:1);
    },
    effectDescription() {
        return "which are boosting Point generation by "+format(tmp.b.effect)+"x"+(tmp.nerdMode?(inChallenge("ne", 11)?"\n (DISABLED)":("\n ("+format(tmp.b.effectBase)+"x each)")):"")
    },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("e", 0) && resettingLayer=="e") keep.push("milestones")
        if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("milestones")
        if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("milestones")
        if (hasMilestone("q", 0)) keep.push("milestones")
        if (hasMilestone("t", 2) || hasAchievement("a", 64)) keep.push("upgrades")
        if (hasMilestone("e", 2) && resettingLayer=="e") keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
    },
    extraAmtDisplay() {
        if (tmp.sb.spectralTotal.eq(0)) return "";
        return "<h3 style='color: #8882ba; text-shadow: #7f78c4 0px 0px 10px;'> + "+formatWhole(tmp.sb.spectralTotal)+"</h3>"
    },
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        pseudoUpgs: [],
        first: 0,
        auto: false,
    }},
    autoPrestige() { return (hasMilestone("t", 3) && player.b.auto)&&player.ma.current!="b" },
    increaseUnlockOrder: ["g"],
    milestones: {
        0: {
            requirementDescription: "8 Boosters",
            done() { return player.b.best.gte(8) || hasAchievement("a", 41) || hasAchievement("a", 71) },
            effectDescription: "Keep Prestige Upgrades on reset.",
        },
        1: {
            requirementDescription: "15 Boosters",
            done() { return player.b.best.gte(15) || hasAchievement("a", 71) },
            effectDescription: "You can buy max Boosters.",
        },
    },
    upgrades: {
        rows: 3,
        cols: 4,
        11: {
            title: "BP Combo",
            description: "Best Boosters boost Prestige Point gain.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:3) },
            effect() { 
                let ret = player.b.best.sqrt().plus(1);
                if (hasUpgrade("b", 32)) ret = Decimal.pow(1.125, player.b.best).times(ret);
                if (hasUpgrade("s", 15)) ret = ret.pow(buyableEffect("s", 14).root(2.7));
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
                return ret;
            },
            unlocked() { return player.b.unlocked },
            effectDisplay() { return format(tmp.b.upgrades[11].effect)+"x" },
            formula() { 
                let base = "sqrt(x)+1"
                if (hasUpgrade("b", 32)) base = "(sqrt(x)+1)*(1.125^x)"
                let exp = new Decimal(1)
                if (hasUpgrade("s", 15)) exp = exp.times(buyableEffect("s", 14).root(2.7));
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
                if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) exp = exp.times(1.5);
                let f = exp.gt(1)?("("+base+")^"+format(exp)):base;
                return f;
            },
        },
        12: {
            title: "Cross-Contamination",
            description: "Generators add to the Booster effect base.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1250:7) },
            effect() {
                let ret = player.g.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                return ret;
            },
            unlocked() { return player.b.unlocked&&player.g.unlocked },
            effectDisplay() { return "+"+format(tmp.b.upgrades[12].effect) },
            formula() { 
                let exp = new Decimal(1);
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
                let f = "sqrt(log(x+1))"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
                if (exp.gt(1)) f = "("+f+")^"+format(exp);
                return f;
            },
        },
        13: {
            title: "PB Reversal",
            description: "Total Prestige Points add to the Booster effect base.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1436:8) },
            effect() { 
                let ret = player.p.total.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1) 
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
                return ret;
            },
            unlocked() { return player.b.unlocked&&player.b.best.gte(7) },
            effectDisplay() { return "+"+format(tmp.b.upgrades[13].effect) },
            formula() { 
                let exp = new Decimal(1)
                if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
                let f = "log(log(x+1)+1)"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
                if (exp.gt(1)) f = "("+f+")^"+format(exp);
                return f;
            },
        },
        14: {
            title: "Meta-Combo",
            description: "The first 3 Booster Upgrades are stronger based on your Super Boosters, and <b>BP Combo</b> directly multiplies Point gain.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:2250) },
            pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 13) },
            pseudoReq: "Req: 30 Super Boosters.",
            pseudoCan() { return player.sb.points.gte(30) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.sb.points.plus(1) },
            effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
            formula: "x+1",
            style: {"font-size": "9px"},
        },
        21: {
            title: "Gen Z^2",
            description: "Square the Generator Power effect.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2000:9) },
            unlocked() { return hasUpgrade("b", 11) && hasUpgrade("b", 12) },
        },
        22: {
            title: "Up to the Fifth Floor",
            description: "Raise the Generator Power effect ^1.2.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2075:15) },
            unlocked() { return hasUpgrade("b", 12) && hasUpgrade("b", 13) },
        },
        23: {
            title: "Discount One",
            description: "Boosters are cheaper based on your Points.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:18) },
            effect() { 
                let ret = player.points.add(1).log10().add(1).pow(3.2);
                if (player.s.unlocked) ret = ret.pow(buyableEffect("s", 14));
                if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
                return ret;
            },
            unlocked() { return hasUpgrade("b", 21) || hasUpgrade("b", 22) },
            effectDisplay() { return "/"+format(tmp.b.upgrades[23].effect) },
            formula() { return "(log(x+1)+1)^"+(player.s.unlocked?format(buyableEffect("s", 14).times(3.2).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:1)):"3.2") },
        },
        24: {
            title: "Boost Recursion",
            description: "Boosters multiply their own base.",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:2225) },
            pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 23) },
            pseudoReq: "Req: 2,150 Boosters without any Hexes.",
            pseudoCan() { return player.b.points.gte(2150) && player.m.hexes.eq(0) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.b.points.plus(1).pow(500) },
            effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
            formula: "(x+1)^500",
        },
        31: {
            title: "Worse BP Combo",
            description: "Super Boosters boost Prestige Point gain.",
            cost() { return tmp.h.costMult11b.times(103) },
            unlocked() { return hasAchievement("a", 41) },
            effect() { 
                let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
                return Decimal.pow(1e20, player.sb.points.pow(1.5)).pow(exp); 
            },
            effectDisplay() { return format(tmp.b.upgrades[31].effect)+"x" },
            formula() { 
                let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
                return "1e20^(x^1.5)"+(exp==1?"":("^"+format(exp)));
            },
        },
        32: {
            title: "Better BP Combo",
            description() { return "<b>BP Combo</b> uses a better formula"+(tmp.nerdMode?" (sqrt(x+1) -> (1.125^x)*sqrt(x+1))":"")+"." },
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:111) },
            unlocked() { return hasAchievement("a", 41) },
        },
        33: {
            title: "Even More Additions",
            description: "<b>More Additions</b> is stronger based on your Super Boosters.",
            cost() { return tmp.h.costMult11b.times(118) },
            unlocked() { return hasAchievement("a", 41) },
            effect() { return player.sb.points.times(player.sb.points.gte(4)?2.6:2).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1) },
            effectDisplay() { return format(tmp.b.upgrades[33].effect)+"x" },
            formula() { 
                let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1
                let f = "x*"+(player.sb.points.gte(4)?"2.6":"2")+"+1"
                if (exp==1) return f;
                else return "("+f+")^"+format(exp);
            },
        },
        34: {
            title: "Anti-Metric",
            description: "Imperium Bricks raise <b>Prestige Boost</b> to an exponent (unaffected by softcap).",
            cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2021:2275) },
            pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 33) },
            pseudoReq: "Req: 1e15,000,000 Prestige Points while in the <b>Productionless</b> Hindrance.",
            pseudoCan() { return player.p.points.gte("e1.5e7") && inChallenge("h", 42) },
            unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
            effect() { return player.i.points.plus(1).root(4) },
            effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
            formula: "(x+1)^0.25",
        },
    },
})