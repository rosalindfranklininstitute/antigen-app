export enum AllFetched {
  False,
  Pending,
  True,
}

export function addUniqueUUID<Type extends { uuid: string }>(
  oldObjs: Type[],
  newObjs: Type[]
) {
  return newObjs.concat(
    oldObjs.filter(
      (oldObj) => !newObjs.find((newObj) => newObj.uuid === oldObj.uuid)
    )
  );
}

export function filterUUID<Type extends { uuid: string }>(
  objs: Type[],
  uuids: string[]
) {
  return uuids
    .map((uuid) => objs.find((obj) => obj.uuid === uuid))
    .filter((obj): obj is Type => !!obj);
}

export function zip<T extends Array<Array<any>>>(
  ...arrays: T
): Array<{
  [K in keyof T]: T[K] extends Array<any> ? T[K][0] : never;
}>;
export function zip(...arrays: any[][]) {
  return arrays[0].map((_, idx) => arrays.map((array) => array[idx]));
}
