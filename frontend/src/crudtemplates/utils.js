import { useRef, useEffect } from "react";
import { LinkIcon } from "@heroicons/react/20/solid";
import config from "../config.js";
import schema from "../schema.js";

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

const plateLocationToName = (location) => {
  if (location < 1 || location > 96) return "Unknown";
  return (
    elisaRowNames[Math.floor((location - 1) / (elisaHeader.length - 1))] +
    elisaHeader[((location - 1) % (elisaHeader.length - 1)) + 1]
  );
};

// Field types which call the displayFieldSingle as a block rather than iterating over array
const displayTogetherFieldTypes = [
  "elisaplate",
  "sequencingplate",
  "platethreshold",
];

export const plateMapOfValues = (elisaValues, colors) => {
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
                  className={
                    "border border-slate-600" +
                    (typeof colors !== "undefined"
                      ? " " + colors[rowIdx * 12 + colIdx - 1]
                      : "")
                  }
                >
                  {elisaValues ? elisaValues[rowIdx * 12 + colIdx - 1] : ""}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const makeExtLink = (value, linkTemplate, context) => {
  if (
    linkTemplate.contexts.includes(context) &&
    value !== null &&
    value !== ""
  ) {
    return (
      <>
        {value}{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href={linkTemplate.template.replace("{value}", value)}
        >
          <LinkIcon className="inline ml-1 -mt-0.5 h-4 w-4 text-indigo-600" />
        </a>
      </>
    );
  } else {
    return value;
  }
};

export const displayFieldSingle = (field, record, context) => {
  if (field.fkApiField) {
    if (!Array.isArray(record[field.fkApiField])) {
      return record[field.field];
    }
    return record[field.fkApiField].find(
      (rec) => rec.id === record[field.field],
    )[field.fkDisplayField];
  }
  if (field.fkDisplayField) {
    return record[field.field + "_" + field.fkDisplayField];
  } else if (field.type === "elisaplate" && record[field.field]) {
    return plateMapOfValues(
      record[field.field].map((well) => well["optical_density"]),
    );
  } else if (field.type === "sequencingplate" && record[field.field]) {
    let numPlates = Math.ceil(record[field.field].length / 96);
    let retVal = [];
    let plateFn = (p) => {
      let plateArr = [];
      let plateVals = record[field.field].slice(p * 96, (p + 1) * 96);
      for (let i = 0; i < plateVals.length; i++) {
        let well = plateVals[i];
        while (plateArr.length < well["location"] - 1) {
          plateArr.push(null);
        }
        plateArr.push(
          well["elisa_well"]["plate"] +
            ":" +
            plateLocationToName(well["elisa_well"]["location"]),
        );
      }
      return plateMapOfValues(plateArr);
    };
    for (let p = 0; p < numPlates; p++) {
      retVal.push(<div key={"seqPlate" + p}>{plateFn(p)}</div>);
      retVal.push(
        <a
          href={
            config.url.API_URL +
            schema.sequencing.apiUrl +
            "/" +
            record.id +
            "/submissionfile/" +
            p +
            "/"
          }
        >
          <button
            type="button"
            className="w-full sm:w-auto mb-2 mt-2 sm:mb-0 relative inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Download sequencing submission file
          </button>
        </a>,
      );
    }
    return retVal;
  } else if (field.type === "platethreshold" && record[field.field]) {
    return (
      <ul>
        {record[field.field].map((plate) => (
          <li key={plate.elisa_plate}>
            Plate {plate.elisa_plate}: {plate.optical_density_threshold}
          </li>
        ))}
      </ul>
    );
  } else if (field.viewPageExtLink) {
    return makeExtLink(record[field.field], field.viewPageExtLink, context);
  } else {
    return record[field.field];
  }
};

export const displayField = (field, record, context) => {
  if (
    !displayTogetherFieldTypes.includes(field.type) &&
    Array.isArray(record[field.field])
  ) {
    return record[field.field]
      .map((valEach) =>
        displayFieldSingle(
          field,
          { ...record, [field.field]: valEach },
          context,
        ),
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
        null,
      );
  } else {
    return displayFieldSingle(field, record, context);
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

const formatTimeInterval = (timeInterval, label) => {
  // helper function to pluralise a time interval when required
  return timeInterval + " " + label + (timeInterval !== 1 ? "s" : "") + " ago";
};

export const timeSince = (date) => {
  // show relative time since a date e.g. "8 seconds ago"

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return formatTimeInterval(Math.floor(interval), "year");
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return formatTimeInterval(Math.floor(interval), "month");
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return formatTimeInterval(Math.floor(interval), "day");
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return formatTimeInterval(Math.floor(interval), "hour");
  }
  interval = seconds / 60;
  if (interval > 1) {
    return formatTimeInterval(Math.floor(interval), "minute");
  }
  interval = seconds;
  return formatTimeInterval(interval, "second");
};

export const usePrevious = (value) => {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};
