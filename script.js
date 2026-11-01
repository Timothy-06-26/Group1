/* DATA */

var effects = {
"rush": { minutes: 5, energy: -10, productivity: -5, happiness: -5 },
"prepare": { minutes: 10, energy: 0, productivity: 10, happiness: 3 },

"breakfast": { minutes: 15, energy: 10, productivity: 0, happiness: 5 },
"coffee": { minutes: 3, energy: 8, productivity: 3, happiness: 0 },
"skip-breakfast": { minutes: 15, energy: 0, productivity: 0, happiness: -5 },

"bus": { minutes: 25, energy: -3, productivity: 3, happiness: 0 },
"walk": { minutes: 35, energy: -10, productivity: 0, happiness: 3 },
"rideshare": { minutes: 15, energy: 0, productivity: 0, happiness: 2 },

"run-class": { minutes: 5, energy: -5, productivity: 10, happiness: 0 },
"coffee-stop": { minutes: 10, energy: 8, productivity: -5, happiness: 5 },

"attend-class": { minutes: 60, energy: -5, productivity: 10, happiness: -3 },
"skip-class": { minutes: 0, energy: 5, productivity: -10, happiness: -8},
