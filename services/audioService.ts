// Simple Web Audio API wrapper for synth sounds
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playClick = () => {
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // High pitch blip
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Ignore audio errors (e.g. if blocked)
  }
};

export const playSpinStart = () => {
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // Rising "charge" sound
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

export const playReelStop = () => {
  try {
    const ctx = initAudio();
    // Simulate a mechanical "clack" with short noise/square wave
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
};

export const playWin = (isBigWin: boolean) => {
  try {
    const ctx = initAudio();
    
    const playNote = (freq: number, time: number, duration: number, vol: number = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = isBigWin ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(vol, time);
      gain.gain.linearRampToValueAtTime(0, time + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };

    const now = ctx.currentTime;
    // C Major Arpeggio
    playNote(523.25, now, 0.2);       // C5
    playNote(659.25, now + 0.1, 0.2); // E5
    playNote(783.99, now + 0.2, 0.4); // G5
    
    if (isBigWin) {
      // Extended flourish for big wins
      playNote(1046.50, now + 0.3, 0.2); // C6
      playNote(783.99, now + 0.4, 0.2);  // G5
      playNote(1046.50, now + 0.5, 0.8, 0.2); // C6 (Loud)
      
      // Add a bass note
      playNote(261.63, now, 1.0, 0.2); // C4
    }
  } catch (e) {}
};