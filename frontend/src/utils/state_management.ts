export function addUniqueUUID<Type extends { uuid: string }>(oldObjs: Type[], newObjs: Type[]) {
    return oldObjs.concat(
        newObjs.filter(
            (newObj) => !oldObjs.find(
                (oldObj) => oldObj.uuid === newObj.uuid
            )
        )
    )
}