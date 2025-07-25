(() => {
      // Globals
      const app = document.getElementById('app');
      const sideA = document.getElementById('sideA');
      const sideB = document.getElementById('sideB');

      // Scores and elements
      const scoreA = document.getElementById('scoreA');
      const scoreB = document.getElementById('scoreB');
      const teamAName = document.getElementById('teamAName');
      const teamBName = document.getElementById('teamBName');

      // Buttons
      const btnAPlus = document.getElementById('btnAPlus');
      const btnAMinus = document.getElementById('btnAMinus');
      const btnBPlus = document.getElementById('btnBPlus');
      const btnBMinus = document.getElementById('btnBMinus');

      // Server selects
      const serverA = document.getElementById('serverA');
      const serverB = document.getElementById('serverB');

      // Layout
      const btnLayout = document.getElementById('btnLayout');
      const layoutIcon = document.getElementById('layoutIcon');

      // Reset
      const btnReset = document.getElementById('btnReset');

      // Color pickers
      const colorBtnA = document.getElementById('colorBtnA');
      const colorBtnB = document.getElementById('colorBtnB');
      const pickerA = document.getElementById('pickerA');
      const pickerB = document.getElementById('pickerB');
      const pickerCloseA = document.getElementById('pickerCloseA');
      const pickerCloseB = document.getElementById('pickerCloseB');
      const hueA = document.getElementById('hueA');
      const hueB = document.getElementById('hueB');
      const slA = document.getElementById('slA');
      const slB = document.getElementById('slB');
      const slCursorA = document.getElementById('slCursorA');
      const slCursorB = document.getElementById('slCursorB');
      const hexInputA = document.getElementById('hexInputA');
      const hexInputB = document.getElementById('hexInputB');

      // QR Code
      const btnQR = document.getElementById('btnQR');
      const qrContainer = document.getElementById('qrContainer');
      const qrCloseBtn = document.getElementById('qrCloseBtn');
      const qrCanvas = document.getElementById('qrCanvas');

      // Timer controls
      const timerToggleBtn = document.getElementById('timerToggleBtn');
      const timerControls = document.getElementById('timerControls');
      const timerStart = document.getElementById('timerStart');
      const timerPause = document.getElementById('timerPause');
      const timerReset = document.getElementById('timerReset');

      // Score state
      let scoreValueA = 0;
      let scoreValueB = 0;

      // Timer state
      let timerRunning = false;
      let timerInterval = null;
      let timerSeconds = 0;

      // Layout state
      let layoutVertical = false;

      // Color Picker state (Hue/Sat/Light)
      // Using HSL representation for team backgrounds
      let colorA = { h: 230, s: 80, l: 20 };
      let colorB = { h: 210, s: 70, l: 30 };

      // Utility: HSL to Hex converter
      function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
          l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return "#" + [f(0), f(8), f(4)].map(x => {
          const hex = Math.round(x * 255).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        }).join("");
      }

      // Utility: Hex to HSL converter
      function hexToHsl(H) {
        let r = 0, g = 0, b = 0;
        if (H.length === 4) {
          r = parseInt("0x" + H[1] + H[1]);
          g = parseInt("0x" + H[2] + H[2]);
          b = parseInt("0x" + H[3] + H[3]);
        } else if (H.length === 7) {
          r = parseInt(H.substring(1, 3), 16);
          g = parseInt(H.substring(3, 5), 16);
          b = parseInt(H.substring(5, 7), 16);
        }
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
          }
          h *= 60;
        }
        return { h, s: s * 100, l: l * 100 };
      }

      // Update team background colors from HSL state
      function updateTeamColors() {
        const hexA = hslToHex(colorA.h, colorA.s, colorA.l);
        const hexB = hslToHex(colorB.h, colorB.s, colorB.l);
        sideA.style.backgroundColor = hexA;
        sideB.style.backgroundColor = hexB;
        hexInputA.value = hexA;
        hexInputB.value = hexB;
      }

      // Update hue slider background based on current HSL hue
      function updateHueSlider(hueSlider, h) {
        // hue slider uses fixed rainbow gradient, no dynamic update needed
      }

      // Update SL picker background color (hue base)
      function updateSLBackground(slPicker, h) {
        slPicker.style.backgroundColor = `hsl(${h}, 100%, 50%)`;
      }

      // Move SL cursor based on s, l percentages
      function updateSLCursor(slCursor, s, l) {
        const x = s * 2.8; // 280px width scale, relative to sl picker width 280px
        const y = 160 - l * 1.6; // 160px height scale (inverted Y)
        slCursor.style.left = `${x}px`;
        slCursor.style.top = `${y}px`;
      }

      // Convert click position inside SL picker to s, l percentages
      function slPosToSL(x, y, el) {
        const rect = el.getBoundingClientRect();
        const s = Math.min(Math.max((x - rect.left) / rect.width, 0), 1);
        const l = 1 - Math.min(Math.max((y - rect.top) / rect.height, 0), 1);
        return { s: s * 100, l: l * 100 };
      }

      // Sync color picker UI for team
      function syncColorPicker(team) {
        const color = team === 'A' ? colorA : colorB;
        const hueSlider = team === 'A' ? hueA : hueB;
        const slPicker = team === 'A' ? slA : slB;
        const slCursor = team === 'A' ? slCursorA : slCursorB;
        updateSLBackground(slPicker, color.h);
        updateSLCursor(slCursor, color.s * 2.8 / 100, color.l * 1.6 / 100);
        // hue slider is static rainbow; no dynamic cursor needed
      }

      // Show/hide pickers
      function openPicker(team) {
        if (team === 'A') {
          pickerA.classList.add('open');
          pickerB.classList.remove('open');
        } else {
          pickerB.classList.add('open');
          pickerA.classList.remove('open');
        }
      }
      function closePickers() {
        pickerA.classList.remove('open');
        pickerB.classList.remove('open');
      }

      // Outside click to close picker
      document.addEventListener('mousedown', (e) => {
        if (!pickerA.contains(e.target) && !colorBtnA.contains(e.target)) {
          pickerA.classList.remove('open');
        }
        if (!pickerB.contains(e.target) && !colorBtnB.contains(e.target)) {
          pickerB.classList.remove('open');
        }
      });

      // Color picker event handlers
      function setupColorPicker(team) {
        const hueSlider = team === 'A' ? hueA : hueB;
        const slPicker = team === 'A' ? slA : slB;
        const slCursor = team === 'A' ? slCursorA : slCursorB;
        const hexInput = team === 'A' ? hexInputA : hexInputB;
        let color = team === 'A' ? colorA : colorB;

        // On hue click or drag
        function onHueChange(e) {
          e.preventDefault();
          const rect = hueSlider.getBoundingClientRect();
          const x = e.touches ? e.touches[0].clientX : e.clientX;
          let percent = Math.min(Math.max(x - rect.left, 0), rect.width) / rect.width;
          color.h = Math.round(percent * 360);
          if (color.h > 359) color.h = 359;
          updateSLBackground(slPicker, color.h);
          if (team === 'A') colorA = color; else colorB = color;
          updateTeamColors();
          syncColorPicker(team);
        }

        // On SL click or drag
        function onSLChange(e) {
          e.preventDefault();
          const pos = slPosToSL(e.clientX, e.clientY, slPicker);
          color.s = Math.round(pos.s);
          color.l = Math.round(pos.l);
          if (team === 'A') colorA = color; else colorB = color;
          updateTeamColors();
          updateSLCursor(slCursor, pos.s * 2.8 / 100, pos.l * 1.6 / 100);
          hexInput.value = hslToHex(color.h, color.s, color.l);
        }

        hueSlider.addEventListener('mousedown', (e) => {
          onHueChange(e);
          const moveHandler = (ev) => onHueChange(ev);
          const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
          };
          document.addEventListener('mousemove', moveHandler);
          document.addEventListener('mouseup', upHandler);
        });
        hueSlider.addEventListener('touchstart', (e) => {
          onHueChange(e);
          const moveHandler = (ev) => onHueChange(ev);
          const upHandler = () => {
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', upHandler);
          };
          document.addEventListener('touchmove', moveHandler);
          document.addEventListener('touchend', upHandler);
        }, { passive: false });

        slPicker.addEventListener('mousedown', (e) => {
          onSLChange(e);
          const moveHandler = (ev) => onSLChange(ev);
          const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
          };
          document.addEventListener('mousemove', moveHandler);
          document.addEventListener('mouseup', upHandler);
        });
        slPicker.addEventListener('touchstart', (e) => {
          onSLChange(e);
          const moveHandler = (ev) => onSLChange(ev);
          const upHandler = () => {
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', upHandler);
          };
          document.addEventListener('touchmove', moveHandler);
          document.addEventListener('touchend', upHandler);
        }, { passive: false });

        // Hex input changes
        hexInput.addEventListener('input', () => {
          const val = hexInput.value.trim();
          if (/^#([0-9A-Fa-f]{6})$/.test(val)) {
            const hsl = hexToHsl(val);
            color.h = Math.round(hsl.h);
            color.s = Math.round(hsl.s);
            color.l = Math.round(hsl.l);
            if (team === 'A') colorA = color; else colorB = color;
            updateTeamColors();
            updateSLBackground(slPicker, color.h);
            updateSLCursor(slCursor, color.s * 2.8 / 100, color.l * 1.6 / 100);
          }
        });

        // Close button
        const pickerClose = team === 'A' ? pickerCloseA : pickerCloseB;
        pickerClose.addEventListener('click', () => {
          closePickers();
        });

        // Open on button click
        const colorBtn = team === 'A' ? colorBtnA : colorBtnB;
        colorBtn.addEventListener('click', () => {
          openPicker(team);
        });
      }

      // Score buttons
      btnAPlus.addEventListener('click', () => {
        scoreValueA++;
        scoreA.textContent = scoreValueA;
      });
      btnAMinus.addEventListener('click', () => {
        if (scoreValueA > 0) scoreValueA--;
        scoreA.textContent = scoreValueA;
      });
      btnBPlus.addEventListener('click', () => {
        scoreValueB++;
        scoreB.textContent = scoreValueB;
      });
      btnBMinus.addEventListener('click', () => {
        if (scoreValueB > 0) scoreValueB--;
        scoreB.textContent = scoreValueB;
      });

      // Server selectors - allow empty (unset)
      [serverA, serverB].forEach(sel => {
        sel.addEventListener('change', () => {
          // just accept value as is, empty means no server
        });
      });

      // Layout toggle
      btnLayout.addEventListener('click', () => {
        layoutVertical = !layoutVertical;
        if (layoutVertical) {
          app.classList.remove('horizontal');
          app.classList.add('vertical');
          layoutIcon.textContent = '↕️';
          btnLayout.setAttribute('aria-pressed', 'true');

          // Adjust layout for vertical:
          // team names and scores stacked left,
          // server + controls shifted right + up
          sideA.style.flexDirection = 'row';
          sideB.style.flexDirection = 'row';

          // For vertical: 
          // Make score area full width and height inside each team section
          scoreA.style.fontSize = '7rem';
          scoreB.style.fontSize = '7rem';

          // Move server selects and buttons to top-right inside each team side (via CSS is complex, so adjust layout)
          // Just keep the controls-row flexible for now; user can see buttons and selects normally

        } else {
          app.classList.remove('vertical');
          app.classList.add('horizontal');
          layoutIcon.textContent = '↔️';
          btnLayout.setAttribute('aria-pressed', 'false');

          sideA.style.flexDirection = 'column';
          sideB.style.flexDirection = 'column';

          scoreA.style.fontSize = '9rem';
          scoreB.style.fontSize = '9rem';
        }
      });

      // Reset button resets all
      btnReset.addEventListener('click', () => {
        scoreValueA = 0;
        scoreValueB = 0;
        scoreA.textContent = scoreValueA;
        scoreB.textContent = scoreValueB;

        teamAName.value = 'Team A';
        teamBName.value = 'Team B';

        serverA.value = '';
        serverB.value = '';

        colorA = { h: 230, s: 80, l: 20 };
        colorB = { h: 210, s: 70, l: 30 };
        updateTeamColors();
        syncColorPicker('A');
        syncColorPicker('B');

        closePickers();
        hideQRCode();
        resetTimer();
      });

      // Timer controls
      function formatTime(s) {
        const m = Math.floor(s / 60);
        const ss = s % 60;
        return `${m}:${ss.toString().padStart(2, '0')}`;
      }
      function updateTimerDisplay() {
        timerToggleBtn.textContent = `⏰ ${formatTime(timerSeconds)}`;
      }
      function startTimer() {
        if (timerRunning) return;
        timerRunning = true;
        timerInterval = setInterval(() => {
          timerSeconds++;
          updateTimerDisplay();
        }, 1000);
      }
      function pauseTimer() {
        if (!timerRunning) return;
        timerRunning = false;
        clearInterval(timerInterval);
      }
      function resetTimer() {
        pauseTimer();
        timerSeconds = 0;
        updateTimerDisplay();
      }

      timerToggleBtn.addEventListener('click', () => {
        const open = timerControls.classList.toggle('open');
        timerToggleBtn.setAttribute('aria-expanded', open.toString());
      });
      timerStart.addEventListener('click', () => startTimer());
      timerPause.addEventListener('click', () => pauseTimer());
      timerReset.addEventListener('click', () => resetTimer());

      updateTimerDisplay();

      // QR Code generation
      function showQRCode() {
        qrContainer.classList.add('open');
        qrContainer.setAttribute('aria-hidden', 'false');

        // Prepare URL / Data string
        const scoreData = {
          teamA: teamAName.value,
          scoreA: scoreValueA,
          serverA: serverA.value || null,
          teamB: teamBName.value,
          scoreB: scoreValueB,
          serverB: serverB.value || null,
        };
        const dataStr = JSON.stringify(scoreData);

        QRCode.toCanvas(qrCanvas, dataStr, {
          width: 200,
          margin: 1,
          color: {
            dark: '#0ea5e9',
            light: '#1e293b'
          }
        }, function (error) {
          if (error) console.error(error);
        });
      }
      function hideQRCode() {
        qrContainer.classList.remove('open');
        qrContainer.setAttribute('aria-hidden', 'true');
      }
      btnQR.addEventListener('click', () => {
        if (qrContainer.classList.contains('open')) {
          hideQRCode();
        } else {
          showQRCode();
        }
      });
      qrCloseBtn.addEventListener('click', hideQRCode);

      // Initialize
      updateTeamColors();
      syncColorPicker('A');
      syncColorPicker('B');

      setupColorPicker('A');
      setupColorPicker('B');

      // Accessibility: focus management for color picker close buttons
      pickerCloseA.tabIndex = 0;
      pickerCloseB.tabIndex = 0;

    })();
    function generateMatchSummary() {
  // Customize this based on your actual match state variable names
  // For example:
  // let teamA = document.querySelector('#teamANameInput').value || 'Team A';
  // let teamB = document.querySelector('#teamBNameInput').value || 'Team B';
  // let scoreA = document.querySelector('#scoreA').innerText || '0';
  // let scoreB = document.querySelector('#scoreB').innerText || '0';

  // Since vichtml is large, adapt accordingly. Here's a general example:
  const teamA = document.querySelector('#player1Name')?.value || 'Player 1';
  const teamB = document.querySelector('#player2Name')?.value || 'Player 2';

  // If you have different selectors for scores, replace accordingly
  const scoreA = document.querySelector('#score1')?.innerText || '0';
  const scoreB = document.querySelector('#score2')?.innerText || '0';

  return `${teamA} vs ${teamB}\nScore: ${scoreA} - ${scoreB}`;
}

document.getElementById('qr-btn').addEventListener('click', () => {
  const qrDiv = document.getElementById('qrcode');
  qrDiv.innerHTML = ''; // clear old QR code
  new QRCode(qrDiv, {
    text: generateMatchSummary(),
    width: 200,
    height: 200,
  });
  document.getElementById('qr-popup').style.display = 'block';
});
async function saveCurrentMatch() {
  const teamA = document.querySelector('#player1Name')?.value || 'Player 1';
  const teamB = document.querySelector('#player2Name')?.value || 'Player 2';
  const scoreA = document.querySelector('#score1')?.innerText || '0';
  const scoreB = document.querySelector('#score2')?.innerText || '0';
  const durationSeconds = window.timerSeconds || 0;

  // Generate UUID client-side as fallback
  const matchId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
    ? crypto.randomUUID() 
    : Math.random().toString(36).slice(2, 10) + '-' + Date.now();

  const { data, error } = await supabase
    .from('matches')
    .insert([{
      id: matchId,
      team_a: teamA,
      team_b: teamB,
      score_a: parseInt(scoreA),
      score_b: parseInt(scoreB),
      duration_seconds: durationSeconds
    }]);

  const saveResultEl = document.getElementById('save-result');
  const qrDiv = document.getElementById('saved-qr');
  qrDiv.innerHTML = '';

  if (error) {
    saveResultEl.style.color = 'red';
    saveResultEl.textContent = 'Error saving match: ' + error.message;
    return;
  }

  saveResultEl.style.color = 'green';
  saveResultEl.textContent = 'Match saved! Scan the QR code or use the link below:';

  const matchUrl = `${window.location.origin}/match.html?id=${matchId}`;

  new QRCode(qrDiv, {
    text: matchUrl,
    width: 200,
    height: 200,
  });

  qrDiv.insertAdjacentHTML('beforeend', `<p><a href="${matchUrl}" target="_blank" rel="noopener noreferrer">${matchUrl}</a></p>`);
}

document.getElementById('save-match-btn').addEventListener('click', saveCurrentMatch);