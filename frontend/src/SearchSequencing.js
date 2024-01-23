import config from "./config.js";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as Sentry from "@sentry/browser";

const SearchSequencing = (props) => {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchCDR3 = () => {
      let schemaUrl =
        config.url.API_URL +
        "/sequencingrun/searchcdr3/" +
        query.replace(/[^A-Za-z0-9]/g, "") +
        "/";
      fetch(schemaUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          res.json().then(
            (data) => {
              setRecords(data.matches);
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

    if (query !== undefined && query !== "") {
      setRecords([]);
      setLoading(true);
      searchCDR3();
    }
  }, [props, query]);

  return (
    <div>
      <div className="w-full max-w-lg lg:max-w-xs float-left mr-2 mb-2">
        <label htmlFor="search" className="sr-only">
          Search by CDR3
        </label>
        <div className="relative text-gray-400 focus-within:text-gray-600">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <input
            id="searchcdr3"
            className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search by CDR3"
            type="search"
            name="search"
            onKeyUp={(evt) => evt.key === "Enter" && setQuery(evt.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        className="w-full max-w-lg lg:max-w-xs items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        onClick={() => setQuery(document.getElementById("searchcdr3").value)}
      >
        Search
      </button>

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
                        " py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      }
                    >
                      Sequencing run no.
                    </th>
                    <th
                      scope="col"
                      className={
                        " px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      }
                    >
                      Sequence
                    </th>
                    <th
                      scope="col"
                      className={
                        " px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      }
                    >
                      CDR3 Seq.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {records.length > 0 &&
                    records.map((record) => (
                      <tr
                        key={
                          "searchcdr3_tablerow_" + query + record.sequence_id
                        }
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {!loading && (
                            <NavLink
                              to={"/sequencing/" + record.sequencing_run}
                            >
                              {record.sequencing_run}
                            </NavLink>
                          )}
                          {loading && (
                            <div
                              className={
                                " h-2.5 bg-gray-300 rounded-full mb-2.5 rounded shadow animate-pulse"
                              }
                            ></div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.sequence_id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.cdr3_aa}
                        </td>
                      </tr>
                    ))}
                  {/* Table empty case */}
                  {!records.length && (
                    <tr>
                      <td
                        colSpan="3"
                        className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 text-center"
                      >
                        <span>
                          {!loading &&
                            query !== undefined &&
                            query !== "" &&
                            "No sequences found for " + query}
                          {!loading &&
                            (query === undefined || query === "") &&
                            "Please enter a query"}
                          {loading && "Loading..."}
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

export default SearchSequencing;
