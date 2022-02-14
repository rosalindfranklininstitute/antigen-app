export function addUniqueUUID<Type extends { uuid: string }>(oldObjs: Type[], newObjs: Type[]) {
    return oldObjs.concat(
        newObjs.filter(
            (newObj) => !oldObjs.find(
                (oldObj) => oldObj.uuid === newObj.uuid
            )
        )
    )
}

export function filterPosted<Type extends { uuid: string }>(objs: Type[], posted: string[]) {
    return posted.map(
        (uuid) => objs.find(
            (obj) => obj.uuid === uuid
        )
    ).filter((obj): obj is Type => !!obj)
}