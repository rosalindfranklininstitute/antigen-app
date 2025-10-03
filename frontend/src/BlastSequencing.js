import config from "./config.js";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Radio, RadioGroup } from "@headlessui/react";
import * as Sentry from "@sentry/browser";
import BlastResultsTable from "./crudtemplates/BlastResultsTable.js";

const BlastSequencing = (props) => {
  const minQueryLength = 6;
  const searchRegions = [
    { id: "cdr3", name: "CDR3" },
    { id: "full", name: "Full Sequence" },
  ];
  const [searchRegion, setSearchRegion] = useState(searchRegions[0]);
  const [queryUpdated, setQueryUpdated] = useState(false);
  const [records, setRecords] = useState();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const searchSequence = () => {
    let schemaUrl =
      config.url.API_URL +
      "/sequencingrun/blastseq/" +
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
              props.onSetError("[BS] HTTP code " + res.status);
            } else {
              setRecords(data);
            }
            setLoading(false);
          },
          () => {
            props.onSetError("[BS] HTTP code " + res.status);
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
                setRecords();
                setQuery(evt.target.value);
                setQueryUpdated(true);
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
                setRecords();
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
        <b>Enter {minQueryLength} or more letters for BLAST search</b>
      )}
      <BlastResultsTable
        blastResults={records}
        isLoading={loading}
        showCDR3col={false}
      />
    </div>
  );
};

export default BlastSequencing;
