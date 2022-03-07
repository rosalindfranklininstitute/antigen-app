export function uuidToColor(uuid: string) {
  const hue = Number("0x".concat(uuid.substring(0, 2)));
  return `hsl(${hue}, 50%, 50%)`;
}
