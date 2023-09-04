import config from "../config.js";
import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toTitleCase, pluralise, displayField } from "./utils.js";
import * as Sentry from "@sentry/browser";

// Use three table rows for loading skeleton
const loadingSkeleton = [
  { showInTable: true, id: "-1" },
  { showInTable: true, id: "-2" },
  { showInTable: true, id: "-3" },
];

const randomWidth = () => {
  let choices = [12, 16, 24, 32];
  var index = Math.floor(Math.random() * choices.length);
  return "w-" + choices[index];
};

const ListTable = (props) => {
  const [records, setRecords] = useState(loadingSkeleton);
  const { recordId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshRecords = () => {
      let schemaUrl = config.url.API_URL + props.schema.apiUrl + "/";
      if (props.schema.parentObjectName) {
        schemaUrl += "?" + props.schema.parentObjectName + "=" + recordId;
      }
      fetch(schemaUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": props.csrfToken,
        },
      })
        .then((res) => {
          res.json().then(
            (data) => {
              setRecords(data);
              setLoading(false);
            },
            () => {
              props.onSetError("HTTP response code " + res.status);
              setLoading(false);
            },
          );
        })
        .catch((err) => {
          Sentry.captureException(err);
          props.onSetError(err.toString());
          setLoading(false);
        });
    };

    setLoading(true);
    setRecords(loadingSkeleton);
    refreshRecords();
  }, [props, recordId]);

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {pluralise(toTitleCase(props.schema.objectName))}
          </h1>
          {/* <p className="mt-2 text-sm text-gray-700">&nbsp;</p> */}
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {!props.readOnly && (
            <NavLink
              to={
                props.schema.viewUrl +
                "/add" +
                (recordId
                  ? "?" + props.schema.parentObjectName + "_id=" + recordId
                  : "")
              }
            >
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Add {props.schema.objectName}
              </button>
            </NavLink>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className={
                        props.schema.fields[0].tableColWidth +
                        " py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      }
                    >
                      {props.schema.fields[0].label}
                    </th>
                    {props.schema.fields
                      .slice(1)
                      .filter((field) => field.showInTable)
                      .map((titleField) => (
                        <th
                          key={props.schema.objectName + "_" + titleField.field}
                          scope="col"
                          className={
                            titleField.tableColWidth +
                            " px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          }
                        >
                          {titleField.label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {records.length > 0 &&
                    records.map((record) => (
                      <tr
                        key={props.schema.objectName + "_tablerow_" + record.id}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {!loading && (
                            <NavLink
                              to={props.schema.viewUrl + "/" + record.id}
                            >
                              {displayField(
                                props.schema.fields[0],
                                record,
                                "ListTable",
                              ) || <em>None</em>}
                            </NavLink>
                          )}
                          {loading && (
                            <div
                              className={
                                randomWidth() +
                                " h-2.5 bg-gray-300 rounded-full mb-2.5 rounded shadow animate-pulse"
                              }
                            ></div>
                          )}
                        </td>
                        {props.schema.fields
                          .slice(1)
                          .filter((field) => field.showInTable)
                          .map((dataField) => (
                            // <td key={props.schema.objectName + "_tablefield_" + record.id + "_" + dataField.field} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record[dataField.field]}</td>
                            <td
                              key={
                                props.schema.objectName +
                                "_tablefield_" +
                                record.id +
                                "_" +
                                dataField.field
                              }
                              className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                            >
                              {!loading &&
                                displayField(dataField, record, "ListTable")}
                              {loading && (
                                <div
                                  className={
                                    randomWidth() +
                                    " h-2.5 bg-gray-300 rounded-full mb-2.5 rounded shadow animate-pulse"
                                  }
                                ></div>
                              )}
                            </td>
                          ))}
                      </tr>
                    ))}
                  {/* Table empty case */}
                  {!loading && !records.length && (
                    <tr>
                      <td
                        colSpan={
                          props.schema.fields.filter(
                            (field) => field.showInTable,
                          ).length
                        }
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-center"
                      >
                        <span>
                          No {pluralise(props.schema.objectName)} have been
                          created yet
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListTable;
