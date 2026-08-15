/* =====================================================
   🔊 AUDIO MODULE (js/audio.js)
   Synthesizes retro chiptune sound effects & 8-bit music
   using the Web Audio API (Zero external MP3 files needed!)
   ===================================================== */

'use strict';

let audioCtx = null;
let musicInterval = null;
let isMusicMuted = false;
let musicStep = 0;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ─────────────────────────────────────────────────────
//  Sound Effects (SFX)
// ─────────────────────────────────────────────────────
function playSound(type) {
  if (isMusicMuted && !type.startsWith('laser')) return;

  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    if (type === 'laser' || type === 'laser_plasma') {
      // 🚀 Plasma Vulcan: Crisp rapid laser pop
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
    else if (type === 'laser_lightning') {
      // ⚡ Tesla Lightning: Electric buzz / crackle
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(450, now + 0.03);
      osc.frequency.setValueAtTime(900, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
    else if (type === 'laser_rocket') {
      // 💥 Heavy Rocket Launch: Low-frequency whoosh thud
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }
    else if (type === 'laser_quantum') {
      // 🔮 Quantum Beam: Vibrating high-energy prism hum
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }
    else if (type === 'laser_vortex') {
      // 🌀 Vortex Blade: Whirring resonant blade slice
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
    else if (type === 'weapon_switch') {
      // 🌟 Weapon Signature Switch Fanfare!
      [523.25, 783.99, 1046.5].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + i * 0.05);

        gain.gain.setValueAtTime(0.22, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.12);
      });
    }
    else if (type === 'enemyLaser') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
    else if (type === 'bossLaser') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
    else if (type === 'explosion') {
      const bufferSize = actx.sampleRate * 0.25;
      const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = actx.createBufferSource();
      noise.buffer = buffer;

      const filter = actx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.25);

      const gain = actx.createGain();
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(actx.destination);
      noise.start(now);
    }
    else if (type === 'bossExplosion') {
      const bufferSize = actx.sampleRate * 0.6;
      const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = actx.createBufferSource();
      noise.buffer = buffer;

      const filter = actx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      const gain = actx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(actx.destination);
      noise.start(now);
    }
    else if (type === 'hit') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
    else if (type === 'powerup') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);

        gain.gain.setValueAtTime(0.18, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.12);
      });
    }
    else if (type === 'waveClear') {
      const fanfare = [440, 554.37, 659.25, 880];
      fanfare.forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + i * 0.08);

        gain.gain.setValueAtTime(0.16, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.18);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.18);
      });
    }
    else if (type === 'bossWarning') {
      [220, 293.66, 220, 293.66].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.22);

        gain.gain.setValueAtTime(0.2, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.22 + 0.2);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.22);
        osc.stop(now + i * 0.22 + 0.2);
      });
    }
    else if (type === 'victory') {
      const victoryNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      victoryNotes.forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.12);

        gain.gain.setValueAtTime(0.22, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });
    }
  } catch (err) {}
}

// ─────────────────────────────────────────────────────
//  8-bit Retro Background Music Loop
// ─────────────────────────────────────────────────────
const BASSLINE = [110, 110, 146.83, 146.83, 130.81, 130.81, 164.81, 146.83];
const LEAD_MELODY = [220, 0, 261.63, 293.66, 329.63, 0, 293.66, 261.63];

function startBackgroundMusic() {
  if (musicInterval) return;
  musicStep = 0;

  musicInterval = setInterval(() => {
    if (isMusicMuted || gameState !== 'playing') return;

    try {
      const actx = getAudioContext();
      if (!actx) return;
      const now = actx.currentTime;

      const bassFreq = BASSLINE[musicStep % BASSLINE.length];
      if (bassFreq > 0) {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassFreq, now);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      const leadFreq = LEAD_MELODY[musicStep % LEAD_MELODY.length];
      if (leadFreq > 0 && Math.random() > 0.2) {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(leadFreq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      musicStep++;
    } catch (e) {}
  }, 190);
}

function stopBackgroundMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

function toggleMute() {
  isMusicMuted = !isMusicMuted;
  const muteBtn = document.getElementById('muteBtn');
  if (muteBtn) {
    muteBtn.textContent = isMusicMuted ? '🔇' : '🔊';
  }
}
