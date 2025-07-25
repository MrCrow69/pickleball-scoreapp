document.addEventListener('DOMContentLoaded', () => {
  const score1 = document.getElementById('score1');
  const score2 = document.getElementById('score2');

  document.getElementById('increaseA').onclick = () => {
    score1.textContent = parseInt(score1.textContent) + 1;
  };
  document.getElementById('decreaseA').onclick = () => {
    let val = parseInt(score1.textContent);
    if (val > 0) score1.textContent = val - 1;
  };
  document.getElementById('increaseB').onclick = () => {
    score2.textContent = parseInt(score2.textContent) + 1;
  };
  document.getElementById('decreaseB').onclick = () => {
    let val = parseInt(score2.textContent);
    if (val > 0) score2.textContent = val - 1;
  };

  const qrBtn = document.getElementById('showQR');
  const qrPopup = document.getElementById('qr-popup');
  const qrClose = document.getElementById('closeQR');

  qrBtn.addEventListener('click', () => {
    const teamA = document.getElementById('player1Name').value || 'Team A';
    const teamB = document.getElementById('player2Name').value || 'Team B';
    const aScore = score1.textContent;
    const bScore = score2.textContent;

    const summary = `${teamA} vs ${teamB}\nScore: ${aScore} - ${bScore}`;
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
      text: summary,
      width: 200,
      height: 200
    });

    qrPopup.style.display = 'block';
  });

  qrClose.addEventListener('click', () => {
    qrPopup.style.display = 'none';
  });
});
