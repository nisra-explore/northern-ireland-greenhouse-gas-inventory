export function wrapLabel(label, maxChars = 28) {
  const words = label.split(' ');
  const lines = [];
  let line = '';

  for (const w of words) {
    const testLine = line ? line + ' ' + w : w;
    if (testLine.length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}
