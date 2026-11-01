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

"library": { minutes: 60, energy: -8, productivity: 12, happiness: 0 },
"nap": { minutes: 30, energy: 15, productivity: -3, happiness: 5 },

"friends": { minutes: 120, energy: -10, productivity: -15, happiness: 20 },
"study-evening": { minutes: 120, energy: -10, productivity: 15, happiness: -5 },
"home": { minutes: 60, energy: 20, productivity: -5, happiness: 5 },    

"finish-work": { minutes: 90, energy: -20, productivity: 15, happiness: 5 },
"partial-work": { minutes: 45, energy: -8, productivity: 7, happiness: 0 },
"ignore-work": { minutes: 0, energy: 15, productivity: -15, happiness: 5 }

};


/* SAVING AND LOADING (Local Storage) */

//localStorage stores in text, so JSON.stringify() converts the object to text, and JSON.parse() converts it back to an object

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function loadGame() {
    var savedText = localStorage.getItem(SAVE_KEY);

    /* For the first time, there is no saved game, we keep new game save */
    if (savedText === null) {
        return;
    }