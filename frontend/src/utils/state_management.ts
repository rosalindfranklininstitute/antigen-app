export function addUniqueUUID<Type extends { uuid: string }>(oldObjs: Type[], newObjs: Type[]) {
    return newObjs.concat(
        oldObjs.filter(
            (oldObj) => !newObjs.find(
                (newObj) => newObj.uuid === oldObj.uuid
            )
        )
    )
}

export function filterUUID<Type extends { uuid: string }>(objs: Type[], uuids: string[]) {
    return uuids.map(
        (uuid) => objs.find(
            (obj) => obj.uuid === uuid
        )
    ).filter((obj): obj is Type => !!obj)
}