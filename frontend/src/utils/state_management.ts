export enum AllFetched {
  False,
  Pending,
  True,
}

export function keyEq<Type, Other extends Type>(
  first: Other,
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

export function filterKeys<Filter, Type extends Filter>(
  objs: Array<Type>,
  filter: Filter,
  keys: Array<keyof Filter>
): Array<Type> {
  return objs.filter((obj) => keyEq(obj, filter, keys));
}

export function intersectKeys<Filter, Type extends Filter>(
  objs: Array<Type>,
  filters: Array<Filter>,
  keys: Array<keyof Filter>
): Array<Type> {
  return filters.flatMap((filter) => filterKeys(objs, filter, keys));
}

export function zip<T extends Array<Array<any>>>(
  ...arrays: T
): Array<{
  [K in keyof T]: T[K] extends Array<any> ? T[K][0] : never;
}>;
export function zip(...arrays: any[][]) {
  return arrays[0].map((_, idx) => arrays.map((array) => array[idx]));
}
