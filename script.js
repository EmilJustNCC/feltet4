document.addEventListener('DOMContentLoaded', () => {
    const names = ["Perjes", "Magn", "Olda", "Betbet", "Sjulstad"];
    const fields = document.querySelectorAll('.field');
    const activateButton = document.getElementById('activate-button');
    const thankYouButton = document.getElementById('thank-you-button');
    const thankYouModal = document.getElementById('thank-you-modal');
    const gamblerModal = document.getElementById('gambler-modal');
    const gamblerActionText = document.getElementById('gambler-action-text');


    // Keep track of the last winning name to prevent consecutive wins
    let lastWinnerName = null;

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    // Scoreboard and Point Adjustment elements
    const scoresDiv = document.getElementById('scores');
    const playerSelect = document.getElementById('player-select');
    const adjustmentButtons = document.querySelectorAll('.point-adjustments button');

    // Initialize scores
    const scores = {};
    names.forEach(name => {
        scores[name] = 0;
    });

    // Function to update the scoreboard display
    function updateScoreboard() {
        scoresDiv.innerHTML = ''; // Clear current scores
        for (const name in scores) {
            const scoreElement = document.createElement('div');
            const scoreValue = scores[name];
            scoreElement.innerHTML = `<strong>${name}:</strong> ${scoreValue} points`;
            if (scoreValue < 0) {
                scoreElement.classList.add('negative-score');
            } else {
                scoreElement.classList.remove('negative-score'); // Ensure class is removed if score becomes non-negative
            }
            scoresDiv.appendChild(scoreElement);
        }
    }

    // Function to populate the player select dropdown
    function populatePlayerSelect() {
        playerSelect.innerHTML = ''; // Clear current options
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            playerSelect.appendChild(option);
        });
    }

    // Function to distribute names, Bonus, and Gambler! randomly
    function distributeFields() {
        const totalFields = 36; // 6x6 grid
        const numNames = 20;
        const numBonus = 8;
        const numGambler = 8;

        let gridContent = Array(totalFields).fill(null);
        let availablePositions = Array.from({ length: totalFields }, (_, i) => i);

        // Helper to get adjacent indices
        function getAdjacentIndices(index) {
            const row = Math.floor(index / 6);
            const col = index % 6;
            const adjacent = [];
            if (row > 0) adjacent.push(index - 6); // Up
            if (row < 5) adjacent.push(index + 6); // Down
            if (col > 0) adjacent.push(index - 1); // Left
            if (col < 5) adjacent.push(index + 1); // Right
            return adjacent;
        }

        // Place names randomly
        let nameList = [];
        names.forEach(name => {
            // Distribute 20 names as evenly as possible (4 of each name)
            for (let i = 0; i < 4; i++) {
                nameList.push(name);
            }
        });
        nameList = shuffleArray(nameList);

        for (let i = 0; i < numNames; i++) {
            const randomPosIndex = Math.floor(Math.random() * availablePositions.length);
            const gridIndex = availablePositions.splice(randomPosIndex, 1)[0];
            gridContent[gridIndex] = nameList[i];
        }

        // Place Bonus and Gambler adjacent to names where possible
        let bonusToPlace = numBonus;
        let gamblerToPlace = numGambler;
        let positionsWithNames = Array.from({ length: totalFields }, (_, i) => i).filter(i => names.includes(gridContent[i]));

        // Shuffle positions with names to randomize adjacency placement order
        positionsWithNames = shuffleArray(positionsWithNames);

        positionsWithNames.forEach(nameIndex => {
            const adjacent = getAdjacentIndices(nameIndex);
            const emptyAdjacent = adjacent.filter(adjIndex => gridContent[adjIndex] === null);

            // Prioritize placing both Bonus and Gambler if possible
            if (emptyAdjacent.length >= 2 && bonusToPlace > 0 && gamblerToPlace > 0) {
                const shuffledEmptyAdjacent = shuffleArray(emptyAdjacent);
                gridContent[shuffledEmptyAdjacent[0]] = "Bonus";
                bonusToPlace--;
                availablePositions = availablePositions.filter(pos => pos !== shuffledEmptyAdjacent[0]);

                gridContent[shuffledEmptyAdjacent[1]] = "Gambler!";
                gamblerToPlace--;
                availablePositions = availablePositions.filter(pos => pos !== shuffledEmptyAdjacent[1]);

            } else {
                // If not enough empty adjacent for both, try placing one
                if (emptyAdjacent.length >= 1) {
                     const randomEmptyAdjacentIndex = emptyAdjacent[Math.floor(Math.random() * emptyAdjacent.length)];
                    if (bonusToPlace > 0) {
                        gridContent[randomEmptyAdjacentIndex] = "Bonus";
                        bonusToPlace--;
                        availablePositions = availablePositions.filter(pos => pos !== randomEmptyAdjacentIndex);
                    } else if (gamblerToPlace > 0) {
                        gridContent[randomEmptyAdjacentIndex] = "Gambler!";
                        gamblerToPlace--;
                        availablePositions = availablePositions.filter(pos => pos !== randomEmptyAdjacentIndex);
                    }
                }
            }
        });


        // Fill remaining empty positions with leftover Bonus and Gambler
        let remainingOtherContent = [];
        for (let i = 0; i < bonusToPlace; i++) {
            remainingOtherContent.push("Bonus");
        }
        for (let i = 0; i < gamblerToPlace; i++) {
            remainingOtherContent.push("Gambler!");
        }
        remainingOtherContent = shuffleArray(remainingOtherContent);

        availablePositions = shuffleArray(availablePositions); // Shuffle remaining positions

        availablePositions.forEach((pos, index) => {
            if (index < remainingOtherContent.length) {
                gridContent[pos] = remainingOtherContent[index];
            }
        });


        // Update the actual fields
        fields.forEach((field, index) => {
            field.textContent = gridContent[index];
            field.classList.remove('highlight', 'winner', 'bonus', 'gambler', 'name'); // Reset classes

            // Add specific classes for styling
            if (names.includes(field.textContent)) {
                field.classList.add('name');
            } else if (field.textContent === "Bonus") {
                field.classList.add('bonus');
            } else if (field.textContent === "Gambler!") {
                field.classList.add('gambler');
            }
        });
    }

    // Function to handle Gambler! actions
    function handleGamblerAction() {
        const actions = [
            "Lose 2 points",
            "Get 1 drink for free from [random name]", // Modified string
            "Get 2 points",
            "Death round", // Text only
            "Dice roll", // Text only
            "2 ud af 3!" // New action
        ];

        gamblerModal.style.display = 'flex'; // Show the modal immediately

        let animationStartTime = Date.now();
        const animationDuration = 6000; // 6 seconds
        const slowDownStartTime = 3000; // Start slowing down after 3 seconds
        let delay = 50; // Initial delay in ms
        let currentIndex = 0;

        function animateGamblerSpin() {
            const elapsed = Date.now() - animationStartTime;

            if (elapsed < animationDuration) {
                // Display the current action in the cycle
                let displayedActionText = actions[currentIndex];
                 if (displayedActionText.includes("[random name]")) {
                    const randomName = names[Math.floor(Math.random() * names.length)];
                    displayedActionText = displayedActionText.replace("[random name]", randomName);
                } else if (displayedActionText === "2 ud af 3!") {
                    displayedActionText = "Roll a dice and get 2 or 3 to win!";
                }
                gamblerActionText.textContent = `Gambler! Action: ${displayedActionText}`;

                // Move to the next action in the cycle
                currentIndex = (currentIndex + 1) % actions.length;

                // Calculate delay - gradually increase delay after slowDownStartTime
                if (elapsed > slowDownStartTime) {
                    const remainingTime = animationDuration - elapsed;
                    delay = 50 + Math.max(0, (animationDuration - remainingTime) / 5);
                } else {
                    delay = 50; // Constant speed for the first 3 seconds
                }

                setTimeout(animateGamblerSpin, delay);
            } else {
                // Animation finished, determine the final action
                const finalAction = actions[Math.floor(Math.random() * actions.length)];

                let displayedActionText = finalAction;
                 if (displayedActionText.includes("[random name]")) {
                    const randomName = names[Math.floor(Math.random() * names.length)];
                    displayedActionText = displayedActionText.replace("[random name]", randomName);
                } else if (displayedActionText === "2 ud af 3!") {
                    displayedActionText = "Roll a dice and get 2 or 3 to win!";
                }
                gamblerActionText.textContent = `Gambler! Action: ${displayedActionText}`;


                // Implement point/drink logic for relevant actions based on the final action
                if (finalAction === "Lose 2 points" || finalAction === "Get 2 points" || finalAction.startsWith("Get 1 drink")) {
                    const randomPlayer = names[Math.floor(Math.random() * names.length)];
                    if (finalAction === "Lose 2 points") {
                        scores[randomPlayer] = scores[randomPlayer] - 2; // Allow negative scores
                    } else if (finalAction === "Get 2 points") {
                        scores[randomPlayer] += 2;
                    } else if (finalAction.startsWith("Get 1 drink")) {
                         // No score change for this action
                    }
                    updateScoreboard(); // Update scoreboard after score change
                }
            }
        }

        // Start the animation
        animateGamblerSpin();
    }

    // Close gambler modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target == gamblerModal) {
            gamblerModal.style.display = 'none';
        }
    });


    // Initial distribution of fields, scoreboard update, and player select population
    distributeFields();
    updateScoreboard();
    populatePlayerSelect();

    // Activate button click handler
    activateButton.addEventListener('click', () => {
        // Disable button during animation
        activateButton.disabled = true;
        thankYouButton.disabled = true;
        adjustmentButtons.forEach(button => button.disabled = true);
        playerSelect.disabled = true;


        // Reset any previous highlights
        // Reset any previous highlights and winner classes
        fields.forEach(field => {
            field.classList.remove('highlight', 'winner');
        });

        // Get only the fields with names
        const nameFields = Array.from(fields).filter(field => names.includes(field.textContent));
        const totalNameFields = nameFields.length;

        // Select a random starting index from the name fields
        let currentIndex = Math.floor(Math.random() * totalNameFields);

        let animationStartTime = Date.now();
        const animationDuration = 7000; // 7 seconds
        const slowDownStartTime = 3000; // Start slowing down after 3 seconds
        let delay = 50; // Initial delay in ms

        function animateSpin() {
            const elapsed = Date.now() - animationStartTime;

            if (elapsed < animationDuration) {
                 if (currentIndex > -1) {
                    // Remove highlight from previous field (if not the very first step)
                    nameFields[currentIndex].classList.remove('highlight');
                }

                // Calculate next index
                currentIndex = (currentIndex + 1) % totalNameFields;

                // Add highlight to current field
                nameFields[currentIndex].classList.add('highlight');

                // Calculate delay - gradually increase delay after slowDownStartTime
                if (elapsed > slowDownStartTime) {
                    const remainingTime = animationDuration - elapsed;
                     // More aggressive easing towards the end
                    delay = 50 + Math.max(0, (animationDuration - remainingTime) / 5);
                } else {
                    delay = 50; // Constant speed for the first 3 seconds
                }


                setTimeout(animateSpin, delay);
            } else {
                // Animation finished, determine the winner
                let winnerIndex = currentIndex;
                let winnerName = nameFields[winnerIndex].textContent;

                // Ensure the winner is not the same as the last winner
                while (winnerName === lastWinnerName) {
                    winnerIndex = Math.floor(Math.random() * totalNameFields);
                    winnerName = nameFields[winnerIndex].textContent;
                }

                // Highlight the winner
                nameFields[winnerIndex].classList.add('winner');
                // Keep highlight on winner until next round

                // Update the last winner
                lastWinnerName = winnerName;

                // Re-enable buttons and select
                activateButton.disabled = false;
                thankYouButton.disabled = false;
                adjustmentButtons.forEach(button => button.disabled = false);
                playerSelect.disabled = false;


                // Optional: Display winning name/content prominently
                console.log("Winner is:", winnerName);
            }
        }

        // Start the animation
        animateSpin();
    });

    // Thank You button click handler
    thankYouButton.addEventListener('click', () => {
        thankYouModal.style.display = 'flex'; // Show the modal

        // Hide the modal after 5 seconds
        setTimeout(() => {
            thankYouModal.style.display = 'none';
        }, 5000); // 5000 milliseconds = 5 seconds
    });

    // Add event listeners to point adjustment buttons
    adjustmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedPlayer = playerSelect.value;
            const points = parseInt(button.dataset.points);
            if (selectedPlayer && !isNaN(points)) {
                scores[selectedPlayer] += points;
                 updateScoreboard(); // Update scoreboard after adjustment
             }
         });
    });

    // Add click listeners to fields for Gambler! action
    fields.forEach(field => {
        field.addEventListener('click', () => {
            if (field.textContent === "Gambler!") {
                handleGamblerAction();
            }
        });
    });

});