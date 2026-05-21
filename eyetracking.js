// ═══════════════════════════════════════════════════════
//  EYE TRACKING & HEURISTIC BLINK DETECTOR
// ═══════════════════════════════════════════════════════

async function startStudy() {
  state.timed = Math.random() < 0.5;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
    });
    document.getElementById('webcam').srcObject = stream;
    document.getElementById('webcam-container').style.display = 'block';

    await webgazer.setRegression('weightedRidge').setTracker('TFFacemesh').begin();
    
    // NASCONDI IL PUNTINO ROSSO DI WEBGAZER
    webgazer.showVideoPreview(true).showPredictionPoints(false); 

    showScreen('calibration');
    initCalibration();
  } catch(e) {
    alert('Camera access is required for eye tracking.');
  }
}

function startEyeTracking() {
  state.eyeTrackingActive = true;
  state.gazeData = []; state.heatPoints = [];
  document.getElementById('gaze-cursor').style.display = 'block';
  
  // BLOCCA L'APPRENDIMENTO DAL MOUSE
  webgazer.removeMouseEventListeners();

  webgazer.setGazeListener(function(data, elapsedTime) {
    if (data != null) {
       handleGazeData(data.x, data.y);
    }
  });

  state.stressInterval = setInterval(sampleStress, 5000);
  state.metricInterval = setInterval(updateMetricsDisplay, 500);
  state.readStart = Date.now();
}

function stopEyeTracking() {
  state.eyeTrackingActive = false;
  webgazer.pause(); webgazer.clearGazeListener();
  clearInterval(state.stressInterval); clearInterval(state.metricInterval); clearInterval(state.countdownInterval);
  document.getElementById('gaze-cursor').style.display = 'none';
  state.readEnd = Date.now();
}

function handleGazeData(rawX, rawY) {
  const now = Date.now();

  // HEURISTIC BLINK DETECTION
  if (lastRawY !== null) {
     const dy = Math.abs(rawY - lastRawY);
     const dt = now - lastRawT;
     const velocityY = dy / dt; 
     
     if (velocityY > 3.0 && (now - lastBlinkTime > 300)) { 
       simulateBlink();
       lastBlinkTime = now;
     }
  }
  lastRawY = rawY;
  lastRawT = now;

  // FILTRO ANTI-SFARFALLIO (EMA)
  if (smoothedX === null) {
    smoothedX = rawX; smoothedY = rawY;
  } else {
    smoothedX = (rawX * EMA_ALPHA) + (smoothedX * (1 - EMA_ALPHA));
    smoothedY = (rawY * EMA_ALPHA) + (smoothedY * (1 - EMA_ALPHA));
  }
  
  const x = smoothedX;
  const y = smoothedY;

  state.gazeX = x; state.gazeY = y;
  const cursor = document.getElementById('gaze-cursor');
  cursor.style.left = x + 'px'; cursor.style.top = y + 'px';

  state.heatPoints.push({ x: x, y: y, t: now });
  state.gazeData.push({ x: x, y: y, t: now });

  if (state.lastX !== null) {
    const dx = x - state.lastX; const dy = y - state.lastY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 30) {
      if (!state.inFixation) { state.inFixation = true; state.fixationStart = now; }
    } else {
      if (state.inFixation) {
        const dur = now - state.fixationStart;
        state.fixDurations.push(dur); state.fixations++; state.inFixation = false;
      }
      state.saccades++; state.saccadeAmplitudes.push(Math.round(dist));
      if (dx < -40) state.regressions++;
    }
  }
  state.lastX = x; state.lastY = y;
}

function simulateBlink() {
  state.blinkCount++; state.blinks++;
  const now = Date.now();
  state.blinkWindow.push(now);
}

function sampleStress() {
  const now = Date.now();
  state.blinkWindow = state.blinkWindow.filter(t => now - t < 60000); 
  const blinkRate = state.blinkWindow.length;
  
  state.blinkTimeline.push({ t: now, count: blinkRate });

  let brScore = 0;
  if (blinkRate < 10) brScore = (10 - blinkRate) * 4; 
  else if (blinkRate > 25) brScore = (blinkRate - 25) * 3; 
  brScore = Math.min(30, brScore);

  const dispersion = state.heatPoints.length > 2 ? calcDispersion() : 0;
  const varScore = Math.min(30, dispersion / 5);

  const recentSaccades = state.saccadeAmplitudes.slice(-5);
  const avgSaccade = recentSaccades.length > 0 ? recentSaccades.reduce((a,b)=>a+b,0)/recentSaccades.length : 0;
  const velScore = Math.min(25, avgSaccade / 10);

  const recentY = state.heatPoints.slice(-10).map(p=>p.y);
  const avgY = recentY.length > 0 ? recentY.reduce((a,b)=>a+b,0)/recentY.length : 0;
  const downScore = (avgY > window.innerHeight * 0.8) ? 15 : 0;

  const stressScore = Math.min(100, brScore + varScore + velScore + downScore);
  state.stressTimeline.push({ t: now, stress: Math.round(stressScore) });
}

function updateMetricsDisplay() {
  const elapsed = (Date.now() - state.readStart) / 60000;
  const blinkRate = elapsed > 0 ? Math.round(state.blinks / elapsed) : 0;
  const dispersion = state.heatPoints.length > 2 ? calcDispersion() : 0;

  document.getElementById('m-fixations').textContent = state.fixations;
  document.getElementById('m-saccades').textContent = state.saccades;
  document.getElementById('m-blinks').textContent = blinkRate + '/min';
  document.getElementById('m-dispersion').textContent = Math.round(dispersion) + 'px';
  document.getElementById('m-regressions').textContent = state.regressions;

  const stressVal = state.stressTimeline.length > 0 ? state.stressTimeline[state.stressTimeline.length-1].stress : 0;
  document.getElementById('stress-bars').innerHTML = `<div style="height:6px;background:var(--border);border-radius:3px;margin-top:8px"><div style="width:${stressVal}%;height:100%;background:${stressVal>60?'var(--danger)':stressVal>30?'var(--warn)':'var(--accent)'};border-radius:3px;transition:width 0.5s, background 0.5s"></div></div><div style="font-size:11px;color:var(--muted2);text-align:right;margin-top:4px">${stressVal}%</div>`;
}

function calcDispersion() {
  const recent = state.heatPoints.slice(-30); if (recent.length < 2) return 0;
  const xs = recent.map(p=>p.x), ys = recent.map(p=>p.y);
  const mx = xs.reduce((a,b)=>a+b)/xs.length, my = ys.reduce((a,b)=>a+b)/ys.length;
  return Math.sqrt(xs.reduce((s,x)=>s+(x-mx)**2,0)/xs.length + ys.reduce((s,y)=>s+(y-my)**2,0)/ys.length);
}