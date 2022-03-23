export enum AllFetched {
  False,
  Pending,
  True,
}

export function keyEq<Type>(
  first: Type,
  second: Type,
  keys: Array<keyof Type>
): boolean {
  return keys.every((key) => first[key] === second[key]);
}

export function replaceByKeys<Type>(
  array: Array<Type>,
  item: Type,
  keys: Array<keyof Type>
): Array<Type> {
  return array.map((arrayItem) =>
    keyEq(arrayItem, item, keys) ? item : arrayItem
  );
}

export function mergeByKeys<Type>(
  first: Array<Type>,
  second: Array<Type>,
  keys: Array<keyof Type>
): Array<Type> {
  return second.concat(
    first.filter(
      (firstItem) =>
        !second.some((secondItem) => keyEq(firstItem, secondItem, keys))
    )
  );
}

export function propsEq<Type>(first: Type, second: Type): boolean {
  return keyEq(first, second, Object.keys(first) as Array<keyof Type>);
}

export function partialEq<Type>(obj: Type, partial: Partial<Type>): boolean {
  return (Object.keys(partial) as Array<keyof Type>).every(
    (key) => partial[key] === obj[key]
  );
}

export function filterPartial<Type>(
  objs: Array<Type>,
  filter: Partial<Type>
): Array<Type> {
  return objs.filter((obj) => partialEq(obj, filter));
}

export function intersectPartial<Type>(
  objs: Array<Type>,
  filters: Array<Partial<Type>>
) {
  return filters.flatMap((filter) => filterPartial(objs, filter));
}

export function zip<T extends Array<Array<any>>>(
  ...arrays: T
): Array<{
  [K in keyof T]: T[K] extends Array<any> ? T[K][0] : never;
}>;
export function zip(...arrays: any[][]) {
  return arrays[0].map((_, idx) => arrays.map((array) => array[idx]));
}
