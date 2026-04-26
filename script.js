let tournamentSteps = [];
let currentStepIndex = 0;
let fullRecapHTML = ""; // Stores the entire history

function generateTournament() {
    const input = document.getElementById('contestantInput').value;
    let contestants = input.split('\n').map(name => name.trim()).filter(name => name !== "");

    if (contestants.length < 2) {
        alert("Please enter at least 2 contestants!");
        return;
    }

    // Reset everything
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

        // Round 1 Triple Threat
        if (roundNumber === 1 && pool.length % 2 !== 0) {
            const c = [pool.pop(), pool.pop(), pool.pop()];
            const winCount = (((pool.length / 2) + 1) % 2 === 0) ? 1 : 2;
            const shuffled = [...c].sort(() => Math.random() - 0.5);
            const matchWinners = shuffled.slice(0, winCount);
            
            winners.push(...matchWinners);
            matches.push({ type: 'triple', players: c, winners: matchWinners });
            fullRecapHTML += `3-Way: ${c.join(' vs ')}<br>Winners: <strong>${matchWinners.join(' & ')}</strong><br>`;
        } 
        // Bye Logic
        else if (pool.length % 2 !== 0) {
            const luckyOne = pool.pop();
            winners.push(luckyOne);
            matches.push({ type: 'bye', player: luckyOne });
            fullRecapHTML += `${luckyOne} had a bye.<br>`;
        }

        // Standard 1v1
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
    document.getElementById('recap-container').innerHTML = ""; // Clear old recaps
    showNextStep();
}

function showNextStep() {
    const step = tournamentSteps[currentStepIndex];
    const title = document.getElementById('roundTitle');
    const display = document.getElementById('roundResults');
    const btn = document.getElementById('nextStepBtn');
    const recapBox = document.getElementById('recap-container');

    title.innerText = step.name;
    display.innerHTML = "";

    if (step.champion) {
        display.innerHTML = `<h1 style="font-size: 4rem;">🏆 ${step.champion.toUpperCase()} 🏆</h1>`;
        
        // Show the Recap Dropdown
        recapBox.innerHTML = `
            <details>
                <summary>Smackdown Recap</summary>
                <div class="recap-content">${fullRecapHTML}</div>
            </details>
        `;

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

// Attach listener to button
document.addEventListener("DOMContentLoaded", () => {
    const nextBtn = document.getElementById('nextStepBtn');
    if (nextBtn) {
        nextBtn.addEventListener("click", showNextStep);
    }
});

let processedData = []; 
let lastMode = "Modern"; // Track which mode was used for the copy header

// Helper for 1st, 2nd, etc.
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Scoring Logic
function getScore(ch, mode) {
    const char = ch.toLowerCase();
    if (mode === 'Modern') {
        switch(char) {
            case 'w': return 10; case 't': return 9; case 'h': return 8;
            case 's': return 5;  case 'l': return 3; case 'b': return 1;
            case 'e': return 0;  default: return null;
        }
    } else {
        // LEGACY SCORING
        switch(char) {
            case 'w': return 5; case 'h': return 4; case 's': return 3;
            case 'l': return 2; case 'b': return 1; case 'e': return 0;
            case 't': return 4.5; // Assuming TOP2 acts like HIGH in legacy
            default: return null;
        }
    }
}

function processSeason(mode) {
    const text = document.getElementById('seasonInput').value.trim();
    const results = document.getElementById('results');
    if(!text) { 
        results.innerHTML = '<em>No input provided.</em>'; 
        return; 
    }

    lastMode = mode;
    const lines = text.split('\n');
    
    // Header for the output section
    let htmlOutput = `
        <h5 class="text-uppercase fw-bold mb-4">Showing ${mode} Scores:</h5>
        <div id="results-grid">`; // Start of the unified grid

    processedData = []; 

    lines.forEach((line, index) => {
        if(line.trim() === '' || line.toUpperCase() === 'DONE') return;

        const placements = line.trim().split(/\t| {4}/);
        let score = 0;
        let count = 0;
        let invalids = [];

        placements.forEach(p => {
            const clean = p.trim();
            if(!clean) return;
            
            const val = getScore(clean.charAt(0), mode);
            if(val === null) {
                invalids.push(clean);
            } else {
                score += val;
                count++;
            }
        });

        const ppe = count > 0 ? (score / count).toFixed(2) : "0.00";
        const ordinalPlace = getOrdinal(index + 1).toUpperCase();
        
        processedData.push(`${score}\t${ppe}`);

        // The row structure
        htmlOutput += `
            <div class="result-row">
                <span class="col-rank">${ordinalPlace}</span>
                <span class="divider">|</span>
                <span class="col-score">SCORE: ${score}</span>
                <span class="divider">|</span>
                <span class="col-ppe">PPE: ${ppe}</span>
                ${invalids.length ? `<span class="divider">|</span><span class="text-danger small">INVALID: ${invalids.join(',')}</span>` : ''}
            </div>`;
    });

    htmlOutput += `</div>`; // End of the grid
    results.innerHTML = htmlOutput;
}

// Event Listeners
document.getElementById('processModern').addEventListener('click', () => processSeason('Modern'));
document.getElementById('processLegacy').addEventListener('click', () => processSeason('Legacy'));

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('seasonInput').value = '';
    document.getElementById('results').innerHTML = '';
    processedData = [];
});

document.getElementById('copyResult').addEventListener('click', async () => {
    if(processedData.length === 0) return;
    try {
        await navigator.clipboard.writeText(processedData.join('\n'));
        const btn = document.getElementById('copyResult');
        btn.textContent = 'COPIED!';
        setTimeout(() => btn.textContent = 'COPY RESULTS', 1500);
    } catch (e) {
        alert('COPY FAILED');
    }
});

// MISS C PICKER
function castVotes() {
    const input = document.getElementById('voterInput').value.trim();
    const resultsContainer = document.getElementById('results');
    
    let contestants = input.split('\n')
        .map(name => name.trim())
        .filter(name => name !== "");

    if (contestants.length < 2) {
        alert("You need at least 2 people to cast votes!");
        return;
    }

    let voteTallies = {}; 
    let votingHistory = []; 
    
    // Initialize tallies
    contestants.forEach(name => voteTallies[name.toUpperCase()] = 0);

    // ANTI-TIE LOGIC: Pick one random contestant to have a 'bias' weight
    const biasTarget = contestants[Math.floor(Math.random() * contestants.length)].toUpperCase();

    // Perform Voting Logic
    contestants.forEach(voter => {
        const voterUpper = voter.toUpperCase();
        let possibleTargets = contestants.filter(name => name.toUpperCase() !== voterUpper);
        
        let voteFor;
        
        // 30% chance to force the vote toward the biasTarget (if they aren't the current voter)
        if (Math.random() < 0.30 && voterUpper !== biasTarget) {
            voteFor = biasTarget;
        } else {
            // Otherwise, pick completely at random
            voteFor = possibleTargets[Math.floor(Math.random() * possibleTargets.length)].toUpperCase();
        }
        
        voteTallies[voteFor]++;
        votingHistory.push({
            voter: voterUpper,
            target: voteFor
        });
    });

    // Determine Winner(s)
    let maxVotes = 0;
    for (let name in voteTallies) {
        if (voteTallies[name] > maxVotes) maxVotes = voteTallies[name];
    }

    let winners = Object.keys(voteTallies).filter(name => voteTallies[name] === maxVotes);

    // Generate Output HTML
    let htmlOutput = `
        <div class="winner-display-card p-5 mb-5 text-center shadow-sm">
            <h2 class="fw-black text-uppercase mb-3">👑 MISS CONGENIALITY 👑</h2>
            <h1 class="display-winner">${winners.join(' & ')}</h1>
            <p class="mb-0 fw-bold voting-stats">WITH ${maxVotes} VOTES!</p>
        </div>
        <div id="results-grid">`;

    votingHistory.forEach(record => {
        htmlOutput += `
            <div class="result-row">
                <span class="col-rank text-truncate">${record.voter}</span>
                <span class="divider">|</span>
                <span class="col-score">VOTED FOR</span>
                <span class="divider">|</span>
                <span class="col-ppe text-truncate">${record.target}</span>
            </div>`;
    });

    htmlOutput += `</div>`;
    resultsContainer.innerHTML = htmlOutput;
}



