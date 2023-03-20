import {
  DocumentPlusIcon,
  DocumentTextIcon,
  DocumentMinusIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../config.js";
import * as Sentry from "@sentry/browser";
import { timeSince } from "./utils.js";

const auditLogActions = ["created", "updated", "deleted", "accessed"];

const auditLogIconColours = [
  "bg-green-500",
  "bg-blue-500",
  "bg-red-500",
  "bg-gray-500",
];

const skipFields = ["id", "added_by", "added_date"];

const capitaliseFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatDate = (dateString) => {
  let d = new Date(dateString);
  return (
    <>
      {d.toLocaleDateString()} {d.toLocaleTimeString()}
      <br />
      {timeSince(d)}
    </>
  );
};

const AuditLog = (props) => {
  const [auditLog, setAuditLog] = useState();
  const { recordId } = useParams();

  useEffect(() => {
    fetch(
      config.url.API_URL + props.schema.apiUrl + "/" + recordId + "/auditlog/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        res.json().then((data) => {
          if (res.status === 404) {
            props.onSetError("404 object not found");
          } else {
            // Put logs in chronological order
            data = data.reverse();
            setAuditLog(data);
          }
        });
      })
      .catch((err) => {
        Sentry.captureException(err);
        props.onSetError(err.toString());
      });
  }, [props, recordId]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg p-10">
      <div className="flow-root">
        <ul className="-mb-8">
          {!auditLog && "Loading..."}
          {auditLog &&
            auditLog.map((logEntry, logIdx) => (
              <li
                key={
                  props.schema.objectName +
                  logEntry.object_id +
                  logEntry.timestamp
                }
              >
                <div className="relative pb-8">
                  {logIdx !== auditLog.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={classNames(
                          auditLogIconColours[logEntry.action],
                          "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                        )}
                      >
                        {logEntry.action === 0 && (
                          <DocumentPlusIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        )}
                        {logEntry.action === 1 && (
                          <DocumentTextIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        )}
                        {logEntry.action === 2 && (
                          <DocumentMinusIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        )}
                        {logEntry.action === 3 && (
                          <DocumentMagnifyingGlassIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                      <div>
                        <p className="text-gray-500">
                          {capitaliseFirstLetter(props.schema.objectName)}{" "}
                          <span className="font-medium text-gray-900">
                            {auditLogActions[logEntry.action]}
                          </span>
                          {" by "}
                          <span className="font-medium text-gray-900">
                            {logEntry.actor_username}
                            {" ("}
                            {logEntry.actor_email}
                            {")"}
                          </span>
                          <br className="mb-2" />
                        </p>
                        {(logEntry.action === 0 || logEntry.action === 1) &&
                          Object.keys(logEntry.changes_dict)
                            .filter((field) => !skipFields.includes(field))
                            .map((fieldName, index) => (
                              <p className="text-sm text-gray-500" key={index}>
                                <span className="text-black">{fieldName}</span>{" "}
                                {logEntry.action === 0 && "set "}
                                {logEntry.action === 1 &&
                                  Array.isArray(
                                    logEntry.changes_dict[fieldName]
                                  ) && (
                                    <>
                                      {"changed from "}
                                      <span className="bg-red-100">
                                        {logEntry.changes_dict[fieldName][0]}
                                      </span>
                                      {!logEntry.changes_dict[fieldName][0]
                                        ? "nothing "
                                        : " "}
                                    </>
                                  )}
                                {Array.isArray(
                                  logEntry.changes_dict[fieldName]
                                ) && (
                                  <>
                                    {"to "}
                                    <span className="bg-green-100">
                                      {logEntry.changes_dict[fieldName][1]}
                                    </span>
                                    {!logEntry.changes_dict[fieldName][1]
                                      ? "nothing"
                                      : ""}
                                  </>
                                )}
                                {!Array.isArray(
                                  logEntry.changes_dict[fieldName]
                                ) && (
                                  <>
                                    {
                                      logEntry.changes_dict[fieldName][
                                        "operation"
                                      ]
                                    }{" "}
                                    {logEntry.changes_dict[fieldName]["objects"]
                                      .map((obj) => (
                                        <span
                                          key={obj}
                                          className={
                                            logEntry.changes_dict[fieldName][
                                              "operation"
                                            ] === "add"
                                              ? "bg-green-100"
                                              : "bg-red-100"
                                          }
                                        >
                                          {obj}
                                        </span>
                                      ))
                                      .reduce((prev, curr) => [
                                        prev,
                                        ", ",
                                        curr,
                                      ])}
                                  </>
                                )}
                              </p>
                            ))}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime={logEntry.timestamp}>
                          {formatDate(logEntry.timestamp)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default AuditLog;
