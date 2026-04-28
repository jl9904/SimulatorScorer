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

/* --- SEASON CALCULATOR LOGIC --- */
let processedData = []; 
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getScore(ch, mode) {
    const char = ch.toLowerCase();
    if (mode === 'Modern') {
        switch(char) {
            case 'w': return 10; case 't': return 9; case 'h': return 8;
            case 's': return 5;  case 'l': return 3; case 'b': return 1;
            case 'e': return 0;  default: return null;
        }
    } else {
        switch(char) {
            case 'w': return 5; case 'h': return 4; case 's': return 3;
            case 'l': return 2; case 'b': return 1; case 'e': return 0;
            case 't': return 4.5; default: return null;
        }
    }
}

function processSeason(mode) {
    const text = document.getElementById('seasonInput').value.trim();
    const results = document.getElementById('results');
    if(!text) return;

    const lines = text.split('\n');
    let htmlOutput = `<h5 class="text-uppercase fw-bold mb-4">Showing ${mode} Scores:</h5><div id="results-grid">`;
    processedData = []; 

    lines.forEach((line, index) => {
        if(line.trim() === '' || line.toUpperCase() === 'DONE') return;
        const placements = line.trim().split(/\t| {4}/);
        let score = 0, count = 0, invalids = [];

        placements.forEach(p => {
            const val = getScore(p.trim().charAt(0), mode);
            if(val === null) invalids.push(p);
            else { score += val; count++; }
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

/* --- MISS CONGENIALITY PICKER --- */
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
            <h2 class="fw-black text-uppercase mb-3">👑 MISS CONGENIALITY 👑</h2>
            <h1 class="display-winner">${winners.join(' & ')}</h1>
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

const winnersToUpload = [
    {
        name: "Star Sapphire",
        season: 15,
        ppe: 6.29,
        division: ["main"],
        image_url: "stars.png",
        placements: ["HIGH", "SAFE", "WIN", "SAFE", "SAFE", "SAFE", "SAFE", "SAFE", "BTM 2", "LOW", "WIN", "HIGH", "WIN", "HIGH*"]
    },
    {
        name: "She-Ra",
        season: "V1",
        ppe: 7.00,
        division: ["spinoff", "all_stars"],
        image_url: "shera.png",
        placements: ["SAFE", "SAFE", "WIN", "HIGH", "BTM 2", "WIN", "WIN"]
    }

];

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
