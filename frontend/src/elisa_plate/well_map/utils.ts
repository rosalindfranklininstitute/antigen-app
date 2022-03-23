function hashNumber(number: number): number {
  number = ((number >>> 16) ^ number) * 0x45d9f3b;
  number = ((number >>> 16) ^ number) * 0x45d9f3b;
  return (number >>> 16) ^ number;
}

export function numToColor(number: number | undefined) {
  return number !== undefined
    ? `hsl(${((hashNumber(number) % 360) + 360) % 360}, 50%, 50%)`
    : "white";
}
