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
    if(!text) { results.innerHTML = '<em>No input provided.</em>'; return; }

    lastMode = mode;
    const lines = text.split('\n');
    let htmlOutput = `<strong>Showing ${mode} Scores:</strong><br><br>`;
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
        const ordinalPlace = getOrdinal(index + 1);
        
        processedData.push(`${score}\t${ppe}`);

        htmlOutput += `<div class="result-entry">
            <strong>${ordinalPlace}</strong> | Score: ${score} | PPE: ${ppe}
            ${invalids.length ? `<span class="invalid"> | (Invalid: ${invalids.join(',')})</span>` : ''}
        </div>`;
    });

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
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy Results', 1500);
    } catch (e) {
        alert('Copy failed');
    }
});