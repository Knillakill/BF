// Effets sonores synthétisés avec Web Audio : aucun fichier son, aucun droit d'auteur.
// Sfx.play('slash' | 'arrow' | 'magic' | 'shield' | 'bossAttack' | 'hurt' | 'poison' | 'heal' | 'ability' | 'yourTurn' | 'win' | 'lose')

const Sfx = (() => {
  let ctx = null;
  let master = null;
  let muted = false;
  try { muted = localStorage.getItem('bf-mute') === '1'; } catch { /* stockage indisponible */ }

  // Le navigateur n'autorise le son qu'après un geste de l'utilisateur : on active au premier clic.
  function audio() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.45;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  document.addEventListener('pointerdown', () => audio(), { capture: true });

  let noiseBuf = null;
  function noiseBuffer(a) {
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 1.5, a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  // Note simple avec enveloppe (attaque courte, décroissance exponentielle).
  function tone(a, { f, to = null, dur = 0.2, type = 'sine', vol = 0.3, at = 0, attack = 0.005 }) {
    const t = a.currentTime + at;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // Souffle de bruit filtré (entailles, flèches, impacts).
  function noise(a, { dur = 0.2, filter = 'bandpass', f = 1000, to = null, q = 1, vol = 0.3, at = 0 }) {
    const t = a.currentTime + at;
    const src = a.createBufferSource();
    src.buffer = noiseBuffer(a);
    const bq = a.createBiquadFilter();
    bq.type = filter;
    bq.Q.value = q;
    bq.frequency.setValueAtTime(f, t);
    if (to) bq.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bq).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  const SOUNDS = {
    slash(a) {
      noise(a, { dur: 0.16, filter: 'highpass', f: 1800, to: 7000, vol: 0.55 });
      noise(a, { dur: 0.14, filter: 'highpass', f: 2200, to: 8000, vol: 0.4, at: 0.1 });
      tone(a, { f: 180, to: 70, dur: 0.18, type: 'square', vol: 0.18, at: 0.12 });
    },
    arrow(a) {
      noise(a, { dur: 0.35, filter: 'bandpass', f: 700, to: 2600, q: 3, vol: 0.35 });
      tone(a, { f: 160, to: 55, dur: 0.12, type: 'square', vol: 0.25, at: 0.42 });
      noise(a, { dur: 0.1, filter: 'lowpass', f: 900, vol: 0.4, at: 0.42 });
    },
    magic(a) {
      [660, 880, 1175, 1568].forEach((f, k) => tone(a, { f, dur: 0.35, type: 'sine', vol: 0.12, at: k * 0.06 }));
      tone(a, { f: 300, to: 1200, dur: 0.55, type: 'triangle', vol: 0.12 });
      tone(a, { f: 110, to: 38, dur: 0.6, type: 'sine', vol: 0.5, at: 0.6 });
      noise(a, { dur: 0.4, filter: 'lowpass', f: 1500, to: 200, vol: 0.3, at: 0.6 });
    },
    shield(a) {
      [523, 784, 1175, 1568].forEach((f, k) => tone(a, { f, dur: 0.9 - k * 0.12, type: 'triangle', vol: 0.14 }));
      noise(a, { dur: 0.06, filter: 'highpass', f: 4000, vol: 0.25 });
    },
    bossAttack(a) {
      tone(a, { f: 95, to: 55, dur: 0.45, type: 'sawtooth', vol: 0.3 });
      noise(a, { dur: 0.4, filter: 'lowpass', f: 600, to: 150, vol: 0.4 });
      noise(a, { dur: 0.18, filter: 'highpass', f: 1500, to: 5000, vol: 0.35, at: 0.42 });
      tone(a, { f: 140, to: 50, dur: 0.25, type: 'square', vol: 0.25, at: 0.45 });
    },
    hurt(a) {
      tone(a, { f: 320, to: 140, dur: 0.22, type: 'square', vol: 0.18 });
      noise(a, { dur: 0.12, filter: 'lowpass', f: 1200, vol: 0.25 });
    },
    poison(a) {
      for (let k = 0; k < 6; k++) tone(a, { f: 280 + Math.random() * 420, to: 700 + Math.random() * 400, dur: 0.09, type: 'sine', vol: 0.16, at: k * 0.07 });
    },
    heal(a) {
      [523, 659, 784, 1046].forEach((f, k) => tone(a, { f, dur: 0.5, type: 'sine', vol: 0.12, at: k * 0.07 }));
    },
    ability(a) {
      [110, 220, 331, 441].forEach((f, k) => tone(a, { f, dur: 1.8 - k * 0.3, type: 'sine', vol: 0.22 / (k + 1), attack: 0.01 }));
      noise(a, { dur: 0.3, filter: 'lowpass', f: 400, vol: 0.25 });
    },
    curse(a) {
      [622, 587, 554, 523].forEach((f, k) => tone(a, { f, to: f * 0.94, dur: 0.35, type: 'triangle', vol: 0.1, at: k * 0.09 }));
      tone(a, { f: 70, dur: 0.7, type: 'sine', vol: 0.25 });
    },
    yourTurn(a) {
      tone(a, { f: 784, dur: 0.25, type: 'triangle', vol: 0.2 });
      tone(a, { f: 1046, dur: 0.4, type: 'triangle', vol: 0.2, at: 0.14 });
    },
    win(a) {
      [523, 659, 784, 1046, 784, 1046].forEach((f, k) => tone(a, { f, dur: k === 5 ? 0.8 : 0.22, type: 'triangle', vol: 0.22, at: k * 0.16 }));
    },
    lose(a) {
      [392, 330, 262, 196].forEach((f, k) => tone(a, { f, dur: k === 3 ? 1.2 : 0.35, type: 'sawtooth', vol: 0.12, at: k * 0.32 }));
    },
  };

  return {
    play(name) {
      if (muted || !SOUNDS[name]) return;
      const a = audio();
      if (!a || a.state !== 'running') return;
      try { SOUNDS[name](a); } catch { /* son ignoré */ }
    },
    toggle() {
      muted = !muted;
      try { localStorage.setItem('bf-mute', muted ? '1' : '0'); } catch { /* stockage indisponible */ }
      if (!muted) this.play('yourTurn');
      return muted;
    },
    get muted() { return muted; },
  };
})();
