// Turn-cue audio files live in /public/audio and are served at these paths.
export const AUDIO_CUES = {
  left: '/audio/go_left.mp3',
  right: '/audio/go_right.mp3',
  straight: '/audio/go_straight.mp3',
} as const;

// Turn-by-turn instructions are free text (see direction.ts), so matching is
// keyword-based rather than an exact lookup — "left", "on the left", etc.
// all resolve to the same cue.
export function matchAudioCue(instruction: string): string | null {
  const text = instruction.toLowerCase();
  if (/\bleft\b/.test(text)) return AUDIO_CUES.left;
  if (/\bright\b/.test(text)) return AUDIO_CUES.right;
  if (/\b(straight|ahead|continue|forward)\b/.test(text)) return AUDIO_CUES.straight;
  return null;
}

// Plays each instruction's matching cue in sequence, calling onStep before
// each one starts. Returns a stop() function to cancel mid-playback.
export function playInstructionAudio(
  instructions: string[],
  onStep?: (index: number) => void
): { stop: () => void } {
  let index = 0;
  let stopped = false;
  let currentAudio: HTMLAudioElement | null = null;

  const playNext = () => {
    if (stopped || index >= instructions.length) return;
    onStep?.(index);

    const cue = matchAudioCue(instructions[index]);
    if (!cue) {
      index++;
      playNext();
      return;
    }

    currentAudio = new Audio(cue);
    currentAudio.onended = () => {
      index++;
      playNext();
    };
    currentAudio.onerror = () => {
      index++;
      playNext();
    };
    currentAudio.play().catch(() => {
      index++;
      playNext();
    });
  };

  playNext();

  return {
    stop: () => {
      stopped = true;
      currentAudio?.pause();
    },
  };
}
