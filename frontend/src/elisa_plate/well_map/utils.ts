import { sha1 } from "object-hash";

export function objToColor(obj: object | undefined) {
  return obj !== undefined
    ? `hsl(${Number("0x".concat(sha1(obj).substring(0, 2)))}, 50%, 50%)`
    : "white";
}
