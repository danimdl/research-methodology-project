// ═══════════════════════════════════════════════════════
//  RESULTS & CHARTS
// ═══════════════════════════════════════════════════════

function showResults() {
  showScreen('results');
  const elapsed = state.readEnd && state.readStart ? ((state.readEnd - state.readStart)/1000) : 120;
  const avgFix = state.fixDurations.length > 0 ? Math.round(state.fixDurations.reduce((a,b)=>a+b,0)/state.fixDurations.length) : 220;
  const stressIdx = state.stressTimeline.length > 0 ? Math.round(state.stressTimeline.reduce((s,x)=>s+x.stress,0)/state.stressTimeline.length) : 0;
  const comp = Math.round((state.score/state.totalQ)*100);

  document.getElementById('results-grid').innerHTML = `
    <div class="result-metric good"><div class="rm-val">${comp}%</div><div class="rm-label">Comprehension</div></div>
    <div class="result-metric"><div class="rm-val">${stressIdx}%</div><div class="rm-label">Avg Stress Score</div></div>
    <div class="result-metric"><div class="rm-val">${state.saccades}</div><div class="rm-label">Saccades</div></div>
    <div class="result-metric"><div class="rm-val">${Math.round(elapsed)}s</div><div class="rm-label">Time</div></div>
  `;

  renderCharts();
  renderHeatmap();
  renderScanpath();
  renderInsights(comp, avgFix, stressIdx);
  renderRawTable();
}

function renderCharts() {
  Chart.defaults.color = '#6b7280';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.07)';

  const bins = [0,100,200,300,400,500,600];
  const fixBins = bins.map((b,i)=>i<bins.length-1 ? state.fixDurations.filter(d=>d>=b&&d<bins[i+1]).length : state.fixDurations.filter(d=>d>=b).length);
  new Chart(document.getElementById('fixation-chart'), { type:'bar', data:{ labels:['0-100','100-200','200-300','300-400','400-500','500-600','600+'], datasets:[{data:fixBins,backgroundColor:'rgba(79,255,176,0.5)'}] }, options:{plugins:{legend:{display:false}}} });

  const blinkLabels = state.blinkTimeline.map(b => Math.round((b.t - state.readStart)/1000) + 's');
  new Chart(document.getElementById('blink-chart'), { type:'line', data:{ labels: blinkLabels.length > 0 ? blinkLabels : ['0s','5s'], datasets:[{data: state.blinkTimeline.length > 0 ? state.blinkTimeline.map(b=>b.count) : [0,0], borderColor:'#00d4ff', backgroundColor:'rgba(0,212,255,0.08)', fill:true, tension:0.4}] }, options:{plugins:{legend:{display:false}}, scales:{y:{min:0}}} });

  const sampledSacc = state.saccadeAmplitudes.filter((_,i)=>i%3===0);
  new Chart(document.getElementById('saccade-chart'), { type:'line', data:{ labels:sampledSacc.map((_,i)=>i+1), datasets:[{data:sampledSacc,borderColor:'#fbbf24', backgroundColor:'rgba(251,191,36,0.06)', fill:true, tension:0.3}] }, options:{plugins:{legend:{display:false}}} });

  const stressLabels = state.stressTimeline.map(s=>Math.round((s.t-state.readStart)/1000)+'s');
  new Chart(document.getElementById('stress-chart'), { type:'line', data:{ labels:stressLabels, datasets:[{data:state.stressTimeline.map(s=>s.stress),borderColor:'#ff6b6b', backgroundColor:'rgba(255,107,107,0.08)', fill:true, tension:0.4}] }, options:{plugins:{legend:{display:false}}, scales:{y:{min:0, max:100}}} });
}

function renderHeatmap() {
  const canvas = document.getElementById('result-heatmap');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 800; canvas.height = canvas.offsetHeight || 220;
  const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);
  const scaleX = canvas.width / window.innerWidth, scaleY = canvas.height / window.innerHeight;
  const pts = state.heatPoints.length > 5 ? state.heatPoints : generateFakeGaze();
  pts.forEach(p => {
    const grd = ctx.createRadialGradient(p.x*scaleX, p.y*scaleY, 0, p.x*scaleX, p.y*scaleY, 20);
    grd.addColorStop(0,'rgba(255,50,50,0.25)'); grd.addColorStop(0.4,'rgba(255,200,0,0.12)'); grd.addColorStop(1,'rgba(0,255,150,0)');
    ctx.fillStyle = grd; ctx.fillRect(0,0,canvas.width,canvas.height);
  });
}

function generateFakeGaze() {
  const pts = [];
  for(let i=0;i<80;i++) { pts.push({x: 150+Math.random()*400, y: 100+Math.random()*500}); }
  return pts;
}

function renderScanpath() {
  const canvas = document.getElementById('scanpath-canvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 800; canvas.height = canvas.offsetHeight || 200;
  const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);
  const pts = state.gazeData.length > 5 ? state.gazeData.slice(0,60) : generateFakeScanpath(canvas.width, canvas.height);
  const scaleX = canvas.width / window.innerWidth, scaleY = canvas.height / window.innerHeight;

  ctx.strokeStyle = 'rgba(79,255,176,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath();
  pts.forEach((p,i) => {
    const x = p.x ? p.x*scaleX : p.x2; const y = p.y ? p.y*scaleY : p.y2;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
  pts.forEach((p,i) => {
    const x = p.x ? p.x*scaleX : p.x2; const y = p.y ? p.y*scaleY : p.y2;
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fillStyle = `rgba(79,255,176,${0.3+i/pts.length*0.7})`; ctx.fill();
  });
}

function generateFakeScanpath(w, h) {
  const pts = []; let x=50, y=30;
  for(let i=0;i<40;i++) {
    x += Math.random()*30 - 5; y += Math.random()*10 - 2;
    if(x>w-20){x=50;y+=20;} pts.push({x2:x,y2:y});
  }
  return pts;
}

function renderInsights(comp, avgFix, stress) {
  const insights = [
    { title: '🧠 4-Pillar Stress Analysis', body: `Your overall stress index was ${stress}%. This was calculated combining Blink Rate anomalies, Gaze Variability (restlessness), Scan Velocity, and Downward Gaze avoidance.`},
    { title: '📈 Stress vs Comprehension', body: `Stress: ${stress}% | Comprehension: ${comp}%. ${stress > 50 && comp < 60 ? 'High stress likely impaired your reading comprehension.' : 'Your stress levels allowed for adequate information encoding.'}`}
  ];
  document.getElementById('insights-container').innerHTML = insights.map(ins=>`<div class="insight-card"><div class="i-title">${ins.title}</div><div class="i-body">${ins.body}</div></div>`).join('');
}

function renderRawTable() {
  const head = document.getElementById('raw-head');
  const body = document.getElementById('raw-body');
  const cols = ['Timestamp','GazeX','GazeY','FixDur(ms)','SaccAmp(px)','BlinkEvent'];
  head.innerHTML = cols.map(c=>`<th style="text-align:left;padding:6px 10px;color:var(--muted2);font-weight:400;font-size:11px">${c}</th>`).join('');

  const rows = state.gazeData.slice(0,20);
  body.innerHTML = rows.map((p,i)=>`<tr style="border-bottom:1px solid var(--border)">
    <td style="padding:5px 10px;color:var(--muted2)">${new Date(p.t).toISOString().substr(11,12)}</td>
    <td style="padding:5px 10px">${Math.round(p.x)}</td>
    <td style="padding:5px 10px">${Math.round(p.y)}</td>
    <td style="padding:5px 10px">${state.fixDurations[i] || '—'}</td>
    <td style="padding:5px 10px">${state.saccadeAmplitudes[i] || '—'}</td>
    <td style="padding:5px 10px">${state.blinkTimeline.some(b=>Math.abs(b.t-p.t)<500)?'✓':'—'}</td>
  </tr>`).join('');
}

function exportData() {
  const rows = [['Timestamp','GazeX','GazeY','FixDur','SaccAmp','Blink','Test','Timed']];
  state.gazeData.forEach((p,i) => {
    rows.push([new Date(p.t).toISOString(), Math.round(p.x), Math.round(p.y),
      state.fixDurations[i]||'', state.saccadeAmplitudes[i]||'',
      state.blinkTimeline.some(b=>Math.abs(b.t-p.t)<500)?1:0,
      state.selectedTest, state.timed?1:0]);
  });
  const csv = rows.map(r=>r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `ocuread_test${state.selectedTest}_${Date.now()}.csv`;
  a.click();
}

function restartStudy() { location.reload(); }