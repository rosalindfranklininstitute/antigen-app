export function uuidToColor(uuid: string | undefined) {
  return uuid
    ? `hsl(${Number("0x".concat(uuid.substring(0, 2)))}, 50%, 50%)`
    : "white";
}
