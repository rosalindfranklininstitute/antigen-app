/**
 *
 * Scramble the bits of an integer number to produce deterministic pseudo
 * random result
 *
 * @param number The number to be scrambled
 * @returns The scrambled number
 */
function hashNumber(number: number): number {
  number = ((number >>> 16) ^ number) * 0x45d9f3b;
  number = ((number >>> 16) ^ number) * 0x45d9f3b;
  return (number >>> 16) ^ number;
}

/**
 *
 * Produces a css colour string from a possibly defined number; If defined the
 * number is hashed by a deterministic function to produce a psedo random
 * result, this result is used to determine the hue angle in the hsl colour
 * space with saturation and lightness each set to 50%; If undefined the
 * default of 'white' is returned
 *
 * @param number The number of which the colour should be based
 * @returns A css colour string in hsl format or white
 */
export function numToColor(number: number | undefined) {
  return number !== undefined
    ? `hsl(${((hashNumber(number) % 360) + 360) % 360}, 50%, 50%)`
    : "white";
}
