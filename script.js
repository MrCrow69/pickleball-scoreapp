let pointTimeline = [];
let startTime = Date.now();

function formatGameDuration() {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function generateMatchSummary() {
  const teamA = document.getElementById('teamA-name').value || 'Team A';
  const teamB = document.getElementById('teamB-name').value || 'Team B';
  const scoreA = parseInt(document.getElementById('scoreA').innerText) || 0;
  const scoreB = parseInt(document.getElementById('scoreB').innerText) || 0;
  const duration = formatGameDuration();
  const winner = scoreA > scoreB ? teamA : scoreB > scoreA ? teamB : 'Draw';

  const timeline = pointTimeline
    .map(p => `• ${p.score} at ${p.time}`)
    .join('\n');

  return `${teamA} vs ${teamB}
Winner: ${winner}
Final Score: ${scoreA} - ${scoreB}
Game Duration: ${duration}

Timeline:
${timeline}`;
}

// QR Code button behavior
document.getElementById('qr-btn').addEventListener('click', () => {
  const matchSummary = generateMatchSummary();
  const qrPopup = document.getElementById('qr-popup');
  qrPopup.classList.add('show');
  document.getElementById('qrcode').innerHTML = '';
  new QRCode(document.getElementById('qrcode'), {
    text: matchSummary,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
});

// Close QR manually
document.getElementById('close-qr').addEventListener('click', () => {
  document.getElementById('qr-popup').classList.remove('show');
});

// Auto close QR when clicking outside
window.addEventListener('click', function(e) {
  const qrPopup = document.getElementById('qr-popup');
  const qrBtn = document.getElementById('qr-btn');
  if (!qrPopup.contains(e.target) && !qrBtn.contains(e.target)) {
    qrPopup.classList.remove('show');
  }
});

// Score click logging
function updateScore(team) {
  const el = document.getElementById(`score${team}`);
  const scoreA = document.getElementById('scoreA').innerText;
  const scoreB = document.getElementById('scoreB').innerText;
  el.innerText = parseInt(el.innerText) + 1;
  const updatedScore = `${document.getElementById('scoreA').innerText} - ${document.getElementById('scoreB').innerText}`;
  pointTimeline.push({ score: updatedScore, time: formatGameDuration() });
}

document.getElementById('scoreA').addEventListener('click', () => updateScore('A'));
document.getElementById('scoreB').addEventListener('click', () => updateScore('B'));
