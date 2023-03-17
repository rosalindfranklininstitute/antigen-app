const elisaHeader = [
  "",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
const elisaRowNames = ["A", "B", "C", "D", "E", "F", "G", "H"];

const elisaPlateOpticalDensityMap = (elisaValues) => {
  return (
    <table className="w-full table-fixed border-collapse border border-slate-500 mt-4">
      <thead>
        <tr>
          {elisaHeader.map((header) => (
            <th
              key={"elisaheader_" + header}
              className="border border-slate-600"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {elisaRowNames.map((rowName, rowIdx) => (
          <tr key={"elisarow_" + rowIdx}>
            {elisaHeader.map((_, colIdx) =>
              colIdx === 0 ? (
                <th
                  key={"elisarowname_" + rowIdx}
                  className="border border-slate-600"
                >
                  {rowName}
                </th>
              ) : (
                <td
                  key={"elisaCell_" + rowIdx + "_" + colIdx}
                  className="border border-slate-600"
                >
                  {elisaValues ? elisaValues[rowIdx * 12 + colIdx - 1] : ""}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const displayFieldSingle = (field, record) => {
  if (field.fkApiField) {
    if (!Array.isArray(record[field.fkApiField])) {
      return record[field.field];
    }
    return record[field.fkApiField].find(
      (rec) => rec.id === record[field.field]
    )[field.fkDisplayField];
  }
  if (field.fkDisplayField) {
    return record[field.field + "_" + field.fkDisplayField];
  } else if (field.type === "elisaplate" && record[field.field]) {
    return elisaPlateOpticalDensityMap(
      record[field.field].map((well) => well["optical_density"])
    );
  } else {
    return record[field.field];
  }
};

export const displayField = (field, record) => {
  if (field.type !== "elisaplate" && Array.isArray(record[field.field])) {
    return record[field.field]
      .map((valEach) =>
        displayFieldSingle(field, { ...record, [field.field]: valEach })
      )
      .reduce(
        (acc, x) =>
          acc === null ? (
            x
          ) : (
            <>
              {acc} <br /> {x}
            </>
          ),
        null
      );
  } else {
    return displayFieldSingle(field, record);
  }
};

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const pluralise = (str) => {
  // TODO: Make less primitive!
  return str.endsWith("y") ? str.slice(0, -1) + "ies" : str + "s";
};
