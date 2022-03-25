export enum AllFetched {
  False,
  Pending,
  True,
}

/**
 *
 * Checks for equality of keyed properties in first & second
 *
 * @param first the first object whos properties should be compared for equality
 * @param second the second object whos properties should be compared for
 * equality
 * @param keys an array of object keys to be checked for equality
 * @returns true if every keyed property is equal
 */
export function keyEq<First extends Second, Second>(
  first: First,
  second: Second,
  keys: Array<keyof Second>
): boolean {
  return keys.every((key) => first[key] === second[key]);
}

/**
 *
 * Merges two arrays of items, replacing items in first which are equal by keys
 * with the corresponding item in second
 *
 * @param first the array to be merged into
 * @param second the array to merge into first
 * @param keys the keys on which to merge
 * @returns an array of second merged into first
 */
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

/**
 *
 * Filters an array of items by a filter object on a set of keys
 *
 * @param objs an array of items to be filtered
 * @param filter the filter to reduce by
 * @param keys the keys on which to filter
 * @returns a subset of the objs array where key equality exists with filter
 */
export function filterKeys<Type extends Filter, Filter>(
  objs: Array<Type>,
  filter: Filter,
  keys: Array<keyof Filter>
): Array<Type> {
  return objs.filter((obj) => keyEq(obj, filter, keys));
}

/**
 *
 * Produces the intersection of an array of items and an array of filters
 *
 * @param objs an array of items to be intersected
 * @param filters the filters to intersect by
 * @param keys the keys on which to intersect
 * @returns a subset of the objs array where key equality exists with any of
 * the filters
 */
export function intersectKeys<Type extends Filter, Filter>(
  objs: Array<Type>,
  filters: Array<Filter>,
  keys: Array<keyof Filter>
): Array<Type> {
  return filters.flatMap((filter) => filterKeys(objs, filter, keys));
}

export function zip<Type extends Array<Array<any>>>(
  ...arrays: Type
): Array<{
  [K in keyof Type]: Type[K] extends Array<any> ? Type[K][0] : never;
}>;
/**
 * Transposes a tuple of arrays into an array of tuples with items from each
 * array in the input
 *
 * @param arrays a set of arrays to be transposed
 * @returns an array of tuples with items from each array in the input
 */
export function zip(...arrays: any[][]) {
  return arrays[0].map((_, idx) => arrays.map((array) => array[idx]));
}
