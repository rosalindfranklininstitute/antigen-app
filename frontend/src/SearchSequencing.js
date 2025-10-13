import config from "./config.js";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Radio, RadioGroup } from "@headlessui/react";
import * as Sentry from "@sentry/browser";

const SearchSequencing = (props) => {
  const minQueryLength = 4;
  const searchRegions = [
    { id: "cdr3", name: "CDR3" },
    { id: "full", name: "Full Sequence" },
  ];
  const [searchRegion, setSearchRegion] = useState(searchRegions[0]);
  const [queryUpdated, setQueryUpdated] = useState(false);
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState();
  const [loading, setLoading] = useState(false);

  const searchSequence = () => {
    let schemaUrl =
      config.url.API_URL +
      "/sequencingrun/searchseq/" +
      query.replace(/[^A-Za-z0-9]/g, "") +
      "/?searchRegion=" +
      searchRegion.id;
    fetch(schemaUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        res.json().then(
          (data) => {
            if (res.status >= 400) {
              props.onSetError("[SS] HTTP code " + res.status);
            } else {
              setRecords(data.matches);
            }
            setLoading(false);
          },
          () => {
            props.onSetError("[SS] HTTP code " + res.status);
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

  const runSearch = () => {
    if (query.length < minQueryLength) return;
    setQueryUpdated(false);
    if (query !== undefined && query !== "") {
      setLoading(true);
      searchSequence();
    }
  };

  return (
    <div>
      <div className="lg:columns-3">
        <div className="w-full lg:max-w-md float-left mr-2 mb-2">
          <label htmlFor="search">Sequence</label>
          <div className="mt-2 relative text-gray-400 focus-within:text-gray-600">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="searchseq"
              className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Enter search sequence (letters only)"
              type="search"
              name="search"
              onKeyUp={(evt) => {
                setRecords([]);
                setQueryUpdated(true);
                setQuery(evt.target.value);
                if (evt.key === "Enter") runSearch();
              }}
            />
          </div>
        </div>

        <div className="">
          <fieldset>
            <legend className="text-gray-900 font-small mb-2">
              Search region
            </legend>
            <RadioGroup
              value={searchRegion}
              onChange={(evt) => {
                setRecords([]);
                setQueryUpdated(true);
                setSearchRegion(evt);
              }}
              className="grid grid-cols-2 gap-2 sm:grid-cols-2"
            >
              {searchRegions.map((option) => (
                <Radio
                  key={option.name}
                  value={option}
                  className={({ checked, disabled }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md border
                    ${
                      checked
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-900 border-gray-300"
                    }
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`
                  }
                >
                  {option.name}
                </Radio>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <div>
          <label>Run search</label>
          <button
            type="button"
            className="mt-2 w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={runSearch}
          >
            Search
          </button>
        </div>
      </div>

      {queryUpdated && query.length < minQueryLength && (
        <b>Enter {minQueryLength} or more letters for search query</b>
      )}

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
                      Sequence identifier
                    </th>
                    <th
                      scope="col"
                      className={
                        " px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      }
                    >
                      {searchRegion.id === "cdr3"
                        ? "CDR3 Sequence"
                        : "Full Sequence"}
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
                          {searchRegion.id === "cdr3"
                            ? record.cdr3_aa
                            : record.sequence_alignment_aa}
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
                            !queryUpdated &&
                            "No sequences found for " + query}
                          {!loading &&
                            (query === undefined || query === "") &&
                            "Please enter a query"}
                          {!loading &&
                            queryUpdated &&
                            query !== undefined &&
                            query !== "" &&
                            "Press search button when ready"}
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
