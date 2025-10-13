import { useState, useEffect } from "react";
import config from "../config.js";
import schemas from "../schema.js";
import * as Sentry from "@sentry/browser";
import { NavLink } from "react-router-dom";

const Dashboard = (props) => {
  const getObjectUrl = (contentType, pk) => {
    return schemas[contentType].viewUrl + "/" + pk;
  };

  const [stats, setStats] = useState([
    { name: "Projects" },
    { name: "Antigens" },
    { name: "Llamas" },
    { name: "Sequencing Runs" },
    { name: "Named Nanobodies" },
  ]);
  const [activityItems, setActivityItems] = useState([]);

  useEffect(() => {
    const loadStats = () => {
      let schemaUrl = config.url.API_URL + "/dashboard/stats";
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
              if (res.status >= 400) {
                props.onSetError("[DS] HTTP code " + res.status);
              } else {
                setStats(data.stats);
              }
            },
            () => {
              props.onSetError("HTTP code " + res.status);
            },
          );
        })
        .catch((err) => {
          Sentry.captureException(err);
          props.onSetError(err.toString());
        });
    };

    const loadActivityItems = () => {
      let schemaUrl = config.url.API_URL + "/dashboard/latest";
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
              if (res.status >= 400) {
                props.onSetError("[DL] HTTP code " + res.status);
              } else {
                setActivityItems(data.logs);
              }
            },
            () => {
              props.onSetError("[DL] HTTP response code " + res.status);
            },
          );
        })
        .catch((err) => {
          Sentry.captureException(err);
          props.onSetError(err.toString());
        });
    };

    loadStats();
    loadActivityItems();
  }, [props]);

  const statuses = {
    create: "text-green-400 bg-green-400/10",
    update: "text-orange-400 bg-orange-400/10",
    delete: "text-rose-400 bg-rose-400/10",
    access: "text-gray-400 bg-gray-400/10",
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const LoadingSkeleton = (
    <div
      className={
        "w-12 h-8 bg-gray-300 rounded-full mt-2 rounded shadow animate-pulse"
      }
    ></div>
  );

  const Stats = () => {
    return (
      <div className="pb-5">
        <dl
          className={"mt-5 grid grid-cols-1 gap-5 sm:grid-cols-" + stats.length}
        >
          {stats.map((item) => (
            <div
              key={item.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <dt className="truncate text-sm font-medium text-gray-500">
                {item.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {Object.hasOwn(item, "value") ? item.value : LoadingSkeleton}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  const ActivityList = () => {
    return (
      <div className="pt-5">
        <h2 className="px-4 text-base font-semibold leading-7">Recent edits</h2>
        <table className="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col className="w-full sm:w-3/12" />
            <col className="lg:w-3/12" />
            <col className="lg:w-3/12" />
            <col className="lg:w-3/12" />
          </colgroup>
          <thead className="border-b border-black/10 text-sm leading-6">
            <tr>
              <th scope="col" className="py-2 pl-4 pr-8 font-semibold">
                User
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
              >
                Content Type
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
              >
                Object
              </th>
              <th
                scope="col"
                className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {activityItems.map((item) => (
              <tr key={item.pk}>
                <td className="py-4 pl-4 pr-8">
                  <div className="flex items-center gap-x-4">
                    {/* <img alt="" src={item.user.imageUrl} className="h-8 w-8 rounded-full bg-gray-800" /> */}
                    <div className="truncate text-sm font-medium leading-6">
                      {item.user.username} ({item.user.email})
                    </div>
                  </div>
                </td>
                <td className="hidden py-4 pl-0 pr-4 text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                  <b>{item.object.type}</b>
                </td>
                <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                  <div className="flex gap-x-3">
                    <div className="font-mono text-sm leading-6 text-gray-400">
                      {(item.object.link.id != null && (
                        <NavLink
                          to={getObjectUrl(
                            item.object.link.schema,
                            item.object.link.id,
                          )}
                        >
                          {item.object.name}
                        </NavLink>
                      )) ||
                        item.object.name}
                    </div>
                    <span
                      className={classNames(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-400/20",
                        statuses[item.object.operation],
                      )}
                    >
                      {item.object.operation}
                    </span>
                  </div>
                </td>
                <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                  <time dateTime={item.dateTime} title={item.dateTime}>
                    {item.date}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Stats />
      <a href="/api/reports/projects" download="antigenapp-project-report.csv">
        <button
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Download Project Report (.csv)
        </button>
      </a>
      <ActivityList />
    </>
  );
};

export default Dashboard;
