function hashNumber(number: number): number {
  number = ((number >> 16) ^ number) * 0x45d9f3b;
  number = ((number >> 16) ^ number) * 0x45d9f3b;
  return (number >> 16) ^ number;
}

export function objToColor(
  obj: { project: string; number: number } | undefined
) {
  return obj !== undefined
    ? `hsl(${hashNumber(obj.number)}, 50%, 50%)`
    : "white";
}
