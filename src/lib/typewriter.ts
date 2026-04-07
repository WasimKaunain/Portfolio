export function buildTypewriterFrames(words: string[]) {
  // Each frame is a string displayed in sequence.
  // We simulate: type -> hold -> delete -> next.
  const frames: string[] = [];

  for (const w of words) {
    // type
    for (let i = 1; i <= w.length; i++) frames.push(w.slice(0, i));
    // hold
    for (let i = 0; i < 16; i++) frames.push(w);
    // delete
    for (let i = w.length; i >= 0; i--) frames.push(w.slice(0, i));
    // pause between words
    for (let i = 0; i < 6; i++) frames.push("");
  }

  return frames;
}
