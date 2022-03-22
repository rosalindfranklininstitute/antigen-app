export enum AllFetched {
  False,
  Pending,
  True,
}

export function addUniqueByKeys<Type>(
  oldObjs: Array<Type>,
  newObjs: Array<Type>,
  keys: Array<keyof Type>
): Array<Type> {
  return newObjs.concat(
    oldObjs.filter(
      (oldObj) =>
        !newObjs.find((newObj) =>
          keys.every((key) => oldObj[key] === newObj[key])
        )
    )
  );
}

export function isEqual<Type>(obj: Type, other: Type): boolean {
  return (Object.keys(obj) as Array<keyof Type>).every(
    (key) => obj[key] === other[key]
  );
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
