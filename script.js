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

// Clock jumps to these times when a new scene starts

var sceneStartTimes ={
    "afternoon": 13 * 60, // 1:00PM
    "evening": 18 * 60, // 6:00PM
    "night": 22 * 60 + 30, //10:30PM
    "summary": 24 * 60 // 12:00AM
};

var PRESENTATION_TIME = 9*60;
// name save is under in localStorage
var SAVE_KEY = "lateAgainSave";

//player progress in one object
var game =  newGame();

function newGame() {
    return {
        scene: "morning",
        minutes: 8 * 60 + 30, //8:30AM
        energy: 70,
        productivity: 50,
        happiness: 60,
        choices: {}
        //stats at the start of current scene
        sceneStart: { minutes: 8 * 60 + 30, energy: 70, productivity: 50, happiness: 60 }
    };
}


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
        if (document.getElementById(savedGame.scene) === null || savedGame.sceneStart === undefined) {
            return false;
        }
        game = savedGame;
        return true;
    } catch (error) {
        return false;
    }

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
            var happinessChange = fx.happiness;

            //Conditional: finishing the assignment while exhausted works less well.
            if (choice === "finish-work" && game.energy < 25) {
                productivityChange = 5;
                happinessChange = -5;
            }

            game.energy = limit(game.energy + fx.energy);
            game.productivity = limit(game.productivity + productivityChange);
            game.happiness = limit(game.happiness + happinessChange);
            game.minutes = game.minutes + fx.minutes;

            game.choices[decisionNumber] = choice;
        }

        /* Runs when player leaves Scene 2, where they on time for 9:00AM? */
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
            return decisions.length === picked.length;
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

            /* UPDATING THE PAGE(DOM) */

            // Updates the page from the "game" object.
            function updateScreen() {
                     showCurrentScene();
                     updateDashboard();
                     updatebuttons();
                     updateMessages();

            if (game.scene === "summary") {
                updateSummary();    
            }
        }
            
        // Displays the current scene and hides all other scenes
        function showCurrentScene() {
            var scenes = document.querySelectorAll(".scene");

            scenes.forEach(function (scene) {
                if (scene.id === game.scene) {
                    scene.hidden = false;
                } else {
                    scene.hidden = true;
                }
            });
        }

        function updateDashboard() {
            // Day progress = decisions made out of 8

            var decisionsMade = Object.keys(game.choices).length;
            var percent = Math.floor((decisionsMade / 8) * 100);

            document.getElementById("current-time").textContent = formatTime(game.minutes);
            document.getElementById("day-progress").value = percent;
            document.getElementById("progress-text").textContent = percent + "%";

            document.getElementById("energy").textContent = game.energy;
            document.getElementById("energy-bar").value = game.energy;

            document.getElementById("productivity").textContent = game.productivity;
            document.getElementById("productivity-bar").value = game.productivity;

            document.getElementById("happiness").textContent = game.happiness;
            document.getElementById("happiness-bar").value = game.happiness;
        }

        //Marks the chosen buttons, locks answered decisions, and unlocks Next buttons.
        function updatebuttons() {
            var choiceButtons = document.querySelectorAll(".choice-btn");

            choiceButtons.forEach(function (button) {
                var decisionNumber = button.closest(".decision").dataset.decision;
                var chosen = game.choices[decisionNumber];

                if (chosen === undefined) {
                    // Not answered yet
                    button.classList.remove("selected");
                
                } else {
                    //Answered: lock the buttons and highligh the one that was picked
                    
                    if (button.dataset.choice === chosen) {
                        button.classList.add("selected");
                    } else {
                        button.classList.remove("selected");
                    }
                }
            });

            var nextButtons = document.querySelectorAll(".next-btn");

            nextButtons.forEach(function (button) {
                var scene = button.closest(".scene");
                button.disabled = !sceneIsFinished(scene);
            });
        }

        //Messages that change based on the current scene and the player's choices
        function updateMessages() {
            var arrivalMessage = document.getElementById("arrival-message");
            var assignmentMessage = document.getElementById("assignment-warning");

            //Scene 2: only once both decisions are made, did you arrive on time?
            if (game.choices[3] !== undefined && game.choices[4] !== undefined) {
                var time = formatTime(game.minutes);

                if (game.minutes <= PRESENTATION_TIME) {
                    arrivalMessage.textContent = "It's " + time + ". You arrived on time for the presentation and your group is relieved!";
                } else {
                    arrivalMessage.textContent = "It's " + time + ". You arrived late for the presentation, your group is group is already presenting and everyone is staring at you.";
                }
            }

        //Scene 4: depending on the afternoon choice, then the evening choice.
        if (game.choices["7"] !== undefined) {
            var text = "";

            if (game.choices["5"] === "attend-class" && game.choices["6"] === "library") {
                text = "You attended the lecture and studied at the library, so most of the assignment is already done.";
            } else if (game.choices["5"] === "attend-class" || game.choices["6"] === "library") {
                text = "You made a little progress this afternoon, but there's still plenty left to do. ";
            } else {
                text = "You didn't make much progress this afternoon, so there's still plenty left to do. Midnight is approaching ";
            }

            if (game.choices["7"] === "friends") {
                text = text + "Out with your friends, the clock keeps ticking. You'll have to catch up later tonight.";
            } else if (game.choices["7"] === "study-evening") {
                text = text + "You turn down the invite and settle in to work. Your friends will understand.";
            } else {
                text = text + "You go home to relax, but the assignment is still waiting for you.";
            }
            
            assignmentMessage.textContent = text;
        }
    }

    //Fills in the final scene.
    function updateSummary() {
        var ending = getEnding();

        document.getElementById("final-energy").textContent = game.energy;
        document.getElementById("final-productivity").textContent = game.productivity;
        document.getElementById("final-happiness").textContent = game.happiness;

        document.getElementById("ending-title").textContent = ending;
        document.getElementById("ending-description").textContent = endingTexts[ending];

//Highlighting the matching card, to lower case and triming it 
// to make sure the capital letters or spaces don't break the matching
        var cards = document.querySelectorAll(".ending-card");

        cards.forEach(function (card) {
            var cardName = card.querySelector("h4").textContent.trim().toLowerCase();

            if (cardName === ending.toLowerCase()) {
                card.classList.add("earned");
            } else {
                card.classList.remove("earned");
            }
        });

    }


    /* EVENT LISTENERS */

    // Clicking a choice button

document.querySelectorAll(".choice-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        var decisionNumber = button.closest(".decision").dataset.decision;
        
        //Remember new choice(this will replace an earlier choice of a decision)
        game.choices[decisionNumber] =  button.dataset.choice;

        game.energy = game.sceneStart.energy;
        game.productivity = game.sceneStart.productivity;
        game.happiness = game.sceneStart.happiness;
        game.minutes = game.sceneStart.minutes;

        // then apply every choice made so far in this scene
        var decisions = button.closest(".scene").querySelectorAll(".decision");

        decisions.forEach(function (decision) {
            var number = decision.dataset.decision;

            if (game.choices[number] !== undefined) {
                applyChoice(number, game.choices[number]);

            }
        });
        saveGame();
        updateScreen();

    });
});

//Clicking a Next button moves to the next scene
document.querySelectorAll(".next-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        // After Scene 2, check if the player arrived on time 
        if (game.scene === "transport") {
            checkArrival();
        }

        // Move to the next scene and jump the clock.
        game.scene = button.dataset.next;
        if (sceneStartTimes[game.scene] !== undefined) {
            game.minutes = sceneStartTimes[game.scene];
        }

        // Remember the stats at the start of the new scene
        game.sceneStart = {
            minutes: game.minutes,
            energy: game.energy,
            productivity: game.productivity, 
            happiness: game.happiness
        };

        saveGame();
        updateScreen();
        window.scrollTo(0, 0);
    });
    });

    //Clicking the Play Again button resets the game

    document.getElementById("replay-btn").addEventListener("click", function () {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    });

    /* START A GAME */

    // If there is a saved game, load it. 
    loadGame();
    updateScreen();