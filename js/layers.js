addLayer("r", {
    name: "red", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF0000",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "red points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('r', 13)) mult = mult.times(upgradeEffect('r', 13))
        if (hasUpgrade('b', 11)) mult = mult.times(2)
        if (hasUpgrade('y', 12)) mult = mult.times(upgradeEffect('y', 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    passiveGeneration() { return (hasMilestone("g", 1))?1:0 },
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("g", 0) && resettingLayer=="b") keep.push("upgrades")
        if (hasMilestone("g", 0) && resettingLayer=="y") keep.push("upgrades")
    },
    upgrades: {
        11: {
            title: "Red Color",
            description: "Double your point gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Raddish red",
            description: "Boost color based on red points.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(1).pow(0.5)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        
        },
        13: {
            title: "Really red",
            description: "Boost red based on color.",
            cost: new Decimal(5),
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        
        },
    },
})

addLayer("b", {
    name: "blue", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#0011ff",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "blue points", // Name of prestige currency
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
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["r"],
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    effect() {
        return Decimal.max(1,Decimal.pow(player.b.points, 2));
    },
    effectDescription() {
        return "which are boosting color generation by "+format(tmp.b.effect)+"x"
    },
    upgrades: {
        11: {
            title: "Blue Color",
            description: "Double red points gain.",
            cost: new Decimal(1),
        },
        12: {
            title: "Sky blue",
            description: "boost yellow points based on blue points.",
            cost: new Decimal(1),
            effect() {
                return player.b.points.add(1).pow(0.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    },
})

addLayer("y", {
    name: "yellow", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Y", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#ffff00",
    requires: new Decimal(10000), // Can be a function that takes requirement increases into account
    resource: "yellow points", // Name of prestige currency
    baseResource: "color", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.6, // Prestige currency exponent

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade('b', 12)) mult = mult.times(upgradeEffect('b', 12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["r","b"],
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Yellow Color",
            description: "Yellow points boost points at reduced rate.",
            cost: new Decimal(1),
            effect() {
                return player.y.points.add(1).pow(0.1)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        12: {
            title: "New Yeller",
            description: "Yellow points boost red points",
            cost: new Decimal(10),
            effect() {
                return player.y.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
    },
})

addLayer("g", {
    name: "green", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#00ff00",
    requires: new Decimal(100), // Can be a function that takes requirement increases into account
    resource: "green points", // Name of prestige currency
    baseResource: "yellow points", // Name of resource prestige is based on
    baseAmount() {return player.y.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    branches: ["b","y"],
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    milestones: {
        0: {
            requirementDescription: "1 green points",
            effectDescription: "keep red upgrades on blue and yellow resets",
            done() { return player.g.points.gte(1) },
        },
        1: {
            requirementDescription: "2 green points",
            effectDescription: "generate 100% of red points on reset",
            done() { return player.g.points.gte(2) },
        },
    },

    // upgrades: {
    //     11: {
    //         title: "Yellow Color",
    //         description: "Yellow points boost points at reduced rate.",
    //         cost: new Decimal(1),
    //         effect() {
    //             return player.y.points.add(1).pow(0.1)
    //         },
    //         effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
    //     },
    // },
})

