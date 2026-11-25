

/* --- SIDEBAR SCRIPT --- */
document.addEventListener("DOMContentLoaded", () => {
    const sideNav = document.querySelector(".side-nav");
    const navTrigger = document.querySelector(".nav-trigger");
    const navLabels = document.querySelectorAll(".nav-label");

    if (!sideNav || !navTrigger) return;

    function syncNavLabels(isExpanded) {
        navLabels.forEach((label) => {
            const nextText = isExpanded ? label.dataset.expanded : label.dataset.collapsed;
            if (nextText) {
                label.textContent = nextText;
            }
        });
    }

    navTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const isExpanded = sideNav.classList.toggle("is-expanded");
        navTrigger.setAttribute("aria-expanded", String(isExpanded));
        syncNavLabels(isExpanded);
    });
});





/* --- GLOBAL TOURNAMENT STATE --- */
let tournamentSteps = [];
let currentStepIndex = 0;
let fullRecapHTML = ""; 

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    const divisions = ["all", "main", "all_stars", "spinoff"];
    divisions.forEach(div => loadHallOfFame(div));

    // Master Sort Listener
    const masterSort = document.getElementById('master-sort');
if (masterSort) {
    masterSort.addEventListener('change', (e) => {
        const [field, direction] = e.target.value.split('-');
        const divisions = ["all", "main", "all_stars", "spinoff"];
        
        divisions.forEach(div => {
            loadHallOfFame(div, field, direction);
        });
    });
}
    
    // Attach Global Listeners
    const nextBtn = document.getElementById('nextStepBtn');
    if (nextBtn) nextBtn.addEventListener("click", showNextStep);

    const castBtn = document.getElementById('castVotesBtn'); // Ensure your button has this ID
    if (castBtn) castBtn.addEventListener("click", castVotes);

    const processModern = document.getElementById('processModern');
    if (processModern) processModern.addEventListener('click', () => processSeason('Modern'));

    const processLegacy = document.getElementById('processLegacy');
    if (processLegacy) processLegacy.addEventListener('click', () => processSeason('Legacy'));

    const processHS = document.getElementById('processHS');
    if (processHS) processHS.addEventListener('click', () => processSeason('High Stakes'));

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('seasonInput').value = '';
            document.getElementById('results').innerHTML = '';
            processedData = [];
        });
    }

    const copyBtn = document.getElementById('copyResult');
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
});

/* --- LALAPARUZA SIMULATOR --- */
function generateTournament() {
    const input = document.getElementById('contestantInput').value;
    let contestants = input.split('\n').map(name => name.trim()).filter(name => name !== "");

    if (contestants.length < 2) {
        alert("Please enter at least 2 contestants!");
        return;
    }

    tournamentSteps = [];
    currentStepIndex = 0;
    fullRecapHTML = ""; 
    let pool = [...contestants];
    let roundNumber = 1;

    while (pool.length > 1) {
        let winners = [];
        let matches = [];
        let roundName = pool.length === 2 ? "THE FINAL SMACKDOWN" : (pool.length <= 4 ? "THE SEMI-FINALS" : `ROUND ${roundNumber}`);
        
        fullRecapHTML += `<strong>--- ${roundName} ---</strong><br>`;
        pool.sort(() => Math.random() - 0.5);

        if (roundNumber === 1 && pool.length % 2 !== 0) {
            const c = [pool.pop(), pool.pop(), pool.pop()];
            const winCount = (((pool.length / 2) + 1) % 2 === 0) ? 1 : 2;
            const shuffled = [...c].sort(() => Math.random() - 0.5);
            const matchWinners = shuffled.slice(0, winCount);
            winners.push(...matchWinners);
            matches.push({ type: 'triple', players: c, winners: matchWinners });
            fullRecapHTML += `3-Way: ${c.join(' vs ')}<br>Winners: <strong>${matchWinners.join(' & ')}</strong><br>`;
        } 
        else if (pool.length % 2 !== 0) {
            const luckyOne = pool.pop();
            winners.push(luckyOne);
            matches.push({ type: 'bye', player: luckyOne });
            fullRecapHTML += `${luckyOne} had a bye.<br>`;
        }

        for (let i = 0; i < pool.length; i += 2) {
            const c1 = pool[i];
            const c2 = pool[i + 1];
            const winner = Math.random() < 0.5 ? c1 : c2;
            winners.push(winner);
            matches.push({ type: '1v1', p1: c1, p2: c2, winner: winner });
            fullRecapHTML += `${c1} vs ${c2}<br>Winner: <strong>${winner}</strong><br>`;
        }

        tournamentSteps.push({ name: roundName, matches: matches });
        pool = winners;
        roundNumber++;
        fullRecapHTML += `<br>`;
    }

    tournamentSteps.push({ name: "WINNER", champion: pool[0] });
    document.getElementById('setup-area').style.display = 'none';
    document.getElementById('tournament-display').style.display = 'block';
    showNextStep();
}

function formatHeaderRoundName(rawName) {
    if (!rawName) return "Lalaparuza";
    if (rawName === "WINNER") return "Lalaparuza: Winner";

    const formatted = rawName
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());

    return `Lalaparuza: ${formatted}`;
}

function showNextStep() {
    const step = tournamentSteps[currentStepIndex];
    const mainHeader = document.getElementById('lalaparuza-header');
    const display = document.getElementById('roundResults');
    const btn = document.getElementById('nextStepBtn');
    const recapBox = document.getElementById('recap-container');

    if (mainHeader) {
        mainHeader.innerText = formatHeaderRoundName(step.name);
    }

    display.innerHTML = "";

    if (step.champion) {
    display.innerHTML = `
        <h1 class="winner-banner">
            <span class="trophy">🏆</span>
            <span class="winner-name">${step.champion.toUpperCase()}</span>
            <span class="trophy">🏆</span>
        </h1>`;
    recapBox.innerHTML = `
        <details>
            <summary>Smackdown Recap</summary>
            <div class="recap-content">${fullRecapHTML}</div>
        </details>`;
    btn.innerText = "RESTART SIMULATOR";
    btn.onclick = () => location.reload();
    } else {
        step.matches.forEach(m => {
            let div = document.createElement('div');
            div.className = 'match-card';
            if (m.type === '1v1') div.innerHTML = `${m.p1} vs. ${m.p2}<br><strong>${m.winner} advances!</strong>`;
            else if (m.type === 'triple') div.innerHTML = `<strong>3-WAY:</strong> ${m.players.join(' vs. ')}<br><strong>${m.winners.join(' & ')} advance(s)!</strong>`;
            else div.innerHTML = `<em>${m.player} has a bye and advances!</em>`;
            display.appendChild(div);
        });
        currentStepIndex++;
        btn.innerText = currentStepIndex === tournamentSteps.length - 1 ? "THE QUEEN OF SHE DONE ALREADY DONE HAD HERSES" : "NEXT ROUND";
    }
}

// /* --- MORE RANDOM LALAPARUZA SIMULATOR --- */

// // Helper function: returns true if the contestant name does NOT contain ~, ', or *
// function isClearName(name) {
//     return !/[~'*]/.test(name);
// }

// // Helper function: determines match winners based on clear name priority
// function resolveMatch(players, neededWinnersCount = 1) {
//     const clearPlayers = players.filter(isClearName);
//     const symbolPlayers = players.filter(p => !isClearName(p));

//     let selectedWinners = [];

//     // Prioritize clear names first
//     if (clearPlayers.length > 0) {
//         const shuffledClear = [...clearPlayers].sort(() => Math.random() - 0.5);
//         selectedWinners.push(...shuffledClear.slice(0, neededWinnersCount));
//     }

//     // Fill remaining winner slots with symbol names if needed
//     if (selectedWinners.length < neededWinnersCount) {
//         const remainingNeeded = neededWinnersCount - selectedWinners.length;
//         const shuffledSymbol = [...symbolPlayers].sort(() => Math.random() - 0.5);
//         selectedWinners.push(...shuffledSymbol.slice(0, remainingNeeded));
//     }

//     return selectedWinners;
// }

// function generateTournament() {
//     const input = document.getElementById('contestantInput').value;
//     let contestants = input.split('\n').map(name => name.trim()).filter(name => name !== "");

//     if (contestants.length < 2) {
//         alert("Please enter at least 2 contestants!");
//         return;
//     }

//     tournamentSteps = [];
//     currentStepIndex = 0;
//     fullRecapHTML = ""; 
//     let pool = [...contestants];
//     let roundNumber = 1;

//     while (pool.length > 1) {
//         let winners = [];
//         let matches = [];
//         let roundName = pool.length === 2 ? "THE FINAL SMACKDOWN" : (pool.length <= 4 ? "THE SEMI-FINALS" : `ROUND ${roundNumber}`);
        
//         fullRecapHTML += `<strong>--- ${roundName} ---</strong><br>`;
//         pool.sort(() => Math.random() - 0.5);

//         if (roundNumber === 1 && pool.length % 2 !== 0) {
//             const c = [pool.pop(), pool.pop(), pool.pop()];
//             const winCount = (((pool.length / 2) + 1) % 2 === 0) ? 1 : 2;
            
//             // Resolve 3-Way match using clear name priority
//             const matchWinners = resolveMatch(c, winCount);
            
//             winners.push(...matchWinners);
//             matches.push({ type: 'triple', players: c, winners: matchWinners });
//             fullRecapHTML += `3-Way: ${c.join(' vs ')}<br>Winners: <strong>${matchWinners.join(' & ')}</strong><br>`;
//         } 
//         else if (pool.length % 2 !== 0) {
//             const luckyOne = pool.pop();
//             winners.push(luckyOne);
//             matches.push({ type: 'bye', player: luckyOne });
//             fullRecapHTML += `${luckyOne} had a bye.<br>`;
//         }

//         for (let i = 0; i < pool.length; i += 2) {
//             const c1 = pool[i];
//             const c2 = pool[i + 1];
            
//             // Resolve 1v1 match using clear name priority
//             const [winner] = resolveMatch([c1, c2], 1);
            
//             winners.push(winner);
//             matches.push({ type: '1v1', p1: c1, p2: c2, winner: winner });
//             fullRecapHTML += `${c1} vs ${c2}<br>Winner: <strong>${winner}</strong><br>`;
//         }

//         tournamentSteps.push({ name: roundName, matches: matches });
//         pool = winners;
//         roundNumber++;
//         fullRecapHTML += `<br>`;
//     }

//     tournamentSteps.push({ name: "WINNER", champion: pool[0] });
//     document.getElementById('setup-area').style.display = 'none';
//     document.getElementById('tournament-display').style.display = 'block';
//     showNextStep();
// }

// function showNextStep() {
//     const step = tournamentSteps[currentStepIndex];
//     const title = document.getElementById('roundTitle');
//     const display = document.getElementById('roundResults');
//     const btn = document.getElementById('nextStepBtn');
//     const recapBox = document.getElementById('recap-container');

//     title.innerText = step.name;
//     display.innerHTML = "";

//     if (step.champion) {
//         display.innerHTML = `<h1 style="font-size: 4rem;">🏆 ${step.champion.toUpperCase()} 🏆</h1>`;
//         recapBox.innerHTML = `
//             <details>
//                 <summary>Smackdown Recap</summary>
//                 <div class="recap-content">${fullRecapHTML}</div>
//             </details>`;
//         btn.innerText = "RESTART SIMULATOR";
//         btn.onclick = () => location.reload();
//     } else {
//         step.matches.forEach(m => {
//             let div = document.createElement('div');
//             div.className = 'match-card';
//             if (m.type === '1v1') div.innerHTML = `${m.p1} vs. ${m.p2}<br><strong>${m.winner} advances!</strong>`;
//             else if (m.type === 'triple') div.innerHTML = `<strong>3-WAY:</strong> ${m.players.join(' vs. ')}<br><strong>${m.winners.join(' & ')} advance(s)!</strong>`;
//             else div.innerHTML = `<em>${m.player} has a bye and advances!</em>`;
//             display.appendChild(div);
//         });
//         currentStepIndex++;
//         btn.innerText = currentStepIndex === tournamentSteps.length - 1 ? "THE QUEEN OF SHE DONE ALREADY DONE HAD HERSES" : "NEXT ROUND";
//     }
// }

// /* --- MORE RANDOM LALAPARUZA SIMULATOR --- */

// // Helper function to check if a contestant should lose to clean names
// function isMarked(name) {
//     return name.includes("'") || name.includes("~") || name.includes("*");
// }

// function generateTournament() {
//     const input = document.getElementById('contestantInput').value;
//     let contestants = input.split('\n').map(name => name.trim()).filter(name => name !== "");

//     if (contestants.length < 2) {
//         alert("Please enter at least 2 contestants!");
//         return;
//     }

//     tournamentSteps = [];
//     currentStepIndex = 0;
//     fullRecapHTML = ""; 
//     let roundNumber = 1;

//     // Split into two distinct pools at the start
//     let cleanPool = contestants.filter(name => !isMarked(name));
//     let markedPool = contestants.filter(name => isMarked(name));

//     // ERROR CAP-CHECK: Make sure there's at least one clean name and one marked name to script this narrative
//     if (cleanPool.length === 0 || markedPool.length === 0) {
//         alert("Please ensure you have at least one clean name and one marked name containing *, ', or ~!");
//         return;
//     }

//     // Pick EXACTLY ONE clean name at random to survive until the final round
//     const chosenCleanFinalist = cleanPool[Math.floor(Math.random() * cleanPool.length)];

//     // Shuffle both pools for initial randomness
//     cleanPool.sort(() => Math.random() - 0.5);
//     markedPool.sort(() => Math.random() - 0.5);

//     // Keep running rounds until we only have 1 total survivor left
//     while ((cleanPool.length + markedPool.length) > 1) {
//         let nextCleanPool = [];
//         let nextMarkedPool = [];
//         let matches = [];
        
//         let currentTotalCount = cleanPool.length + markedPool.length;
//         let isFinalRound = currentTotalCount === 2;
//         let roundName = isFinalRound ? "THE FINAL SMACKDOWN" : (currentTotalCount <= 4 ? "THE SEMI-FINALS" : `ROUND ${roundNumber}`);
        
//         fullRecapHTML += `<strong>--- ${roundName} ---</strong><br>`;

//         // --- ROUND 1 SPECIAL TRIPLE THREAT LOGIC ---
//         if (roundNumber === 1 && currentTotalCount % 2 !== 0) {
//             let triplePlayers = [];
            
//             while (triplePlayers.length < 3 && markedPool.length > 0) {
//                 triplePlayers.push(markedPool.pop());
//             }
//             while (triplePlayers.length < 3 && cleanPool.length > 0) {
//                 triplePlayers.push(cleanPool.pop());
//             }

//             const remainingPairs = (cleanPool.length + markedPool.length) / 2;
//             const winCount = ((remainingPairs + 1) % 2 === 0) ? 1 : 2;
            
//             // Round 1: Prioritize advancing clean names or the chosen finalist
//             const sortedPlayers = [...triplePlayers].sort((a, b) => {
//                 if (a === chosenCleanFinalist) return -1;
//                 if (b === chosenCleanFinalist) return 1;
//                 return isMarked(a) - isMarked(b);
//             });
//             const matchWinners = sortedPlayers.slice(0, winCount);

//             matchWinners.forEach(w => {
//                 if (isMarked(w)) nextMarkedPool.push(w);
//                 else nextCleanPool.push(w);
//             });

//             matches.push({ type: 'triple', players: triplePlayers, winners: matchWinners });
//             fullRecapHTML += `3-Way: ${triplePlayers.join(' vs ')}<br>Winners: <strong>${matchWinners.join(' & ')}</strong><br>`;
//         }
//         // --- BYE LOGIC FOR SUBSEQUENT ROUNDS ---
//         else if (currentTotalCount % 2 !== 0) {
//             // Protect our Chosen One if they happen to draw the bye
//             if (cleanPool.includes(chosenCleanFinalist)) {
//                 cleanPool = cleanPool.filter(p => p !== chosenCleanFinalist);
//                 nextCleanPool.push(chosenCleanFinalist);
//                 matches.push({ type: 'bye', player: chosenCleanFinalist });
//                 fullRecapHTML += `${chosenCleanFinalist} had a bye.<br>`;
//             } else if (markedPool.length > 0) {
//                 const luckyOne = markedPool.pop();
//                 nextMarkedPool.push(luckyOne);
//                 matches.push({ type: 'bye', player: luckyOne });
//                 fullRecapHTML += `${luckyOne} had a bye.<br>`;
//             } else {
//                 const luckyOne = cleanPool.pop();
//                 nextCleanPool.push(luckyOne);
//                 matches.push({ type: 'bye', player: luckyOne });
//                 fullRecapHTML += `${luckyOne} had a bye.<br>`;
//             }
//         }

//         // --- PAIRINGS ENGINE ---
//         // Match Clean vs Marked for as long as possible
//         while (cleanPool.length > 0 && markedPool.length > 0) {
//             const c1 = cleanPool.pop();
//             const c2 = markedPool.pop();
            
//             let winner;
//             if (isFinalRound) {
//                 // THE FINALS: The clean name (our finalist) explicitly loses to the marked name
//                 winner = isMarked(c1) ? c1 : c2;
//             } else if (c1 === chosenCleanFinalist || c2 === chosenCleanFinalist) {
//                 // If it's the chosen finalist, they ALWAYS win to get to the end
//                 winner = (c1 === chosenCleanFinalist) ? c1 : c2;
//             } else if (roundNumber === 1) {
//                 // Round 1: Standard clean names win automatically over marked
//                 winner = isMarked(c1) ? c2 : c1;
//             } else {
//                 // Round 2+: Non-chosen clean names lose to marked contestants
//                 winner = isMarked(c1) ? c1 : c2;
//             }
            
//             if (isMarked(winner)) nextMarkedPool.push(winner);
//             else nextCleanPool.push(winner);
            
//             matches.push({ type: '1v1', p1: c1, p2: c2, winner: winner });
//             fullRecapHTML += `${c1} vs ${c2}<br>Winner: <strong>${winner}</strong><br>`;
//         }

//         // Clean vs Clean battles (If they meet up before the final round)
//         while (cleanPool.length >= 2) {
//             const c1 = cleanPool.pop();
//             const c2 = cleanPool.pop();
            
//             let winner;
//             if (c1 === chosenCleanFinalist || c2 === chosenCleanFinalist) {
//                 winner = (c1 === chosenCleanFinalist) ? c1 : c2;
//             } else {
//                 winner = Math.random() < 0.5 ? c1 : c2;
//             }
            
//             nextCleanPool.push(winner);
//             matches.push({ type: '1v1', p1: c1, p2: c2, winner: winner });
//             fullRecapHTML += `${c1} vs ${c2}<br>Winner: <strong>${winner}</strong><br>`;
//         }

//         // Marked vs Marked battles
//         while (markedPool.length >= 2) {
//             const c1 = markedPool.pop();
//             const c2 = markedPool.pop();
//             const winner = Math.random() < 0.5 ? c1 : c2;
            
//             nextMarkedPool.push(winner);
//             matches.push({ type: '1v1', p1: c1, p2: c2, winner: winner });
//             fullRecapHTML += `${c1} vs ${c2}<br>Winner: <strong>${winner}</strong><br>`;
//         }

//         // Push leftovers over if a single competitor remains in either pool
//         if (cleanPool.length === 1) {
//             let leftover = cleanPool.pop();
//             if (isMarked(leftover)) nextMarkedPool.push(leftover);
//             else nextCleanPool.push(leftover);
//         }
//         if (markedPool.length === 1) {
//             let leftover = markedPool.pop();
//             if (isMarked(leftover)) nextMarkedPool.push(leftover);
//             else nextCleanPool.push(leftover);
//         }

//         tournamentSteps.push({ name: roundName, matches: matches });
        
//         // Pass survivors onto next round and shuffle
//         cleanPool = nextCleanPool.sort(() => Math.random() - 0.5);
//         markedPool = nextMarkedPool.sort(() => Math.random() - 0.5);
//         roundNumber++;
//         fullRecapHTML += `<br>`;
//     }

//     // Final winner extraction
//     const finalChampion = cleanPool.length > 0 ? cleanPool[0] : markedPool[0];

//     tournamentSteps.push({ name: "WINNER", champion: finalChampion });
//     document.getElementById('setup-area').style.display = 'none';
//     document.getElementById('tournament-display').style.display = 'block';
//     showNextStep();
// }

// function showNextStep() {
//     const step = tournamentSteps[currentStepIndex];
//     const title = document.getElementById('roundTitle');
//     const display = document.getElementById('roundResults');
//     const btn = document.getElementById('nextStepBtn');
//     const recapBox = document.getElementById('recap-container');

//     title.innerText = step.name;
//     display.innerHTML = "";

//     if (step.champion) {
//         display.innerHTML = `<h1 style="font-size: 4rem;">🏆 ${step.champion.toUpperCase()} 🏆</h1>`;
//         recapBox.innerHTML = `
//             <details>
//                 <summary>Smackdown Recap</summary>
//                 <div class="recap-content">${fullRecapHTML}</div>
//             </details>`;
//         btn.innerText = "RESTART SIMULATOR";
//         btn.onclick = () => location.reload();
//     } else {
//         step.matches.forEach(m => {
//             let div = document.createElement('div');
//             div.className = 'match-card';
//             if (m.type === '1v1') div.innerHTML = `${m.p1} vs. ${m.p2}<br><strong>${m.winner} advances!</strong>`;
//             else if (m.type === 'triple') div.innerHTML = `<strong>3-WAY:</strong> ${m.players.join(' vs. ')}<br><strong>${m.winners.join(' & ')} advance(s)!</strong>`;
//             else div.innerHTML = `<em>${m.player} has a bye and advances!</em>`;
//             display.appendChild(div);
//         });
//         currentStepIndex++;
//         btn.innerText = currentStepIndex === tournamentSteps.length - 1 ? "THE QUEEN OF SHE DONE ALREADY DONE HAD HERSES" : "NEXT ROUND";
//     }
// }


/* --- SEASON CALCULATOR LOGIC --- */
let processedData = []; 
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function normalizeSeasonMode(mode) {
    const clean = (mode || '').trim().toLowerCase();
    if (clean === 'modern') return 'Modern';
    if (clean === 'legacy') return 'Legacy';
    if (clean === 'high stakes' || clean === 'high-stakes' || clean === 'highstakes') {
        return 'High Stakes';
    }
    return mode;
}

function getScore(ch, mode) {
    const char = ch.toLowerCase();
    if (mode === 'Modern') {
        switch(char) {
            case 'w': return 10; case 't': return 9; case 'h': return 8;
            case 's': return 5;  case 'l': return 3; case 'b': return 1;
            case 'e': return 0;  default: return null;
        }
    } if (mode === 'Legacy') {
        switch(char) {
            case 'w': return 5; case 'h': return 4; case 's': return 3;
            case 'l': return 2; case 'b': return 1; case 'e': return 0;
            case 't': return 4.5; default: return null;
        }
    }
    else {
        switch(char) {
            case 'w': return 35; case 'h': return 20; case 's': return 10;
            case 'l': return -20; case 'b': return -25; case 'e': return 0;
            case 't': return 30; default: return null;
        }
    }

}

function processSeason(mode) {
    const text = document.getElementById('seasonInput').value.trim();
    const results = document.getElementById('results');
    if(!text) return;

    const normalizedMode = normalizeSeasonMode(mode);
    const lines = text.split('\n');
    let htmlOutput = `<h5 class="text-uppercase fw-bold mb-4">Showing ${normalizedMode} Scores:</h5><div id="results-grid">`;
    processedData = [];

    lines.forEach((line, index) => {
        if(line.trim() === '' || line.toUpperCase() === 'DONE') return;
        const placements = line.trim().split(/\t| {4}/);
        let score = normalizedMode === 'High Stakes' ? 100 : 0;
        let count = 0;
        let invalids = [];

        placements.forEach(p => {
            const trimmed = p.trim();
            if (!trimmed) return;
            const val = getScore(trimmed.charAt(0), normalizedMode);
            if (val === null) invalids.push(p);
            else {
                score += val;
                count++;
            }
        });

        const ppe = count > 0 ? (score / count).toFixed(2) : "0.00";
        processedData.push(`${score}\t${ppe}`);
        htmlOutput += `
            <div class="result-row">
                <span class="col-rank">${getOrdinal(index + 1).toUpperCase()}</span>
                <span class="divider">|</span>
                <span class="col-score">SCORE: ${score}</span>
                <span class="divider">|</span>
                <span class="col-ppe">PPE: ${ppe}</span>
            </div>`;
    });
    results.innerHTML = htmlOutput + `</div>`;
}

async function copyToClipboard() {
    if(processedData.length === 0) return;
    await navigator.clipboard.writeText(processedData.join('\n'));
    const btn = document.getElementById('copyResult');
    btn.textContent = 'COPIED!';
    setTimeout(() => btn.textContent = 'COPY RESULTS', 1500);
}

/* --- MX CONGENIALITY PICKER --- */
function castVotes() {
    const input = document.getElementById('voterInput').value.trim();
    const resultsContainer = document.getElementById('results');
    let contestants = input.split('\n').map(n => n.trim()).filter(n => n !== "");

    if (contestants.length < 2) return;

    let voteTallies = {};
    let votingHistory = [];
    contestants.forEach(n => voteTallies[n.toUpperCase()] = 0);

    const biasTarget = contestants[Math.floor(Math.random() * contestants.length)].toUpperCase();

    contestants.forEach(voter => {
        const voterUpper = voter.toUpperCase();
        let targets = contestants.filter(n => n.toUpperCase() !== voterUpper);
        let voteFor = (Math.random() < 0.3 && voterUpper !== biasTarget) ? biasTarget : targets[Math.floor(Math.random() * targets.length)].toUpperCase();
        
        voteTallies[voteFor]++;
        votingHistory.push({ voter: voterUpper, target: voteFor });
    });

    let maxVotes = Math.max(...Object.values(voteTallies));
    let winners = Object.keys(voteTallies).filter(n => voteTallies[n] === maxVotes);

    let html = `
        <div class="winner-display-card p-5 mb-5 text-center shadow-sm">
            <h2 class="fw-black text-uppercase mb-3">❤️ MX CONGENIALITY ❤️</h2>
            <h3 class="display-winner">${winners.join(' & ')}</h3>
            <p class="mb-0 fw-bold voting-stats">WITH ${maxVotes} VOTES!</p>
        </div><div id="results-grid">`;

    votingHistory.forEach(r => {
        html += `
            <div class="result-row">
                <span class="col-rank text-truncate">${r.voter}</span>
                <span class="divider">|</span>
                <span class="col-score">VOTED FOR</span>
                <span class="divider">|</span>
                <span class="col-ppe text-truncate">${r.target}</span>
            </div>`;
    });
    resultsContainer.innerHTML = html + `</div>`;
}

/* --- HALL OF FAME SCRIPTS --- */
function createFameRow(data) {
    const imagePath = `images/${data.image_url}`;
    const placementHTML = data.placements.map(p => {
        let css = "p-safe";
        const cp = p.replace('*', '').toUpperCase();
        if (cp.includes("WIN")) css = "p-win";
        else if (cp.includes("HIGH")) css = "p-high";
        else if (cp.includes("LOW")) css = "p-low";
        else if (cp.includes("BTM")) css = "p-btm";
        else if (cp.includes("ELIM")) css = "p-elim";
        else if (cp.includes("TOP 2")) css = "p-top2";
        return `<span class="${css}">${p}</span>`;
    }).join('');

    return `
        <div class="fame-row">
            <div class="fame-season">${data.season}</div>
            <div class="fame-img-wrap"><img src="${imagePath}" alt="${data.name}"></div>
            <div class="fame-details">
                <div class="fame-name">${data.name.toUpperCase()}</div>
                <div class="placement-track">${placementHTML}</div>
            </div>
            <div class="fame-ppe"><small>PPE</small><div>${data.ppe}</div></div>
        </div>`;
}

/**
 * Loads and sorts Firestore data for specific divisions.
 * @param {string} targetDiv - The division to load (all, main, all_stars, spinoff)
 * @param {string} field - The database field to sort by (season, ppe)
 * @param {string} direction - Sort direction (asc, desc)
 */
async function loadHallOfFame(targetDiv = "all", field = "season", direction = "asc") {
    const db = window.db;
    const fs = window.fs; 

    if (!db || !fs) {
        setTimeout(() => loadHallOfFame(targetDiv, field, direction), 100);
        return;
    }

    try {
        const colRef = fs.collection(db, "hall_of_fame");
        let q;

        // For individual tabs, we keep the simple Firestore query
        // 1. If it's NOT the "all" tab, we filter by the specific division
        if (targetDiv !== "all") {
            q = fs.query(
                colRef, 
                fs.where("division", "array-contains", targetDiv), 
                fs.orderBy(field, direction)
            );
        } 
        // 2. If it IS the "all" tab, we just want everything sorted by the user's choice
        else {
            q = fs.query(
                colRef, 
                fs.orderBy(field, direction)
            );
        }

        const snap = await fs.getDocs(q);
        const container = document.getElementById(`content-${targetDiv}`);
        
        if (container) {
            container.innerHTML = "";
            
            // Convert Firestore docs to a standard array for JS .sort()
            let docsArray = [];
            snap.forEach(doc => docsArray.push(doc.data()));

            if (targetDiv === "all") {
                const divisionOrder = { "main": 1, "all_stars": 2, "spinoff": 3 };

                docsArray.sort((a, b) => {
                    // 1. PPE sorting still ignores divisions entirely
                    if (field === "ppe") {
                        return direction === "asc" ? a.ppe - b.ppe : b.ppe - a.ppe;
                    }

                    // 2. For Season sorting, find the "best" (lowest number) priority in the array
                    const getPriority = (divArray) => {
                        if (!Array.isArray(divArray)) return 99;
                        const priorities = divArray.map(d => divisionOrder[d] || 99);
                        return Math.min(...priorities); // Get the most "important" category
                    };

                    const priorityA = getPriority(a.division);
                    const priorityB = getPriority(b.division);

                    if (priorityA !== priorityB) {
                        return direction === "asc" ? priorityA - priorityB : priorityB - priorityA;
                    }

                    // 3. Within the same priority group, sort by Season
                    return direction === "asc" 
                        ? String(a.season).localeCompare(String(b.season), undefined, {numeric: true})
                        : String(b.season).localeCompare(String(a.season), undefined, {numeric: true});
                });
            }

            // Render the sorted results
            docsArray.forEach(data => {
                container.innerHTML += createFameRow(data);
            });
        }
    } catch (e) {
        console.error("Sorting Error:", e);
    }
}


// 1. Define the function (keep your current logic)
async function bulkUpload() {
    const db = window.db;
    const fs = window.fs;

    // Safety check: If Firebase isn't ready, wait 1 second and try again
    if (!db || !fs) {
        console.log("Firebase not ready for bulk upload, retrying in 1s...");
        setTimeout(bulkUpload, 1000);
        return;
    }

    const colRef = fs.collection(db, "hall_of_fame");
    const { addDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

    console.log("Starting upload...");

    for (const winner of winnersToUpload) {
        try {
            await addDoc(colRef, winner);
            console.log(`Successfully added: ${winner.name}`);
        } catch (e) {
            console.error(`Error adding ${winner.name}: `, e);
        }
    }
    console.log("All done!");
}

// 2. ONLY CALL IT ONCE THE WINDOW HAS LOADED
window.addEventListener('load', () => {
     //bulkUpload(); // Uncomment this line ONLY when you are ready to push the data
});


// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.querySelector('.nav-trigger');
    const content = document.querySelector('.nav-content');

    if (trigger && content) {
        trigger.addEventListener('click', () => {
            content.classList.toggle('active');
        });
    }
});

/* =========================================
   HOME PAGE RANDOM WINNER BANNER
   ========================================= */
function formatWinnerSubtitle(winner) {
    const divisions = Array.isArray(winner.division) ? winner.division : [winner.division];
    const seasonNum = winner.season;

    if (divisions.includes("all_stars")) {
        return `ALL STARS ${seasonNum} WINNER`;
    }

    if (divisions.includes("main")) {
        return `SEASON ${seasonNum} WINNER`;
    }

    return `SEASON ${seasonNum} WINNER`;
}

function resolveWinnerImage(imageUrl) {
    if (!imageUrl) return "";
    if (/^(https?:\/\/|\/|images\/)/i.test(imageUrl)) {
        return imageUrl;
    }
    return `images/${imageUrl}`;
}

async function loadRandomHomeWinner() {
    const bannerEl = document.getElementById("winner-banner");
    const imgEl = document.getElementById("winnerBannerImg");
    const nameEl = document.getElementById("winnerBannerName");
    const subtitleEl = document.getElementById("winnerBannerSubtitle");

    // Exit cleanly on pages that don't have the home banner
    if (!bannerEl || !nameEl || !subtitleEl || !imgEl) return;

    // Wait if Firebase bridge hasn't finished initializing yet
    if (!window.db || !window.fs) return;

    const { collection, query, where, getDocs } = window.fs;

    try {
        const q = query(
            collection(window.db, "hall_of_fame"),
            where("division", "array-contains-any", ["main", "all_stars"])
        );

        const snapshot = await getDocs(q);
        const eligibleWinners = [];

        snapshot.forEach((docSnap) => {
            eligibleWinners.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (eligibleWinners.length === 0) {
            nameEl.textContent = "NO WINNERS FOUND";
            subtitleEl.textContent = "";
            imgEl.style.display = "none";
            return;
        }

        const randomIndex = Math.floor(Math.random() * eligibleWinners.length);
        const chosen = eligibleWinners[randomIndex];

        nameEl.textContent = chosen.name || "UNKNOWN WINNER";
        subtitleEl.textContent = formatWinnerSubtitle(chosen);

        const resolvedSrc = resolveWinnerImage(chosen.image_url);
        if (resolvedSrc) {
            imgEl.src = resolvedSrc;
            imgEl.alt = `${chosen.name} winner portrait`;
            imgEl.style.display = "block";
        } else {
            imgEl.style.display = "none";
        }
    } catch (err) {
        console.error("Failed to load random winner banner:", err);
        nameEl.textContent = "WINNER SPOTLIGHT";
        subtitleEl.textContent = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.db && window.fs) {
        loadRandomHomeWinner();
    } else {
        window.addEventListener("firebase-ready", loadRandomHomeWinner, { once: true });
    }
});

/* =========================================
   CONTESTANT IMPORTER LOGIC
   ========================================= */
let parsedContestantsBuffer = [];

const VALID_PLACEMENTS = new Set([
    "WIN", "TOP 2", "HIGH", "SAFE", "LOW", "BTM 2", "BTM 3", "BTM 4", "ELIM", "EXT", "RUN", "QUIT", "DISQ", "ADV", "WIN + ELIM", "TOP 2 + ELIM", "HIGH + ELIM", "SAFE + ELIM", "LOW + ELIM", "BTM 2 + ELIM", "SWAP + ELIM", "RTRN", "WIN + QUIT", "WIN + BTM 2"
]);

function extractNameAndTeam(rawNameCell) {
    const trimmed = rawNameCell.trim();
    const lastChar = trimmed.slice(-1);

    if (lastChar === "'") {
        return { cleanName: trimmed.slice(0, -1).trim(), team: "Davonne" };
    }
    if (lastChar === "*") {
        return { cleanName: trimmed.slice(0, -1).trim(), team: "Robin" };
    }
    if (lastChar === "~") {
        return { cleanName: trimmed.slice(0, -1).trim(), team: "Wintour" };
    }

    return { cleanName: trimmed, team: "Jaden" };
}

function normalizeImportedRank(rawRank) {
    const cleaned = String(rawRank || "")
        .trim()
        .replace(/\s+place$/i, "")
        .replace(/\s+/g, " ");

    const lower = cleaned.toLowerCase();
    if (!lower) return "";
    if (lower === "winner" || lower === "1st") return "1st";
    if (lower === "runner-up" || lower === "runner up" || lower === "2nd") return "2nd";

    const ordinalMatch = cleaned.match(/^(\d+(?:st|nd|rd|th))(?:\b|$)/i);
    if (ordinalMatch) {
        return ordinalMatch[1].toLowerCase();
    }

    return cleaned;
}

function looksLikeRankCell(cell) {
    const v = String(cell || "").trim().toLowerCase();
    if (!v) return false;
    if (v === "winner" || v === "runner-up" || v === "runner up") return true;
    return /^\d+(?:st|nd|rd|th)?(?:\s+place)?$/i.test(v);
}

function parseSeasonSheet(rawSheet, seasonType, seasonNumber) {
    const lines = rawSheet.split("\n");
    const parsedRows = [];
    const seasonTypeLower = String(seasonType || "").trim().toLowerCase();
    const seasonFlaggedAllStars = seasonTypeLower.includes("all stars");

    lines.forEach((line) => {
        if (!line.trim()) return;

        // Split on tabs (or 2+ spaces if copied without tabs), preserving cell order
        const rawCells = line.includes("\t")
            ? line.split("\t")
            : line.trim().split(/ {2,}/);

        const nonEmptyCells = rawCells.map(c => c.trim()).filter(c => c !== "");
        if (nonEmptyCells.length < 4) return;

        // Last two non-empty cells are Points (number) and PPE (double)
        const ppe = parseFloat(nonEmptyCells[nonEmptyCells.length - 1]);
        const points = Number(nonEmptyCells[nonEmptyCells.length - 2]);

        // Detect All Stars layout (Name, ...Placements, Rank, Points, PPE)
        // vs Standard layout (Rank, Name, ...Placements, Points, PPE)
        const cellBeforePoints = nonEmptyCells[nonEmptyCells.length - 3];
        const firstCell = nonEmptyCells[0];
        const isAllStarsRow =
            seasonFlaggedAllStars ||
            (looksLikeRankCell(cellBeforePoints) && !looksLikeRankCell(firstCell));

        let rawRank = "";
        let rawName = "";
        let middleCells = [];

        if (isAllStarsRow) {
            rawName = nonEmptyCells[0];
            rawRank = cellBeforePoints;
            middleCells = nonEmptyCells.slice(1, nonEmptyCells.length - 3);
        } else {
            rawRank = firstCell;
            rawName = nonEmptyCells[1];
            middleCells = nonEmptyCells.slice(2, nonEmptyCells.length - 2);
        }

        const rank = normalizeImportedRank(rawRank);
        const { cleanName, team } = extractNameAndTeam(rawName);

        const placements = [];
        let detectedMissC = false;
        let detectedFinalist = false;
        let detectedLalaWinner = false;

        middleCells.forEach((cell) => {
            const upper = cell.toUpperCase();

            // Omit GUEST, QOSDADHH, and MISS C from placements array
            if (upper === "GUEST") return;
            if (upper === "QOSDADHH") {
                detectedLalaWinner = true;
                return;
            }
            if (upper === "MISS C") {
                detectedMissC = true;
                return;
            }

            if (VALID_PLACEMENTS.has(upper)) {
                placements.push(upper);
            }
        });

        // Pre-detect finalists: placements with RUN or ranks 1st–3rd
        if (placements.includes("RUN") || isTopThreeFinalistRank(rank)) {
            detectedFinalist = true;
        }

        // For All Stars sheets, the rank column ("Winner", "Runner-Up", "3rd Place", etc.)
        // replaces the finale WIN/ELIM column—append it so finale badges render on Records
        if (isAllStarsRow) {
            const lastPlacement = placements[placements.length - 1];
            if (rank === "1st" && lastPlacement !== "WIN") {
                placements.push("WIN");
            } else if ((rank === "2nd" || rank === "3rd") && lastPlacement !== "ELIM") {
                placements.push("ELIM");
            }
        }

        parsedRows.push({
            season_type: seasonType,
            season_number: seasonNumber,
            rank: rank,
            name: cleanName,
            contestant_team: team,
            placements: placements,
            points: isNaN(points) ? 0 : points,
            ppe: isNaN(ppe) ? 0.0 : ppe,
            miss_c: detectedMissC,
            finalist: detectedFinalist,
            lala_winner: detectedLalaWinner
        });
    });

    return parsedRows;
}

function renderContestantReviewList(contestants) {
    const listEl = document.getElementById("reviewContestantList");
    if (!listEl) return;

    listEl.innerHTML = contestants.map((c, idx) => `
        <div class="review-row">
            <div class="review-row-info">
                <span class="review-row-title">${c.rank} — ${c.name}</span>
                <span class="review-row-meta">
                    Team: <strong>${c.contestant_team}</strong> | Points: <strong>${c.points}</strong> | PPE: <strong>${c.ppe.toFixed(2)}</strong>
                </span>
            </div>
            <div class="review-row-checks">
                <label class="review-check-label">
                    <input type="checkbox" class="miss-c-checkbox" data-index="${idx}" ${c.miss_c ? "checked" : ""}>
                    <span>MISS C</span>
                </label>
                <label class="review-check-label">
                    <input type="checkbox" class="finalist-checkbox" data-index="${idx}" ${c.finalist ? "checked" : ""}>
                    <span>FINALIST</span>
                </label>
                <label class="review-check-label">
                    <input type="checkbox" class="lala-winner-checkbox" data-index="${idx}" ${c.lala_winner ? "checked" : ""}>
                    <span>QOSDADHH</span>
                </label>
            </div>
        </div>
    `).join("");
}

async function saveContestantsToFirestore(contestants) {
    const statusEl = document.getElementById("importStatusAlert");
    if (!window.db || !window.fs || !window.fs.writeBatch) {
        alert("Firebase is not ready yet. Please refresh and try again.");
        return;
    }

    const { collection, doc, writeBatch } = window.fs;

    try {
        if (statusEl) {
            statusEl.className = "mt-4 text-center fw-bold text-primary";
            statusEl.textContent = `Uploading ${contestants.length} contestants to Firestore...`;
        }

        const batch = writeBatch(window.db);
        const colRef = collection(window.db, "animated_contestants");

        contestants.forEach((contestant) => {
            const newDocRef = doc(colRef);
            batch.set(newDocRef, contestant);
        });

        await batch.commit();

        if (statusEl) {
            statusEl.className = "mt-4 text-center fw-bold text-success";
            statusEl.textContent = `Success! Added ${contestants.length} contestants (${contestants[0].season_type} Season ${contestants[0].season_number}) to animated_contestants.`;
        }

        document.getElementById("seasonSheetInput").value = "";
        parsedContestantsBuffer = [];
    } catch (err) {
        console.error("Error writing animated_contestants batch:", err);
        if (statusEl) {
            statusEl.className = "mt-4 text-center fw-bold text-danger";
            statusEl.textContent = "Failed to upload contestants. Check the console for details.";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const openReviewBtn = document.getElementById("openImportReviewBtn");
    const confirmFlagsBtn = document.getElementById("confirmFlagsBtn");
    const submitPasswordBtn = document.getElementById("submitImportPasswordBtn");
    const passwordInput = document.getElementById("adminPasswordInput");

    if (!openReviewBtn) return;

    const reviewModal = new bootstrap.Modal(document.getElementById("contestantReviewModal"));
    const passwordModal = new bootstrap.Modal(document.getElementById("passwordPromptModal"));

    // Step 1: Parse inputs & open checkbox review modal
    openReviewBtn.addEventListener("click", () => {
        const seasonType = document.getElementById("seasonTypeInput").value.trim();
        const seasonNumberRaw = document.getElementById("seasonNumberInput").value.trim();
        const rawSheet = document.getElementById("seasonSheetInput").value.trim();

        if (!seasonType || !seasonNumberRaw || !rawSheet) {
            alert("Please fill out Season Type, Season Number, and Season Sheet before clicking ADD.");
            return;
        }

        const seasonNumber = Number(seasonNumberRaw);
        if (isNaN(seasonNumber)) {
            alert("Season Number must be a valid number.");
            return;
        }

        parsedContestantsBuffer = parseSeasonSheet(rawSheet, seasonType, seasonNumber);

        if (parsedContestantsBuffer.length === 0) {
            alert("No valid contestant rows could be parsed from the Season Sheet.");
            return;
        }

        renderContestantReviewList(parsedContestantsBuffer);
        reviewModal.show();
    });

    // Step 2: Save checkbox states & open password modal
    confirmFlagsBtn.addEventListener("click", () => {
        document.querySelectorAll(".miss-c-checkbox").forEach((cb) => {
            const idx = Number(cb.dataset.index);
            if (parsedContestantsBuffer[idx]) {
                parsedContestantsBuffer[idx].miss_c = cb.checked;
            }
        });

        document.querySelectorAll(".finalist-checkbox").forEach((cb) => {
            const idx = Number(cb.dataset.index);
            if (parsedContestantsBuffer[idx]) {
                parsedContestantsBuffer[idx].finalist = cb.checked;
            }
        });

        document.querySelectorAll(".lala-winner-checkbox").forEach((cb) => {
            const idx = Number(cb.dataset.index);
            if (parsedContestantsBuffer[idx]) {
                parsedContestantsBuffer[idx].lala_winner = cb.checked;
            }
        });

        reviewModal.hide();

        const errorMsg = document.getElementById("passwordErrorMsg");
        if (errorMsg) errorMsg.style.display = "none";
        if (passwordInput) passwordInput.value = "";

        passwordModal.show();
    });

    // Step 3: Verify password & write to Firestore
    function handlePasswordSubmit() {
        const entered = passwordInput.value;
        const errorMsg = document.getElementById("passwordErrorMsg");

        if (entered !== "Addthesebitches") {
            if (errorMsg) errorMsg.style.display = "block";
            return;
        }

        if (errorMsg) errorMsg.style.display = "none";
        passwordModal.hide();
        saveContestantsToFirestore(parsedContestantsBuffer);
    }

    submitPasswordBtn.addEventListener("click", handlePasswordSubmit);

    if (passwordInput) {
        passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handlePasswordSubmit();
            }
        });
    }
});

function isTopThreeFinalistRank(normalizedRank) {
    const clean = String(normalizedRank || "").trim().toLowerCase();
    if (!clean) return false;

    if (["1st", "2nd", "3rd", "2nd/3rd"].includes(clean)) {
        return true;
    }

    const leadNumMatch = clean.match(/^(\d+)/);
    if (leadNumMatch) {
        const placeNum = Number(leadNumMatch[1]);
        return placeNum >= 1 && placeNum <= 3;
    }

    return false;
}

/* =========================================
   CONTESTANT RECORDS PAGE (animated_contestants)
   ========================================= */
let allContestantRecords = [];

let currentSortState = {
    key: "season", // "season" | "name" | "points" | "ppe"
    direction: "asc" // "asc" | "desc"
};

let recordsPaginationState = {
    currentPage: 1,
    pageSize: 50
};

const SEASON_TYPE_SORT_ORDER = [
    "Girlies",
    "All Stars",
    "Bros",
    "Bros All Stars",
    "Girlies vs. Bros",
    "Second Chance",
    "Specials"
];

function normalizeSeasonTypeLabel(seasonType) {
    const clean = String(seasonType || "").trim().toLowerCase().replace(/[_-]+/g, " ");
    if (clean === "girlies" || clean === "g") return "Girlies";
    if (clean === "bros" || clean === "b") return "Bros";
    if (clean === "all stars" || clean === "allstars" || clean === "as") return "All Stars";
    if (clean === "bros all stars" || clean === "brosallstars" || clean === "bas") return "Bros All Stars";
    if (clean === "girlies vs bros" || clean === "girlies vs. bros" || clean === "gvb") return "Girlies vs. Bros";
    if (clean === "second chance" || clean === "sc") return "Second Chance";
    if (clean === "specials" || clean === "special" || clean === "spinoff" || clean === "spin off") return "Specials";
    return String(seasonType || "").trim();
}

function getSeasonTypeSortRank(seasonType) {
    const normalized = normalizeSeasonTypeLabel(seasonType);
    const idx = SEASON_TYPE_SORT_ORDER.findIndex(
        (label) => label.toLowerCase() === normalized.toLowerCase()
    );
    return idx !== -1 ? idx : SEASON_TYPE_SORT_ORDER.length;
}

function formatSeasonTypeCode(seasonType) {
    const normalized = normalizeSeasonTypeLabel(seasonType).toLowerCase();
    if (normalized === "girlies") return "G";
    if (normalized === "bros") return "B";
    if (normalized === "all stars") return "AS";
    if (normalized === "bros all stars") return "BAS";
    if (normalized === "girlies vs. bros") return "GVB";
    if (normalized === "second chance") return "SC";
    if (normalized === "specials") return "SP";
    return normalized ? normalized.charAt(0).toUpperCase() : "G";
}

function parseRankOrder(rankValue) {
    const str = String(rankValue || "").trim().toLowerCase();
    const match = str.match(/^(\d+)/);
    if (match) {
        return Number(match[1]);
    }
    return Number.MAX_SAFE_INTEGER;
}

function compareBySeasonThenRank(a, b, seasonDir = "asc") {
    const dirMult = seasonDir === "asc" ? 1 : -1;

    // 1. Sort by Season Type priority (Girlies -> All Stars -> Bros -> Bros All Stars -> Girlies vs. Bros -> Second Chance -> Specials -> other)
    const typeRankA = getSeasonTypeSortRank(a.season_type);
    const typeRankB = getSeasonTypeSortRank(b.season_type);

    if (typeRankA !== typeRankB) {
        return (typeRankA - typeRankB) * dirMult;
    }

    // If both are in the "other" bucket, sort their type names alphabetically
    if (typeRankA === SEASON_TYPE_SORT_ORDER.length) {
        const typeCmp = normalizeSeasonTypeLabel(a.season_type).localeCompare(
            normalizeSeasonTypeLabel(b.season_type),
            undefined,
            { sensitivity: "base" }
        );
        if (typeCmp !== 0) return typeCmp * dirMult;
    }

    // 2. Then sort by Season Number within that Season Type
    const seasonA = Number(a.season_number);
    const seasonB = Number(b.season_number);
    const validSeasonA = isNaN(seasonA) ? Number.MAX_SAFE_INTEGER : seasonA;
    const validSeasonB = isNaN(seasonB) ? Number.MAX_SAFE_INTEGER : seasonB;

    if (validSeasonA !== validSeasonB) {
        return (validSeasonA - validSeasonB) * dirMult;
    }

    // 3. Then sort by Placement Rank (1st, 2nd, 3rd...)
    const rankA = parseRankOrder(a.rank);
    const rankB = parseRankOrder(b.rank);

    if (rankA !== rankB) {
        return rankA - rankB;
    }

    return String(a.rank || "").localeCompare(String(b.rank || ""), undefined, {
        numeric: true,
        sensitivity: "base"
    });
}

function sortContestantRecords(records, sortState = currentSortState) {
    const { key, direction } = sortState;
    const mult = direction === "asc" ? 1 : -1;
    const searchInput = document.getElementById("recordsSearchInput");
    const activeQuery = searchInput ? searchInput.value.trim() : "";

    return [...records].sort((a, b) => {
        if (activeQuery) {
            const exactA = isExactRankQueryMatch(a, activeQuery) ? 0 : 1;
            const exactB = isExactRankQueryMatch(b, activeQuery) ? 0 : 1;
            if (exactA !== exactB) {
                return exactA - exactB;
            }
        }

        if (key === "season") {
            return compareBySeasonThenRank(a, b, direction);
        }

        if (key === "name") {
            const nameA = String(a.name || "").trim();
            const nameB = String(b.name || "").trim();
            const cmp = nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
            if (cmp !== 0) return cmp * mult;
            return compareBySeasonThenRank(a, b, "asc");
        }

        if (key === "points") {
            const ptsA = Number(a.points);
            const ptsB = Number(b.points);
            const validA = isNaN(ptsA) ? -Infinity : ptsA;
            const validB = isNaN(ptsB) ? -Infinity : ptsB;
            if (validA !== validB) return (validA - validB) * mult;
            return compareBySeasonThenRank(a, b, "asc");
        }

        if (key === "ppe") {
            const ppeA = Number(a.ppe);
            const ppeB = Number(b.ppe);
            const validA = isNaN(ppeA) ? -Infinity : ppeA;
            const validB = isNaN(ppeB) ? -Infinity : ppeB;
            if (validA !== validB) return (validA - validB) * mult;
            return compareBySeasonThenRank(a, b, "asc");
        }

        return compareBySeasonThenRank(a, b, "asc");
    });
}

function initSortableHeaders() {
    const headerRow = document.querySelector("#records-page .records-header-row");
    if (!headerRow) return;

    const columnMap = {
        ".col-season": "season",
        ".col-name": "name",
        ".col-points": "points",
        ".col-ppe": "ppe"
    };

    Object.entries(columnMap).forEach(([selector, key]) => {
        const col = headerRow.querySelector(selector);
        if (!col) return;

        col.dataset.sortKey = key;
        col.classList.add("sortable-col");
        col.setAttribute("role", "button");
        col.setAttribute("tabindex", "0");

        if (!col.querySelector(".sort-indicator")) {
            const labelText = col.textContent.trim();
            col.innerHTML = `<span>${labelText}</span><span class="sort-indicator">⇅</span>`;
        }
    });

    document.querySelectorAll("#records-page .sortable-col").forEach((col) => {
        col.addEventListener("click", () => handleSortColumnClick(col.dataset.sortKey));
        col.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSortColumnClick(col.dataset.sortKey);
            }
        });
    });
}

function updateSortHeaderIndicators() {
    document.querySelectorAll("#records-page .sortable-col").forEach((col) => {
        const key = col.dataset.sortKey;
        const indicator = col.querySelector(".sort-indicator");
        const isActive = currentSortState.key === key;

        col.classList.toggle("active-sort", isActive);

        if (indicator) {
            if (!isActive) {
                indicator.textContent = "⇅";
            } else {
                indicator.textContent = currentSortState.direction === "asc" ? "▲" : "▼";
            }
        }
    });

    // Keep mobile sort chips in sync with currentSortState
    document.querySelectorAll("#records-page .mobile-sort-key-btn").forEach((btn) => {
        const key = btn.dataset.sortKey;
        const arrow = btn.querySelector(".mobile-key-arrow");
        const isActive = currentSortState.key === key;

        btn.classList.toggle("active", isActive);

        if (arrow) {
            if (!isActive) {
                arrow.textContent = "⇅";
            } else {
                arrow.textContent = currentSortState.direction === "asc" ? "▲" : "▼";
            }
        }
    });
}

function handleSortColumnClick(key) {
    if (!key) return;

    if (currentSortState.key === key) {
        currentSortState.direction = currentSortState.direction === "asc" ? "desc" : "asc";
    } else {
        currentSortState.key = key;
        currentSortState.direction = "asc";
    }

    recordsPaginationState.currentPage = 1;
    updateSortHeaderIndicators();
    applyRecordsSearchAndFilters();
}

function hasQosdadhhTitle(contestant) {
    if (!contestant || typeof contestant !== "object") return false;
    return contestant.lala_winner === true;
}

function getRecordsRowClass(contestant) {
    const rankClean = String(contestant.rank || "").trim().toLowerCase();
    const isMissC = Boolean(contestant.miss_c);
    const isFinalist = Boolean(contestant.finalist);
    const isQosdadhh = hasQosdadhhTitle(contestant);

    const isWinner = rankClean === "1st";
    const isRunnerUp = rankClean === "2nd" || rankClean === "2nd/3rd";

    if (isWinner && isMissC) return "row-rose-gold";
    if (isRunnerUp && isMissC) return "row-pink-gray";
    if (isQosdadhh) return "row-green-blue";
    if (isWinner) return "row-gold";
    if (isRunnerUp) return "row-silver";
    if (isMissC) return "row-pink";
    if (isFinalist) return "row-bronze";

    return "row-default";
}

function getPlacementBadgeClass(placement, contestant = {}, index = 0, total = 0) {
    const p = String(placement || "").trim().toUpperCase();
    const isLast = total > 0 && index === total - 1;
    const rankClean = String(contestant.rank || "").trim().toLowerCase();
    const isFinalist = Boolean(contestant.finalist);

    if (isLast) {
        if (p === "WIN" && rankClean === "1st") {
            return "placement-gold-win";
        }
        if (p === "ELIM" && rankClean === "2nd") {
            return "placement-silver-elim";
        }
        if (p === "ELIM" && isFinalist && (rankClean === "3rd" || rankClean === "4th")) {
            return "placement-bronze-elim";
        }
    }

    if (p === "WIN") return "placement-win";
    if (p === "TOP 2") return "placement-top2";
    if (p === "HIGH") return "placement-high";
    if (p === "SAFE") return "placement-safe";
    if (p === "LOW") return "placement-low";
    if (p === "BTM 2" || p === "BTM 3" || p === "BTM 4" || p === "BTM 5" || p === "BTM 6") return "placement-btm";
    if (p === "ELIM") return "placement-elim";
    if (p === "RUN") return "placement-run";
    if (p === "QUIT") return "placement-quit";
    if (p === "RTRN") return "placement-rtrn";
    if (p === "DISQ") return "placement-disq";
    return "placement-default";
}

function isExactRankQueryMatch(contestant, rawQuery) {
    const q = String(rawQuery || "").trim().toLowerCase().replace(/\s+place$/i, "");
    if (!q) return false;

    const rawRank = String(contestant.rank || "").trim().toLowerCase();
    const normalizedRank = rawRank.replace(/\s+place$/i, "").trim();
    const rankNumOnly = normalizedRank.replace(/(st|nd|rd|th)$/i, "");

    const exactAliases = new Set([
        rawRank,
        normalizedRank,
        rankNumOnly,
        normalizedRank === "1st" ? "winner" : "",
        normalizedRank === "2nd" ? "runner-up" : "",
        normalizedRank === "2nd" ? "runner up" : ""
    ].filter(Boolean));

    // If user typed a pure number like "4", match rank "4th" (rankNumOnly === "4")
    // without letting "14th" (rankNumOnly === "14") match
    return exactAliases.has(q);
}

function matchesSearchQuery(contestant, rawQuery) {
    const q = String(rawQuery || "").trim().toLowerCase();
    if (!q) return true;

    if (isExactRankQueryMatch(contestant, q)) {
        return true;
    }

    const name = String(contestant.name || "").toLowerCase();
    const rawType = String(contestant.season_type || "").toLowerCase();
    const normalizedType = normalizeSeasonTypeLabel(contestant.season_type).toLowerCase();
    const code = formatSeasonTypeCode(contestant.season_type).toLowerCase();
    const seasonNum = String(contestant.season_number ?? "").toLowerCase();

    const fullSeasonLabel = `${normalizedType} ${seasonNum}`.trim();
    const compactSeasonLabel = `${code}${seasonNum}`.trim();
    const spacedCodeLabel = `${code} ${seasonNum}`.trim();
    const rawSeasonLabel = `${rawType} ${seasonNum}`.trim();

    return (
        name.includes(q) ||
        normalizedType.includes(q) ||
        rawType.includes(q) ||
        seasonNum === q ||
        fullSeasonLabel.includes(q) ||
        compactSeasonLabel.includes(q) ||
        spacedCodeLabel.includes(q) ||
        rawSeasonLabel.includes(q)
    );
}

function getSelectedFilters() {
    const selected = {
        seasonType: [],
        rank: [],
        title: [],
        team: []
    };

    document.querySelectorAll(".record-filter-cb:checked").forEach((cb) => {
        const group = cb.dataset.group;
        if (selected[group]) {
            selected[group].push(cb.value);
        }
    });

    return selected;
}

function matchesChecklistFilters(contestant, filters) {
    const rankClean = String(contestant.rank || "").trim().toLowerCase();
    const isWinner = rankClean === "1st";
    const isRunnerUp = rankClean === "2nd" || rankClean === "2nd/3rd";
    const isFinalist = Boolean(contestant.finalist);
    const isMissC = Boolean(contestant.miss_c);
    const isQosdadhh = hasQosdadhhTitle(contestant);
    const contestantType = normalizeSeasonTypeLabel(contestant.season_type);
    const contestantTeam = String(contestant.contestant_team || "").trim().toLowerCase();

    if (filters.seasonType.length > 0) {
        const matchType = filters.seasonType.some(
            (val) => normalizeSeasonTypeLabel(val).toLowerCase() === contestantType.toLowerCase()
        );
        if (!matchType) return false;
    }

    if (filters.rank.length > 0) {
        const matchRank = filters.rank.some((val) => {
            if (val === "Winner") return isWinner;
            if (val === "Runner Up's") return isRunnerUp;
            if (val === "Finalists") return isFinalist;
            return false;
        });
        if (!matchRank) return false;
    }

    if (filters.title.length > 0) {
        const matchTitle = filters.title.some((val) => {
            if (val === "Winner") return isWinner;
            if (val === "Miss Congeniality") return isMissC;
            if (val === "QOSDADHH") return isQosdadhh;
            return false;
        });
        if (!matchTitle) return false;
    }

    if (filters.team.length > 0) {
        const matchTeam = filters.team.some((val) => val.toLowerCase() === contestantTeam);
        if (!matchTeam) return false;
    }

    return true;
}

function applyRecordsSearchAndFilters(resetPage = false) {
    if (resetPage) {
        recordsPaginationState.currentPage = 1;
    }

    const searchInput = document.getElementById("recordsSearchInput");
    const queryText = searchInput ? searchInput.value : "";
    const activeFilters = getSelectedFilters();

    const filtered = allContestantRecords.filter(
        (c) => matchesSearchQuery(c, queryText) && matchesChecklistFilters(c, activeFilters)
    );

    renderContestantRecords(filtered, allContestantRecords.length > 0);
}

function renderContestantRecords(records, hasAnyLoaded = false) {
    const container = document.getElementById("recordsListContainer");
    if (!container) return;

    if (!records || records.length === 0) {
        updatePaginationBar(0, 1, 0, 0);
        const message = hasAnyLoaded
            ? "No matching contestants found."
            : "No contestants found in animated_contestants.";
        container.innerHTML = `<div class="records-empty-state">${message}</div>`;
        return;
    }

    const sortedRecords = sortContestantRecords(records, currentSortState);
    const pageSize = recordsPaginationState.pageSize || 50;
    const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));

    if (recordsPaginationState.currentPage > totalPages) {
        recordsPaginationState.currentPage = totalPages;
    }

    const startIndex = (recordsPaginationState.currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, sortedRecords.length);
    const pageRecords = sortedRecords.slice(startIndex, endIndex);

    updatePaginationBar(sortedRecords.length, totalPages, startIndex, endIndex);

    container.innerHTML = pageRecords.map((c) => {
        const rowClass = getRecordsRowClass(c);
        const typeCode = formatSeasonTypeCode(c.season_type);
        const seasonNum = c.season_number ?? "";
        const rankText = c.rank ?? "";
        const nameText = c.name ?? "";
        const pointsText = c.points ?? 0;
        const ppeNum = Number(c.ppe);
        const ppeText = !isNaN(ppeNum) ? ppeNum.toFixed(2) : "0.00";

        const placementsArr = Array.isArray(c.placements) ? c.placements : [];
        const placementsHtml = placementsArr
            .map((pl, idx) => (
                `<span class="placement-badge ${getPlacementBadgeClass(pl, c, idx, placementsArr.length)}">${pl}</span>`
            ))
            .join("");

        return `
            <div class="contestant-record-row ${rowClass}">
                <div class="rec-season">
                    <span class="season-type-tag">${typeCode}</span>
                    <span>${seasonNum}</span>
                </div>
                <div class="rec-rank">${rankText}</div>
                <div class="rec-name">${nameText}</div>
                <div class="rec-placements">${placementsHtml}</div>
                <div class="rec-points">${pointsText}</div>
                <div class="rec-ppe">${ppeText}</div>
            </div>
        `;
    }).join("");
}

function updatePaginationBar(totalFiltered, totalPages, startIndex, endIndex) {
    const bar = document.getElementById("recordsPaginationBar");
    const infoEl = document.getElementById("recordsPageInfo");
    const indicatorEl = document.getElementById("recordsPageIndicator");
    const prevBtn = document.getElementById("recordsPrevPageBtn");
    const nextBtn = document.getElementById("recordsNextPageBtn");

    if (!bar) return;

    if (totalFiltered === 0) {
        bar.style.display = "none";
        return;
    }

    bar.style.display = "flex";

    if (infoEl) {
        infoEl.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalFiltered}`;
    }
    if (indicatorEl) {
        indicatorEl.textContent = `${recordsPaginationState.currentPage} / ${totalPages}`;
    }
    if (prevBtn) {
        prevBtn.disabled = recordsPaginationState.currentPage <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = recordsPaginationState.currentPage >= totalPages;
    }
}

async function loadAnimatedContestants() {
    const container = document.getElementById("recordsListContainer");
    if (!container) return;

    if (!window.db || !window.fs) return;

    const { collection, getDocs } = window.fs;

    let records = [];
    try {
        const snapshot = await getDocs(collection(window.db, "animated_contestants"));
        snapshot.forEach((docSnap) => {
            records.push({ id: docSnap.id, ...docSnap.data() });
        });
    } catch (err) {
        console.error("Failed to fetch animated_contestants:", err);
        container.innerHTML = `<div class="records-empty-state text-danger">Error loading records from Firestore.</div>`;
        return;
    }

    allContestantRecords = records;
    applyRecordsSearchAndFilters(true);
}

document.addEventListener("DOMContentLoaded", () => {
    const recordsContainer = document.getElementById("recordsListContainer");
    const filterBtn = document.getElementById("recordsFilterBtn");
    const filterPanel = document.getElementById("recordsFilterPanel");
    const searchInput = document.getElementById("recordsSearchInput");
    const clearFiltersBtn = document.getElementById("clearRecordsFiltersBtn");
    const mobileSortToggleBtn = document.getElementById("mobileSortToggleBtn");
    const mobileSortBar = document.getElementById("mobileSortBar");
    const pageSizeSelect = document.getElementById("recordsPageSizeSelect");
    const prevPageBtn = document.getElementById("recordsPrevPageBtn");
    const nextPageBtn = document.getElementById("recordsNextPageBtn");

    if (mobileSortToggleBtn && mobileSortBar) {
        mobileSortToggleBtn.addEventListener("click", () => {
            const isHidden = mobileSortBar.style.display === "none";
            mobileSortBar.style.display = isHidden ? "block" : "none";
        });
    }

    if (recordsContainer) {
        initSortableHeaders();
        updateSortHeaderIndicators();
    }

    if (filterBtn && filterPanel) {
        filterBtn.addEventListener("click", () => {
            const isHidden = filterPanel.style.display === "none";
            filterPanel.style.display = isHidden ? "block" : "none";
        });
    }

    document.querySelectorAll("#records-page .mobile-sort-key-btn").forEach((btn) => {
        btn.addEventListener("click", () => handleSortColumnClick(btn.dataset.sortKey));
    });

    if (pageSizeSelect) {
        pageSizeSelect.addEventListener("change", () => {
            const parsedSize = Number(pageSizeSelect.value);
            recordsPaginationState.pageSize = [50, 100, 250].includes(parsedSize) ? parsedSize : 50;
            recordsPaginationState.currentPage = 1;
            applyRecordsSearchAndFilters();
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
            if (recordsPaginationState.currentPage > 1) {
                recordsPaginationState.currentPage -= 1;
                applyRecordsSearchAndFilters();
                recordsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
            recordsPaginationState.currentPage += 1;
            applyRecordsSearchAndFilters();
            recordsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => applyRecordsSearchAndFilters(true));
    }

    document.querySelectorAll(".record-filter-cb").forEach((cb) => {
        cb.addEventListener("change", () => applyRecordsSearchAndFilters(true));
    });

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            document.querySelectorAll(".record-filter-cb").forEach((cb) => {
                cb.checked = false;
            });
            applyRecordsSearchAndFilters(true);
        });
    }

    if (recordsContainer) {
        if (window.db && window.fs) {
            loadAnimatedContestants();
        } else {
            window.addEventListener("firebase-ready", loadAnimatedContestants, { once: true });
        }
    }
});