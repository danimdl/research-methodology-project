// ═══════════════════════════════════════════════════════
//  STATE & ANTI-JITTER
// ═══════════════════════════════════════════════════════
let state = {
  selectedTest: 'A', timed: false, calibrated: false, calibPoints: [], gazeData: [], gazeX: 0, gazeY: 0,
  fixations: 0, saccades: 0, blinks: 0, regressions: 0, fixDurations: [], blinkTimeline: [],
  saccadeAmplitudes: [], stressTimeline: [], readStart: null, readEnd: null, answers: {}, heatPoints: [],
  score: 0, totalQ: 0, eyeTrackingActive: false, lastX: null, lastY: null, fixationStart: null, inFixation: false,
  blinkCount: 0, blinkWindow: [], minuteTimer: null, countdownInterval: null, secondsLeft: 180
};

// Filtro EMA (Exponential Moving Average)
let smoothedX = null;
let smoothedY = null;
const EMA_ALPHA = 0.04; 

// Tracking
let lastBlinkTime = 0;
let lastRawY = null;
let lastRawT = 0;

// Calibrazione
let calibStep = 0;
let clickCount = 0;
const CLICKS_PER_DOT = 4;
const CALIB_ORDER = [0,1,2,3,4,5,6,7,8];