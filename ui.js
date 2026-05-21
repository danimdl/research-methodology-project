// ═══════════════════════════════════════════════════════
//  UI LOGIC & NAVIGATION
// ═══════════════════════════════════════════════════════

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectTest(t) {
  state.selectedTest = t;
  document.getElementById('card-a').classList.toggle('selected', t === 'A');
  document.getElementById('card-b').classList.toggle('selected', t === 'B');
}

function initCalibration() {
  calibStep = 0;
  clickCount = 0;
  const grid = document.getElementById('calib-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'calib-dot'; cell.id = 'cdot-' + i;
    cell.innerHTML = '<div class="calib-dot-inner"></div>';
    cell.onclick = () => clickCalibDot(i);
    grid.appendChild(cell);
  }
  activateCalibDot(0);
}

function activateCalibDot(idx) {
  document.querySelectorAll('.calib-dot').forEach(d => d.classList.remove('active'));
  const dot = document.getElementById('cdot-' + CALIB_ORDER[idx]);
  if (dot) {
    dot.classList.add('active');
    document.getElementById('calib-instruction').textContent = `● Clicks left on this dot: ${CLICKS_PER_DOT - clickCount}`;
  }
}

function clickCalibDot(i) {
  if (i !== CALIB_ORDER[calibStep]) return;
  const dot = document.getElementById('cdot-' + i);
  const inner = dot.querySelector('.calib-dot-inner');
  
  clickCount++;
  
  if (clickCount < CLICKS_PER_DOT) {
    inner.style.transform = `scale(${1.4 - (clickCount * 0.1)})`;
    inner.style.backgroundColor = 'var(--accent2)';
    document.getElementById('calib-instruction').textContent = `● Clicks left on this dot: ${CLICKS_PER_DOT - clickCount}`;
    return;
  }
  
  clickCount = 0;
  dot.classList.remove('active'); dot.classList.add('done');
  inner.style.transform = 'scale(0.9)';
  inner.style.backgroundColor = 'var(--accent)';
  
  const rect = dot.getBoundingClientRect();
  const dotX = rect.left + rect.width/2;
  const dotY = rect.top + rect.height/2;
  
  state.calibPoints.push({ x: dotX, y: dotY });
  webgazer.recordScreenPosition(dotX, dotY, 'click');
  
  calibStep++;
  document.getElementById('calib-bar-fill').style.width = ((calibStep / 9) * 100) + '%';
  document.getElementById('calib-progress-text').textContent = calibStep + ' / 9 points calibrated';
  
  if (calibStep < 9) {
    activateCalibDot(calibStep);
  } else {
    document.getElementById('calib-instruction').textContent = '✓ High-Precision Calibration complete!';
    state.calibrated = true;
    setTimeout(startReading, 900);
  }
}

function startReading() {
  const t = TEXTS[state.selectedTest];
  document.getElementById('reading-content').innerHTML = `<div class="article-header"><div class="article-title">${t.title}</div></div><div class="article-body">${t.body}</div>`;
  showScreen('reading');
  const timerSec = document.getElementById('timer-section');
  if (state.timed) {
    timerSec.classList.remove('hidden'); 
    state.secondsLeft = 120;
    updateTimerDisplay();
    state.countdownInterval = setInterval(() => {
      state.secondsLeft--; 
      updateTimerDisplay();
      if (state.secondsLeft <= 0) { 
        clearInterval(state.countdownInterval); 
        goToQuestions(); 
      }
    }, 1000);
  } else { 
    timerSec.classList.add('hidden'); 
  }
  startEyeTracking();
}

function updateTimerDisplay() {
  const m = Math.floor(state.secondsLeft / 60), s = state.secondsLeft % 60;
  document.getElementById('timer-display').textContent = m + ':' + String(s).padStart(2,'0');
}
function confirmFinishReading() { document.getElementById('modal-overlay').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
function goToQuestions() { document.getElementById('modal-overlay').style.display = 'none'; stopEyeTracking(); showQuestionsScreen(); }

function showQuestionsScreen() {
  const qs = QUESTIONS[state.selectedTest]; state.totalQ = qs.length;
  document.getElementById('questions-container').innerHTML = qs.map((q,i) => {
    return `<div class="question-card"><div class="q-text">${q.text}</div><div class="options-list">
      ${q.options.map((opt,j)=>`<button class="option-btn" id="opt-${q.id}-${j}" onclick="selectOption('${q.id}',${j},${q.correct})">${opt}</button>`).join('')}
    </div></div>`;
  }).join('');
  showScreen('questions');
}

function selectOption(qId, j, correct) {
  if (state.answers[qId] !== undefined) return;
  state.answers[qId] = j; if (j === correct) state.score++;
  document.querySelectorAll(`[id^="opt-${qId}-"]`).forEach((btn,i) => {
    if (i === correct) btn.classList.add('correct');
    else if (i === j && j !== correct) btn.classList.add('wrong');
  });
}

function submitAnswers() { showResults(); }

// Initialize defaults on load
selectTest('A');