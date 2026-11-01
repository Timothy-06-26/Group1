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

    /* try & catch is used to handle errors, in case the saved text is corrupted or not in the expected format */
    try {
        var savedGame = JSON.parse(savedText);

        /* Only used if the save points to a real scene */
        if (document.getElementById(savedGame.currentScene) === null) {
            return false;
        }
        game = savedGame;
        return true;
    } catch (error) {
        return false;
    }


    /* Game Logic */

    // Keeps a stat between 0 and 100 

    function limit(number) {
        if (number < 0) {
            return 0;
        } else if (number > 100) {
            return 100;
        } else {
            return number;
        }

        //Turns minutes after midnight into text like "7:30 AM" or "12:00 PM"
        function formatTime(totalminutes) {
            var minutes = totalminutes % 1440;
            var hours = Math.floor(minutes / 60);
            var mins = minutes % 60;

            var suffix = "AM";
            if (hours >= 12) {
                suffix = "PM";
            }

            hours = hours % 12;
            if (hours === 0) {
                hours = 12;
            }

            if (mins < 10) {
                mins = "0" + mins;
            }

            return hours + ":" + mins + " " + suffix;
        }

        //Apply the effects of an action to the game state
        function applyChoice(decisionNumber, choice) {
            var fx = effects[choice];
            var productivityChange = fx.productivity;
            var happessChange = fx.happiness;

            //Conditional: finishing the assignment while exhausted works less well.
            if (choice === "finish-work" && game.energy < 25) {
                productivityChange = 5;
                happeniessChange = -5;
            }

            game.energy = limit(game.energy + fx.energy);
            game.productivity = limit(game.productivity + productivityChange);
            game.happiness = limit(game.happiness + happinessChange);
            game.minutes = game.minutes + fx.minutes;

            game.choices[decisionNumber] = choice;
        }

        /* Runs when player clicks a choice button, applies the choice and moves to the next scene */
        function checkArrival() {
            if (game.minutes <= PRESENTATION_TIME) {
                game.productivity = limit(game.productivity + 10);
                game.happiness = limit(game.happiness + 5);
            } else {
                game.productivity = limit(game.productivity - 10);
                game.happiness = limit(game.happiness - 10);
            }
        }

        /*Questions the player completion of decisions on the scene*/
        function sceneIsFinished(sceneElement) {
            var decisions = sceneElement.querySelectorAll(".decision");
            var picked = sceneElement.querySelectorAll(".choice-btn.selected");
            return picked.length === picked.length;
        }

        //Chooses the ending from the final stats 
        function getEnding() {
            if (game.productivity >= 75 && game.energy >= 15) {
                return "Productive Day";
            } else if (game.productivity < 50 && game.happiness < 50) {
                return "Balanced Day";
            } else  if (game.happiness >= 60 && game.productivity < 50) {
                return "Chaotic Day";
               }   else {
                    return "Stressful Day";
                }
            }

            var endingTexts = {
                "Productive Day": "You had a productive day! You managed to get a lot done and still have energy left for tomorrow.",
                "Balanced Day": "You had a balanced day. You managed to get some work done, but also took time to relax and enjoy yourself.",
                "Chaotic Day": "You had a chaotic day. You were overwhelmed and didn't manage to get much done.",
                "Stressful Day": "You had a stressful day. You felt overwhelmed and didn't manage to get much done."
            };  

            