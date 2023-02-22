export const displayFieldSingle = (field, record) => {
    if(field.fkApiField) {
        if(!Array.isArray(record[field.fkApiField])) {
            return record[field.field];
        }
        return record[field.fkApiField].find(rec => rec.id == record[field.field])[field.fkDisplayField];
    }
    if(field.fkDisplayField) {
        return record[field.field + "_" + field.fkDisplayField];
    } else {
        return record[field.field];
    }
}

export const displayField = (field, record) => {
    console.log(field, record);
    if(Array.isArray(record[field.field])) {
        return record[field.field].map(valEach => displayFieldSingle(field, {...record, [field.field]: valEach}))
            .reduce((acc, x) => acc === null ? x : <>{acc} <br /> {x}</>, null);
    } else {
        return displayFieldSingle(field, record);
    }
};

export const toTitleCase = (str) => {
    return str.replace(
    /\w\S*/g,
    function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
    );
}

export const pluralise = (str) => {
    // TODO: Make less primitive!
    return (str.endsWith("y")) ? str.slice(0, -1) + "ies" : str + "s";
}